import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    postImage: {
        type: String
    },
    senderFirstName: {
        type: String,
        required: true
    },
    senderLastName: {
        type: String,
        required: true
    },
    senderProfileImage: {
        type: String,
        required: true
    },
    likes: {
        type: Array,
    },
    comments: {
        type: Array
    }
})

export = mongoose.model('Post', postSchema)

