import {RumiousComponent} from "rumious";

export class Router extends RumiousComponent{
  
  onCreate(){
    let {router} = this.props;
    this.router = router;
    this.context = router.context;
  }
  
  onRender(){
    
  }
  
  template(){
    return <></>;
  }
}