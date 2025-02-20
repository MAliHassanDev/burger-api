import { HttpRequest } from "./request.ts";
import { HttpResponse } from "./response.ts";

import type {
  ServerOptions,
  RequestHandler,
  BurgerRequest,
  BurgerResponse,
} from "../types/index.d.ts";

export class Server {
  private options: ServerOptions;
  private server: ReturnType<typeof Bun.serve> | null = null;

  constructor(options: ServerOptions) {
    this.options = options;
  }

  public start(handler: RequestHandler): void {
    // Start Bun's native server using Bun.serve
    this.server = Bun.serve({
      port: this.options.port,
      fetch: async (request: Request) => {
        try {
          // Wrap the native Request with HttpRequest to get a BurgerRequest
          const burgerReq = new HttpRequest(
            request
          ) as unknown as BurgerRequest;

          // Wrap the native Response with HttpResponse to get a BurgerResponse
          const burgerRes = new HttpResponse() as unknown as BurgerResponse;

          return await handler(burgerReq, burgerRes);
        } catch (error) {
          console.error("Error processing request:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      },
    });
    console.log(`✔ Server started on port: ${this.options.port}`);
  }

  public stop(): void {
    if (this.server) {
      this.server.stop();
      console.log("Server stopped.");
    }
  }
}
