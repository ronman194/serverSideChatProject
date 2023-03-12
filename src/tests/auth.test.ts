import request from 'supertest'
import app from '../server'
import mongoose from 'mongoose'
import Post from '../models/post_model'
import User from '../models/user_model'

const newImg = 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=389&q=80'
const updateuserFirstName = "userr"
const updateUserLastName = "userrr"
const userFirstName = "user"
const userLastName = "userr"
const userEmail = "user1@gmail.com"
const userPassword = "12345"
let accessToken = ''
let refreshToken = ''

beforeAll(async () => {
    await User.findOneAndDelete({ 'email': userEmail })
})

afterAll(async () => {
    // await Post.remove()
    await User.findOneAndDelete({ 'email': userEmail })
    mongoose.connection.close()
})

describe("Auth Tests", () => {
    test("Not aquthorized attempt test", async () => {
        const response = await request(app).get('/post');
        expect(response.statusCode).not.toEqual(200)
    })

    test("Register test without password", async () => {
        const response = await request(app).post('/auth/register').send({
            "firstName": userFirstName,
            "lastName": userLastName,
            "email": userEmail,
        })
        expect(response.statusCode).toEqual(400)
    })
    test("Register test without first name", async () => {
        const response = await request(app).post('/auth/register').send({
            "lastName": userLastName,
            "email": userEmail,
            "password": userPassword
        })
        expect(response.statusCode).toEqual(400)
    })
    test("Register test", async () => {
        const response = await request(app).post('/auth/register').send({
            "firstName": userFirstName,
            "lastName": userLastName,
            "email": userEmail,
            "password": userPassword
        })
        expect(response.statusCode).toEqual(200)
    })
    test("Register test with exist user", async () => {
        const response = await request(app).post('/auth/register').send({
            "firstName": userFirstName,
            "lastName": userLastName,
            "email": userEmail,
            "password": userPassword
        })
        expect(response.statusCode).toEqual(400)
    })

    test("Login test wrog password", async () => {
        const response = await request(app).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword + '4'
        })
        expect(response.statusCode).not.toEqual(200)
        const access = response.body.accesstoken
        expect(access).toBeUndefined()
    })
    test("Login test wrog email", async () => {
        const response = await request(app).post('/auth/login').send({
            "email": userEmail + "AAA",
            "password": userPassword
        })
        expect(response.statusCode).not.toEqual(200)
        const access = response.body.accesstoken
        expect(access).toBeUndefined()
    })

    test("Login test", async () => {
        const response = await request(app).post('/auth/login').send({
            "email": userEmail,
            "password": userPassword
        })
        expect(response.statusCode).toEqual(200)
        accessToken = response.body.tokens.accessToken
        expect(accessToken).not.toBeNull()
        refreshToken = response.body.tokens.refreshToken
        expect(refreshToken).not.toBeNull()
    })


    test("test sign valid access token", async () => {
        const response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200)
    })

    test("test sign wrong access token", async () => {
        const response = await request(app).get('/post').set('Authorization', 'JWT 1' + accessToken);
        expect(response.statusCode).not.toEqual(200)
    })

    jest.setTimeout(15000)

    test("test expiered token", async () => {
        await new Promise(r => setTimeout(r, 6000))
        const response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).not.toEqual(200)
    })

    test("test refresh token", async () => {
        let response = await request(app).get('/auth/refresh').set('Authorization', 'JWT ' + refreshToken);
        expect(response.statusCode).toEqual(200)

        accessToken = response.body.accessToken
        expect(accessToken).not.toBeNull()
        refreshToken = response.body.refreshToken
        expect(refreshToken).not.toBeNull()

        response = await request(app).get('/post').set('Authorization', 'JWT ' + accessToken);
        expect(response.statusCode).toEqual(200)

    })
    test("update user", async () => {
        let response = await request(app).put('/auth/update').set('Authorization', 'JWT ' + accessToken)
            .send({
                "firstName": updateuserFirstName,
                "lastName": userLastName,
                "profileImage": newImg,
                "email": userEmail
            })
        expect(response.statusCode).toEqual(200)

        const res = await request(app).get('/post?sender=' + userEmail).set('Authorization', 'JWT ' + accessToken)
        expect(res.statusCode).toEqual(200)
        res.body.post.forEach(sender => {
            expect(sender.firstName).toEqual(updateuserFirstName)
            expect(sender.lastName).toEqual(updateUserLastName)
        });

    })

    test("Logout test", async () => {
        const response = await request(app).get('/auth/logout').set('Authorization', 'JWT ' + refreshToken)
        expect(response.statusCode).toEqual(200)
    })

})