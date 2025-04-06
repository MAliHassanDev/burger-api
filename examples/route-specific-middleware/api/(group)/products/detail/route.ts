import type { BurgerNext, BurgerRequest } from '@src';

// Route-specific middleware
export const middleware = [
    async (req: BurgerRequest, next: BurgerNext) => {
        console.log(
            'Product Detail Route-specific middleware executed for request:',
            req.url
        );
        return next();
    },
];

export function GET(req: BurgerRequest) {
    return Response.json({
        message: 'Product Detail',
    });
}
