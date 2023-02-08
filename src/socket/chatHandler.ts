import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Message from "../models/message_model";

export = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {

    const sendMessage =async (payload) => {
        const to = payload.to;
        const message = payload.message;
        const from = socket.data.user;
        const newMessage = new Message({
            'message': message,
            'sender': from,
            'reciver': to
        });
        await newMessage.save();
        io.to(to).emit("chat:message", { 'to': to, 'from': from, 'message': message });
    }
    const getMessage =async (payload) => {
        const userId = payload.userId;
        const reciveMessages = await Message.find({'reciver': userId});
        const sendMessages = await Message.find({'sender': userId});
        socket.emit("chat:get_messages.response", { 'userId': userId, 'reciveMessages': reciveMessages, 'sendMessages': sendMessages });
    }

    console.log('register chat handlers');
    socket.on("chat:send_message", sendMessage);
    socket.on("chat:get_messages", getMessage);
}