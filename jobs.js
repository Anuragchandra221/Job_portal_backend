const mongoose = require('mongoose')

const job_schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    description: String,
    salary: Number,
    created_at: {
        type: Date,
        default: ()=>Date.now()
    },
    deadline: Date,
    applications: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'applications'
    }
})

const job_model = mongoose.model("jobs",job_schema)

module.exports = job_model