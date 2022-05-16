export type Permissions = typeof Permissions[keyof typeof Permissions];

export const Permissions = {
  LISTINGS_READ: 'listings:read',
  LISTINGS_UPDATE: 'listings:update',
  USER_READ: 'users:read',
  USER_UPDATE: 'users:update',
  USER_DELETE: 'users:delete',
} as const;

export type RoleNames = typeof RoleNames[keyof typeof RoleNames];

export const RoleNames = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type Roles = Partial<Record<RoleNames, ReadonlyArray<Permissions>>>;

export const Roles: Roles = {
  [RoleNames.USER]: [
    Permissions.LISTINGS_READ,
    Permissions.USER_READ,
  ],
  [RoleNames.ADMIN]: [
    Permissions.LISTINGS_UPDATE,
    Permissions.USER_UPDATE,
    Permissions.USER_DELETE,
  ],
} as const;
