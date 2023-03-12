import server from "../app";
import mongoose from "mongoose";
import Client, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

import request from 'supertest';
import User from '../models/user_model';

const userFirstName1 = "user"
const userLastName1 = "userr"
const userEmail1 = "user1@gmail.com"
const userPassword1 = "12345"
const newImg = 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=389&q=80'


const sendMessages = ["hi... test 1", "hi... test 2", "hi... test 3", "hi... test 4",]

type Client = {
    socket: Socket<DefaultEventsMap, DefaultEventsMap>,
    accessToken: string,
    id: string
}

let client1: Client;

function clientSocketConnect(clientSocket): Promise<string> {
    return new Promise((resolve) => {
        clientSocket.on("connect", () => {
            resolve("1");
        });
    });
}

const connectUser = async () => {
    const response1 = await request(server).post('/auth/register').send({
        "firstName": userFirstName1,
        "lastName": userLastName1,
        "email": userEmail1,
        "password": userPassword1
    });
    const userId = response1.body._id;
    const response = await request(server).post('/auth/login').send({
        "email": userEmail1,
        "password": userPassword1
    });
    const token = response.body.tokens.accessToken;

    const socket = Client('http://localhost:' + process.env.PORT, {
        auth: {
            token: 'barrer ' + token
        }
    });
    await clientSocketConnect(socket);
    const client = { socket: socket, accessToken: token, id: userId };
    return client;
}

describe("my awesome project", () => {
    jest.setTimeout(25000);

    beforeAll(async () => {
        await User.findOneAndDelete({ 'email': userEmail1 })
        client1 = await connectUser();
        console.log("finish beforeAll");
    });

    afterAll(() => {
        client1.socket.close();
        server.close();
        mongoose.connection.close();
    });

    test("Test send message", (done) => {
        const newMessage = {
            'message': sendMessages[0],
            'senderImage': newImg,
            'user': userEmail1
        };
        client1.socket.emit("newMessage", newMessage);
        done();
    });
    test("Test get messages", (done) => {
        client1.socket.once('allMessages', (args) => {
            const newMsg = args[args.length - 1];
            expect(newMsg.message).toBe(sendMessages[0]);
            expect(newMsg.sender).toBe(userEmail1);
            done();
        })
        client1.socket.emit("allMessages");
    });
});