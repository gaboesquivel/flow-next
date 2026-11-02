import type { CompositionTier } from "../core/tiers";
import { tierFromSignals } from "../core/tiers";
import { acmeEntityIds } from "../fixtures/acme-catalog";

export type ControlledIntent =
  | "compare-plans"
  | "show-metrics"
  | "support-dashboard"
  | "product-timeline"
  | "search-products"
  | "list-products"
  | "onboarding-form"
  | "insufficient-data"
  | "injection-guard";

export interface RoutedIntent {
  intent: ControlledIntent | null;
  tier: CompositionTier;
}

const injectionPattern =
  /ignore (?<scope>all|prior) instructions|system prompt|execute arbitrary|<script|javascript:/iu;

/** `normalizedQuery` is trimmed and lowercased. */
export const isPlanComparison = (normalizedQuery: string) =>
  /compare|versus|vs\b/u.test(normalizedQuery) && /plan|orbit|nova/u.test(normalizedQuery);

/** Checked in order; the first match wins. */
const controlledIntentRules: [test: (normalizedQuery: string) => boolean, ControlledIntent][] = [
  [isPlanComparison, "compare-plans"],
  [
    (q) => /support\s+dashboard|help\s*desk|customer\s*service|\bticket\b|csat/u.test(q),
    "support-dashboard",
  ],
  [(q) => /metric|mrr|churn|revenue|dashboard|chart/u.test(q), "show-metrics"],
  [(q) => /timeline|release|history|chronolog/u.test(q), "product-timeline"],
  [(q) => /search|find\b/u.test(q), "search-products"],
  [(q) => /onboarding\s+form|sign[- ]?up\s+form|new\s+user\s+form/u.test(q), "onboarding-form"],
  [(q) => /list|show all|catalog/u.test(q), "list-products"],
  [(q) => /unsupported|render a 3d|arbitrary code|run shell/u.test(q), "insufficient-data"],
];

export const routeQuery = (query: string): RoutedIntent => {
  if (injectionPattern.test(query)) {
    return { intent: "injection-guard", tier: 1 };
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.includes(" and ") || normalizedQuery.includes(" plus ")) {
    const decision = tierFromSignals({
      ambiguous: false,
      hasControlledIntent: false,
      needsOpenComposition: false,
      synthesisRequired: true,
    });
    return { intent: null, tier: decision.tier };
  }

  for (const [test, intent] of controlledIntentRules) {
    if (test(normalizedQuery)) return { intent, tier: 1 };
  }

  return { intent: null, tier: ambiguousQueryTier(normalizedQuery).tier };
};

export const ambiguousQueryTier = (normalizedQuery: string) =>
  tierFromSignals({
    ambiguous: normalizedQuery.length < 8,
    hasControlledIntent: false,
    needsOpenComposition: /custom layout|surprise me|design a|generate|pricing/u.test(
      normalizedQuery,
    ),
    synthesisRequired: false,
  });

export const defaultEntityIds = () => acmeEntityIds;
