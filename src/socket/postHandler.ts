import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import postController from "../controllers/post";
import Req from '../common/Req';
import Res from '../common/Res';
import Err from '../common/Err';

export = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>,
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap>) => {

    const getAllPosts = async (payload) => {
        try {
            const response:Res = await postController.getAllPosts(new Req({}, payload.userId,null, {'sender':null}));
            socket.emit('post:get.response', response.body);
        } catch (err) {
            socket.emit('post:get.response', { 'status': 'fail' });
        }
    }

    const getPostsBySender = async (payload) => {
        console.log("SENDER: " + payload.userId)
        try {
            const response:Res = await postController.getAllPosts(new Req({}, payload.userId,null, {'sender':payload.userId}));
            socket.emit('post:get:sender.response', response.body);
        } catch (err) {
            socket.emit('post:get:sender.response', { 'status': 'fail' });
        }
    }

    const getPostById = async (payload) => {
        console.log("get post with id: %s", payload.postId);
        try {
            const response:Res = await postController.getPostById(new Req(payload.postId, payload.userId,payload.postId));
            socket.emit('post:get:id.response', response.body);
        } catch (err) {
            socket.emit('post:get:id.response', { 'status': 'fail' });
        }
    }

    const putPostById = async (payload) => {
        console.log("update post with id: %s", payload.postId);
        try {
            const response:Res = await postController.putPostById(new Req(payload, payload.userId,payload.postId));
            socket.emit('post:put.response', response.body);
        } catch (err) {
            socket.emit('post:put.response', { 'status': 'fail' });
        }
    }
    
    const addNewPost = async (payload) => {
        console.log("postAdd with socketId: %s", payload.socketId);
        try {
            const response:Res = await postController.addNewPost(new Req(payload.message, payload.userId));
            socket.emit('post:add.response', response.body);
        } catch (err) {
            socket.emit('post:add.response', { 'status': 'fail' });
        }

    }

    console.log('register echo handlers');
    socket.on("post:get", getAllPosts);
    socket.on("post:get:sender", getPostsBySender);
    socket.on("post:get:id", getPostById);
    socket.on("post:add_new", addNewPost);
    socket.on("post:put", putPostById);
}