import { readdirSync } from "fs";
import * as path from "path";
import type {
  RouteDefinition,
  RequestHandler,
  Middleware,
} from "../types/index.d.ts";

export class Router {
  public routes: RouteDefinition[] = [];

  constructor(private routesDir: string) {}

  public async loadRoutes(): Promise<void> {
    this.routes = [];
    await this.scanDirectory(this.routesDir);
  }

  /**
   * Recursively scans the directory and loads route definitions.
   * @param dir the directory to scan
   * @param basePath the relative path to the root of the directory
   */
  private async scanDirectory(
    dir: string,
    basePath: string = ""
  ): Promise<void> {
 console.log(`Scanning directory: ${dir}`);
 
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        await this.scanDirectory(entryPath, relativePath);
      } else if (entry.isFile() && entry.name === "route.ts") {
        // Determine route URL from the file path (remove 'route.ts')
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
   * @param filePath the path to the route file
   * @returns the route path
   */
  private convertFilePathToRoute(filePath: string): string {
    // Remove the trailing "route.ts"
    let route = filePath.replace(/route\.ts$/, "");
    // Normalize to forward slashes
    route = route.split(path.sep).join("/");
    // Remove index if present
    if (route.endsWith("/index/") || route.endsWith("/index")) {
      route = route.replace(/\/index\/?$/, "");
    }
    // Replace [param] with :param for dynamic routes
    route = route.replace(/\[([^\]]+)\]/g, ":$1");
    // Ensure it starts with '/'
    if (!route.startsWith("/")) {
      route = "/" + route;
    }
    // Remove trailing slash (except for root)
    if (route !== "/" && route.endsWith("/")) {
      route = route.slice(0, -1);
    }
    return route;
  }

  /**
   * Resolves the route definition and parameters for the given request.
   * @param request the request object
   * @returns an object with the route definition and parameters
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
   * Splits the route and request paths to compare segments.
   * Returns extracted parameters if the route matches, or null otherwise.
   * @param requestPath the path of the incoming request
   * @param routePath the path of the route to match
   * @returns an object with the extracted parameters if the route matches,
   * or null if the route does not match
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
