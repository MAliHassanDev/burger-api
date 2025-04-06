import type { TrieNode, RouteDefinition } from '@src/types';
import { resolve } from 'path';

// Export constants
export {
    ROUTE_CONSTANTS,
    HTTP_METHODS,
    compareRoutes,
    getRouteSpecificity,
} from '@utils/routing.js';

/**
 * Resolves the given path to the specified directory.
 * @param directory the directory to resolve to
 * @param path the path to resolve
 * @returns the resolved path
 */
export function setDir(directory: string, path: string): string {
    return resolve(directory, path);
}

/**
 * Removes leading and trailing slashes from the given prefix.
 * @param prefix the prefix to clean
 * @returns the cleaned prefix
 */
export function cleanPrefix(prefix: string): string {
    // Remove all slashes from the beginning
    while (prefix.startsWith('/')) {
        prefix = prefix.slice(1);
    }
    // Remove all slashes from the end
    while (prefix.endsWith('/')) {
        prefix = prefix.slice(0, -1);
    }
    return prefix;
}

/**
 * Normalizes a file path by replacing multiple slashes with a single slash
 * and removing any trailing slash, unless the path is the root.
 * @param path The file path to normalize.
 * @returns The normalized file path.
 */
export function normalizePath(path: string): string {
    // Replace multiple slashes with a single slash
    let normalized = path.replace(/\/+/g, '/');

    // Remove trailing slash if it's not the root
    if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }

    return normalized;
}

/**
 * Collects all routes from the trie and returns them as an array of RouteDefinition objects.
 * @param node The current node in the trie.
 * @param currentPath The current path being traversed.
 * @param routes The array of collected routes.
 * @returns An array of RouteDefinition objects.
 */
export function collectRoutes(
    node: TrieNode,
    currentPath: string = '',
    routes: RouteDefinition[] = []
): RouteDefinition[] {
    // If this node has a route definition, add it
    if (node.route) {
        routes.push({
            ...node.route,
            path: currentPath,
        });
    }

    // Traverse static children
    node.children.forEach((child: TrieNode, segment: string) => {
        collectRoutes(child, `${currentPath}/${segment}`, routes);
    });

    // Traverse dynamic child if exists
    if (node.paramChild) {
        const paramPath = `${currentPath}/:${node.paramChild.paramName}`;
        collectRoutes(node.paramChild, paramPath, routes);
    }

    return routes;
}
