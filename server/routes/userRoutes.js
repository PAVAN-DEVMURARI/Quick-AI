import express from 'express';
import { auth } from '../middlewares/auth.js';
import { getPublishedCreations, getUser, toggleLikeCreation } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/get-user-creations' , auth , getUser)
userRouter.get('/get-published-creations' , auth , getPublishedCreations)
// Toggle like should be POST because it mutates state
userRouter.post('/toggle-like-creation' , auth , toggleLikeCreation)

export default userRouter;