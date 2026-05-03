export type RouteInfo = {
  params: Record<string, any>;
};

/**
 *
 * @param pattern
 * @param url
 *
 * slug /:id
 * any route /*
 *
 */
export function match(pattern: string, url: string): RouteInfo | null {
  const patternPath = normalizePath(pattern);
  const urlPath = normalizePath(url);

  const patternSegments = splitPath(patternPath);
  const urlSegments = splitPath(urlPath);
  const params: Record<string, any> = {};

  let urlIndex = 0;

  for (
    let patternIndex = 0;
    patternIndex < patternSegments.length;
    patternIndex += 1
  ) {
    const patternSegment = patternSegments[patternIndex]!;

    if (patternSegment === "*") {
      params["*"] = urlSegments.slice(urlIndex).join("/");
      return { params };
    }

    const urlSegment = urlSegments[urlIndex];

    if (urlSegment === undefined) {
      return null;
    }

    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = decodePathSegment(urlSegment);
      urlIndex += 1;
      continue;
    }

    if (patternSegment !== urlSegment) {
      return null;
    }

    urlIndex += 1;
  }

  if (urlIndex !== urlSegments.length) {
    return null;
  }

  return { params };
}

function normalizePath(value: string): string {
  const withoutQuery = value.split("?")[0]?.split("#")[0] ?? "";

  if (withoutQuery === "") {
    return "/";
  }

  return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
}

function splitPath(value: string): Array<string> {
  return value.split("/").filter(Boolean);
}

function decodePathSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
