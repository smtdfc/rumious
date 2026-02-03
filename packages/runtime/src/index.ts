export function $$element(tag: string, parent: HTMLElement) {
  let ele = document.createElement(tag);
  parent.appendChild(ele);
  return ele;
}

export function $$template(html: string) {
  let temp = document.createElement("template");
  temp.innerHTML = html;

  return temp;
}
