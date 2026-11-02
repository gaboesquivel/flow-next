import { withEve } from "eve/next";
import type { NextConfig } from "next";

/** Markdown negotiation when Accept asks for markdown and does not list text/html. */
const markdownAcceptPattern = "^(?!.*text/html).*text/markdown";

/** MCP App bundle that MCP routes serve as the GenUI preview resource. */
const genuiPreview = "./mcp-app/dist/genui-preview.html";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["flow-next.localhost", "*.flow-next.localhost"],
  experimental: {
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
    },
  },
  headers() {
    return [
      {
        headers: [{ key: "Vary", value: "Accept" }],
        source: "/",
      },
    ];
  },
  outputFileTracingIncludes: {
    "/api/mcp": [genuiPreview],
    "/api/mcp/operator": [genuiPreview],
    "/mcp": [genuiPreview],
  },
  redirects() {
    return [{ destination: "/dev", permanent: false, source: "/developers" }];
  },
  rewrites() {
    return {
      beforeFiles: [
        {
          destination: "/api/:path*",
          source: "/v1/api/:path*",
        },
        {
          destination: "/markdown/home",
          source: "/index.md",
        },
        {
          destination: "/markdown/home",
          has: [
            {
              key: "accept",
              type: "header",
              value: markdownAcceptPattern,
            },
          ],
          source: "/",
        },
      ],
    };
  },
};

export default withEve(nextConfig, { eveRoot: "." });
