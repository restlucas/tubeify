"use server";

import { cookies } from "next/headers";

export const getCookies = async () => {
  const cookieStore = await cookies();
  return cookieStore.getAll();
};

export const setCookies = async (
  name: string,
  value: string,
  options?: { expires?: Date }
) => {
  const cookieStore = await cookies();

  let cookieString = `${name}=${value}; path=/;`;
  if (options?.expires) {
    cookieString += ` expires=${options.expires.toUTCString()};`;
  }

  const cookieName = "@tubeify:" + name;
  cookieStore.set(cookieName, cookieString);
};
