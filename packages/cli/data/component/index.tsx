import { RumiousComponent } from 'rumious-core';

interface IProps{
  
}

export class IndexComponent extends RumiousComponent<IProps> {
  template(){
    return (
      <h1>Hello</h1>
    )
  }
}