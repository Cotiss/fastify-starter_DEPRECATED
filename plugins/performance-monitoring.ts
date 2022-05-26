import {
  FastifyPluginCallback,
  HTTPMethods,
  onRequestHookHandler,
  onResponseHookHandler,
} from "fastify";
import {
  createHistogram,
  performance,
  PerformanceEntry,
  PerformanceObserver,
  RecordableHistogram,
} from "perf_hooks";
import fp from "fastify-plugin";

type PerformanceEntries = Record<string, Record<string, PerformanceEntry[]>>;

type PerformanceEntryWithMethod = PerformanceEntry & {
  detail: {
    method: HTTPMethods;
  };
};

export type GeneratePerformanceTrackingHistogram = (
  routerPath: string,
  method?: HTTPMethods | undefined
) => {
  min: number;
  max: number;
  mean: number;
  exceeds: number;
  stddev: number;
  count: number;
} | null;

function parseDuration(d: number) {
  return Math.round(d) < 1 ? 1 : Math.round(d);
}

const performanceMonitoringPlugin: FastifyPluginCallback = function (
  instance,
  opts,
  next
) {
  instance.log.debug("Starting up perfomance monitoring");

  const entries: PerformanceEntries = {};

  const perfObserver = new PerformanceObserver((items) => {
    items.getEntriesByType("measure").forEach((entry) => {
      const typedEntry = entry as PerformanceEntryWithMethod;
      const { method } = typedEntry.detail;
      const routerPath = typedEntry.name;

      // Keep perfomance entries sorted by url path and mehod e.g. entries[routerPath][method] = Array<PerfomanceEntry>
      if (entries[routerPath]) {
        if (entries[routerPath][method]) {
          entries[routerPath][method].push(typedEntry);
        } else {
          entries[routerPath][method] = [typedEntry];
        }
      } else {
        entries[routerPath] = {
          [method]: [typedEntry],
        };
      }
    });
  });

  perfObserver.observe({ entryTypes: ["measure"], buffered: true });

  const startTracking: onRequestHookHandler = (request, reply, next) => {
    performance.mark(`${request.id} start`);
    next();
  };

  const endTracking: onResponseHookHandler = (request, reply, next) => {
    performance.mark(`${request.id} end`);
    performance.measure(`${request.routerPath}`, {
      start: `${request.id} start`,
      end: `${request.id} end`,
      detail: {
        method: request.method,
      },
    });
    next();
  };

  const generatePerformanceTrackingHistogram: GeneratePerformanceTrackingHistogram =
    (routerPath: string, method?: HTTPMethods) => {
      const histogram = createHistogram() as RecordableHistogram & { count: number };

      // Get entries by HTTP method or all entries for a route
      if (method) {
        if (entries[routerPath]) {
          if (
            entries[routerPath][method] &&
            entries[routerPath][method].length > 0
          ) {
            entries[routerPath][method].map((p) => {
              const duration = parseDuration(p.duration);
              histogram.record(Math.round(duration));
            });
          }
        }
      } else {
        if (entries[routerPath]) {
          let perfEntries: PerformanceEntry[] = [];
          Object.entries(entries[routerPath]).map(([_, v]) => {
            if (v) {
              perfEntries = perfEntries.concat(v);
            }
          });
          if (perfEntries.length > 0) {
            perfEntries.map((p) => {
              const duration = parseDuration(p.duration);
              histogram.record(Math.round(duration));
            });
          }
        }
      }

      if (histogram.count > 0) {
        return {
          min: histogram.min,
          max: histogram.max,
          mean: histogram.mean,
          exceeds: histogram.exceeds,
          stddev: histogram.stddev,
          count: histogram.count,
        };
      } else {
        return null;
      }
    };

  instance.addHook("onRequest", startTracking);
  instance.addHook("onResponse", endTracking);
  instance.addHook("onClose", () => {
    instance.log.debug("Shutting down performance monitoring");
    perfObserver.disconnect();
  });
  instance.decorate(
    "generatePerformanceTrackingHistogram",
    generatePerformanceTrackingHistogram
  );

  next();
};

export default fp(performanceMonitoringPlugin, {
  name: "performanceMonitoring",
});
