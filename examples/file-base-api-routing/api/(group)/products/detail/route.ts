import type { BurgerRequest, BurgerResponse } from "@src/index";

export async function GET(req: BurgerRequest, res: BurgerResponse) {
  return res.json({
    message: "Product Detail",
  });
}
