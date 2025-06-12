import type { RumiousApp } from '../app/index.js';

export abstract class RumiousModule {}

export type RumiousModuleClass < T extends RumiousModule = any, O = any > = {
  init(app: RumiousApp, options ? : O): T;
};