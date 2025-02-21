import { RumiousComponent } from 'rumious';

export class Page extends RumiousComponent {
  onCreate(){
    let {router} = this.props;
    router.configs({
      title:"new page"
    })
  }
  
  template() {
    return (
      <>
        <p>This is page </p>
      </>
    )
  }
}