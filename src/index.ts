// Import stuff  from core
import { Server } from "./core/server";
import { Router } from "./core/router";
import { HttpRequest } from "./core/request";
import { HttpResponse } from "./core/response";
import { generateOpenAPIDocument } from "./core/openapi";
import { swaggerHtml } from "./core/swagger-ui.ts";

// Import middleware
import { createValidationMiddleware } from "./middleware/validator.ts";

// Import types
import type {
  ServerOptions,
  RequestHandler,
  BurgerRequest,
  BurgerResponse,
  Middleware,
} from "./types/index.d.ts";

export class Burger {
  private server: Server;
  private router?: Router;
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
      this.router = new Router(options.apiDir, "api");
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
   * If a router is provided, it will be used to handle incoming requests.
   * If no router is provided, a default handler will be used that returns a plain text response.
   * @returns A promise that resolves when the server has finished starting.
   */
  async serve(): Promise<void> {
    // File-based routing mode
    if (this.router) {
      await this.router.loadRoutes();
      this.server.start(async (req: Request) => {
        // Wrap the native request with helper methods
        const request = new HttpRequest(req) as unknown as BurgerRequest;

        // Create a new instance of BurgerResponse for the handler
        const response = new HttpResponse() as unknown as BurgerResponse;

        // Create URL object
        const url = new URL(request.url);

        // Check if the request is for /openapi.json
        if (url.pathname === "/openapi.json") {
          if (this.router) {
            // Generate OpenAPI document
            const doc = generateOpenAPIDocument(this.router, this.options);
            // Return it as JSON
            return response.json(doc);
          } else {
            // Set status to 500
            response.setStatus(500);
            // Return an error if router is not available
            return response.json({ error: "Router not available" });
          }
        }

        // Serve the Swagger UI at /docs
        if (url.pathname === "/docs") {
          return response.html(swaggerHtml);
        }

        // Get the route and params for the current request
        const { route, params } = this.router!.resolve(req);

        if (!route) {
          return response.json({ error: "Route not found" });
        }

        // Add params to the request
        request.params = params;

        // Get the handler for the current HTTP method
        const method = req.method.toUpperCase();
        const handler = route.handlers[method];
        if (!handler) {
          response.setStatus(405);
          return response.json({ error: "Method Not Allowed" });
        }

        /**
         * Build the middleware composition chain.
         * 1. Compose the Route-Specific Chain
         * 2. Insert Validation Middleware (if a schema exists)
         * 3. Insert Global Middleware
         * 4. Execute the handler
         */

        // 1. Compose the Route-Specific Chain
        let routeChain = async () => handler(request, response, params);
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
      });
    } else {
      // Fallback to default handler if no router is provided
      this.server.start(
        async (_: Request) =>
          new Response("Hello from burger-api!", {
            headers: { "Content-Type": "text/plain" },
          })
      );
    }
  }
}

// Export utils
export { setDir } from "./utils/index";

// Export types
export type {
  ServerOptions,
  RequestHandler,
  BurgerRequest,
  BurgerResponse,
  Middleware,
} from "./types/index.d.ts";
