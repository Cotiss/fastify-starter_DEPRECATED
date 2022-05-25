import { FastifyInstance } from "fastify";

export default async function listings(instance: FastifyInstance) {
  instance.get("/", async (request, reply) => {
    reply.send(instance.retrieveStats());
  });
}
