import { BurgerRequest, BurgerResponse } from "../../../../../src";

// Route-specific middleware
export const middleware = [
  async (req: BurgerRequest, next: () => Promise<Response>) => {
    console.log("Product Route-specific middleware executed");
    return await next();
  },
];

export async function GET(req: BurgerRequest, res: BurgerResponse) {
  const query = req.query;
  return res.json({
    query: query,
    name: "John Doe",
  });
}

export async function POST(req: BurgerRequest, res: BurgerResponse) {
  const body = await req.json();
  return res.json(body);
}
