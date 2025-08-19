import { describe, expect } from 'testious';
import { Ref, createRef } from '../dist/index.js';

describe('Rumious Ref test', (group) => {
  let ref;

  group.beforeEach(() => {
    const div = document.createElement('div');
    div.className = 'test-class';
    div.id = 'test-id';
    div.textContent = 'Hello';
    div.innerHTML = '<span>World</span>';
    div.setAttribute('data-test', 'true');
    div.value = '123';

    ref = createRef();
    ref.setTarget(div);
  });

  group.it('Ref isSet works', () => {
    expect(ref.isSet()).toEqual(true);
  });

  group.it('Ref class manipulation', () => {
    ref.addClass('hello');
    expect(ref.element?.classList.contains('hello')).toEqual(true);

    ref.removeClass('hello');
    expect(ref.element?.classList.contains('hello')).toEqual(false);

    ref.toggleClass('toggled');
    expect(ref.element?.classList.contains('toggled')).toEqual(true);

    ref.toggleClass('toggled');
    expect(ref.element?.classList.contains('toggled')).toEqual(false);
  });

  group.it('Ref text and html', () => {
    ref.text = 'new text';
    expect(ref.text).toEqual('new text');

    ref.html = '<b>bold</b>';
    expect(ref.html).toEqual('<b>bold</b>');
  });

  group.it('Ref value set/get', () => {
    expect(ref.value).toEqual('123');

    ref.value = '456';
    expect(ref.value).toEqual('456');
  });

  group.it('Ref attribute manipulation', () => {
    expect(ref.getAttr('data-test')).toEqual('true');

    ref.setAttr('data-test', 'false');
    expect(ref.getAttr('data-test')).toEqual('false');

    ref.removeAttr('data-test');
    expect(ref.getAttr('data-test')).toEqual(null);
  });

  group.it('Ref addChild and clear', () => {
    const span = document.createElement('span');
    span.textContent = 'child';
    ref.addChild(span);
    expect(ref.element?.contains(span)).toEqual(true);

    ref.clear();
    expect(ref.element?.innerHTML).toEqual('');
  });

  group.it('Ref style manipulation', () => {
    ref.setStyle('color', 'red');
    expect(ref.getStyle('color')).toEqual('red');

    ref.show('inline-block');
    expect(ref.element?.style.display).toEqual('inline-block');

    ref.hide();
    expect(ref.element?.style.display).toEqual('none');
  });

  group.it('Ref event listener on/off', () => {
    let count = 0;
    const clickHandler = () => {
      count++;
    };

    ref.on('click', clickHandler);

    ref.element?.dispatchEvent(new window.MouseEvent('click'));
    expect(count).toEqual(1);

    ref.off('click', clickHandler);
    ref.element?.dispatchEvent(new window.MouseEvent('click'));
    expect(count).toEqual(1);
  });

  group.it('Ref focus and blur (no crash)', () => {
    ref.focus();
    ref.blur();
  });

  group.it('Ref remove element', () => {
    ref.remove();
    expect(ref.isSet()).toEqual(false);
  });
});
