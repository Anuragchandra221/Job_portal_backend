const mongoose = require('mongoose')

const application_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    applied_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    qualification: String,
    years_of_experience: Number,
    applying_for:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'jobs'
    }
})

const application_model = mongoose.model("applications",application_schema)

module.exports = application_model