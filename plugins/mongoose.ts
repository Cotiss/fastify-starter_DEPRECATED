import { FastifyPluginAsync } from "fastify";
import fp from 'fastify-plugin';
import mongoose, { Mongoose } from 'mongoose';

const mongoosePlugin: FastifyPluginAsync = async function (instance) {
  mongoose.connection.on('connected', function() {
    instance.log.debug('Mongoose connected');
  });

  mongoose.connection.on('disconnected', function() {
    instance.log.debug('Mongoose disconnected');
  });

  mongoose.connection.on('reconnected', function() {
    instance.log.debug('Mongoose reconnected');
  });

  mongoose.connection.on('error', function(err) {
    instance.log.error('Mongoose error', err);
  });

  try {
    await mongoose.connect(instance.config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch(error) {
    instance.log.fatal('Mongoose failed to connect', error);
  }

  instance.decorate<Mongoose>('mongoose', mongoose);

  instance.addHook('onClose', async () => {
    await mongoose.connection.close();
  })
}

export default fp(mongoosePlugin, {
  name: 'mongoose',
});
