import { readFile } from "node:fs/promises";
import path from "node:path";

import { registerAppResource, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/server";

export const GENUI_PREVIEW_RESOURCE_URI = "ui://genui/preview";

export const genuiPreviewResourceDescription =
  "Interactive GenUI preview for MCP Apps hosts — renders OpenUI compositions from compose_ui results.";

export const genuiPreviewHtmlPath = () =>
  path.join(process.cwd(), "mcp-app/dist/genui-preview.html");

let cachedHtml: Promise<string> | undefined;

const readAndCacheGenuiPreviewHtml = async () => {
  try {
    return await readFile(genuiPreviewHtmlPath(), "utf-8");
  } catch (error) {
    cachedHtml = undefined;
    throw error;
  }
};

/** Reads the bundled preview HTML; cached in production, re-read in development so rebuilds show up. */
export const readGenuiPreviewHtml = () => {
  if (process.env.NODE_ENV !== "production") return readFile(genuiPreviewHtmlPath(), "utf-8");
  cachedHtml ??= readAndCacheGenuiPreviewHtml();
  return cachedHtml;
};

export const registerGenuiPreviewResource = (server: McpServer, title: string) =>
  registerAppResource(
    server,
    title,
    GENUI_PREVIEW_RESOURCE_URI,
    { description: genuiPreviewResourceDescription },
    async () => ({
      contents: [
        {
          mimeType: RESOURCE_MIME_TYPE,
          text: await readGenuiPreviewHtml(),
          uri: GENUI_PREVIEW_RESOURCE_URI,
        },
      ],
    }),
  );
