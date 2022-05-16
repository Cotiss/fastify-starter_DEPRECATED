import { FastifyPluginAsync, preHandlerHookHandler } from "fastify";
import fp from 'fastify-plugin';
import { Roles, RoleNames, Permissions } from "../constants/permissions";

function getPermissions(roles: RoleNames[]) {
  if (!roles) return [];
  const permissions = roles
    .map((role) => Roles[role])
    .flat()
    .filter(Boolean);
  return Array.from(new Set(permissions));
}

export type AccessPreHandlerFactory = (permissions: Permissions[]) => preHandlerHookHandler;

const accessControlPlugin: FastifyPluginAsync = async function (instance) {
  const requireAllPermissions: AccessPreHandlerFactory = function(requiredPermissions: Permissions[] = []) {
    return function(request, reply) {
      try {
        const permissions = getPermissions(request.user.roles);
        if (
          requiredPermissions.length &&
          !requiredPermissions.every((v) => permissions.includes(v))
        ) {
          return reply.forbidden();
        }
      } catch (e) {
        this.log.error('Failed verifying users roles', e);
        return reply.forbidden();
      }
    };
  };
  
  const requireOnePermissions: AccessPreHandlerFactory = function(requiredPermissions: Permissions[] = []) {
    return function(request, reply) {
      try {
        const permissions = getPermissions(request.user.roles);
  
        if (
          requiredPermissions.length && 
          !requiredPermissions.some((v) => permissions.includes(v))
        ) {
          return reply.forbidden();
        }
      } catch (e) {
        this.log.error('Failed verifying users roles', e);
        return reply.forbidden();
      }
    };
  };

  instance.decorate('requireAllPermissions', requireAllPermissions);
  instance.decorate('requireOnePermissions', requireOnePermissions);

};

export default fp(accessControlPlugin, {
  name: 'access-control',
  dependencies: ['authentication'],
  decorators: {
    fastify: ['authenticate']
  }
});
