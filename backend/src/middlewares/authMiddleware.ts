import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as any;
        req.user = { id: decoded.id, role: decoded.role };
        return next();
      }
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token' });
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token && token !== 'null') {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as any;
        req.user = { id: decoded.id, role: decoded.role };
      }
    } catch (error) {
      // Don't throw error, just proceed as guest
      console.log('Invalid token provided for optional route, treating as guest');
    }
  }
  next();
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'system_admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export const staffOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff' || req.user.role === 'system_admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as staff or admin' });
  }
};

export const deliveryBoy = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && (req.user.role === 'delivery_boy' || req.user.role === 'admin' || req.user.role === 'system_admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized for delivery access' });
  }
};

export const systemAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'system_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as System Admin' });
  }
};
