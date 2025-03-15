// Import stuff from node
import { readdirSync } from 'fs'
import * as path from 'path'

// Import utils
import {
  cleanPrefix,
  normalizePath,
  compareRoutes,
  ROUTE_CONSTANTS,
  HTTP_METHODS,
} from '@utils/index.js'

// Import types
import type {
  Middleware,
  RequestHandler,
  RouteDefinition,
} from '@burgerTypes/index.js'

/**
 * ApiRouter class for handling file-based routing.
 * Loads routes from a directory structure and matches requests to the appropriate route handlers.
 * Supports dynamic segments (e.g., [id]) and HTTP method handlers.
 * Routes are sorted to prioritize static routes over dynamic ones to prevent overlapping route issues.
 */
export class ApiRouter {
  /** Array of loaded route definitions */
  public routes: RouteDefinition[] = []

  /**
   * Constructor for the ApiRouter class.
   * @param routesDir The directory path where route modules are located.
   * @param prefix Optional prefix to prepend to all routes (e.g., "api" becomes "/api/...").
   */
  constructor(private routesDir: string, private prefix: string = '') {
    if (!routesDir) {
      throw new Error('Routes directory path is required')
    }
  }

  /**
   * Loads route modules from the specified directory and adds them to the routes array.
   * After loading, sorts the routes to prioritize static routes over dynamic ones based on specificity.
   * @returns A promise that resolves when all route modules have been loaded and sorted.
   * @throws Error if the routes directory doesn't exist or can't be accessed
   */
  public async loadRoutes(): Promise<void> {
    try {
      this.routes = []
      await this.scanDirectory(this.routesDir)
      // Sort routes to ensure static routes are matched before dynamic ones
      this.routes.sort((a, b) => compareRoutes(a, b))
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to load routes: ${errorMessage}`)
    }
  }

  /**
   * Recursively scans the directory for route modules and adds them to the routes array.
   * @param dir The current directory to scan.
   * @param basePath The base path for constructing the route path.
   * @throws Error if multiple dynamic folders are found at the same level or if directory access fails
   */
  private async scanDirectory(
    dir: string,
    basePath: string = ''
  ): Promise<void> {
    // Track if a dynamic folder has been found at this directory level
    let dynamicFolderFound = false

    try {
      const entries = readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const entryPath = path.join(dir, entry.name)
        const relativePath = path.join(basePath, entry.name)

        if (entry.isDirectory()) {
          // Handle dynamic directories (e.g., [id])
          if (
            entry.name.startsWith(ROUTE_CONSTANTS.DYNAMIC_FOLDER_START) &&
            entry.name.endsWith(ROUTE_CONSTANTS.DYNAMIC_FOLDER_END)
          ) {
            if (dynamicFolderFound) {
              throw new Error(
                `Multiple dynamic route folders found in the same directory: '${entry.name}' conflicts with another dynamic folder in '${dir}'.`
              )
            }
            dynamicFolderFound = true
          }
          await this.scanDirectory(entryPath, relativePath)
        } else if (entry.isFile() && entry.name === 'route.ts') {
          await this.loadRouteModule(entryPath, relativePath)
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error // Re-throw specific errors we created
      }
      throw new Error(`Failed to scan directory '${dir}': ${String(error)}`)
    }
  }

  /**
   * Loads a route module and adds it to the routes array
   * @param entryPath Full path to the route file
   * @param relativePath Relative path used to construct the route
   */
  private async loadRouteModule(
    entryPath: string,
    relativePath: string
  ): Promise<void> {
    try {
      // Convert file path to route path and load the module
      const routePath = this.convertFilePathToRoute(relativePath)
      const modulePath = path.resolve(entryPath)
      const routeModule = await import(modulePath)

      // Collect HTTP method handlers from the module
      const handlers: { [method: string]: RequestHandler } = {}

      for (const method of HTTP_METHODS) {
        if (typeof routeModule[method] === 'function') {
          handlers[method] = routeModule[method]
        }
      }

      // Create route definition
      const routeDef: RouteDefinition = {
        path: routePath,
        handlers,
        middleware: routeModule.middleware as Middleware[],
        schema: routeModule.schema,
        openapi: routeModule.openapi,
      }

      this.routes.push(routeDef)
    } catch (error) {
      throw new Error(
        `Failed to load route module '${entryPath}': ${String(error)}`
      )
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
    if (filePath.endsWith('route.ts')) {
      filePath = filePath.slice(0, -'route.ts'.length)
    }

    // Split path into segments
    const segments = filePath.split(path.sep)
    const resultSegments: string[] = []

    for (let segment of segments) {
      if (!segment) continue // Skip empty segments

      // Skip grouping segments (e.g., (group))
      if (
        segment.startsWith(ROUTE_CONSTANTS.GROUPING_FOLDER_START) &&
        segment.endsWith(ROUTE_CONSTANTS.GROUPING_FOLDER_END)
      )
        continue

      // Convert dynamic segments from [param] to :param
      if (
        segment.startsWith(ROUTE_CONSTANTS.DYNAMIC_FOLDER_START) &&
        segment.endsWith(ROUTE_CONSTANTS.DYNAMIC_FOLDER_END)
      ) {
        const param = segment.slice(1, -1)
        resultSegments.push(ROUTE_CONSTANTS.DYNAMIC_SEGMENT_PREFIX + param)
      } else {
        resultSegments.push(segment)
      }
    }

    // Construct the route with leading slash
    let route = '/' + resultSegments.join('/')

    // Apply prefix if provided
    if (this.prefix) {
      const cleanPrefixStr = cleanPrefix(this.prefix)
      route = '/' + cleanPrefixStr + route
    }

    // Remove trailing slash unless it's the root
    if (route !== '/' && route.endsWith('/')) {
      route = route.slice(0, -1)
    }

    return route
  }

  /**
   * Resolves the given request by finding a matching route and extracting dynamic parameters.
   * @param request The request to resolve.
   * @returns An object containing the matched route and parameters, or an empty params object if no match.
   */
  public resolve(request: Request): {
    route?: RouteDefinition
    params: Record<string, string>
  } {
    try {
      const url = new URL(request.url)
      const reqPath = normalizePath(url.pathname)
      const method = request.method.toUpperCase()

      for (const route of this.routes) {
        const match = this.matchRoute(reqPath, route.path)
        if (match && route.handlers[method]) {
          return { route, params: match }
        }
      }
      return { params: {} }
    } catch (error) {
      // Return no match in case of URL parsing errors
      return { params: {} }
    }
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
    const reqSegments = requestPath.split('/').filter(Boolean)
    const routeSegments = routePath.split('/').filter(Boolean)

    if (reqSegments.length !== routeSegments.length) {
      return null
    }

    const params: Record<string, string> = {}
    for (let i = 0; i < reqSegments.length; i++) {
      const rSegment = routeSegments[i]
      const reqSegment = reqSegments[i]

      if (rSegment.startsWith(ROUTE_CONSTANTS.DYNAMIC_SEGMENT_PREFIX)) {
        const paramName = rSegment.slice(1)
        params[paramName] = decodeURIComponent(reqSegment)
      } else if (rSegment !== reqSegment) {
        return null
      }
    }
    return params
  }
}
