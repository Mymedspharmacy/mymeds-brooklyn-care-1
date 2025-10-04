import { Request } from 'express';

export interface User {
  id: string;
  userId: string; // Alias for id for backward compatibility
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'PHARMACIST' | 'STAFF';
  firstName?: string;
  lastName?: string;
  name?: string; // Alias for firstName + lastName
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user: User;
}

// Augment Express Request globally
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

declare module 'hpp' {
  import { RequestHandler } from 'express';
  
  interface HppOptions {
    checkBody?: boolean;
    checkBodyOnlyForContentType?: string[];
    checkQuery?: boolean;
    checkQueryOnlyForContentType?: string[];
    whitelist?: string[];
    whitelistOnlyForContentType?: string[];
  }
  
  function hpp(options?: HppOptions): RequestHandler;
  export = hpp;
}

declare module 'xss-clean' {
  import { RequestHandler } from 'express';
  
  interface XssCleanOptions {
    mode?: 'sanitize' | 'escape';
  }
  
  function xssClean(options?: XssCleanOptions): RequestHandler;
  export = xssClean;
} 