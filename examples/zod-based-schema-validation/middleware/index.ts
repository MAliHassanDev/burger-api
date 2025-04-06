import type { Middleware, BurgerNext, BurgerRequest } from '@burgerTypes';

export const globalMiddleware1: Middleware = async (
    req: BurgerRequest,
    next: BurgerNext
) => {
    console.log('Global middleware executed for request:', req.url);

    // Call the next middleware
    return next();
};
