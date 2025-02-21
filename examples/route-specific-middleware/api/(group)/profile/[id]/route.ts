import type { BurgerRequest, BurgerResponse } from "../../../../../../src";

// Route-specific middleware
export const middleware = [
  async (req: BurgerRequest, next: () => Promise<Response>) => {
    console.log("Profile Route-specific middleware executed");
    return await next();
  },
];

export async function GET(
  req: BurgerRequest,
  res: BurgerResponse,
  params: { id: string }
) {
  const query = req.query;

  return res.json({
    id: params.id,
    query: query,
    name: "John Doe",
  });
}
