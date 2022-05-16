import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import fp from 'fastify-plugin';

export const DEFAULT_LIMIT = 20;
export const DEFAULT_MAX_LIMIT = 100;

export interface Page<Entity> {
  count: number;
  page: Entity[];
}

interface PageQuery {
  limit: string;
  offset: string;
}

function parseNumber(str: string | undefined, defaultValue: number) {
   if (typeof str !== 'string') {
     return defaultValue;
   }
   const value = Number.parseInt(str, 10);
   return Number.isNaN(value) ? defaultValue : value;
}

type Request = FastifyRequest<{ Querystring: Partial<PageQuery> }>;

export interface PaginationParserOptions {
  defaultLimit?: number;
  maximumLimit?: number;
}

export type PaginationParser = (this: FastifyRequest, options?: PaginationParserOptions) => {
  limit: number;
  offset: number;
};

export type PaginatedReplySender = <T = any>(this: FastifyReply, page: Page<T>) => void;

const parsePagination: PaginationParser = function(options = {}) {
  const request = this as Request;
  const { defaultLimit, maximumLimit } = {
    defaultLimit: options.defaultLimit ?? DEFAULT_LIMIT,
    maximumLimit: options.maximumLimit ?? DEFAULT_MAX_LIMIT,
  };

  const limit = Math.min(parseNumber(request.query.limit, defaultLimit), maximumLimit);
  const offset = parseNumber(request.query.offset, 0);

  return { limit, offset };
}

const sendWithPagination: PaginatedReplySender = function({ count, page }) {
  const reply = this;
  const request = reply.request as Request;
  const { limit, offset } = parsePagination.call(request);
  request.log.info('limit: %d, offest: %d', limit, offset);
  const next = offset + limit < count
    ? new URLSearchParams({ limit: String(limit), offset: String(offset + limit) }).toString()
    : null;
  const previous = offset - limit < 0
    ? null
    : new URLSearchParams({ limit: String(limit), offset: String(offset - limit) }).toString();

  reply.send({ count, next, previous, results: page });
}

async function paginationPlugin(instance: FastifyInstance) {
  instance.decorateRequest("parsePagination", parsePagination);
  instance.decorateReply("sendWithPagination", sendWithPagination);
}

export default fp(paginationPlugin);
