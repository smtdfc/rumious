import type { RumiousApp } from '../app/index.js'
import type { RumiousComponent } from '../component/component.js'

export type RumiousRenderable = RumiousComponent | RumiousApp;
export type RumiousTemplateGenerator = (root: HTMLElement | HTMLDocument, context: Record < any, any > ) => HTMLElement | HTMLDocument | Node;