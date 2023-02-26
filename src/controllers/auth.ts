
import User from '../models/user_model'
import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Res from '../common/Res'
import Err from '../common/Err'
import Post from '../models/post_model'

function sendError(res: Response, error: string) {
    res.status(400).send({
        'err': error
    })
}

const register = async (req: Request, res: Response) => {
    const firstName: String = req.body.firstName;
    const lastName: String = req.body.lastName;
    const email: String = req.body.email.toLowerCase();
    const password = req.body.password;
    const profileImage: String = req.body.profileImage;

    if (email == null || password == null) {
        return sendError(res, 'please provide valid email and password')
    }

    if (firstName == null || lastName == null) {
        return sendError(res, 'please provide valid first and last name')
    }

    try {
        const user = await User.findOne({ 'email': email })
        if (user != null) {
            console.log('user already registered, try a different name')
            return sendError(res, 'user already registered, try a different name')
        }

        const salt = await bcrypt.genSalt(10)
        const encryptedPwd = await bcrypt.hash(password, salt)
        const newUser = new User({
            'firstName': firstName,
            'lastName': lastName,
            'email': email,
            'password': encryptedPwd,
            'profileImage': profileImage
        })
        await newUser.save()
        return res.status(200).send({
            'email': email,
            '_id': newUser._id
        })
    } catch (err) {
        return sendError(res, 'fail to create new user, please try again')
    }
}

async function generateTokens(userId: string) {
    const accessToken = await jwt.sign(
        { 'id': userId },
        process.env.ACCESS_TOKEN_SECRET,
        { 'expiresIn': process.env.JWT_TOKEN_EXPIRATION }
    )
    const refreshToken = await jwt.sign(
        { 'id': userId },
        process.env.REFRESH_TOKEN_SECRET
    )

    return { 'accessToken': accessToken, 'refreshToken': refreshToken }
}

const login = async (req: Request, res: Response) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    if (email == null || password == null) {
        return sendError(res, 'please provide valid email and password')
    }

    try {
        const user = await User.findOne({ 'email': email })
        if (user == null) return sendError(res, 'incorrect user or password')

        const match = await bcrypt.compare(password, user.password)
        if (!match) return sendError(res, 'incorrect user or password')

        const tokens = await generateTokens(user._id.toString())

        if (user.refresh_tokens == null) user.refresh_tokens = [tokens.refreshToken]
        else user.refresh_tokens.push(tokens.refreshToken)
        await user.save()
        console.log("HII")
        return res.status(200).send({ 'tokens': tokens, 'user': user })
    } catch (err) {
        console.log("error: " + err)
        return sendError(res, 'fail checking user')
    }
}

function getTokenFromRequest(req: Request): string {
    const authHeader = req.headers['authorization']
    if (authHeader == null) return null
    return authHeader.split(' ')[1]
}

type TokenInfo = {
    id: string
}
const refresh = async (req: Request, res: Response) => {
    const refreshToken = getTokenFromRequest(req)
    if (refreshToken == null) return sendError(res, 'authentication missing')

    try {
        const user: TokenInfo = <TokenInfo>jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const userObj = await User.findById(user.id)
        if (userObj == null) return sendError(res, 'fail validating token')

        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = []
            await userObj.save()
            return sendError(res, 'fail validating token')
        }

        const tokens = await generateTokens(userObj._id.toString())

        userObj.refresh_tokens[userObj.refresh_tokens.indexOf(refreshToken)] = tokens.refreshToken
        console.log("refresh token: " + refreshToken)
        console.log("with token: " + tokens.refreshToken)
        await userObj.save()

        return res.status(200).send(tokens)
    } catch (err) {
        return sendError(res, 'fail validating token')
    }
}

const logout = async (req: Request, res: Response) => {
    const refreshToken = getTokenFromRequest(req)
    if (refreshToken == null) return sendError(res, 'authentication missing')

    try {
        const user = <TokenInfo>jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const userObj = await User.findById(user.id)
        if (userObj == null) return sendError(res, 'fail validating token')

        if (!userObj.refresh_tokens.includes(refreshToken)) {
            userObj.refresh_tokens = []
            await userObj.save()
            return sendError(res, 'fail validating token')
        }

        userObj.refresh_tokens.splice(userObj.refresh_tokens.indexOf(refreshToken), 1)
        await userObj.save()
        return res.status(200).send()
    } catch (err) {
        return sendError(res, 'fail validating token')
    }
}

const updateProfile = async (req) => {
    const updateFirstName = req.body.firstName;
    const updateLastName = req.body.lastName;
    const updateImgProfile = req.body.profileImage;
    const email = req.body.email.toLowerCase();
    // console.log(updateFirstName + updateLastName + updateImgProfile + email)
    // console.log(req.body);
    try {
        const user = await User.findOneAndUpdate({ 'email': email },
            { 'firstName': updateFirstName, 'lastName': updateLastName, 'profileImage': updateImgProfile }, { new: true }
        )
        await Post.updateMany({ 'sender': email },
            {
                'senderFirstName': updateFirstName,
                'senderLastName': updateLastName,
                'senderProfileImage': updateImgProfile
            })
        // console.log('user ' + user)
        return new Res(user, email, null);
    } catch (err) {
        // console.log("fail to update post in db")
        return new Res(new Err(400, err.message), email, new Err(400, err.message));
    }
}

const authenticateMiddleware = async (req, res, next: NextFunction) => {
    const token = getTokenFromRequest(req);
    // console.log("TOKEN " + token);
    if (token == null) return sendError(res, 'authentication missing');
    try {
        const user = <TokenInfo>jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        // console.log(user);
        req.body.userId = user.id;
        // console.log("token user: " + user.id);
        return next();
    } catch (err) {
        return sendError(res, 'fail validating token');
    }

}

export = { login, refresh, register, logout, updateProfile, authenticateMiddleware }
