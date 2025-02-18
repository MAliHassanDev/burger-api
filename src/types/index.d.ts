export interface ServerOptions {
  port: number;
  apiDir?: string; // Directory for API routes
  pageDir?: string; // Directory for Page routes (future use)
}

export type RequestHandler = (
  request: Request,
  params?: Record<string, string>
) => Promise<Response> | Response;

export type Middleware = (
  request: Request,
  next: () => Promise<Response>
) => Promise<Response>;

export interface RouteDefinition {
  path: string;
  handlers: { [method: string]: RequestHandler };
  middleware?: Middleware[];
  // Future: schema?: any;
}
