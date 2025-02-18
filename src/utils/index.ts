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
