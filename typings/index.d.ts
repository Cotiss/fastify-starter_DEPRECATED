import type { Static } from "@sinclair/typebox";
import type { Queue, Worker } from "bullmq";
import type { preHandlerHookHandler } from "fastify";
import type { Mongoose } from "mongoose";
import type { Client } from "typesense";

/**
 * To use Fastify with TypeScript you need to provide definitions for any plugin that
 * decorates the instance, reply, or request with a closure.
 */
declare module "fastify" {
  export interface FastifyInstance {
    config: import("../config").EnvConfig;
    mongoose: Mongoose;
    typesense: Client;
    authenticate: preHandlerHookHandler;
    generatePerformanceTrackingHistogram: import("../plugins/performance-monitoring").GeneratePerformanceTrackingHistogram;
    requireAllPermissions: import("../plugins/access-control").AccessPreHandlerFactory;
    requireOnePermissions: import("../plugins/access-control").AccessPreHandlerFactory;
    ListingsService: import("../services/listings").ListingsService;
    AuthService: import("../domain/auth/auth.service").AuthService;
    UsersService: import("../domain/users/users.service").UsersService;
  }

  export interface FastifyRequest {
    parsePagination: import("../plugins/paginate").PaginationParser;
    user: any;
  }

  export interface FastifyReply {
    sendWithPagination: import("../plugins/paginate").PaginatedReplySender;
  }
}

// This provides the JWT defintion to this plugin, since it injects it into the Fastify instance
declare module "fastify-jwt" {
  interface FastifyJWT {
    payload: { id: string; roles: any[] };
    user: {
      id: string;
      roles: import("../constants/permissions").RoleNames[];
    };
  }
}

export type Body<T extends TSchema> = { Body: Static<T> };

export type InferModel<M extends Model> = typeof M["schema"];

export type HTTP_METHOD =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH";
