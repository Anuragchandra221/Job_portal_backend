const mongoose = require('mongoose')
const a_schema = new mongoose.Schema({
    headquaters: String,
})
const user_schema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        lowercase: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    company: {
        type: Boolean,
        required: true
    },
    address: a_schema,
    date_established: String,
    jobs_posted: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "jobs",
    },
    applications: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "applications",
    }
})

const user_model = mongoose.model("users",user_schema)

module.exports = user_model