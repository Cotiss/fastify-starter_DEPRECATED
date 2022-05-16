import { FastifyPluginAsync, preHandlerHookHandler } from "fastify";
import fp from 'fastify-plugin';
import JwtPlugin from 'fastify-jwt';

const authenticationPlugin: FastifyPluginAsync = async function (instance) {
  instance.register(JwtPlugin, {
    secret: instance.config.JWT_SECRET,
  });

  const authenticate: preHandlerHookHandler = async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  }

  instance.decorate('authenticate', authenticate);
};

export default fp(authenticationPlugin, {
  name: 'authentication'
});
