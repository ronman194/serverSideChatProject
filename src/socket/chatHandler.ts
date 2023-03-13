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
            'sender': from.toLowerCase(),
            'senderImage': senderImage,
            'time': Date.now()
        });
        await newMessage.save();
        io.emit("newMessage", newMessage);
    }
    const getMessage = async () => {
        const messages = await Message.find();
        io.emit("allMessages", messages);
    }

    socket.on("newMessage", sendMessage);
    socket.on("allMessages", getMessage);
    socket.on('disconnect', () => {
        // console.log('A user has disconnected');
    });
}