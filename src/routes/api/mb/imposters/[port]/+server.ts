import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  const req = await fetch(`http://localhost:2525/imposters/${params.port}`);

  var res = await req.json();
  return json(res);
};

export const DELETE: RequestHandler = async ({ params }) => {
  const req = await fetch(`http://localhost:2525/imposters/${params.port}`, {
    method: "DELETE"
  });

  var res = await req.json();
  return json(res);
};
