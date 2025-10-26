import 'dotenv/config';
import { validateEnv } from '@/config';
import { createApplication } from '@/core';

const env = validateEnv();
const app = createApplication(env);

app.start().catch((error) => {
  console.error('[fatal] Failed to start application:', error);
  process.exit(1);
});
