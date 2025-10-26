import 'dotenv/config';
import { createApplication } from '@/core';

const app = createApplication();

app.start().catch((error) => {
  console.error('[fatal] Failed to start application:', error);
  process.exit(1);
});
