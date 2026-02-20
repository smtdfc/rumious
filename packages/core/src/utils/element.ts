export function getBaseClass(tagName: string): typeof HTMLElement {
  if (tagName.includes("-")) return HTMLElement;

  const table: Record<string, typeof HTMLElement> = {
    // Grouping & Sections
    main: HTMLElement,
    article: HTMLElement,
    aside: HTMLElement,
    header: HTMLElement,
    footer: HTMLElement,
    nav: HTMLElement,
    section: HTMLElement,
    address: HTMLElement,

    // Table
    caption: HTMLTableCaptionElement,
    col: HTMLTableColElement,
    colgroup: HTMLTableColElement,
    tr: HTMLTableRowElement,
    th: HTMLTableCellElement,

    // Forms
    label: HTMLLabelElement,
    fieldset: HTMLFieldSetElement,
    legend: HTMLLegendElement,
    datalist: HTMLDataListElement,
    optgroup: HTMLOptGroupElement,
    option: HTMLOptionElement,
    output: HTMLOutputElement,
    progress: HTMLProgressElement,
    meter: HTMLMeterElement,

    // Text Content
    blockquote: HTMLQuoteElement,
    q: HTMLQuoteElement,
    pre: HTMLPreElement,
    hr: HTMLHRElement,
    br: HTMLBRElement,

    // Headings
    h1: HTMLHeadingElement,
    h2: HTMLHeadingElement,
    h3: HTMLHeadingElement,
    h4: HTMLHeadingElement,
    h5: HTMLHeadingElement,
    h6: HTMLHeadingElement,

    // Media
    canvas: HTMLCanvasElement,
    audio: HTMLAudioElement,
    video: HTMLVideoElement,
    source: HTMLSourceElement,
    track: HTMLTrackElement,
    map: HTMLMapElement,
    area: HTMLAreaElement,

    // Scripting & Embedded
    iframe: HTMLIFrameElement,
    embed: HTMLEmbedElement,
    object: HTMLObjectElement,
    param: HTMLParamElement,
    details: HTMLDetailsElement,
    summary: HTMLElement,

    // Lists & Misc
    dl: HTMLDListElement,
    dt: HTMLElement,
    dd: HTMLElement,
    template: HTMLTemplateElement,
    slot: HTMLSlotElement,

    // Formatting
    strong: HTMLElement,
    em: HTMLElement,
    b: HTMLElement,
    i: HTMLElement,
    u: HTMLElement,
    small: HTMLElement,
    sub: HTMLElement,
    sup: HTMLElement,
    code: HTMLElement,
    kbd: HTMLElement,
    samp: HTMLElement,
    var: HTMLElement,
    time: HTMLTimeElement,
    data: HTMLDataElement,
  };

  return table[tagName.toLowerCase()] || HTMLElement;
}
