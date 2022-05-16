import Fastify from 'fastify';
import type { FastifyServerOptions, FastifyInstance } from "fastify";
import autoLoad from 'fastify-autoload';
import { join } from 'path';
import { EnvConfig } from "./config";
import CorsPlugin from 'fastify-cors';
import RedisPlugin from 'fastify-redis';
import SensiblePlugin from 'fastify-sensible';

// Using a function to encasulate the Fastify instance
function buildServer(config: EnvConfig): FastifyInstance {
  const options: FastifyServerOptions = {
    logger: {
      level: config.LOG_LEVEL,
      prettyPrint: config.PRETTY_PRINT,
    },
  }
  const fastify = Fastify(options);
  
  // Add config object to fastify, so we can access it with `instance.config`
  fastify.decorate('config', config);

  fastify.register(CorsPlugin, { origin: true });

  // Recommended defaults for error handling published by the fastify team, not included out of the box as they keep fastify core slim.
  // Great thing about their plugin architecture, even if it was included OOTB, it would just be a plugin that is loaded by default.
  fastify.register(SensiblePlugin);

  // Register Redis at `instance.redis`
  fastify.register(RedisPlugin, {
    url: config.REDIS_URI,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  /**
   * -- Plugins --
   * 
   * At Fastify's core it's built on plugin architecture which is built on top of a direct acyclic graph (DAG).
   * It achieves this using closures to create encapsulation and inheritance throughout the graph, preventing issues
   * caused by cross dependencies.
   * 
   * As mentioned, at its core a plugin is just a closure within the Fastify instance. With this you can register the 
   * plugin at different scopes, local, outer, and global. Local is the default which will provide access to its descendants.
   * 
   * If you want to create a global plugin, you'll need to wrap it in a `fastify-plugin` which handles this for you as well as
   * linking dependent plugins.
   * 
   * Since plugins are just closures, they don't provide much capabilities other than being able to expose functions and data,
   * this is where the lifecycle comes in. Fastify also exposes lifecycle methods to hook into each phase of its lifecycle of a
   * request. Plugins use these hooks to register functionality which then exposes the context of that hook. An example would be
   * the `onRequest` hook which provides the context of the request object and allows you to modify its closure. Worth noting
   * that depending on the part of the lifecycle, the data will be in a different format. For instance the `onRequest` hook 
   * won't have a JavaScript object representing the body, it will have the raw serialised data. Whereas the `preHandler` hook
   * will have this.
   * 
   * Autoload is a convenience plugin for Fastify that loads all plugins found in a directory and automatically configures routes
   * matching the folder structure.
   * 
   * ## References
   * Closures: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
   * Fastify Plugin: https://github.com/fastify/fastify-plugin
   * Fastify Lifecycle: https://www.fastify.io/docs/latest/Reference/Lifecycle/
   * Fastify Autoload: https://github.com/fastify/fastify-autoload
   */   

  // Load all the files in the plugins directory, don't need to worry about encapsulation as they are all wrapped in `fastify-plugin`
  // Reference for `fastify-plugin` https://www.fastify.io/docs/latest/Guides/Plugins-Guide
  fastify.register(autoLoad, {
    dir: join(__dirname, 'plugins'),
  });
  
  // The domain directory contains each of our separate "subject areas", i.e. User, Listing, etc.
  // We're using a regular expression to only load the plugins which have the suffic `.service.ts`.
  fastify.register(autoLoad, {
    dir: join(__dirname, 'domain'),
    scriptPattern: /.*\.service\.ts$/
  });
  
  // Similar to above we're only loading the controllers here, since most controllers will depend on a service.
  fastify.register(autoLoad, {
    dir: join(__dirname, 'domain'),
    scriptPattern: /.*\.controller\.ts$/
  });

  fastify.log.info('Fastify is starting up!');

  // Return the root fastify instance so we can create a HTTP server and react
  return fastify;
}

export default buildServer
