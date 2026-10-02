declare const payload: unknown;
export const value = payload as string; // JUSTIFICATION: The caller validated this string.
