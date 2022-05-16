import { FastifyInstance } from "fastify";
import fp from 'fastify-plugin';

const DEFAULT_SERVICE_NAME = 'AbstractService';

/**
 * Fastify Service
 * 
 * This is an abstract class which provides allows you to write your services 
 * as classes while still exposing a functional plugin interface.
 * 
 * Most of the "magic" happens in the `expose` function, which creates an instance
 * of the services and decorates the fastify instance.
 */
export abstract class Service {
  protected instance: FastifyInstance;
  public serviceName: string = DEFAULT_SERVICE_NAME;
  
  constructor(instance: FastifyInstance) {
    this.instance = instance;
    this.instance.addHook('onClose', this.onClose);
  }

  get name() {
    if (this.serviceName === DEFAULT_SERVICE_NAME) {
      throw new Error('You need to specify a custom "serviceName" for this service');
    }
    return this.serviceName;
  }

  async onClose() {
  }
}

type Clazz<T extends Service> = new (...args: any[]) => T;

export function expose<T extends Service>(service: Clazz<T>) {
  const plugin = async function(instance: FastifyInstance) {
    const serviceInstance = new service(instance);
    instance.decorate(serviceInstance.name, serviceInstance as unknown);
    instance.log.info('Registered service "%s"', serviceInstance.name);
  }
  return fp(plugin);
}
