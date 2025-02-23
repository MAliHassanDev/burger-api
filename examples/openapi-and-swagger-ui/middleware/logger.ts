import type { BurgerRequest, BurgerResponse, Middleware } from "../../../src";

// Global middleware example: a simple logger.
export const globalLogger: Middleware = async (
  req: BurgerRequest,
  res: BurgerResponse,
  next: () => Promise<Response>
) => {
  console.log(`[Global Logger] ${req.method} ${req.url}`);
  return next();
};
