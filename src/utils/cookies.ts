"use server";

import { cookies } from "next/headers";

export const getCookies = async (name: string) => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(`@tubeify:${name}-token`);
  return cookie ? cookie.value : null;
};

export const setCookies = async (
  name: string,
  value: string,
  options?: { expires?: Date }
) => {
  const cookieStore = await cookies();

  const cookieName = `@tubeify:${name}`;

  let cookieString = `${cookieName}=${value}; path=/;`;

  if (!options?.expires) {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour em miliseconds
    options = { expires: oneHourFromNow };
  } else {
    cookieString += `expires=${options.expires.toUTCString()};`;
  }

  console.log(cookieString);

  cookieStore.set(cookieName, value, {
    path: "/",
    expires: options.expires,
  });
};
