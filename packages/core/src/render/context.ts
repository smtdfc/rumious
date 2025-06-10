import type {RumiousApp} from '../app/index.js';

export class RumiousRenderContext{
  constructor(
    public app:RumiousApp,
    public target:any
  ){}
}