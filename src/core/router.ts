import { readdirSync } from "fs";
import * as path from "path";
import type {
  RequestHandler,
  Middleware,
  RouteDefinition,
} from "../types/index.d.ts";

export class Router {
  public routes: RouteDefinition[] = [];

  /**
   * Constructor for the Router class.
   * @param routesDir The directory path to find route modules.
   */
  constructor(private routesDir: string) {}

  /**
   * Loads route modules from the specified directory and
   * adds them to the list of available routes.
   * @returns A promise that resolves when all route modules have been loaded.
   */
  public async loadRoutes(): Promise<void> {
    this.routes = [];
    await this.scanDirectory(this.routesDir);
  }

  /**
   * Recursively scans the specified directory for route files and processes them.
   *
   * @param dir - The directory path to scan for route files.
   * @param basePath - The base path to prepend to route paths (default is an empty string).
   *
   * This method reads all entries in the given directory. For each directory entry,
   * it recursively scans the directory. For each file named "route.ts", it constructs
   * a route URL using the file path, imports the route module, extracts the request
   * handlers for supported HTTP methods, and adds the route to the router's list
   * of routes, including any defined middleware in the module.
   */
  private async scanDirectory(
    dir: string,
    basePath: string = ""
  ): Promise<void> {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        await this.scanDirectory(entryPath, relativePath);
      } else if (entry.isFile() && entry.name === "route.ts") {
        // Convert file path to route URL
        const routePath = this.convertFilePathToRoute(relativePath);
        const modulePath = path.resolve(entryPath);
        const routeModule = await import(modulePath);
        const handlers: { [method: string]: RequestHandler } = {};
        const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"];
        for (const method of methods) {
          if (typeof routeModule[method] === "function") {
            handlers[method] = routeModule[method];
          }
        }
        const routeDef: RouteDefinition = {
          path: routePath,
          handlers,
          middleware: routeModule.middleware,
        };
        this.routes.push(routeDef);
      }
    }
  }

  /**
   * Converts a file path to a route path.
   *
   * Removes the trailing "route.ts" portion, skips empty segments or segments named "index",
   * skips segments enclosed in parentheses, converts dynamic segments (e.g., [id]) to :id,
   * and joins the remaining segments with '/' and ensures the path starts with '/'.
   * If the resulting path is not the root and has a trailing slash, it is removed.
   * @param filePath the file path to convert
   * @returns the converted route path
   */
  private convertFilePathToRoute(filePath: string): string {
    // Remove the trailing "route.ts" portion
    if (filePath.endsWith("route.ts")) {
      filePath = filePath.slice(0, -"route.ts".length);
    }
    // Split the path using the system path separator
    const segments = filePath.split(path.sep);
    const resultSegments: string[] = [];

    for (let segment of segments) {
      // Skip empty segments or segments named "index"
      if (!segment || segment.toLowerCase() === "index") continue;

      // If the segment is enclosed in parentheses (e.g., (dashboard)), skip it
      if (segment.startsWith("(") && segment.endsWith(")")) continue;

      // If the segment is dynamic (e.g., [id]), convert it to :id
      if (segment.startsWith("[") && segment.endsWith("]")) {
        const param = segment.slice(1, -1);
        resultSegments.push(":" + param);
      } else {
        resultSegments.push(segment);
      }
    }

    // Join the segments with '/' and ensure the path starts with '/'
    let route = "/" + resultSegments.join("/");
    // Remove trailing slash if it's not the root
    if (route !== "/" && route.endsWith("/")) {
      route = route.slice(0, -1);
    }
    return route;
  }

  /**
   * Resolves the given request by finding a matching route and extracting any
   * dynamic parameters. Returns an object with the matched route and dynamic
   * parameters if found, or an empty object if no route matches.
   * @param request the request to resolve
   * @returns an object with the matched route and dynamic parameters if found,
   * otherwise an empty object
   */
  public resolve(request: Request): {
    route?: RouteDefinition;
    params: Record<string, string>;
  } {
    const url = new URL(request.url);
    const reqPath = url.pathname;
    const method = request.method.toUpperCase();
    for (const route of this.routes) {
      const match = this.matchRoute(reqPath, route.path);
      if (match) {
        if (route.handlers[method]) {
          return { route, params: match };
        }
      }
    }
    return { params: {} };
  }

  /**
   * Checks if the given request path matches the given route path.
   * If it does, extracts any dynamic parameters from the request path
   * and returns them as a Record<string, string>. Otherwise, returns null.
   * @param requestPath the request path to check
   * @param routePath the route path to check against
   * @returns a Record<string, string> of dynamic parameters if the request path matches the route path, otherwise null
   */
  private matchRoute(
    requestPath: string,
    routePath: string
  ): Record<string, string> | null {
    const reqSegments = requestPath.split("/").filter(Boolean);
    const routeSegments = routePath.split("/").filter(Boolean);
    if (reqSegments.length !== routeSegments.length) {
      return null;
    }
    const params: Record<string, string> = {};
    for (let i = 0; i < reqSegments.length; i++) {
      const rSegment = routeSegments[i];
      const reqSegment = reqSegments[i];
      if (rSegment.startsWith(":")) {
        const paramName = rSegment.slice(1);
        params[paramName] = reqSegment;
      } else if (rSegment !== reqSegment) {
        return null;
      }
    }
    return params;
  }
}
