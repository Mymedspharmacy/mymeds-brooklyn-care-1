import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: any;
}

// Augment Express Request globally
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
} 