import type { BurgerRequest, Middleware } from "../../../src/types";

/**
 * Example of a global middleware function. This middleware logs a message to
 * the console whenever it is executed.
 * @param req - The BurgerRequest object.
 * @param next - The next middleware function to call.
 * @returns A Promise resolved with the response from the next middleware function.
 */
export const globalMiddleware1: Middleware = async (
  req: BurgerRequest,
  next
) => {
  console.log("Global middleware executed.");

  // Call the next middleware
  return await next();
};
