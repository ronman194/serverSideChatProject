import request from 'supertest';
import app from '../server';
import mongoose from 'mongoose';
import Post from '../models/post_model';
import User from '../models/user_model';

const newPostMessage = 'This is the new test post message'
let newPostSender = ''
let newPostId = ''
let firstName = ''
let lastName = ''
let profileImg = ''
const newImg = 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=389&q=80'
const newPostMessageUpdated = 'This is the updated message'

const userEmail = "f@gmail.com"
const userPassword = "12345"
let accessToken = ''

beforeAll(() => {
})

async function loginUser() {
    const res = await request(app).post('/auth/login').send({
        "email": userEmail,
        "password": userPassword
    });
    newPostSender = res.body.user.email;
    firstName = res.body.user.firstName;
    lastName = res.body.user.lastName;
    profileImg = res.body.user.profileImage;
    accessToken = res.body.tokens.accessToken;
}

beforeEach(async () => {
    await loginUser()
})

afterAll(async () => {
    await Post.findByIdAndDelete(newPostId);
    mongoose.connection.close()
})


describe("Posts Tests", () => {
    test("add new post", async () => {
        const response = await request(app).post('/post').set('Authorization', 'JWT ' + accessToken)
            .send({
                "message": newPostMessage,
                "sender": newPostSender,
                "image": '',
                "firstName": firstName,
                "lastName": lastName,
                "profileImage": profileImg,

            })
        expect(response.statusCode).toEqual(200)
        expect(response.body.post.message).toEqual(newPostMessage)
        expect(response.body.post.sender).toEqual(newPostSender)
        expect(response.body.post.postImage).toEqual('')
        expect(response.body.post.senderFirstName).toEqual(firstName)
        expect(response.body.post.senderLastName).toEqual(lastName)
        expect(response.body.post.senderProfileImage).toEqual(profileImg)
        newPostId = response.body.post._id
    })

    test("get all posts", async () => {
        const response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).toEqual(200)
    })

    test("get post by id", async () => {
        const response = await request(app).get('/post/' + newPostId).set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).toEqual(200)
        expect(response.body.post.message).toEqual(newPostMessage)
        expect(response.body.post.sender).toEqual(newPostSender)
    })

    test("get post by wrong id fails", async () => {
        const response = await request(app).get('/post/12345').set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).toEqual(400)
    })

    test("get post by sender", async () => {
        const response = await request(app).get('/post?sender=' + newPostSender).set('Authorization', 'JWT ' + accessToken)
        expect(response.statusCode).toEqual(200)
        response.body.post.forEach(sender => {
            expect(sender.sender).toEqual(newPostSender)
        });
    })

    describe("Updating", () => {
        test("update post by ID", async () => {
            let response = await request(app).put('/post/' + newPostId).set('Authorization', 'JWT ' + accessToken)
                .send({
                    "message": newPostMessageUpdated,
                    "updateImage": newImg
                })
            expect(response.statusCode).toEqual(200)
            expect(response.body.post.message).toEqual(newPostMessageUpdated)
            expect(response.body.post.postImage).toEqual(newImg)

            response = await request(app).get('/post/' + newPostId).set('Authorization', 'JWT ' + accessToken)
            expect(response.statusCode).toEqual(200)
            expect(response.body.post.message).toEqual(newPostMessageUpdated)
            expect(response.body.post.postImage).toEqual(newImg)

            response = await request(app).put('/post/12345').set('Authorization', 'JWT ' + accessToken)
                .send({
                    "message": newPostMessageUpdated,
                    "sender": newPostSender
                })
            expect(response.statusCode).toEqual(400)

        })
    })
    describe("Delete", () => {
        test("delete post by ID", async () => {
            let response = await request(app).delete('/post/' + newPostId).set('Authorization', 'JWT ' + accessToken)

            expect(response.statusCode).toEqual(200)

        })
        test("delete post by wrong ID", async () => {
            let response = await request(app).delete('/post/' + 12345).set('Authorization', 'JWT ' + accessToken)

            expect(response.statusCode).not.toEqual(200)

        })
    })
})