export function unwrapSoapResult<T>(result: any): T {
  if (!result || typeof result !== "object") {
    return result as T;
  }

  if ("return" in result && result.return != null) {
    return result.return as T;
  }

  const keys = Object.keys(result);

  if (keys.length === 1) {
    const nested = result[keys[0]];

    if (nested && typeof nested === "object") {
      if ("return" in nested && nested.return != null) {
        return nested.return as T;
      }

      return nested as T;
    }
  }

  return result as T;
}
