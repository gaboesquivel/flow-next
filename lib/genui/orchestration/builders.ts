import { openUiStringList, openUiStringLiteral } from "../contract/openui-text";
import type { CompositionEnvelope, GroundedRecord } from "../core/envelope";
import { GENUI_LIBRARY_VERSION } from "../core/envelope";
import { onboardingFormRecords } from "../fixtures/synthetic-onboarding";
import {
  supportDashboardRecords,
  supportMetricIds,
  supportTicketIds,
} from "../fixtures/synthetic-support";
import type { CompositeName } from "../registry/composites";
import { chooseCollectionComposite } from "../registry/composites";

const envelope = ({
  fallbackText,
  records,
  requestId,
  root,
}: {
  fallbackText: string;
  records: GroundedRecord[];
  requestId: string;
  root: string;
}): CompositionEnvelope => ({
  fallbackText,
  libraryVersion: GENUI_LIBRARY_VERSION,
  openuiText: `root = ${root}`,
  records,
  requestId,
});

export const answerDocument = ({
  body,
  records,
  requestId,
  sourceIds = [],
}: {
  body: string;
  records: GroundedRecord[];
  requestId: string;
  sourceIds?: string[];
}) =>
  envelope({
    fallbackText: body,
    records,
    requestId,
    root: `Answer(${openUiStringLiteral(body)}, ${openUiStringList(sourceIds)})`,
  });

export const collectionDocument = ({
  composite,
  entityIds,
  records,
  requestId,
}: {
  composite?: CompositeName;
  entityIds: string[];
  records: GroundedRecord[];
  requestId: string;
}) => {
  const layout = composite ?? chooseCollectionComposite({ entityIds });
  return envelope({
    fallbackText: `Showing ${entityIds.length} items.`,
    records,
    requestId,
    root: `CollectionGrid(${openUiStringLiteral(layout)}, ${openUiStringList(entityIds)})`,
  });
};

export const comparisonDocument = ({
  dimension,
  entityIds,
  records,
  requestId,
}: {
  dimension?: string;
  entityIds: string[];
  records: GroundedRecord[];
  requestId: string;
}) =>
  envelope({
    fallbackText: `Comparing ${entityIds.length} items.`,
    records,
    requestId,
    root: `ComparisonView("side-by-side", ${openUiStringLiteral(dimension ?? "")}, ${openUiStringList(entityIds)})`,
  });

export const dataExplorerDocument = ({
  metricIds,
  records,
  requestId,
}: {
  metricIds: string[];
  records: GroundedRecord[];
  requestId: string;
}) =>
  envelope({
    fallbackText: "Metrics overview.",
    records,
    requestId,
    root: `DataExplorer("metrics-dashboard", ${openUiStringList(metricIds)})`,
  });

export const timelineDocument = ({
  orderedIds,
  records,
  requestId,
}: {
  orderedIds: string[];
  records: GroundedRecord[];
  requestId: string;
}) =>
  envelope({
    fallbackText: "Timeline.",
    records,
    requestId,
    root: `TimelineView("timeline-vertical", ${openUiStringList(orderedIds)})`,
  });

export const sectionStackDocument = ({
  childExpressions,
  records,
  requestId,
}: {
  childExpressions: string[];
  records: GroundedRecord[];
  requestId: string;
}) =>
  envelope({
    fallbackText: "Multiple sections.",
    records,
    requestId,
    root: `SectionStack([${childExpressions.join(", ")}])`,
  });

export const onboardingFormDocument = ({ requestId }: { requestId: string }) => {
  const records = onboardingFormRecords;
  const children = [
    `Answer(${openUiStringLiteral("Welcome — tell us about yourself to get started.")}, [])`,
    `InteractiveForm("form-wizard", "form:onboarding")`,
  ];
  return sectionStackDocument({
    childExpressions: children,
    records,
    requestId,
  });
};

export const supportDashboardDocument = ({ requestId }: { requestId: string }) => {
  const records = supportDashboardRecords;
  const metrics = supportMetricIds();
  const tickets = supportTicketIds();
  const children = [
    `DataExplorer("metrics-dashboard", ${openUiStringList(metrics)})`,
    `CollectionGrid("list-compact", ${openUiStringList(tickets)})`,
    `Answer(${openUiStringLiteral(
      "Queue is stable; billing and auth issues dominate escalations this week.",
    )}, ${openUiStringList(["document:playbook-escalation"])})`,
  ];
  return sectionStackDocument({
    childExpressions: children,
    records,
    requestId,
  });
};

export const statusDocument = ({
  message,
  records,
  requestId,
  variant,
}: {
  message: string;
  records: GroundedRecord[];
  requestId: string;
  variant: "loading" | "empty" | "warning" | "error";
}) =>
  envelope({
    fallbackText: message,
    records,
    requestId,
    root: `StatusMessage(${openUiStringLiteral(message)}, ${openUiStringLiteral(variant)})`,
  });
