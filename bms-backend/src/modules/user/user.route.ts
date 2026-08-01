import express from 'express';
import * as UserController from './user.controller';
import { isVerifiedUser } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/me', UserController.getMe);     
router.put('/activate/:id', isVerifiedUser, UserController.activateUser);

export default router;