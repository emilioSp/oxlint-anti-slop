declare const payload: unknown;
/* JUSTIFICATION: The caller validated the payload as a string. */
export const value = payload as string;
