import { RumiousRenderContext } from './context.js';

type RumiousDymanicInjectorContentTypes =
  HTMLElement |
  string

export class RumiousInjector < T extends RumiousDymanicInjectorContentTypes > {
  constructor(public contents ? : T[]) {}
}

export function createHTMLInjector(html: string):RumiousInjector<string>{
  return new RumiousInjector<string>([html]);
}