import type { Middleware, BurgerNext, BurgerRequest } from '@burgerTypes';

export const globalMiddleware1: Middleware = async (
    request: BurgerRequest,
    next: BurgerNext
) => {
    console.log('Global middleware executed for request:', request.url);

    // Call the next middleware
    return next();
};
