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