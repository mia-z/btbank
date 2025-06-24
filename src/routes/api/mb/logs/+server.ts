import { json, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({}) => {
  const req = await fetch(`http://localhost:2525/logs`);

  var res = await req.json();
  return json(res);
};
