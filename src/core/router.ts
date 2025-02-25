// Import stuff from node
import { readdirSync } from "fs";
import * as path from "path";

// Import utils
import { cleanPrefix, normalizePath } from "@/utils/index.ts";

// Import types
import type { RequestHandler, RouteDefinition } from "../types/index.d.ts";

/**
 * Router class for handling file-based routing.
 * Loads routes from a directory structure and matches requests to the appropriate route handlers.
 * Supports dynamic segments (e.g., [id]) and HTTP method handlers.
 * Routes are sorted to prioritize static routes over dynamic ones to prevent overlapping route issues.
 */
export class Router {
  /** Array of loaded route definitions */
  public routes: RouteDefinition[] = [];

  /**
   * Constructor for the Router class.
   * @param routesDir The directory path where route modules are located.
   * @param prefix Optional prefix to prepend to all routes (e.g., "api" becomes "/api/...").
   */
  constructor(private routesDir: string, private prefix: string = "") {}

  /**
   * Loads route modules from the specified directory and adds them to the routes array.
   * After loading, sorts the routes to prioritize static routes over dynamic ones based on specificity.
   * @returns A promise that resolves when all route modules have been loaded and sorted.
   */
  public async loadRoutes(): Promise<void> {
    this.routes = [];
    await this.scanDirectory(this.routesDir);
    // Sort routes to ensure static routes are matched before dynamic ones
    this.routes.sort((a, b) => this.compareRoutes(a, b));
  }

  /**
   * Recursively scans the directory for route modules and adds them to the routes array.
   * @param dir The current directory to scan.
   * @param basePath The base path for constructing the route path.
   */
  private async scanDirectory(
    dir: string,
    basePath: string = ""
  ): Promise<void> {
    // Track if a dynamic folder has been found at this directory level
    let dynamicFolderFound = false;

    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        // Handle dynamic directories (e.g., [id])
        if (entry.name.startsWith("[") && entry.name.endsWith("]")) {
          if (dynamicFolderFound) {
            throw new Error(
              `Multiple dynamic route folders found in the same directory: '${entry.name}' conflicts with another dynamic folder.`
            );
          }
          dynamicFolderFound = true;
        }
        await this.scanDirectory(entryPath, relativePath);
      } else if (entry.isFile() && entry.name === "route.ts") {
        // Convert file path to route path and load the module
        const routePath = this.convertFilePathToRoute(relativePath);
        const modulePath = path.resolve(entryPath);
        const routeModule = await import(modulePath);

        // Collect HTTP method handlers from the module
        const handlers: { [method: string]: RequestHandler } = {};
        const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"];
        for (const method of methods) {
          if (typeof routeModule[method] === "function") {
            handlers[method] = routeModule[method];
          }
        }

        // Create route definition
        const routeDef: RouteDefinition = {
          path: routePath,
          handlers,
          middleware: routeModule.middleware,
          schema: routeModule.schema,
          openapi: routeModule.openapi,
        };
        this.routes.push(routeDef);
      }
    }
  }

  /**
   * Converts a file path to a route path by processing dynamic segments,
   * removing certain directory indicators, and applying a prefix if specified.
   * @param filePath The file path to convert into a route path.
   * @returns The converted route path string.
   */
  private convertFilePathToRoute(filePath: string): string {
    // Remove the "route.ts" suffix
    if (filePath.endsWith("route.ts")) {
      filePath = filePath.slice(0, -"route.ts".length);
    }

    // Split path into segments
    const segments = filePath.split(path.sep);
    const resultSegments: string[] = [];

    for (let segment of segments) {
      if (!segment) continue; // Skip empty segments

      // Skip grouping segments (e.g., (group))
      if (segment.startsWith("(") && segment.endsWith(")")) continue;

      // Convert dynamic segments from [param] to :param
      if (segment.startsWith("[") && segment.endsWith("]")) {
        const param = segment.slice(1, -1);
        resultSegments.push(":" + param);
      } else {
        resultSegments.push(segment);
      }
    }

    // Construct the route with leading slash
    let route = "/" + resultSegments.join("/");

    // Apply prefix if provided
    if (this.prefix) {
      const cleanPrefixStr = cleanPrefix(this.prefix);
      route = "/" + cleanPrefixStr + route;
    }

    // Remove trailing slash unless it's the root
    if (route !== "/" && route.endsWith("/")) {
      route = route.slice(0, -1);
    }

    return route;
  }

  /**
   * Resolves the given request by finding a matching route and extracting dynamic parameters.
   * @param request The request to resolve.
   * @returns An object containing the matched route and parameters, or an empty params object if no match.
   */
  public resolve(request: Request): {
    route?: RouteDefinition;
    params: Record<string, string>;
  } {
    const url = new URL(request.url);
    const reqPath = normalizePath(url.pathname);
    const method = request.method.toUpperCase();

    for (const route of this.routes) {
      const match = this.matchRoute(reqPath, route.path);
      if (match && route.handlers[method]) {
        return { route, params: match };
      }
    }
    return { params: {} };
  }

  /**
   * Checks if the request path matches the route path, extracting dynamic parameters if matched.
   * @param requestPath The request path to check.
   * @param routePath The route path to match against.
   * @returns A record of dynamic parameters if matched, otherwise null.
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

  /**
   * Calculates the specificity of a route path based on the number of static segments.
   * Static segments increase the score, while dynamic segments (:param) do not.
   * @param path The route path to evaluate.
   * @returns The specificity score (higher means more static segments).
   */
  private getRouteSpecificity(path: string): number {
    const segments = path.split("/").filter(Boolean);
    return segments.reduce((score, segment) => {
      return segment.startsWith(":") ? score : score + 1;
    }, 0);
  }

  /**
   * Compares two routes for sorting, prioritizing those with higher specificity (more static segments).
   * If specificity is equal, sorts alphabetically by path.
   * @param a The first route to compare.
   * @param b The second route to compare.
   * @returns Negative if a comes before b, positive if b comes before a, zero if equal.
   */
  private compareRoutes(a: RouteDefinition, b: RouteDefinition): number {
    const aSpecificity = this.getRouteSpecificity(a.path);
    const bSpecificity = this.getRouteSpecificity(b.path);

    if (aSpecificity > bSpecificity) return -1;
    if (aSpecificity < bSpecificity) return 1;
    return a.path.localeCompare(b.path);
  }
}
