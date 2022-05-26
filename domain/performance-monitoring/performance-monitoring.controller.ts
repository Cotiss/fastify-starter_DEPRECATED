import { FastifyInstance, HTTPMethods } from 'fastify';

interface PerformanceMonitoring {
  Querystring: {
    routerPath: string,
    method?: HTTPMethods,
  }
}

export default async function performanceMonitoring(instance: FastifyInstance) {
  instance.get<PerformanceMonitoring>('/', async (request, reply) => {
    const { routerPath, method } = request.query;
    
    const result = instance.generatePerformanceTrackingHistogram(routerPath, method);
    return result;
  })
}
