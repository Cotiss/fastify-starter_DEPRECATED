import { FastifyInstance } from 'fastify';
import { Body } from "../../typings";
import { Errors } from "./auth.constants";
import { LoginBody, LoginResponse } from "./auth.schema";

export default async function auth(instance: FastifyInstance) {
  instance.post<Body<typeof LoginBody>>(
    '/login',
    {
      schema: {
        body: LoginBody,
        response: {
          200: LoginResponse
        }
      }
    },
    async function (request) {
      const { email, password } = request.body;
      try {
        return await this.AuthService.login(email, password);
      } catch (err) {
        this.log.error(err);
        if (err instanceof Error) {
          switch (err.message) {
            case Errors.INACTIVE_ACCOUNT: {
              throw this.httpErrors.unauthorized('Account is deactivated');
            }
            case Errors.INVALID_CREDENTIALS: {
              throw this.httpErrors.unauthorized('Invalid email or password');
            }
            default: {
              throw this.httpErrors.badRequest();
            }
          }
        }
        throw err;
      }
    }
  )
}
