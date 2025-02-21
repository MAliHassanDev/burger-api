import type { BurgerRequest, Middleware } from "@/types";


/**
 * Example of an internal middleware function. This middleware logs a message to
 * the console whenever it is executed.
 * @param req - The BurgerRequest object.
 * @param next - The next middleware function to call.
 * @returns A Promise resolved with the response from the next middleware function.
 */
export const internalMiddleware1: Middleware = async (
  req: BurgerRequest,
  next
) => {
  console.log("Internal middleware executed.");
  return await next();
};
