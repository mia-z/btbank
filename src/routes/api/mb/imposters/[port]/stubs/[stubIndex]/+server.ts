import type { RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ request, params }) => {
  const req = await fetch(
    `http://localhost:2525/imposters/${params.port}/stubs/${params.stubIndex}`,
    {
      method: "PUT",
      body: await request.json()
    }
  );

  var res = await req.json();
  return res;
};
