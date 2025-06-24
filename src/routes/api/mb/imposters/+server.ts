import { json, text, type RequestHandler } from "@sveltejs/kit";
import type { Imposter } from "../../../../app";

export const GET: RequestHandler = async ({}) => {
  const req = await fetch(`http://localhost:2525/imposters`);

  var res = await req.json();
  return json(res);
};

export const POST: RequestHandler = async ({ request }) => {
  const req = await fetch(`http://localhost:2525/imposters`, {
    method: "POST",
    body: await request.text()
  });

  if (req.status !== 201) {
    const jsonRes = await req.json();
    console.log(jsonRes.errors);
    if (Array.isArray(jsonRes?.errors)) {
      return json(jsonRes.errors[0], { status: req.status });
    }

    return json({ error: "other error" }, { status: req.status });
  }

  var res = (await req.json()) as Imposter;
  return json(res);
};
