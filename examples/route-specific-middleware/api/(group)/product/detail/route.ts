import { BurgerRequest, BurgerResponse } from "../../../../../../src";

// Route-specific middleware
export const middleware = [
  async (
    req: BurgerRequest,
    res: BurgerResponse,
    next: () => Promise<Response>
  ) => {
    console.log("Product Detail Route-specific middleware executed");
    return await next();
  },
];

export async function GET(req: BurgerRequest, res: BurgerResponse) {
  return res.json({
    message: "Product Detail",
  });
}
