const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/job')
const express = require('express')
const cors = require('cors')
const app = express()
app.use(express.json())
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
app.use(cors())

const user_model = require('./user')
const job_model = require('./jobs')
const application_model = require('./applications')

app.post('/register',async (req, res)=>{
    const user = await user_model.findOne({email:req.body.email})

    if(user){
        res.status(400).send({"err":"User already exists"})
    }else{
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password,salt)
        const usrData = {
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            company: req.body.company,
        };
        if(req.body.address){
            usrData.address = req.body.address
        }
        const usr = new user_model(usrData)
        console.log(req.body)
        usr.save().then(()=>{
            res.status(200).send({"status": "ok"})
        }).catch((err)=>{
            res.status(500).send({"err":err.message})
        })
    }

})

app.post('/login', async (req, res)=>{
    const user = await user_model.findOne({email: req.body.email})

    if(!user){
        res.status(400).send({"err":"Invalid email"})
    }else{
        const validate_password = await bcrypt.compare(req.body.password, user.password)
        if(!validate_password){
            res.status(403).send({"err":"Incorrect password"})
        }else{
            const token = jwt.sign({_id:user.id},"secret1234")
            res.status(200).send({"token":token})
        }
    }
})

app.get('/latest-jobs', async (req,res)=>{
    const job = await job_model.find().sort({created_at:-1})
    res.send(job)
})

app.post('/apply-job', (req, res, next)=>{
    const token = req.header("auth-token")
    if(!token){
        res.status(403).send({"err":"Not Authorised"})
    }else{
        try{
            const verify = jwt.verify(token, "secret1234")
            next()
        }catch{
            res.status(400).send("Invalid token")
        }
    }
} ,async (req,res)=>{
    const id = jwt.decode(req.header("auth-token"),"secret1234")._id
    const user = await user_model.findOne({_id:id})
    const job = await job_model.findOne({$and:[{title:req.body.title},{description:req.body.description}]})
    // console.log(job)
    if(user.company===false){
        // console.log(req.body)
        const application = new application_model({
            name: req.body.name,
            qualification: req.body.qualification,
            years_of_experience: req.body.years_of_experience,
            applied_by: user,
            applying_for: job
        })
        try{
            application.save()
            console.log(job.applications)
            user.applications.push(application)
            job.applications.push(application)
            job.save()
            user.save()
            res.status(200).send({"status":"ok"})
        }catch(err){
            console.log(err.message)
        }
    }else{
        res.status(403).send({"err":"You don't have permission"})
    }
})

app.post('/post-job',(req,res,next)=>{
    const token = req.header("auth-token")
    if(!token){
        res.status(403).send({"err":"Not Authorised"})
    }else{
        try{
            const verify = jwt.verify(token, "secret1234")
            next()
        }catch{
            res.status(400).send("Invalid token")
        }
    }
    },async (req, res)=>{
        const id = jwt.decode(req.header("auth-token"),"secret1234")._id
        const user = await user_model.findOne({_id:id})
        if(user.company===true){
            console.log(req.body)
            const job = new job_model({
                title: req.body.title,
                description: req.body.description,
                salary: req.body.salary,
                deadline: req.body.deadline,
                company: user 
            })
            try{
                job.save()
                user.jobs_posted.push(job)
                user.save()
                res.status(200).send({"status":"ok"})
            }catch(err){
                console.log(err.message)
            }
        }else{
            res.status(403).send({"err":"You don't have permission"})
        }
})

app.listen(8000,()=>{
    console.log("server is listening on port 8000")
})
