export enum Errors {
  INACTIVE_ACCOUNT = 'inactive_account',
  INVALID_CREDENTIALS = 'invalid_credentials',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INCOMPLETE = 'incomplete',
  CANCELED = 'canceled',
  TRIALING = 'trialing',
  INCOMPLETE_EXPIRED = 'incompleteExpired',
  PAST_DUE = 'pastDue',
  UNPAID = 'unpaid',
  BILLING_REQUIRED = 'billing_required',
}
