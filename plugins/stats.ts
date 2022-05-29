// https://github.com/fastify/fastify-routes-stats/blob/master/index.js
import {
  PerformanceObserver,
  performance,
  RecordableHistogram,
  createHistogram,
} from "node:perf_hooks";
import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";

const ONSEND = "on-send-";
const ONREQUEST = "on-request-";
const ROUTES = "fastify-routes:";

export type RetrieveStats = () => ObservedEntries;

type ObservedEntries = Record<string, Record<string, RecordableHistogram>>;

const performanceMonitorPlugin: FastifyPluginAsync = async function (instance) {
  let observedEntries: ObservedEntries = {};
  const obs = new PerformanceObserver((items) => {
    items.getEntries().forEach((item) => {
      if (item.name.indexOf(ROUTES) === 0) {
        const method = item.name.split(":")[1].split("|")[0];
        const route = item.name.split(":")[1].split("|")[1];
        if (observedEntries[method] && observedEntries[method][route]) {
          observedEntries[method][route].record(Math.floor(item.duration));
        } else {
          if (!observedEntries[method]) {
            observedEntries[method] = {};
          }
          observedEntries[method][route] = createHistogram();
          observedEntries[method][route].record(Math.floor(item.duration));
        }
      }
    });
    performance.clearMarks();
  });
  obs.observe({ entryTypes: ["measure"] });

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

  const retrieveStats: RetrieveStats = function () {
    return observedEntries;
  };

  instance.decorate("retrieveStats", retrieveStats);
};

export default fp(performanceMonitorPlugin, {
  name: "performance-monitor",
});
