import type { TypeSafeClient } from "@typesafe-ai/sdk";

import type { z } from "zod";

import type { CompositionTier } from "../core/tiers";
import { JEV_CONFIDENCE_THRESHOLD } from "../core/tiers";
import type { ControlledIntent, RoutedIntent } from "./routing";
import { ambiguousQueryTier } from "./routing";
import type { composeClassifierSchema } from "./stream-schema";

export type ComposeClassifier = z.infer<typeof composeClassifierSchema>;

export type AmbiguousClassification =
  | {
      classifier: ComposeClassifier;
      intent: ControlledIntent;
      tier: 1;
    }
  | {
      classifier: ComposeClassifier;
      intent: null;
      tier: CompositionTier;
    }
  | {
      classifier: "jev";
      failure: "classification_failed";
    };

/** Jev choices for ambiguous queries; every key other than `open` and `unsupported` is a controlled intent. */
const intentChoices = {
  "compare-plans": "Compare subscription or product plans",
  "list-products": "List or browse catalog entities",
  "onboarding-form": "Collect new user information in a form",
  open: "Open-ended or novel layout requiring generation",
  "product-timeline": "Show a chronological product timeline",
  "search-products": "Search or filter catalog items",
  "show-metrics": "Show metrics, revenue, or dashboard charts",
  "support-dashboard": "Customer support or help desk dashboard",
  unsupported: "Request is outside the registered component catalog",
} satisfies Partial<Record<ControlledIntent | "open" | "unsupported", string>>;

const intentChoiceIds = Object.keys(intentChoices);

const jevIntentFromChoice = (choiceId: string): ControlledIntent | "open" | null => {
  if (choiceId === "open") return "open";
  if (choiceId === "unsupported") return "insufficient-data";
  return intentChoiceIds.includes(choiceId) ? (choiceId as ControlledIntent) : null;
};

const regexFallback = ({ routed }: { routed: RoutedIntent }): AmbiguousClassification => ({
  classifier: "regex",
  intent: null,
  tier: routed.tier,
});

export const classifyAmbiguousQuery = async ({
  query,
  routed,
  runJev = defaultJevClassifier,
}: {
  query: string;
  routed: RoutedIntent;
  runJev?: (query: string) => Promise<AmbiguousClassification | null>;
}): Promise<AmbiguousClassification> => {
  const apiKey = process.env.TYPESAFE_API_KEY?.trim();
  if (!apiKey) return regexFallback({ routed });

  try {
    const jevResult = await runJev(query);
    if (jevResult) return jevResult;
    return regexFallback({ routed });
  } catch {
    return { classifier: "jev", failure: "classification_failed" };
  }
};

let jevClient: TypeSafeClient | null = null;

const getJevClient = async () => {
  if (!jevClient) {
    const { TypeSafeClient } = await import("@typesafe-ai/sdk");
    jevClient = new TypeSafeClient({ defaultModel: "jev-latest" });
  }
  return jevClient;
};

const defaultJevClassifier = async (query: string): Promise<AmbiguousClassification | null> => {
  const { choice } = await import("@typesafe-ai/sdk");
  const client = await getJevClient();
  const response = await client.systemOne({
    questions: {
      intent: choice("Which starter experience best matches this UI request?", intentChoices),
    },
    state: query,
  });

  const confidence = response.answers.intent.confidence ?? 0;
  if (confidence < JEV_CONFIDENCE_THRESHOLD) {
    const decision = ambiguousQueryTier(query.trim().toLowerCase());
    return { classifier: "jev", intent: null, tier: decision.tier };
  }

  const mapped = jevIntentFromChoice(response.answers.intent.choice);
  if (mapped === "open") {
    return { classifier: "jev", intent: null, tier: 3 };
  }
  if (mapped === "insufficient-data" || mapped === null) {
    return { classifier: "jev", intent: "insufficient-data", tier: 1 };
  }
  return { classifier: "jev", intent: mapped, tier: 1 };
};
