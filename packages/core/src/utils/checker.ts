import {RumiousTemplate} from '../types/index.js';

export function isTemplate(fn: unknown): fn is RumiousTemplate {
  return typeof fn === 'function' && (fn as any).__isTemplate === true;
}