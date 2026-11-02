import { otel } from "eve/instrumentation/otel";

/** Shared OpenTelemetry capture policy for Flow starter Eve agents. */
export default otel({
  resource: {
    "service.namespace": "flow-starter",
    "deployment.environment": process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  },
  tracePolicy: ({ environment }) => ({
    emit: true,
    recordInputs: environment === "development",
    recordOutputs: environment === "development",
  }),
});
