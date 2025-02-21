// Import stuff  from core
import { Server } from "./core/server";
import { Router } from "./core/router";
import { HttpRequest } from "./core/request";
import { HttpResponse } from "./core/response";

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
   * Starts the server.
   * Global middleware runs first in the order provided,
   * then file-specific middleware, and finally the route handler.
   */
  async serve(customHandler?: RequestHandler): Promise<void> {
    // Custom handler mode
    if (customHandler) {
      this.server.start(customHandler);
      return;
    }

    // File-based routing mode
    if (this.router) {
      await this.router.loadRoutes();
      this.server.start(async (req: Request) => {
        // Wrap the native request with helper methods
        const request = new HttpRequest(req) as unknown as BurgerRequest;
        const { route, params } = this.router!.resolve(req);
        if (!route) {
          return new Response("Not Found", { status: 404 });
        }
        const method = req.method.toUpperCase();
        const handler = route.handlers[method];
        if (!handler) {
          return new Response("Method Not Allowed", { status: 405 });
        }

        // Create a new instance of BurgerResponse for the handler
        const response = new HttpResponse() as unknown as BurgerResponse;

        // Build the final handler chain:
        // Start with the route handler accepting (request,response, params)
        let finalHandler = async () => handler(request, response, params);

        // Wrap route-specific middleware (if any)
        if (route.middleware && route.middleware.length > 0) {
          for (const mw of route.middleware.reverse()) {
            const next = finalHandler;
            finalHandler = async () => mw(request, next);
          }
        }

        // Wrap global middleware in order provided (first to last)
        if (this.globalMiddleware.length > 0) {
          let globalFinal = finalHandler;
          for (const mw of this.globalMiddleware.reverse()) {
            const next = globalFinal;
            globalFinal = async () => mw(request, next);
          }
          return await globalFinal();
        } else {
          return await finalHandler();
        }
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
