import { FastifyInstance } from 'fastify';

interface Search {
  Querystring: {
    limit: number,
    offset: number,
  }
}

export default async function listings(instance: FastifyInstance) {
  instance.get<Search>('/search', async (request, reply) => {
    const { limit, offset } = request.parsePagination({ defaultLimit: 10, maximumLimit: 20 });
    const { items, count } = await instance.ListingsService.pageListings(limit, offset);
    reply.sendWithPagination({ count, page: items });
  })

  instance.get('/test', async (request) => {
    instance.log.info('here');
    return {
      hello: 'dane'
    }
  });
}
