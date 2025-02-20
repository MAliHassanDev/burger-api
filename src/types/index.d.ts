export interface ServerOptions {
  /**
   * The port number to listen on.
   */
  port: number;
  /**
   * The directory path to load API routes from.
   * If not specified, no API routes are loaded.
   */
  apiDir?: string;
  /**
   * The directory path to load Page routes from.
   * If not specified, no Page routes are loaded.
   * Page routes are not yet supported, but will be supported in the future.
   */
  pageDir?: string;
}

export interface BurgerRequest extends Request {
  /**
   * Provides helper to access query parameters as URLSearchParams.
   * This is a convenience property that allows you to access the query
   * parameters of the request as a URLSearchParams object, which provides
   * methods for working with the query parameters like `get(key)`,
   * `getAll(key)`, `has(key)`, `keys()`, `values()`, `entries()`, and more.
   */
  query: URLSearchParams;
}

export interface BurgerResponse {
  /**
   * Returns a JSON response with proper headers.
   * @param data - The data to send as JSON.
   * @param init - Optional ResponseInit settings.
   */
  json(data: unknown, init?: ResponseInit): Response;

  /**
   * Returns a plain text response with proper headers.
   * @param data - The text to send.
   * @param init - Optional ResponseInit settings.
   */
  text(data: string, init?: ResponseInit): Response;

  /**
   * Returns an HTML response with proper headers.
   * @param data - The HTML to send.
   * @param init - Optional ResponseInit settings.
   */

  /**
   * Returns a redirect response.
   * @param url - The URL to redirect to.
   * @param status - The HTTP status code (default 302).
   */
  redirect(url: string, status?: number): Response;

  /**
   * Returns a file response using Bun.file.
   * @param filePath - The file path to serve.
   * @param init - Optional ResponseInit settings.
   */
  file(filePath: string, init?: ResponseInit): Response;

  /**
   * Returns the original Response object.
   * @param body - The response body. If undefined or null, the response body will be empty.
   * @param init - Optional ResponseInit settings.
   * @returns The original Response object.
   */
  original(body?: BodyInit | null, init?: ResponseInit): Response;
}

export type RequestHandler = (
  request: BurgerRequest,
  response: BurgerResponse,
  params?: Record<string, string>
) => Promise<Response> | Response;

export type Middleware = (
  request: BurgerRequest,
  next: () => Promise<Response>
) => Promise<Response>;

export interface RouteDefinition {
  /**
   * The path of the route.
   */
  path: string;
  /**
   * An object containing the request handlers for each HTTP method.
   * The keys are the HTTP method names (e.g. "GET", "POST", etc.).
   * The values are the request handlers for that method.
   */
  handlers: { [method: string]: RequestHandler };
  /**
   * An array of middleware functions to run before the request handler.
   * The middleware functions will be run in the order they are specified.
   */
  middleware?: Middleware[];
}
