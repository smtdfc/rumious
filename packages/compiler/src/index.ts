import * as parser from "@babel/parser";
import type { ParserPlugin } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

function assignNodeAttr(tranformer: RumiousJSXTransformer, nodeID: t.Identifier, attr: string, value: t.Expression, template: RumiousTemplate): t.Statement {
  return t.expressionStatement(
    t.callExpression(
      t.memberExpression(
        nodeID,
        t.identifier("setAttribute")
      ),
      [t.stringLiteral(attr), value]
    )
  );
}

function valueToAST(value: any): t.Expression {
  if (typeof value === "string") return t.stringLiteral(value);
  if (typeof value === "number") return t.numericLiteral(value);
  if (typeof value === "boolean") return t.booleanLiteral(value);
  if (value === null) return t.nullLiteral();
  if (Array.isArray(value))
    return t.arrayExpression(value.map(v => valueToAST(v)));
  if (typeof value === "object") {
    return t.objectExpression(
      Object.entries(value).map(([key, val]) =>
        t.objectProperty(t.identifier(key), valueToAST(val))
      )
    );
  }
  throw new Error("Unsupported value type: " + typeof value);
}

export interface RumiousTemplateScope {
  context: t.Identifier;
  templateRoot: t.Identifier;
  rootElement: t.Identifier;
  generateIdentifier: (p ? : string) => t.Identifier;
}

export type RumiousTemplateNodePart = number[];

export interface RumiousTemplateDynamicAttrPart {
  type: 'dynamic_attr';
  path: RumiousTemplateNodePart;
  expression: t.Expression;
  name: string;
}

export interface RumiousTemplateDynamicValuePart {
  type: 'dynamic_value';
  path: RumiousTemplateNodePart;
  expression: t.Expression;
  name: string;
}

export interface RumiousTemplateDirectivePart {
  type: 'directive';
  path: RumiousTemplateNodePart;
  expression: t.Expression;
  name: string;
  modifier: string;
}


export type RumiousTemplatePart = |
  RumiousTemplateDynamicAttrPart |
  RumiousTemplateDirectivePart |
  RumiousTemplateDynamicValuePart

export interface RumiousTemplate {
  html: string;
  parts: RumiousTemplatePart[];
  path: any[];
  scope: RumiousTemplateScope;
  elements: Record < string,
  t.Identifier > ;
  events: string[];
}

export interface RumiousImportDetails {
  [key: string]: {
    aliasId: t.Identifier;
    alias: string;
  }
}

export type RumiousImportData = Record < string, RumiousImportDetails > ;
const SINGLE_DIRECTIVES = ['ref', 'model'];
const NAMESPACED_DIRECTIVES = ['bind', 'on', 'attr', 'prop'];

export class RumiousJSXTransformer {
  ast: t.File;
  code: string;
  importsData: RumiousImportData = {};
  path!: NodePath;
  
  constructor(code: string, filename: string = ".jsx") {
    this.code = code;
    const isTSX = filename.endsWith('.tsx');
    const isTS = filename.endsWith('.ts') || isTSX;
    const plugins: ParserPlugin[] = ["jsx"];
    
    if (isTS || isTSX) plugins.push("typescript");
    
    
    this.ast = parser.parse(code, {
      sourceType: "module",
      plugins
    });
  }
  
  ensureEvent(name: string, template: RumiousTemplate) {
    if (template.events.includes(name)) return;
    template.events.push(name);
  }
  
  ensureImport(name: string, moduleName: string): t.Identifier {
    
    if (!this.importsData[moduleName]) {
      let alias = "i_" + moduleName + name;
      let aliasID = this.path.scope.generateUidIdentifier(alias);
      this.importsData[moduleName] = {
        [name]: {
          aliasId: aliasID,
          alias
        }
      };
      return aliasID;
    } else {
      if (!this.importsData[moduleName][name]) {
        let alias = "rumious" + moduleName + name;
        let aliasID = this.path.scope.generateUidIdentifier(alias);
        this.importsData[moduleName][name] = {
          aliasId: aliasID,
          alias
        }
        return aliasID;
      } else {
        return this.importsData[moduleName][name].aliasId;
      }
    }
  }
  
