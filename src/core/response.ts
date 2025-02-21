export class HttpResponse {
  // Default status is 200, and headers start empty.
  private _status: number = 200;
  private _headers: Headers = new Headers();
  private _body: BodyInit | null = null;

  constructor() {}

  /**
   * Set a header value.
   * @param name Header name
   * @param value Header value
   */
  public setHeader(name: string, value: string): void {
    this._headers.set(name, value);
  }

  /**
   * Remove a header.
   * @param name Header name to remove
   */
  public removeHeader(name: string): void {
    this._headers.delete(name);
  }

  /**
   * Set the HTTP status.
   * @param status Status code
   */
  public setStatus(status: number): void {
    this._status = status;
  }

  /**
   * Set the response body.
   * @param body Body content
   */
  public setBody(body: BodyInit): void {
    this._body = body;
  }

  /**
   * Creates a JSON response.
   * This sets the "Content-Type" header and serializes the data.
   * @param data The data to serialize as JSON.
   * @returns The final Response object.
   */
  public json(data: unknown): Response {
    this.setHeader("Content-Type", "application/json");
    this._body = JSON.stringify(data);
    return this.build();
  }

  /**
   * Creates a plain text response.
   * @param data The text to send.
   * @returns The final Response object.
   */
  public text(data: string): Response {
    this.setHeader("Content-Type", "text/plain");
    this._body = data;
    return this.build();
  }

  /**
   * Creates an HTML response.
   * @param data The HTML string.
   * @returns The final Response object.
   */
  public html(data: string): Response {
    this.setHeader("Content-Type", "text/html");
    this._body = data;
    return this.build();
  }

  /**
   * Creates a redirect response.
   * @param url The URL to redirect to.
   * @param status Optional status code (default is 302).
   * @returns The final Response object.
   */
  public redirect(url: string, status: number = 302): Response {
    this.setStatus(status);
    this.setHeader("Location", url);
    // Typically a redirect response doesn't have a body.
    this._body = null;
    return this.build();
  }

  /**
   * Creates a file response using Bun.file.
   * @param filePath The file path to serve.
   * @returns The final Response object.
   */
  public file(filePath: string): Response {
    try {
      const file = Bun.file(filePath);
      this._body = file;
      return this.build();
    } catch (error) {
      console.error("Error serving file:", error);
      this.setStatus(404);
      this._body = "File not found";
      return this.build();
    }
  }

  /**
   * Returns a Response directly using the provided body and init.
   * This is a direct passthrough and does not use the mutable state.
   * @param body The response body.
   * @param init Optional ResponseInit.
   * @returns A new Response object.
   */
  public original(body?: BodyInit | null, init?: ResponseInit): Response {
    return new Response(body, init);
  }

  /**
   * Builds the final Response object using the current mutable state.
   * @returns The final Response object.
   */
  public build(): Response {
    return new Response(this._body, {
      status: this._status,
      headers: this._headers,
    });
  }
}
