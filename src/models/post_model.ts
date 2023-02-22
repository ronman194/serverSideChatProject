import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    message:{
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    postImage:{
        type: String
    }
})

export = mongoose.model('Post',postSchema)

