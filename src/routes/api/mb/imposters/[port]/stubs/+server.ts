import { json, text, type RequestHandler } from "@sveltejs/kit";
import type { Imposter } from "../../../../../../app";

export const PUT: RequestHandler = async ({ request, params }) => {
  const req = await fetch(
    `http://localhost:2525/imposters/${params.port}/stubs`,
    {
      method: "PUT",
      body: await request.text()
    }
  );

  if (req.status !== 200) {
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
