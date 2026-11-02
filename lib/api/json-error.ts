export const jsonError = ({
  code,
  message,
  resolution,
  retryAfterSeconds,
  status,
  extraHeaders,
}: {
  code: string;
  message: string;
  resolution: string;
  retryAfterSeconds?: number;
  status: number;
  extraHeaders?: Record<string, string>;
}) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  };
  if (retryAfterSeconds !== undefined) {
    headers["Retry-After"] = String(retryAfterSeconds);
  }

  return Response.json(
    {
      code,
      error: message,
      resolution,
      type: "https://is-agentic.com/docs#errors",
    },
    { headers, status },
  );
};
