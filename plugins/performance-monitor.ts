// https://github.com/fastify/fastify-routes-stats/blob/master/index.js
import {
  PerformanceObserver,
  performance,
  createHistogram,
} from "node:perf_hooks";
import { isAfter, isBefore } from "date-fns";
import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import summary from "summary";

const ONSEND = "on-send-";
const ONREQUEST = "on-request-";
const ROUTES = "fastify-routes:";

interface PerformanceRecord {
  duration: number;
  timestamp: Date;
}

interface StatsProps {
  beforeDate?: Date;
  afterDate?: Date;
}

interface Statistics {
  mean: number;
  mode: number;
  median: number;
  max: number;
  min: number;
  sd: number;
}

let observedEntries: Record<string, Record<string, PerformanceRecord[]>> = {};
type observedResults = Record<string, Record<string, Statistics>>;

export type RetrieveStats = (props: StatsProps) => observedResults;

function recordObservations() {
  const obs = new PerformanceObserver((items) => {
    items.getEntries().forEach((item) => {
      if (item.name.indexOf(ROUTES) === 0) {
        const method = item.name.split(":")[1].split("|")[0];
        const route = item.name.split(":")[1].split("|")[1];
        if (observedEntries[method] && observedEntries[method][route]) {
          observedEntries[method][route].push({
            duration: item.duration,
            timestamp: new Date(),
          });
        } else {
          if (!observedEntries[method]) {
            observedEntries[method] = {};
          }
          observedEntries[method][route] = [
            { duration: item.duration, timestamp: new Date() },
          ];
        }
      }
    });
    performance.clearMarks();
  });

  obs.observe({ entryTypes: ["measure"] });
}

const stats: RetrieveStats = function ({ beforeDate, afterDate }: StatsProps) {
  const results: observedResults = {};
  console.log("sdfsdf", observedEntries);

  const methods = Object.keys(observedEntries);
  for (let i = 0; i < methods.length; i++) {
    const method = methods[i];
    const routes = Object.keys(observedEntries[method]);
    for (let j = 0; j < routes.length; j++) {
      const route = routes[j];
      const s = summary(
        observedEntries[method][route]
          .map(({ duration, timestamp }) => {
            if (beforeDate && isBefore(timestamp, beforeDate)) return;

            if (afterDate && isAfter(timestamp, afterDate)) return;

            return duration;
          })
          .filter((entry) => entry)
      );

      if (s.data.length === 0) break;

      if (!results[method]) {
        results[method] = {};
      }

      results[method][route] = {
        mean: s.mean(),
        mode: s.mode(),
        median: s.median(),
        max: s.max(),
        min: s.min(),
        sd: s.sd(),
      };
    }
  }
  return results;
};

const performanceMonitorPlugin: FastifyPluginAsync = async function (instance) {
  recordObservations();
  instance.addHook("onRequest", function (request, reply, next) {
    const id = request.id;
    performance.mark(ONREQUEST + id);
    next();
  });

  instance.addHook("onSend", function (request, reply, _, next) {
    let routeId = request.raw.url;

    const id = request.id;
    performance.mark(ONSEND + id);

    const key = `${ROUTES}${request.raw.method}|${routeId}`;
    performance.measure(key, ONREQUEST + id, ONSEND + id);

    performance.clearMarks(ONSEND + id);
    performance.clearMarks(ONREQUEST + id);

    next();
  });

  instance.decorate("stats", stats);
};

export default fp(performanceMonitorPlugin, {
  name: "performance-monitor",
});
