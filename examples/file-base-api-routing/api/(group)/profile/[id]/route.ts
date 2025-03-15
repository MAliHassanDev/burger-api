import type { BurgerRequest, BurgerResponse } from "@src";

export async function GET(req: BurgerRequest, res: BurgerResponse) {
  const query = req.query;

  return res.json({
    id: req?.params?.id,
    query: query,
    name: "John Doe",
  });
}
