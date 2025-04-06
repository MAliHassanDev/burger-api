import type { Middleware, BurgerRequest, BurgerNext } from '@src';

// Global middleware example: a simple logger.
export const globalLogger: Middleware = async (
    req: BurgerRequest,
    next: BurgerNext
) => {
    console.log(`[Global Logger] ${req.method} ${req.url}`);
    return next();
};
