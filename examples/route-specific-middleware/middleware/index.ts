import type { Middleware, BurgerNext, BurgerRequest } from '@src';

export const globalMiddleware1: Middleware = (
    req: BurgerRequest
): BurgerNext => {
    console.log('Global middleware executed for request:', req.url);

    // Call the next middleware
    return undefined;
};
