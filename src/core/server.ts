import type { ServerOptions, RequestHandler } from "../types/index.d.ts";

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
          return await handler(request);
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
