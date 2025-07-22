import {BaseStrategy} from './base.js';
import type {RouterModule} from '../module/index.js';

export class HashStrategy extends BaseStrategy{
  constructor(
    public router:RouterModule
  ){
    super(router);
  }
  
  resolve(path:string){
    this.router.resolvePage(path);
  }
  
  start(){
    const  onHashChange = ()=>{
      let hash = window.location.hash;
      let path = hash.slice(1);
      if(path.length === 0) path = '/';
      this.resolve(path);
    }
    
    window.addEventListener('hashchange',onHashChange);
    onHashChange();
  }
}