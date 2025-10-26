import { CONSTANTS } from './constants';

export function getMinecraftConfig() {
  const host = process.env.MC_HOST;
  const port = process.env.MC_PORT;
  const username = process.env.MC_USERNAME;

  if (!host || !port || !username) {
    throw new Error(
      'Missing required environment variables: MC_HOST, MC_PORT, MC_USERNAME'
    );
  }

  return {
    host,
    port: Number(port),
    username,
    version: process.env.MC_VERSION || CONSTANTS.DEFAULT_MC_VERSION,
    auth: (process.env.MC_AUTH as 'mojang' | 'microsoft' | 'offline') || undefined,
  };
}
