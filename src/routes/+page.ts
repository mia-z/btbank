import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const req = await fetch("/api/mb/imposters");
  const res = await req.json();
  console.log(res);

  return res;
};