  transformJSXAttr(
    node: t.JSXElement,
    template: RumiousTemplate
  ) {
    let attrs = node.openingElement.attributes;
    for (let attr of attrs) {
      if (!t.isJSXAttribute(attr)) continue;
      if (t.isJSXIdentifier(attr.name)) {
        if (SINGLE_DIRECTIVES.includes(attr.name.name)) {
          if (t.isStringLiteral(attr.value)) {} else if (t.isJSXExpressionContainer(attr.value)) {
            template.parts.push({
              type: "directive",
              modifier: '',
              expression: t.isJSXEmptyExpression(attr.value) ? t.stringLiteral("") : (attr.value.expression as t.Expression),
              path: [...template.path],
              name: attr.name.name
            });
          }
          continue;
        }
        
        if (t.isStringLiteral(attr.value)) {
          template.html += ` ${attr.name.name}=${JSON.stringify(attr.value.value)} `
        } else if (t.isJSXExpressionContainer(attr.value)) {
          template.parts.push({
            type: "dynamic_attr",
            expression: t.isJSXEmptyExpression(attr.value) ? t.stringLiteral("") : (attr.value.expression as t.Expression),
            path: [...template.path],
            name: attr.name.name
          });
        }
      }
      else if (t.isJSXNamespacedName(attr.name)) {
        let namespace_ = attr.name.namespace.name;
        let name = attr.name.name.name;
        
        if (NAMESPACED_DIRECTIVES.includes(namespace_)) {
          if (t.isStringLiteral(attr.value)) {}
          else if (t.isJSXExpressionContainer(attr.value)) {
            if (namespace_ === 'on') this.ensureEvent(name, template);
            
            template.parts.push({
              type: "directive",
              modifier: name,
              expression: t.isJSXEmptyExpression(attr.value) ? t.stringLiteral("") : (attr.value.expression as t.Expression),
              path: [...template.path],
              name: namespace_
            });
          }
          continue;
        }
        
        if (t.isStringLiteral(attr.value)) {
          template.html += ` ${namespace_}:${name}=${JSON.stringify(attr.value.value)} `
        } else if (t.isJSXExpressionContainer(attr.value)) {
          template.parts.push({
            type: "dynamic_attr",
            expression: t.isJSXEmptyExpression(attr.value) ? t.stringLiteral("") : (attr.value.expression as t.Expression),
            path: [...template.path],
            name: `${namespace_}:${name}`
          });
        }
      }
      
    }
  }
  
  transformJSXText(
    node: t.JSXText,
    template: RumiousTemplate
  ) {
    template.html += `${node.value}`;
  }
  
  transformJSXExpressionContainer(
    node: t.JSXExpressionContainer,
    template: RumiousTemplate
  ) {
    template.html += `<rumious-placeholder></rumious-placeholder>`;
    template.parts.push({
      type: "dynamic_value",
      expression: t.isJSXEmptyExpression(node.expression) ? t.stringLiteral("") : (node.expression as t.Expression),
      path: [...template.path],
      name: ""
    });
  }
  
  transformJSXElement(
    node: t.JSXElement,
    template: RumiousTemplate
  ) {
    
    let name: string;
    
    if (t.isJSXIdentifier(node.openingElement.name)) {
      name = node.openingElement.name.name;
    } else if (t.isJSXMemberExpression(node.openingElement.name)) {
      const getMemberName = (m: t.JSXMemberExpression): string =>
        t.isJSXIdentifier(m.object) ?
        `${m.object.name}.${m.property.name}` :
        `${getMemberName(m.object)}.${m.property.name}`;
      name = getMemberName(node.openingElement.name);
    } else {
      throw new Error('Unsupported JSX element name');
    }
    
    template.html += `<${name}`;
    this.transformJSXAttr(node, template);
    template.html += `>`;
    
    template.path.push(0);
    
    let countChild = 0;
    for (const child of node.children) {
      template.path[template.path.length - 1] = countChild;
      if (t.isJSXElement(child)) {
        this.transformJSXElement(child, template);
      } else if (t.isJSXText(child)) {
        this.transformJSXText(child, template);
      } else if (t.isJSXExpressionContainer(child)) {
        this.transformJSXExpressionContainer(child, template)
      }
      
      countChild++;
    }
    
    template.path.pop();
    template.html += `</${name}>`;
  }
  
