// Import stuff  from core
import { Server } from '@core/server.js';
import { ApiRouter } from '@core/api-router.js';
import { PageRouter } from '@core/page-router.js';
import { generateOpenAPIDocument } from '@core/openapi.js';
import { swaggerHtml } from '@core/swagger-ui.js';

// Import utils
import { collectRoutes } from '@utils';

// Import middleware
import { createValidationMiddleware } from '@middleware/validator.js';

// Import types
import type {
    ServerOptions,
    Middleware,
    BurgerRequest,
    RequestHandler,
} from '@burgerTypes';
import type { HTMLBundle } from 'bun';

export class Burger {
    private server: Server;
    private apiRouter?: ApiRouter;
    private pageRouter?: PageRouter;
    private globalMiddleware: Middleware[] = [];
    private openApiDoc: any = null;
    private routes: {
        [key: string]: HTMLBundle | RequestHandler;
    } = {};

    /**
     * Constructor for the Burger class.
     * @param options - The options for the server and router.
     * The options object should contain the following properties:
     * - port: The port number to listen on.
     * - apiDir: The directory path to load API routes from.
     * - pageDir: The directory path to load page routes from.
     * - middleware: An array of global middleware functions.
     */
    constructor(private options: ServerOptions) {
        this.server = new Server(options);

        // Initialize API router if apiDir is provided
        this.apiRouter = options.apiDir
            ? new ApiRouter(options.apiDir, options.apiPrefix || 'api')
            : undefined;

        // Initialize page router if pageDir is provided
        this.pageRouter = options.pageDir
            ? new PageRouter(options.pageDir, options.pagePrefix || '')
            : undefined;

        // Add global middleware if any
        this.globalMiddleware = options.globalMiddleware?.length
            ? options.globalMiddleware.slice()
            : [];
    }

    /**
     * Starts the server and begins listening for incoming requests.
     * @param port - The port number to listen on. Defaults to `4000`.
     * @param cb - An optional cb function to be executed when the server is listening.
     * @returns A Promise that resolves when the server has started listening.
     */
    async serve(port: number = 4000, cb?: () => void): Promise<void> {
        // Flag to track if any routes were loaded
        let routesConfigured = false;

        // Handle page routes
        if (this.pageRouter) {
            // Load Page routes
            await this.pageRouter.loadPages();
            // If there are any page routes, add them to the routes object
            const pagesRoutes = this.pageRouter.pages;
            // Get the length of the pages routes
            const pagesRoutesLength = pagesRoutes.length;
            // Check if pages were actually found
            if (pagesRoutesLength > 0) {
                // Set the flag to true
                routesConfigured = true;
                // Loop through the pages routes
                for (let i = 0; i < pagesRoutesLength; i++) {
                    // Get the current page route
                    const pageRoute = pagesRoutes[i];
                    // Add the page route to the routes object
                    this.routes[pageRoute.path] = pageRoute.handler;
                }
            }
        }

        // Handle API routes
        if (this.apiRouter) {
            // Load API routes
            await this.apiRouter.loadRoutes();

            // Collect API routes
            const apiRoutes = collectRoutes(this.apiRouter.routes);

            // Generate OpenAPI document
            this.openApiDoc = generateOpenAPIDocument(apiRoutes, this.options);

            const apiRoutesLength = apiRoutes.length;
            // If there are any API routes, add them to the routes object
            if (apiRoutesLength > 0) {
                // Set the flag to true
                routesConfigured = true;

                for (let i = 0; i < apiRoutesLength; i++) {
                    /**
                     * ================================================
                     * Pre-compute the required functionality start
                     * ================================================
                     */

                    // Get the current route object
                    const route = apiRoutes[i];

                    // Get the schema for the current HTTP method
                    const schema = route.schema;

                    // Get the middlewares for the current route
                    const routeSpecificMiddleware = route.middleware || [];

                    // Get the handlers for the current route
                    const handlers = route.handlers;

                    // Optimize middleware array initialization by pre-allocating size
                    const totalMiddlewareCount =
                        this.globalMiddleware.length +
                        (schema ? 1 : 0) +
                        (routeSpecificMiddleware?.length || 0);

                    // Pre-allocate array with known size
                    const middlewaresToRun = new Array<Middleware>(
                        totalMiddlewareCount
                    );

                    // Initialize index to track the current middleware
                    let index = 0;

                    // Copy global middleware
                    for (let i = 0; i < this.globalMiddleware.length; i++) {
                        middlewaresToRun[index++] = this.globalMiddleware[i];
                    }

                    // Add validation middleware if schema exists
                    if (schema) {
                        middlewaresToRun[index++] =
                            createValidationMiddleware(schema);
                    }

                    // Add route-specific middleware if it exists
                    if (routeSpecificMiddleware?.length) {
                        for (
                            let i = 0;
                            i < routeSpecificMiddleware.length;
                            i++
                        ) {
                            middlewaresToRun[index++] =
                                routeSpecificMiddleware[i];
                        }
                    }

                    /**
                     * ================================================
                     * Pre-compute the required functionality end
                     * ================================================
                     */

                    this.routes[route.path] = async (
                        request: BurgerRequest
                    ) => {
                        // Get the method from the request
                        const method = request.method;

                        // Get the handler for the current HTTP method
                        const handler = handlers[method];

                        // If no handler is found, return a 405
                        if (!handler) {
                            return new Response('Method Not Allowed', {
                                status: 405,
                            });
                        }

                        // Fast path for common case of zero middleware
                        if (totalMiddlewareCount === 0) {
                            // Skip middleware processing entirely
                            return handler(request);
                        }

                        // Define a specialized next function that takes the current index
                        const runMiddleware = async (
                            index: number
                        ): Promise<Response> => {
                            if (index < middlewaresToRun.length) {
                                // Direct array access with pre-cached middleware
                                const middleware = middlewaresToRun[index];

                                return middleware(request, () =>
                                    runMiddleware(index + 1)
                                );
                            }

                            // Direct handler execution without await wrapper for less promise overhead
                            return handler(request);
                        };

                        // Start execution with index 0 - avoid unnecessary function call overhead
                        return runMiddleware(0);
                    };
                }

                // Add special routes for OpenAPI
                this.routes['/openapi.json'] = async () => {
                    return this.openApiDoc
                        ? Response.json(this.openApiDoc)
                        : Response.json({
                              error: 'API Router not configured',
                              message:
                                  'Please provide an apiDir option when initializing the Burger instance to enable OpenAPI documentation.',
                          });
                };

                // Add special route for Swagger UI
                this.routes['/docs'] = async () => {
                    return new Response(swaggerHtml, {
                        headers: { 'Content-Type': 'text/html' },
                    });
                };
            }
        }

        // If routes were configured, start the server
        if (routesConfigured) {
            // Start the server
            this.server.start(
                this.routes,
                async () => {
                    return new Response('Not Found', {
                        status: 404,
                    });
                },
                port,
                cb
            );
        } else {
            // If no routes were configured, log an error
            console.error(
                'Error: No routes configured! Please provide either apiDir with route.ts files or pageDir with html files when initializing the Burger Class.'
            );
        }
    }
}

// Export utils
export { setDir } from '@utils';

// Export types
export type {
    ServerOptions,
    RequestHandler,
    BurgerRequest,
    BurgerResponse,
    BurgerNext,
    Middleware,
    openapi,
} from '@burgerTypes';
