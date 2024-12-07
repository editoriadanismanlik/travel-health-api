import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const verifyToken = async (token: string): Promise<any> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = await verifyToken(token);
    (req as AuthRequest).user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};
