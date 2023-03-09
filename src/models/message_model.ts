import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    senderImage: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true,
        default: Date.now,
    },

})

export = mongoose.model('Message', messageSchema)

