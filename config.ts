// Library to load and verify environment variables against a JSON schema
import envSchema from 'env-schema';
// Library used to build JSON schemas which supports inferring types
import { Static, Type } from '@sinclair/typebox';

const Schema = Type.Object({
  LOG_LEVEL: Type.String({ default: 'info' }),
  PRETTY_PRINT: Type.Boolean({ default: false }),
  MONGO_URI: Type.String(),
  APP_PORT: Type.Number({ default: 5000 }),
  REDIS_URI: Type.String(),
  JWT_SECRET: Type.String({ default: 'my-precious' }),
});

export type EnvConfig = Static<typeof Schema>;

export default envSchema<EnvConfig>({
  schema: Schema,
  dotenv: true,
  // Ajv is a JSON schema validator, the custom options are to support typebox.
  // https://ajv.js.org/
  ajv: {
    customOptions: (ajv) => {
      ajv.addKeyword('kind');
      ajv.addKeyword('modifier');
      return ajv;
    }
  }
});
