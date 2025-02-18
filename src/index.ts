import { Server } from "./core/server";
import { Router } from "./core/router";

// Import types
import type { ServerOptions, RequestHandler } from "./types/index.d.ts";

export class Burger {
  private server: Server;
  private router?: Router;
  private globalMiddleware: any[] = [];

  constructor(private options: ServerOptions) {
    this.server = new Server(options);
    if (options.apiDir) {
      this.router = new Router(options.apiDir);
    }
  }

  /**
   * Starts the server.
   * If a custom handler is provided, it takes precedence.
   * Otherwise, the router (if set) resolves routes automatically.
   */
  async serve(customHandler?: RequestHandler): Promise<void> {
    // Custom handler mode
    if (customHandler) {
      this.server.start(customHandler);
      return;
    }

    // If using file-based routing, load routes first
    if (this.router) {
      await this.router.loadRoutes();
      this.server.start(async (req: Request) => {
        const { route, params } = this.router!.resolve(req);

        if (!route) {
          return new Response("Not Found", { status: 404 });
        }

        const method = req.method.toUpperCase();

        const handler = route.handlers[method];

        if (!handler) {
          return new Response("Method Not Allowed", { status: 405 });
        }

        // Compose route-specific middleware chain
        let finalHandler = async () => handler(req, params);

        if (route.middleware && route.middleware.length > 0) {
          for (const mw of route.middleware.reverse()) {
            const next = finalHandler;
            finalHandler = async () => mw(req, next);
          }
        }

        // Compose global middleware chain if present
        if (this.globalMiddleware.length > 0) {
          let globalFinal = finalHandler;
          for (const mw of this.globalMiddleware.reverse()) {
            const next = globalFinal;
            globalFinal = async () => mw(req, next);
          }
          return await globalFinal();
        } else {
          return await finalHandler();
        }
      });
    } else {
      // Fallback to a default handler if no router is set
      this.server.start(
        async (_: Request) =>
          new Response("Hello from burger-api!", {
            headers: { "Content-Type": "text/plain" },
          })
      );
    }
  }
}

// Export types
export type { ServerOptions, RequestHandler } from "./types/index.d.ts";
