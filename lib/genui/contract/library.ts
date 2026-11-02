import { createLibrary, defineComponent } from "@openuidev/lang-core";

import type { ComponentName } from "../registry/components";
import { componentPropsByName } from "./schemas";

const noop = () => null;

/** Library order and descriptions; props come from `componentPropsByName`. */
const componentDescriptions: [ComponentName, string][] = [
  ["Answer", "Short prose answer with source references."],
  ["SectionStack", "Ordered sections for multi-intent results."],
  ["CollectionGrid", "Collection or grid of entities."],
  ["SearchResults", "Search results with optional filters."],
  ["ComparisonView", "Side-by-side or tabular comparison."],
  ["TimelineView", "Chronological timeline."],
  ["DetailView", "Detail view for one entity or document."],
  ["DataExplorer", "Metrics and charts exploration."],
  ["DocumentationBlock", "Documentation with code."],
  ["InteractiveForm", "Form wired to registered actions."],
  ["FilePreview", "Embedded file or media preview."],
  ["StatusMessage", "Loading, empty, warning, or error."],
  ["EvidenceQuote", "Customer evidence quote with link to source signal."],
  ["RankedSignalList", "Ordered list of signals with supporter context."],
];

export const flowGenuiContractLibrary = createLibrary({
  components: componentDescriptions.map(([name, description]) =>
    defineComponent({
      component: noop,
      description,
      name,
      props: componentPropsByName[name],
    }),
  ),
  root: "Answer",
});

export const flowGenuiLibraryJsonSchema = () => flowGenuiContractLibrary.toJSONSchema();
