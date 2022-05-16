import { Type } from "@sinclair/typebox";

export const LoginBody = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String(),
});

export const LoginResponse = Type.Object({
  accessToken: Type.String(),
});
