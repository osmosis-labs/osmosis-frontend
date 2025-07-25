export function captureError(e: any) {
  if (e instanceof Error) {
    console.error(e);
  } else if (process.env.NODE_ENV === "development") {
    console.warn("Did not capture non-Error:", e);
  }
}
