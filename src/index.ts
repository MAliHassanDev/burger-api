// Import stuff  from core
import { Server } from "@core/server.js";
import { ApiRouter } from "@core/api-router.js";
import { PageRouter } from "@core/page-router.js";
import { HttpRequest } from "@core/request.js";
import { HttpResponse } from "@core/response.js";
import { generateOpenAPIDocument } from "@core/openapi.js";
import { swaggerHtml } from "@core/swagger-ui.js";

// Import middleware
import { createValidationMiddleware } from "@middleware/validator.js";

// Import types
import type {
  ServerOptions,
  BurgerRequest,
  BurgerResponse,
  Middleware,
} from "@burgerTypes";

export class Burger {
  private server: Server;
  private apiRouter?: ApiRouter;
  private pageRouter?: PageRouter;
  private globalMiddleware: Middleware[] = [];

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
    // Initialize API router
    if (options.apiDir) {
      this.apiRouter = new ApiRouter(options.apiDir, "api");
    }

    // Initialize page router
    if (options.pageDir) {
      this.pageRouter = new PageRouter(options.pageDir, "");
    }

    // Add global middleware
    if (options.globalMiddleware) {
      options.globalMiddleware.forEach((mw) => this.addGlobalMiddleware(mw));
    }
  }

  /**
   * Adds a global middleware function to the list of middlewares.
   * @param mw - The middleware function to add.
   */
  addGlobalMiddleware(mw: Middleware) {
    this.globalMiddleware.push(mw);
  }

  /**
   * Starts the server and begins listening for incoming requests.
   * @param port - The port number to listen on. Defaults to `4000`.
   * @param cb - An optional cb function to be executed when the server is listening.
   * @returns A Promise that resolves when the server has started listening.
   */
  async serve(port: number = 4000, cb?: () => void): Promise<void> {
    // File-based routing mode
    const routes: { [key: string]: any } = {};

    // Load Page routes
    if (this.pageRouter) {
      await this.pageRouter.loadPages();
      this.pageRouter.pages.forEach((page) => {
        routes[page.path] = page.handler;
      });
    }

    if (this.apiRouter) {
      // Load API routes
      await this.apiRouter.loadRoutes();

      // Start the server
      this.server.start(
        routes,
        async (req: Request) => {
          // Wrap the native request with helper methods
          const request = new HttpRequest(req) as unknown as BurgerRequest;

          // Create a new instance of BurgerResponse for the handler
          const response = new HttpResponse() as unknown as BurgerResponse;

          // Create URL object
          const url = new URL(request.url);

          // Check if the request is for /openapi.json
          if (url.pathname === "/openapi.json") {
            if (this.apiRouter) {
              // Generate OpenAPI document
              const doc = generateOpenAPIDocument(this.apiRouter, this.options);
              // Return it as JSON
              return response.json(doc);
            } else {
              // Return an error if router is not available
              return response
                .status(500)
                .json({ error: "Router not available" });
            }
          }

          // Serve the Swagger UI at /docs
          if (url.pathname === "/docs") {
            return response.html(swaggerHtml);
          }

          // Get the route and params for the current request
          const { route, params } = this.apiRouter!.resolve(req);

          if (!route) {
            // Return a 404 if no route is found
            return response.status(404).json({ error: "Route not found" });
          }

          // Add params to the request
          request.params = params;

          // Get the handler for the current HTTP method
          const method = req.method.toUpperCase();
          const handler = route.handlers[method];
          if (!handler) {
            // Return a 405 if no handler is found
            return response.status(405).json({ error: "Method Not Allowed" });
          }

          /**
           * Build the middleware composition chain.
           * 1. Compose the Route-Specific Chain
           * 2. Insert Validation Middleware (if a schema exists)
           * 3. Insert Global Middleware
           * 4. Execute the handler
           */

          // 1. Compose the Route-Specific Chain
          let routeChain = async () => handler(request, response);
          if (route.middleware && route.middleware.length > 0) {
            // Wrap route-specific middleware (in reverse order to preserve order of execution)
            for (const mw of route.middleware.slice().reverse()) {
              const next = routeChain;
              routeChain = async () => mw(request, response, next);
            }
          }

          // 2. Insert Validation Middleware (if a schema exists)
          let composedChain = routeChain;
          if (route.schema) {
            const validationMw = createValidationMiddleware(route.schema);
            composedChain = async () =>
              validationMw(request, response, routeChain);
          }

          // 3. Wrap Global Middleware (in reverse order so that the first-added runs first)
          let finalHandler = composedChain;
          if (this.globalMiddleware.length > 0) {
            for (const mw of this.globalMiddleware.slice().reverse()) {
              const next = finalHandler;
              finalHandler = async () => mw(request, response, next);
            }
          }

          // Execute the full chain
          return await finalHandler();
        },
        port,
        cb
      );
    } else {
      // Fallback to default handler if no router is provided
      this.server.start(
        null,
        async (_: Request) =>
          new Response("Hello from burger-api!", {
            headers: { "Content-Type": "text/plain" },
          }),
        port,
        cb
      );
    }
  }
}

// Export utils
export { setDir } from "@utils";

// Export types
export type {
  ServerOptions,
  RequestHandler,
  BurgerRequest,
  BurgerResponse,
  BurgerNext,
  Middleware,
  openapi,
} from "@burgerTypes";
