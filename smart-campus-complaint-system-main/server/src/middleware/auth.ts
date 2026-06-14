import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'secret') as JwtPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const isStudent = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ error: 'Student access required' });
  }
  next();
};

export const isStaff = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'staff') {
    return res.status(403).json({ error: 'Staff access required' });
  }
  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const isStaffOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!['staff', 'admin'].includes(req.user?.role ?? '')) {
    return res.status(403).json({ error: 'Staff or Admin access required' });
  }
  next();
};
