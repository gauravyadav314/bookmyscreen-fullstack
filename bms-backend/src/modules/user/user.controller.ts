import { NextFunction, Response, Request } from "express";
import * as UserService from './user.service';
import * as TokenService from '../auth/token.service';

export const createUser = async (req:Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
}

export const getAllUsers = async (req:Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users);
    }  catch (error) {
        next(error);
    }       
}

export const getUserById = async (req:Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserService.getUserById(req.user?._id);      
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    }  catch (error) {  
        next(error);
    }
}

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accessToken } = req.cookies;
        if (!accessToken) {
            res.status(200).json(null);
            return;
        }

        let decodedToken: any;
        try {
            decodedToken = TokenService.verifyAccessToken(accessToken);
        } catch (err) {
            res.status(200).json(null);
            return;
        }

        if (!decodedToken || !decodedToken._id) {
            res.status(200).json(null);
            return;
        }

        const user = await UserService.getUserById(decodedToken._id);
        if (!user) {
            res.status(200).json(null);
            return;
        }

        res.status(200).json(user);
        return;
    } catch (error) {
        res.status(200).json(null);
        return;
    }
}

export const activateUser = async (req:Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        updateData.activateUser = true; // Ensure activateUser is set to true
        const updatedUser = await UserService.activateUser(userId, updateData);
        res.status(200).json(updatedUser);

    }  catch (error) {
        next(error);
    }
}