import type { BurgerRequest, BurgerResponse } from "../../../../../../src";

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
  // return new Response(
  //   JSON.stringify({
  //     id: params.id,
  //     query: query,
  //     name: "John Doe",
  //   }),
  //   {
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   }
  // );
}
