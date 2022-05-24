import { FastifyInstance } from "fastify";

export default async function listings(instance: FastifyInstance) {
  instance.get("/", async (request, reply) => {
    const afterDate = new Date();
    reply.send(instance.stats({ afterDate }));
  });
}
