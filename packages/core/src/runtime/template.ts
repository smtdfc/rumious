export function $$createTemplate(html: string): HTMLTemplateElement {
  let element = document.createElement("template");
  element.innerHTML = html;
  return element;
}
