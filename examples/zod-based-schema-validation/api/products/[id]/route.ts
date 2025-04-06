// Import stuff from zod
import { z } from 'zod';

// Import types
import type { BurgerNext, BurgerRequest } from '@src';

// Export a schema for GET requests.
export const schema = {
    get: {
        params: z.object({
            id: z.string().min(1, 'ID is required'),
        }),
    },
};

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

export async function GET(
    req: BurgerRequest<{ params: z.infer<typeof schema.get.params> }>
) {
    return Response.json({
        id: req.validated?.params.id,
        name: 'John Doe',
    });
}
