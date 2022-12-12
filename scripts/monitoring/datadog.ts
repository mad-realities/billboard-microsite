import { client, v2 } from "@datadog/datadog-api-client";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config({
  path: ".env.local",
});
const datadog = new v2.MetricsApi(client.createConfiguration());

// TODO: Submitting metrics via the Datadog HTTP API does not perform the same batching optimizations
// as the DogStatsD client. This can degrade application performance under load. We should consider
// using https://github.com/dbader/node-datadog-metrics (which wraps @datadog/datadog-api-client) instead.

export const incrementCount = async (metricName: string, value: number, extraTags: string[] = []) => {
  const params: v2.MetricsApiSubmitMetricsRequest = {
    body: {
      series: [
        {
          metric: `billboard.${metricName}`,
          type: 1, // COUNT type
          points: [
            {
              timestamp: Math.round(new Date().getTime() / 1000),
              value,
            },
          ],
          tags: [process.env.NODE_ENV || "", "billboard", "v1", ...extraTags],
        },
      ],
    },
  };

  await datadog.submitMetrics(params).catch((error) => console.error(error));
};

export const trackGauge = async (metricName: string, value: number, extraTags: string[] = []) => {
  const params: v2.MetricsApiSubmitMetricsRequest = {
    body: {
      series: [
        {
          metric: `billboard.${metricName}`,
          type: 3, // GAUGE type
          points: [
            {
              timestamp: Math.round(new Date().getTime() / 1000),
              value,
            },
          ],
          tags: [process.env.NODE_ENV || "", "billboard", "v1", ...extraTags],
        },
      ],
    },
  };

  await datadog.submitMetrics(params).catch((error) => console.error(error));
};
