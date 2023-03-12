import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Message from "../models/message_model";

export = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {

    const sendMessage = async (payload) => {
        const senderImage = payload.senderImage;
        const message = payload.message;
        const from = payload.user;
        const newMessage = new Message({
            'message': message,
            'sender': from,
            'senderImage': senderImage,
            'time': Date.now()
        });
        await newMessage.save();
        console.log("New Message")
        console.log(newMessage)
        io.emit("newMessage", newMessage);
    }
    const getMessage = async () => {
        // const userId = payload.userId;
        const messages = await Message.find();
        console.log("Get Messages")
        console.log(messages)
        // const reciveMessages = await Message.find({'reciver': userId});
        // const sendMessages = await Message.find({'sender': userId});
        io.emit("allMessages", messages);
    }

    console.log('register chat handlers');
    socket.on("newMessage", sendMessage);
    socket.on("allMessages", getMessage);
    socket.on('disconnect', () => {
        // console.log('A user has disconnected');
    });
}