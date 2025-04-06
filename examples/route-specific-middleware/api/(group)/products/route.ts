import type { BurgerNext, BurgerRequest } from '@src';

// Route-specific middleware
export const middleware = [
    async (req: BurgerRequest, next: BurgerNext) => {
        console.log(
            'Product Route-specific middleware executed for request:',
            req.url
        );
        return next();
    },
];

export async function GET(req: BurgerRequest) {
    console.log('Product GET request');
    const query = new URL(req.url).searchParams;
    return Response.json({
        query: Object.fromEntries(query),
        name: 'John Doe',
    });
}

export async function POST(req: BurgerRequest) {
    const body = await req.json();
    return Response.json(body);
}
