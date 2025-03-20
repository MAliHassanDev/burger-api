import type {
    Middleware,
    BurgerRequest,
    BurgerResponse,
    BurgerNext,
} from '@src';

// Global middleware example: a simple logger.
export const globalLogger: Middleware = async (
    req: BurgerRequest,
    res: BurgerResponse,
    next: BurgerNext
) => {
    console.log(`[Global Logger] ${req.method} ${req.url}`);
    return next();
};
