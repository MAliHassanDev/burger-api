import { z } from "zod";

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

  /**
   * Global middleware to be executed before each request.
   */
  globalMiddleware?: Middleware[];

  /**
   * The title of the API. This is an optional property that can be used
   * to specify a custom title for the API documentation.
   */
  title?: string;

  /**
   * The description of the API. This is an optional property that can be used
   * to provide a brief overview of the API.
   */
  description?: string;

  /**
   * The version of the API. This is an optional property that can be used
   * to specify the version of the API.
   */
  version?: string;
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

  /**
   * Contains URL parameters extracted from the request path.
   * This property is only present if the request path matches a route
   * with dynamic parameters.
   *
   * For example, if the route is `/users/:id`, and the request path is
   * `/users/123`, then the `params` property will be `{ id: '123' }`.
   */
  params?: Record<string, string>;

  /**
   * Contains validated data for the request.
   * This is an optional property that will only be present if
   * a middleware has validated the request data and attached the
   * validated data to the request.
   *
   * Properties:
   * - `params`: Validated URL parameters.
   * - `query`: Validated query string parameters.
   * - `body`: Validated request body (if JSON).
   */
  validated?: {
    params?: unknown;
    query?: unknown;
    body?: unknown;
  };
}

export interface BurgerResponse {
  /**
   * Sets a header value.
   * @param name - The header name.
   * @param value - The header value.
   */
  setHeader(name: string, value: string): void;

  /**
   * Removes a header.
   * @param name - The header name to remove.
   */
  removeHeader(name: string): void;

  /**
   * Sets the HTTP status code.
   * @param status - The status code.
   */
  setStatus(status: number): void;

  /**
   * Sets the response body.
   * @param body - The body content.
   */
  setBody(body: BodyInit): void;

  /**
   * Builds and returns the final Response object using the current state.
   * This should be called only once when the response is finalized.
   * @returns The final Response object.
   */
  build(): Response;

  /**
   * Convenience method to send a JSON response.
   * Sets the "Content-Type" header and serializes the data to JSON.
   * @param data - The data to send.
   * @returns The final Response object.
   */
  json(data: unknown): Response;

  /**
   * Convenience method to send a plain text response.
   * Sets the "Content-Type" header and returns a text response.
   * @param data - The text to send.
   * @returns The final Response object.
   */
  text(data: string): Response;

  /**
   * Convenience method to send an HTML response.
   * Sets the "Content-Type" header and returns an HTML response.
   * @param data - The HTML string to send.
   * @returns The final Response object.
   */
  html(data: string): Response;

  /**
   * Convenience method to send a redirect response.
   * Sets the "Location" header and status code.
   * @param url - The URL to redirect to.
   * @param status - The HTTP status code (default 302).
   * @returns The final Response object.
   */
  redirect(url: string, status?: number): Response;

  /**
   * Convenience method to send a file response using Bun.file.
   * @param filePath - The file path to serve.
   * @returns The final Response object.
   */
  file(filePath: string): Response;

  /**
   * Returns a Response directly using the provided body and init settings.
   * This bypasses the mutable state.
   * @param body - The response body.
   * @param init - Optional ResponseInit settings.
   * @returns A new Response object.
   */
  original(body?: BodyInit | null, init?: ResponseInit): Response;
}

/**
 * Represents a request handler function.
 * Request handler functions receive a BurgerRequest, BurgerResponse, and
 * optional URL parameters as arguments. They must return a Response object,
 * which can be either a Promise that resolves with a Response object or a
 * Response object directly.
 *
 * @param request - The incoming BurgerRequest object.
 * @param response - The outgoing BurgerResponse object.
 * @param params - Optional URL parameters as a Record<string, string>.
 * @returns A Response object or a Promise that resolves with a Response object.
 */
export type RequestHandler = (
  request: BurgerRequest,
  response: BurgerResponse,
  params?: Record<string, string>
) => Promise<Response> | Response;

/**
 * Represents a middleware function in the request handling pipeline.
 * Middleware functions have the ability to modify the request and response
 * objects, end the request-response cycle, or call the next middleware function
 * in the chain. They are executed in the order they are defined.
 *
 * @param request - The incoming BurgerRequest object.
 * @param response - The outgoing BurgerResponse object.
 * @param next - A function to call the next middleware in the chain.
 * @returns A Promise that resolves with the response.
 */
export type Middleware = (
  request: BurgerRequest,
  response: BurgerResponse,
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

  /**
   * An optional route schema to validate the request data against.
   * This property is set by the user when defining a route.
   * The schema is used to validate the request data for each HTTP method.
   * The keys are the HTTP method names (in lowercase) and the values are
   * the Zod schema objects for that method.
   */
  schema?: RouteSchema;

  /**
   * An optional OpenAPI metadata object for the route.
   * This object defines the OpenAPI specification details for each HTTP method.
   * The keys are the HTTP method names (e.g. "get", "post") and the values are
   * objects containing OpenAPI metadata, such as summary and description.
   */
  openapi?: {
    [method: string]: {
      summary?: string;
      description?: string;
    };
  };
}

/**
 * Define a type for the route schema.
 * For each HTTP method (in lowercase), you can optionally define:
 * - params: for URL parameters,
 * - query: for query string parameters,
 * - body: for the request body.
 */
export type RouteSchema = {
  [method: string]: {
    params?: z.ZodTypeAny;
    query?: z.ZodTypeAny;
    body?: z.ZodTypeAny;
  };
};