  generate(): string {
    traverse(this.ast, {
      Program: (path) => {
        this.path = path;
      },
      
      JSXAttribute: (path) => {
        console.log(path);
      },
      
      JSXElement: (path) => {
        
        const data: RumiousTemplate = {
          html: '',
          parts: [],
          path: [],
          elements: {},
          events: [],
          scope: {
            rootElement: path.scope.generateUidIdentifier('root'),
            templateRoot: path.scope.generateUidIdentifier('tmpl'),
            context: path.scope.generateUidIdentifier('ctx'),
            generateIdentifier: (prefix ? : string) => path.scope.generateUidIdentifier(prefix)
          }
        }
        
        this.transformJSXElement(path.node, data);
        const template = t.templateLiteral(
          [
            t.templateElement({ raw: data.html, }, false),
          ],
          []
        );
        
        const statements = [];
        const elements: Record < string, any >= {}
        for (let d of data.parts) {
          let pathStr = d.path.join('.');
          if (!data.elements[pathStr]) {
            data.elements[pathStr] = path.scope.generateUidIdentifier('node');
            
            const resolveNodeFn = this.ensureImport('resolveNode', 'rumious');
            statements.unshift(
              t.variableDeclaration("let", [
                t.variableDeclarator(
                  data.elements[pathStr],
                  t.callExpression(
                    resolveNodeFn,
                    [data.scope.templateRoot, valueToAST(d.path)]
                  )
                )
              ])
            );
          }
          
          if (d.type === 'dynamic_attr') {
            statements.push(
              assignNodeAttr(
                this,
                data.elements[pathStr],
                d.name,
                d.expression,
                data
              )
            );
          }
          
          if (d.type === 'directive') {
            const direvtivesObj = this.ensureImport('directives', 'rumious');
            statements.push(
              t.expressionStatement(
                t.callExpression(
                  t.memberExpression(
                    direvtivesObj,
                    t.identifier(d.name),
                  ),
                  [
                    data.scope.context,
                    t.stringLiteral(d.modifier),
                    data.elements[pathStr],
                    d.expression
                  ]
                )
              )
            )
          }
          
          if (d.type === 'dynamic_value') {
            const createDynamicValueFn = this.ensureImport('createDynamicValue', 'rumious');
            const replaceNodeFn = this.ensureImport('replaceNode', 'rumious');
            
            statements.push(
              t.expressionStatement(
                t.callExpression(
                  replaceNodeFn,
                  [
                    data.elements[pathStr],
                    t.callExpression(
                      createDynamicValueFn,
                      [data.scope.context, d.expression]
                    )
                  ]
                )
              )
            )
          }
        }
        
        const htmlCreateFn = this.ensureImport('html', 'rumious');
        const templateCreateFn = this.ensureImport('createTemplate', 'rumious');
        const delegateEventsFn = this.ensureImport('delegateEvents', 'rumious');
        
        const getTemplateStat = t.variableDeclaration("let", [
          t.variableDeclarator(
            data.scope.templateRoot,
            t.callExpression(
              htmlCreateFn,
              [
                template
              ]
            )
          )
        ]);
        
        const templateFn = t.callExpression(
          templateCreateFn,
          [
            t.arrowFunctionExpression(
              [
                data.scope.rootElement,
                data.scope.context
              ],
              t.blockStatement([
                getTemplateStat,
                ...statements,
                t.expressionStatement(t.callExpression(
                  t.memberExpression(
                    data.scope.rootElement,
                    t.identifier('appendChild')
                  ),
                  [data.scope.templateRoot]
                )),
                t.expressionStatement(t.callExpression(
                  delegateEventsFn,
                  [valueToAST(data.events)]
                )),
                t.returnStatement(
                  data.scope.rootElement
                )
              ])
            )
          ]
        );
        
        path.replaceWith(templateFn);
      }
    });
    let importDec: t.ImportDeclaration[] = [];
    
    
    for (let moduleName in this.importsData) {
      let names: t.ImportSpecifier[] = [];
      for (let importObj in this.importsData[moduleName]) {
        names.push(
          t.importSpecifier(this.importsData[moduleName][importObj].aliasId, t.identifier(importObj), )
        );
      }
      
      importDec.push(
        t.importDeclaration(
          names,
          t.stringLiteral(moduleName)
        )
      );
    }
    
    this.ast.program.body.unshift(...importDec);
    
    return generate(this.ast, {}, this.code).code;
  }
}

export function compile(code: string, filename: string = '.js'): string {
  let tranformer = new RumiousJSXTransformer(code, filename);
  return tranformer.generate();
}