/**
 * コア型定義
 */

import type { TemzinBot } from './bot';

export interface TemzinBotOpts {
  host: string;
  port: number;
  username: string;
  version: string;
  auth: 'mojang' | 'microsoft' | 'offline' | undefined;
  onLogin?: () => void;
}

export type TemzinBotModule = (temzinBot: TemzinBot) => Promise<void> | void;
