

import express from 'express'
import Req from '../common/Req'
import Res from '../common/Res'
const router = express.Router()
import auth from '../controllers/auth'

/**
* @swagger
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*/

/**
* @swagger
* tags:
*   name: Auth
*   description: The Authentication API
*/

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - firstName
*         - lastName
*         - email
*         - password
*       properties:
*         firstName:
*           type: string
*           description: The user first name
*         lastName:
*           type: string
*           description: The user last name
*         email:
*           type: string
*           description: The user email
*         password:
*           type: string
*           description: The user password
*         profileImage:
*           type: string
*           description: The user profile image
*       example:
*         firstName: 'bob'
*         lastName: 'bobi'
*         email: 'bob@gmail.com'
*         password: '123456'
*     UpdateUser:
*       type: object
*       required:
*         - firstName
*         - lastName
*         - email
*         - profileImage
*       properties:
*         firstName:
*           type: string
*           description: The user update first name
*         lastName:
*           type: string
*           description: The user update last name
*         email:
*           type: string
*           description: The user email
*         profileImage:
*           type: string
*           description: The user update profile image
*       example:
*         firstName: 'bo'
*         lastName: 'bob'
*         email: 'bob@gmail.com'
*         profileImage: 'https://images.unsplash.com/photo-1677530248563-e6105354fafb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxNXx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60'
*/

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Register success retuns user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Registeration error
 *         content:
 *           application/json:
 *             schema:
 *               err:
 *                 type: string
 *                 description: The error description 
 *  
 */
router.post('/register', auth.register)


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Login success retuns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               access_token:
 *                 type: string
 *                 description: The Access Token
 *               refresh_token:
 *                 type: string
 *                 description: The Refresh Token
 *             example:
 *               access_token: '223412341...'
 *               refresh_token: '123456...'
 *
 */
router.post('/login', auth.login)

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: refresh access token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: refresh token success retuns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               access_token:
 *                 type: string
 *                 description: The Access Token
 *               refresh_token:
 *                 type: string
 *                 description: The Refresh Token
 *             example:
 *               access_token: '223412341...'
 *               refresh_token: '123456...'
 *
 */
router.get('/refresh', auth.refresh)


/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: logout user invalidate refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: logout sucess, refresh token is invalidated
 *
 */
router.get('/logout', auth.logout)

/**
 * @swagger
 * /auth/update:
 *   put:
 *     summary: update a user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: update user details successful
*         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *  
 *
 */
router.put('/update', auth.authenticateMiddleware, async (req, res) => {
    try {
        const response: Res = await auth.updateProfile(Req.fromRestRequest(req));
        if (response.err == null) {
            response.sendRestResponse(res);
        }
        if (response.err.code === 400) {
            return res.status(400).send({
                'status': 'fail',
                'message': response.err.message
            });
        }
    } catch (err) {
        console.log("ERR" + err)
    }
});
export = router



