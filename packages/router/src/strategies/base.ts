import type {RouterModule} from '../module/index.js';


export class BaseStrategy{
  constructor(
    public router:RouterModule
  ){}
  
  start(){}
}
