// Import stuff from core
import { HttpRequest } from "./request.ts";
import { HttpResponse } from "./response.ts";

// Import stuff from utils
import { errorResponse } from "@/utils/error.ts";

import type {
  ServerOptions,
  RequestHandler,
  BurgerRequest,
  BurgerResponse,
} from "../types/index.d.ts";

export class Server {
  private options: ServerOptions;
  private server: ReturnType<typeof Bun.serve> | null = null;

  /**
   * Initializes a new instance of the Server class with the given options.
   * @param options - Configuration options for the server.
   */
  constructor(options: ServerOptions) {
    this.options = options;
  }

  /**
   * Starts the server with the given port, handler, and callback.
   * @param port - The port to listen on.
   * @param handler - The request handler function.
   * @param cb - The callback function to be called when the server starts.
   */
  public start(port: number, handler: RequestHandler, cb?: () => void): void {
    // Start Bun's native server using Bun.serve
    this.server = Bun.serve({
      port,
      fetch: async (request: Request) => {
        try {
          // Wrap the native Request with HttpRequest to get a BurgerRequest
          const burgerReq = new HttpRequest(
            request
          ) as unknown as BurgerRequest;

          // Wrap the native Response with HttpResponse to get a BurgerResponse
          const burgerRes = new HttpResponse() as unknown as BurgerResponse;

          // Invoke and return the handler with the wrapped requests and responses
          return await handler(burgerReq, burgerRes);
        } catch (error) {
          // Return a custom error response
          return errorResponse(error, request, this.options.debug ?? false);
        }
      },
    });
    if (cb) {
      cb();
    } else {
      console.log(`✔ Server started on port: ${port}`);
    }
  }

  /**
   * Stops the server.
   * If the server is currently running, this method will stop the server and
   * log a message to the console indicating that the server has been stopped.
   * If the server is not running, this method does nothing.
   */
  public stop(): void {
    if (this.server) {
      this.server.stop();
      console.log("Server stopped.");
    }
  }
}
