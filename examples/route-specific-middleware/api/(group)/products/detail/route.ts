import type { BurgerRequest, BurgerResponse, BurgerNext } from '@src';

// Route-specific middleware
export const middleware = [
    async (req: BurgerRequest, res: BurgerResponse, next: BurgerNext) => {
        console.log('Product Detail Route-specific middleware executed');
        return await next();
    },
];

export async function GET(req: BurgerRequest, res: BurgerResponse) {
    return res.json({
        message: 'Product Detail',
    });
}
