import {RumiousComponent} from '../../component/component.js';
import { createElement } from '../../jsx/index.js';

export class Pending extends RumiousComponent {
  static tag = 'r-pending';
  constructor(){
    super();
    this.asynchronousRender = true;
  }
  
  async setLoader(loader) {
    this.loader = loader;

    try {
      this.result = await this.loader.execute();
      this.renderResult();
    } catch (error) {
      this.error = error;
      this.renderError();
    }
  }

  renderResult() {
    if(!this.result) throw 'Rumious Render: Cannot find component when lazy loading !';
    this.element.before(
      this.render(
        createElement(this.result, {})
      )
    );
    this.element.remove();
  }

  renderError() {
    this.element.appendChild(
      this.render(
        this.props.errorComponent ?? this.error
      )
    )
  }

  onRender() {
    let { loader } = this.props;
    this.setLoader(loader)
  }

  template() {
    return this.props.fallback;
  }
}