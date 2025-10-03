// Use Case Pattern Interface
// Clean Architecture: Application Layer

export interface IUseCase<Request, Response> {
  execute(request: Request): Promise<Response>;
}

export type ICommand<Request, Response> = IUseCase<Request, Response>

export type IQuery<Request, Response> = IUseCase<Request, Response>

// Base request and response types
export interface BaseRequest {
  userId?: string;
  timestamp?: Date;
}

export interface BaseResponse {
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface ErrorResponse extends BaseResponse {
  success: false;
  error: string;
  code?: string;
}

export interface SuccessResponse<T = any> extends BaseResponse {
  success: true;
  data?: T;
}
