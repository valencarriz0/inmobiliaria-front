export const POST_VERIFICATION_RETURN_KEY = "postVerificationReturnTo";

export function isInternalPath(value: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//") && !/^\/[\\/]/.test(value));
}

export function savePostVerificationReturn(path: string) {
  if (!isInternalPath(path)) return;
  try { localStorage.setItem(POST_VERIFICATION_RETURN_KEY, path); } catch { return; }
}

export function consumePostVerificationReturn() {
  try {
    const value = localStorage.getItem(POST_VERIFICATION_RETURN_KEY);
    localStorage.removeItem(POST_VERIFICATION_RETURN_KEY);
    return isInternalPath(value) ? value : "/";
  } catch { return "/"; }
}
