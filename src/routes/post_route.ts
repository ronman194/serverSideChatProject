/**
* @swagger
* tags:
*   name: Post
*   description: The Posts API
*/

import express from 'express';
const router = express.Router();
import post from '../controllers/post';
import auth from '../controllers/auth';
import Req from '../common/Req';
import Res from '../common/Res';
import Err from '../common/Err';

/**
* @swagger
* components:
*   schemas:
*     Post:
*       type: object
*       required:
*         - message
*         - sender
*         - postImage
*         - senderFirstName
*         - senderLastName
*         - senderProfileImage
*       properties:
*         message:
*           type: string
*           description: The post text
*         sender:
*           type: string
*           description: The sending user email
*         postImage:
*           type: string
*           description: The post image 
*         senderFirstName:
*           type: string
*           description: The sending user first name
*         senderLastName:
*           type: string
*           description: The sending user last name
*         senderProfileImage:
*           type: string
*           description: The sending user profile image
*       example:
*         message: 'this is my new post'
*         sender: 'bob@gmail.com'
*         postImage: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=389&q=80'
*         senderFirstName: 'bob'
*         senderLastName: 'bobi'
*         senderProfileImage: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=389&q=80'
*     AddPost:
*       type: object
*       required:
*         - message
*         - sender
*         - image
*         - firstName
*         - lastName
*         - profileImage
*       properties:
*         message:
*           type: string
*           description: The post text
*         sender:
*           type: string
*           description: The sending user email
*         image:
*           type: string
*           description: The post image 
*         firstName:
*           type: string
*           description: The sending user first name
*         lastName:
*           type: string
*           description: The sending user last name
*         profileImage:
*           type: string
*           description: The sending user profile image
*       example:
*         message: 'this is my new post'
*         sender: 'bob@gmail.com'
*         image: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=389&q=80'
*         firstName: 'bob'
*         lastName: 'bobi'
*         profileImage: 'https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=389&q=80'
*     UpdatePost:
*       type: object
*       required:
*         - message 
*         - updateImage 
*       properties:
*         message:
*           type: string
*           description: The post update text
*         updateImage:
*           type: string
*           description: The post update image 
*       example:
*         message: 'this is my new and update post'
*         updateImage: 'https://images.unsplash.com/photo-1677530248563-e6105354fafb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxNXx8fGVufDB8fHx8&auto=format&fit=crop&w=500&q=60'
*/

/**
 * @swagger
 * /post:
 *   get:
 *     summary: get list of post from server
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sender
 *         schema:
 *           type: string
 *           description: filter the posts according to the given sender id
 *     responses:
 *       200:
 *         description: the list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                  $ref: '#/components/schemas/Post'
 *  
 */
router.get('/', auth.authenticateMiddleware, async (req, res) => {
    try {
        const response: Res = await post.getAllPosts(Req.fromRestRequest(req));
        if (response.err == null) {
            response.sendRestResponse(res);
        }
        if (response.err.code) {
            if (response.err.code === 400) {
                return res.status(400).send({
                    'status': 'fail',
                    'message': response.err.message
                });
            }
        }
    } catch (err) {
        console.log(err)
    }
});

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: get post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         requiered: true
 *         schema:
 *           type: string
 *           description: the requested post id
 *     responses:
 *       200:
 *         description: the requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *  
 */
router.get('/:id', auth.authenticateMiddleware, async (req, res) => {
    try {
        const response: Res = await post.getPostById(Req.fromRestRequest(req));
        if (response.err == null) {
            response.sendRestResponse(res);
        }
        if (response.err.code != null) {
            if (response.err.code === 400) {
                return res.status(400).send({
                    'status': 'fail',
                    'message': response.err.message
                });
            }
        }
    } catch (err) {
        console.log("ERR")
    }
});

/**
 * @swagger
 * /post:
 *   post:
 *     summary: add a new post
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddPost'
 *     responses:
 *       200:
 *         description: the requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *  
 */
router.post('/', auth.authenticateMiddleware, async (req, res) => {
    try {
        const response: Res = await post.addNewPost(Req.fromRestRequest(req));
        response.sendRestResponse(res);
    } catch (err) {
        res.status(400).send({
            'status': 'fail',
            'message': err.message
        });
    }
});



/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: update existing post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         requiered: true
 *         schema:
 *           type: string
 *           description: the updated post id    
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePost'
 *     responses:
 *       200:
 *         description: the requested update post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *  
 */
router.put('/:id', auth.authenticateMiddleware, async (req, res) => {
    try {
        const response: Res = await post.putPostById(Req.fromRestRequest(req));
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
        console.log("ERR")
    }
});

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: get post by id
 *     tags: [Post]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         requiered: true
 *         schema:
 *           type: string
 *           description: the requested post id
 *     responses:
 *       200:
 *         description: the post deleted
 *  
 */
router.delete('/:id', auth.authenticateMiddleware, async (req, res) => {
    try {
        const response: Res = await post.deletePostById(Req.fromRestRequest(req));
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
        console.log("ERR")
    }
});


export = router