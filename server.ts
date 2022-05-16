// Loads environment variables and verifies each exists, also provides types
import configSchema from './config';
// Builds the Fastify instance
import buildServer from './index';

const fastify = buildServer(configSchema);

const start = async function () {
  try {
    await fastify.listen(configSchema.APP_PORT);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
