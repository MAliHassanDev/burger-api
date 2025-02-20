export class HttpRequest {
  private _request: Request;

  /**
   * Constructs a new HttpRequest instance.
   * @param request - The native Request object.
   */
  constructor(request: Request) {
    this._request = request;
  }

  /**
   * Gets the query parameters as a URLSearchParams object.
   * @returns The query parameters as a URLSearchParams object.
   */
  get query(): URLSearchParams {
    return new URL(this._request.url).searchParams;
  }

  /**
   * Gets the URL of the request.
   * @returns The URL as a string.
   */
  get url() {
    return this._request.url;
  }

  /**
   * Gets the HTTP method of the request.
   * @returns The HTTP method as a string.
   */
  get method() {
    return this._request.method;
  }

  /**
   * Gets the headers of the request.
   * @returns The headers as a Headers object.
   */
  get headers() {
    return this._request.headers;
  }

  /**
   * Gets the body of the request as JSON.
   * @returns The body as a Promise of the parsed JSON.
   */
  async json<T = any>(): Promise<T> {
    return this._request.json();
  }

  /**
   * Returns the original Request object.
   * @returns The original Request object.
   */
  get original(): Request {
    return this._request;
  }
}
