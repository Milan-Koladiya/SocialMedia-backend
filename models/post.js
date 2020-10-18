const mongoose = require('mongoose')
const connection = require('../connection/connection')

const postSchema = new mongoose.Schema({
    Title: {
        type: String,
        trim: true,
    },
    Body: {
        type: String,
        required: true,
        trim: true,
    },
    Post: {
        type: String,
        required: true
    }
    ,
    Postedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
},
    {
        timestamps: true
    }
)

const model = mongoose.model('post', postSchema);

module.exports = model;