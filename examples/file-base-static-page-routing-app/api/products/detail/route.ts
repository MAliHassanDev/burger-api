import type { BurgerRequest, BurgerResponse } from '@src';

export async function GET(req: BurgerRequest, res: BurgerResponse) {
    console.log('[GET] Product Detail route invoked');

    return res.json({
        name: 'Sample Product',
    });
}
