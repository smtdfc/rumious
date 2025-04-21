import { RumiousComponent } from 'rumious';

interface IProps {}

export class IndexComponent extends RumiousComponent<IProps> {
  template() {
    return <h1>Hello</h1>;
  }
}
