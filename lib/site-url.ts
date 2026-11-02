type HeaderLike = Pick<Headers, "get">;

/** `proto://host` from Host (or X-Forwarded-Host) and X-Forwarded-Proto; first value only. */
const originFromHostHeaders = (headers: HeaderLike) => {
  const host = (headers.get("host") ?? headers.get("x-forwarded-host"))?.split(",")[0]?.trim();
  if (!host) return;
  const proto = headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
};

const httpsOriginFromHost = (value: string) =>
  `https://${value.replace(/^https?:\/\//u, "").replace(/\/$/u, "")}`;

export const resolveSiteOriginFromHeaderList = (headerList: HeaderLike) => {
  const origin = originFromHostHeaders(headerList);
  return resolveSiteOrigin(origin ? new Request(`${origin}/`) : undefined);
};

export const resolveSiteOrigin = (request?: Request) => {
  const fromEnv = process.env.NEXT_PUBLIC_APP_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/u, "");

  if (request) {
    try {
      const { hostname, origin } = new URL(request.url);
      if (hostname) return origin;
    } catch {
      // fall through to headers / env
    }

    const fromHeaders = originFromHostHeaders(request.headers);
    if (fromHeaders) return fromHeaders;
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return httpsOriginFromHost(vercelProduction);

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/u, "")}`;

  const agentic = process.env.AGENTIC_CHECK_URL?.trim();
  if (agentic) return httpsOriginFromHost(agentic);

  return "http://localhost:3000";
};
