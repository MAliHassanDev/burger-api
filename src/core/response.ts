export class HttpResponse {
  /**
   * Returns a JSON response with proper headers.
   * @param data - The data to send as JSON.
   * @param init - Optional ResponseInit settings.
   */
  json(data: unknown, init: ResponseInit = {}): Response {
    const body = JSON.stringify(data);
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return new Response(body, { ...init, headers });
  }

  /**
   * Returns a plain text response with proper headers.
   * @param data - The text to send.
   * @param init - Optional ResponseInit settings.
   */
  text(data: string, init: ResponseInit = {}): Response {
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "text/plain");
    }
    return new Response(data, { ...init, headers });
  }

  /**
   * Returns an HTML response with proper headers.
   * @param data - The HTML to send.
   * @param init - Optional ResponseInit settings.
   */
  html(data: string, init: ResponseInit = {}): Response {
    const headers = new Headers(init.headers || {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "text/html");
    }
    return new Response(data, { ...init, headers });
  }

  /**
   * Returns a redirect response.
   * @param url - The URL to redirect to.
   * @param status - The HTTP status code (default 302).
   */
  redirect(url: string, status: number = 302): Response {
    return new Response(null, {
      status,
      headers: { Location: url },
    });
  }

  /**
   * Returns a file response using Bun.file.
   * @param filePath - The file path to serve.
   * @param init - Optional ResponseInit settings.
   */
  file(filePath: string, init: ResponseInit = {}): Response {
    try {
      const file = Bun.file(filePath);
      return new Response(file, init);
    } catch (error) {
      console.error("Error serving file:", error);
      return new Response("File not found", { status: 404 });
    }
  }

  /**
   * Returns the original Response object.
   * @param body - The response body. If undefined or null, the response body will be empty.
   * @param init - Optional ResponseInit settings.
   * @returns The original Response object.
   */
  original(body?: BodyInit | null, init?: ResponseInit): Response {
    return new Response(body, init);
  }
}
