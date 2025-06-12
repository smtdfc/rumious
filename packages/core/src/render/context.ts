import type {RumiousApp} from '../app/index.js';

type Callback = () => any;

export class RumiousRenderContext{
  public onRendered: Callback[] = [];
  constructor(
    public app:RumiousApp,
    public target:any
  ){}
}