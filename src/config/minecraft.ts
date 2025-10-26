import { CONSTANTS } from './constants';
import type { Env } from './schema';

export function getMinecraftConfig(env: Env) {
  return {
    host: env.MC_HOST,
    port: env.MC_PORT,
    username: env.MC_USERNAME,
    version: env.MC_VERSION || CONSTANTS.DEFAULT_MC_VERSION,
    auth: env.MC_AUTH,
  };
}
