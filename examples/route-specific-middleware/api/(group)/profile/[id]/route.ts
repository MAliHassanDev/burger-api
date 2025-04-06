import type { BurgerNext, BurgerRequest } from '@src';

// Route-specific middleware
export const middleware = [
    async (req: BurgerRequest, next: BurgerNext) => {
        console.log(
            'Profile Route-specific middleware executed for request:',
            req.url
        );
        return next();
    },
];

export function GET(req: BurgerRequest) {
    const query = new URL(req.url).searchParams;

    return Response.json({
        id: req.params?.id,
        query: Object.fromEntries(query),
        name: 'John Doe',
    });
}
