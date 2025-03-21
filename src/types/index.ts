import { z } from 'zod';

export interface ServerOptions {
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
     * The version of the API. This is an optional property that can be used
     * to specify the version of the API.
     */
    version?: string;

    /**
     * Enables or disables debug mode. This is an optional property
     * that, when set to true, can be used to output additional debugging
     * information to the console or logs to aid in development and troubleshooting.
     */
    debug?: boolean;
}


type DefaultRequestProperties = {
  params?: unknown;
  query?: unknown;
  body?: unknown;
};

export interface BurgerRequest<
  RequestValidatedProperties extends DefaultRequestProperties = DefaultRequestProperties
> extends Request {
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
  validated: RequestValidatedProperties;
}

export interface BurgerResponse {
    /**
     * Sets a header value.
     * @param name - The header name.
     * @param value - The header value.
     * @returns The current instance for chaining.
     */
    header(name: string, value: string): this;

    /**
     * Removes a header.
     * @param name - The header name to remove.
     * @returns The current instance for chaining.
     */
    removeHeader(name: string): this;

    /**
     * Sets the HTTP status code.
     * @param status - The status code.
     * @returns The current instance for chaining.
     */
    status(status: number): this;

    /**
     * Sets the response body.
     * @param body - The body content.
     * @returns The current instance for chaining.
     */
    body(body: BodyInit): this;

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
     * @returns The current instance for chaining.
     */
    redirect(url: string, status?: number): this;

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
 * Represents a next function in the request handling pipeline.
 * This function is used to call the next middleware in the chain.
 * It returns a Promise that resolves with a Response object.
 */
export type BurgerNext = () => Promise<Response>;

/**
 * Represents a request handler function.
 * Request handler functions receive a BurgerRequest and BurgerResponse as
 * arguments. They must return a Response object, which can be either a Promise
 * that resolves with a Response object or a Response object directly.
 *
 * @param request - The incoming BurgerRequest object.
 * @param response - The outgoing BurgerResponse object.
 * @returns A Response object or a Promise that resolves with a Response object.
 */
export type RequestHandler = (
    request: BurgerRequest,
    response: BurgerResponse
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
    next: BurgerNext
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
     * Optional OpenAPI metadata to generate documentation for the route.
     * If provided, this property should define an object where each key
     * is an HTTP method name (in lowercase), and the value is an object
     * containing the OpenAPI metadata for that method.
     */
    openapi?: openapi;
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

/**
 * Optional OpenAPI metadata to generate documentation for the route.
 * Each key is an HTTP method name (in lowercase) and the value is an object
 * containing the OpenAPI metadata for that method.
 *
 * If the `openapi` property is not defined, the route will not be included in
 * the generated OpenAPI documentation.
 *
 * See the OpenAPI specification for the possible properties and their
 * descriptions.
 */
export type openapi = {
    [method: string]: {
        summary?: string;
        description?: string;
        tags?: string[];
        operationId?: string;
        deprecated?: boolean;
        responses?: Record<string, any>;
        externalDocs?: {
            description?: string;
            url?: string;
        };
    };
};

export interface PageDefinition {
    path: string;
    handler: RequestHandler;
    middleware?: RequestHandler[];
}
