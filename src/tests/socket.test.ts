import server from "../app";
import mongoose from "mongoose";
import Client, { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

import request from 'supertest';
import Post from '../models/post_model';
import User from '../models/user_model';
import Message from '../models/message_model';

const userEmail = "user1@gmail.com";
const userPassword = "12345";

const userEmail2 = "user2@gmail.com";
const userPassword2 = "12345";

let postId = '';
const message = "hi... post add message";
const updateMessage = "This is a new message";

const sendMessages = ["hi... test 1", "hi... test 2", "hi... test 3", "hi... test 4",]
const reciveMessage = ["hi... test 5"];



type Client = {
    socket: Socket<DefaultEventsMap, DefaultEventsMap>,
    accessToken: string,
    id: string
}

let client1: Client;
let client2: Client;

function clientSocketConnect(clientSocket): Promise<string> {
    return new Promise((resolve) => {
        clientSocket.on("connect", () => {
            resolve("1");
        });
    });
}

const connectUser = async (userEmail:string, userPassword:string) => {
    const response1 = await request(server).post('/auth/register').send({
        "email": userEmail,
        "password": userPassword
    });
    const userId = response1.body._id;
    const response = await request(server).post('/auth/login').send({
        "email": userEmail,
        "password": userPassword
    });
    const token = response.body.accessToken;

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
        await Post.remove();
        await User.remove();
        await Message.remove();
        client1 = await connectUser(userEmail, userPassword);
        client2 = await connectUser(userEmail2, userPassword2);
        console.log("finish beforeAll");
    });

    afterAll(() => {
        client1.socket.close();
        client2.socket.close();
        server.close();
        mongoose.connection.close();
    });

    test("should work", (done) => {
        client1.socket.once("echo:echo_res", (arg) => {
            console.log("echo:echo");
            expect(arg.msg).toBe('hello');
            done();
        });
        client1.socket.emit("echo:echo", { 'msg': 'hello' });
    });

    test("postAdd", (done) => {
        client2.socket.once('post:add.response', (args) => {
            expect(args.message).toEqual(message);
            expect(args.sender).toEqual(client2.id);
            postId = args._id;
            done();
        })
        client2.socket.emit('post:add_new', { 'message': message, 'userId': client2.id, 'socketId': client2.socket.id });
    })
    test("postAdd", (done) => {
        client1.socket.once('post:add.response', (args) => {
            expect(args.message).toEqual(message);
            expect(args.sender).toEqual(client1.id);
            postId = args._id;
            done();
        })
        client1.socket.emit('post:add_new', { 'message': message, 'userId': client1.id, 'socketId': client1.socket.id });
    })

    test("Post get all test", (done) => {
        client1.socket.once('post:get.response', (arg) => {
            expect(arg[0].message).toBe(message);
            expect(arg[0].sender).toBe(client2.id);
            done();
        });
        client1.socket.emit("post:get", {});
    });

    test("Post get post by sender test", (done) => {
        client1.socket.once('post:get:sender.response', (arg) => {
            console.log("on any " + arg);
            expect(arg[0].message).toBe(message);
            expect(arg[0].sender).toBe(client1.id);
            done();
        });
        client1.socket.emit("post:get:sender", { 'userId': client1.id });
    });

    //********************************************************************************************* */
    test("Test chat messages", (done) => {
        client2.socket.once('chat:message', (args) => {
            expect(args.to).toBe(client2.id);
            expect(args.message).toBe(sendMessages[0]);
            expect(args.from).toBe(client1.id);
            done();
        })
        client1.socket.emit("chat:send_message", { 'to': client2.id, 'message': sendMessages[0] });
    });
    test("Test chat messages", (done) => {
        client2.socket.once('chat:message', (args) => {
            expect(args.to).toBe(client2.id);
            expect(args.message).toBe(sendMessages[1]);
            expect(args.from).toBe(client1.id);
            done();
        })
        client1.socket.emit("chat:send_message", { 'to': client2.id, 'message': sendMessages[1] });
    });
    test("Test chat messages", (done) => {
        client2.socket.once('chat:message', (args) => {
            expect(args.to).toBe(client2.id);
            expect(args.message).toBe(sendMessages[2]);
            expect(args.from).toBe(client1.id);
            done();
        })
        client1.socket.emit("chat:send_message", { 'to': client2.id, 'message': sendMessages[2] });
    });
    test("Test chat messages", (done) => {
        client2.socket.once('chat:message', (args) => {
            expect(args.to).toBe(client2.id);
            expect(args.message).toBe(sendMessages[3]);
            expect(args.from).toBe(client1.id);
            done();
        })
        client1.socket.emit("chat:send_message", { 'to': client2.id, 'message': sendMessages[3] });
    });
    test("Test chat messages", (done) => {
        client1.socket.once('chat:message', (args) => {
            expect(args.to).toBe(client1.id);
            expect(args.message).toBe(reciveMessage[0]);
            expect(args.from).toBe(client2.id);
            done();
        })
        client2.socket.emit("chat:send_message", { 'to': client1.id, 'message': reciveMessage[0] });
    });
    test("Test get messages", (done) => {
        client1.socket.once('chat:get_messages.response', (args) => {
            for (let i = 0; i < sendMessages.length; i++) {
                expect(args.sendMessages[i].message).toBe(sendMessages[i]);
                expect(args.sendMessages[i].sender).toBe(client1.id);
                expect(args.sendMessages[i].reciver).toBe(client2.id);
            }
            for (let i = 0; i < reciveMessage.length; i++) {
                expect(args.reciveMessages[i].message).toBe(reciveMessage[i]);
                expect(args.reciveMessages[i].sender).toBe(client2.id);
                expect(args.reciveMessages[i].reciver).toBe(client1.id);
            }
            done();
        })
        client1.socket.emit("chat:get_messages", { 'userId': client1.id });
    });

    //********************************************************************************************* */
    test("get post by id", (done) => {
        client1.socket.once('post:get:id.response', (args) => {
            expect(args.sender).toEqual(client1.id);
            expect(args._id).toEqual(postId);
            expect(args.message).toEqual(message);
            done();
        })
        client1.socket.emit('post:get:id', { 'postId': postId, 'userId': client1.id });
    });

    test("get post by wrong id", (done) => {
        client1.socket.once('post:get:id.response', (args) => {
            console.log(args.message);
            expect(args.code).toEqual(400);
            done();
        })
        client1.socket.emit('post:get:id', { 'postId': 123456, 'userId': client1.id });
    });

    test("update post by id", (done) => {
        client1.socket.once('post:put.response', (args) => {
            expect(args.sender).toEqual(client1.id);
            expect(args._id).toEqual(postId);
            expect(args.message).toEqual(updateMessage);
            done();
        })
        client1.socket.emit('post:put', { 'postId': postId, 'message': updateMessage, 'userId': client1.id });
    });

    test("update post by wrong id", (done) => {
        client1.socket.once('post:put.response', (args) => {
            console.log(args.message);
            expect(args.code).toEqual(400);
            done();
        })
        client1.socket.emit('post:put', { 'postId': 123456, 'message': updateMessage, 'userId': client1.id });
    });

});