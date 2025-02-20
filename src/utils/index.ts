import { resolve } from "path";

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
  while (prefix.startsWith("/")) {
    prefix = prefix.slice(1);
  }
  // Remove all slashes from the end
  while (prefix.endsWith("/")) {
    prefix = prefix.slice(0, -1);
  }
  return prefix;
}
