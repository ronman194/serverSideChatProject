
import Post from '../models/post_model';
import { Request, Response } from 'express';
import Res from '../common/Res';
import Err from '../common/Err';


const getAllPosts = async (req) => {
    try {
        let posts = {}
        if (req.query.sender == null) {
            posts = await Post.find()
        } else {
            posts = await Post.find({ 'sender': req.query.sender })
        }
        return new Res(posts, req.body.userId, null);
    } catch (err) {
        return new Res(new Err(400, err.message), req.body.userId, new Err(400, err.message));
    }
}

const getPostById = async (req) => {
    let param = req.params.id;
    if (param == null || undefined){
        param = req.params;
    }
    try {
        const posts = await Post.findById(param);
        return new Res(posts, req.body.userId, null);
    } catch (err) {
        return new Res(new Err(400, err.message), req.body.userId, new Err(400, err.message));
    }
}


const addNewPost = async (req) => {
    console.log(req.body);

    const post = new Post({
        message: req.body.message,
        sender: req.body.sender,     //extract the user id from the auth 
        postImage: req.body.image
    });

    if (post.message == undefined || post.message == null) {
        post.message = req.body;
        post.sender = req.userId;
        try {
            const newPost = await post.save();
            console.log("Save Succesful id: "+ newPost._id);
            return new Res(newPost, req.userId, null);
        } catch (err) {
            return new Res(null, req.userId, new Err(400, err.message));
        }
    }

    try {
        const newPost = await post.save();
        return new Res(newPost, req.body.userId, null);
    } catch (err) {
        return new Res(null, req.body.userId, new Err(400, err.message));
    }

}


const putPostById = async (req) => {
    try {
        const updateMessage = req.body.message;
        let postId = req.params.id;
        if (postId == null || postId == undefined){
            postId = req.params;
        }
        const post = await Post.findByIdAndUpdate(postId, {'message':updateMessage}, { new: true })
        return new Res(post, req.body.userId, null);
    } catch (err) {
        console.log("fail to update post in db")
        return new Res(new Err(400, err.message), req.body.userId, new Err(400, err.message));
    }
}


export = { getAllPosts, addNewPost, getPostById, putPostById }
