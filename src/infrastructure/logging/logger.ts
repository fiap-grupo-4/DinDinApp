function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
}

export const logger = {
  error(event: string, error?: unknown) {
    if (__DEV__) console.error(event, getErrorCode(error));
  },
  warn(event: string, error?: unknown) {
    if (__DEV__) console.warn(event, getErrorCode(error));
  },
};
