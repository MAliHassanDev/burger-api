import { BurgerRequest, BurgerResponse } from "../../../../../../src";

export async function GET(req: BurgerRequest, res: BurgerResponse) {
  return res.json({
    message: "Product Detail",
  });
}
