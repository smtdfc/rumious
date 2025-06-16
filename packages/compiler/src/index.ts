import * as parser from "@babel/parser";
import type { ParserPlugin } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";


function convertJSXMemberToMemberExpression(
  jsxMember: t.JSXMemberExpression
): t.MemberExpression {
  const object = t.isJSXIdentifier(jsxMember.object) ?
    t.identifier(jsxMember.object.name) :
    convertJSXMemberToMemberExpression(jsxMember.object);
  
  const property = t.identifier(jsxMember.property.name);
  
  return t.memberExpression(object, property);
}


function getIdentifierOrMemberExpression(
  node: t.JSXElement
): t.Identifier | t.MemberExpression {
  const name = node.openingElement.name;
  
  if (t.isJSXIdentifier(name)) {
    return t.identifier(name.name);
  }
  
  if (t.isJSXMemberExpression(name)) {
    return convertJSXMemberToMemberExpression(name);
  }
  
  throw new Error('Unknown error ! ');
}


function convertJSXAttributesToObjectExpression(
  attrs: (t.JSXAttribute | t.JSXSpreadAttribute)[]
): t.ObjectExpression {
  const properties: (t.ObjectProperty | t.SpreadElement)[] = [];
  
  for (const attr of attrs) {
    if (t.isJSXSpreadAttribute(attr)) {
      const argument = attr.argument as t.Expression;
      properties.push(t.spreadElement(argument));
      continue;
    }
    
    const keyNode = attr.name;
    const keyName = typeof keyNode.name === 'string' ? keyNode.name : null;
    
    if (!keyName) {
      throw new Error('Attribute name must be string');
    }
    
    let valueExpr: t.Expression;
    const value = attr.value;
    
    if (t.isJSXExpressionContainer(value)) {
      valueExpr = value.expression as t.Expression;
    } else if (t.isStringLiteral(value)) {
      valueExpr = value;
    } else if (value === null) {
      valueExpr = t.booleanLiteral(true);
    } else {
      throw new Error(`Unspport value type !`);
    }
    
    properties.push(
      t.objectProperty(t.identifier(keyName), valueExpr)
    );
  }
  
  return t.objectExpression(properties);
}


function isValidComponentName(name: string): boolean {
  const pascalCaseRegex = /^[A-Z][A-Za-z0-9]*$/;
  return pascalCaseRegex.test(name);
}

function assignNodeAttr(transformer: RumiousJSXTransformer, nodeID: t.Identifier, attr: string, value: t.Expression, template: RumiousTemplate): t.Statement {
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
  appendChildFn: t.Identifier;
  context: t.Identifier;
  templateRoot: t.Identifier;
  rootElement: t.Identifier;
  generateIdentifier: (p ? : string) => t.Identifier;
}

export type RumiousTemplateNodePart = number[];


export interface RumiousTemplate {
  scope: RumiousTemplateScope;
  elements: Record < string,
  t.Identifier > ;
  events: string[];
  stats: t.Statement[];
}

export interface RumiousImportDetails {
  [key: string]: {
    aliasId: t.Identifier;
    alias: string;
  }
}

export type RumiousImportData = Record < string, RumiousImportDetails > ;
const SINGLE_DIRECTIVES = ['ref', 'model', 'each', 'view'];
const NAMESPACED_DIRECTIVES = ['bind', 'on', 'attr', 'prop'];

export class RumiousJSXTransformer {
  ast: t.File;
  code: string;
  importsData: RumiousImportData = {};
  path!: NodePath;
  events: string[] = [];
  
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
    if (this.events.includes(name)) return;
    this.events.push(name);
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
  
  transformNodes(
    nodes: any[],
    template: RumiousTemplate,
    rootElementId: t.Identifier,
    contextId: t.Identifier,
  ) {
    let textBuffer = "";
    
    const flushText = () => {
      if (textBuffer !== "") {
        template.stats.push(
          t.expressionStatement(
            t.callExpression(
              template.scope.appendChildFn,
              [rootElementId, t.stringLiteral(textBuffer)]
            )
          )
        );
      }
      textBuffer = "";
    };
    
    for (let node of nodes) {
      if (t.isJSXText(node)) {
        textBuffer += node.value;
      } else {
        flushText();
        if (t.isJSXElement(node)) {
          this.transformJSXElement(node, template, rootElementId, contextId);
        } else if (t.isJSXExpressionContainer(node)) {
          this.transformJSXExpressionContainer(node, template, rootElementId, contextId);
        }
      }
    }
    
    flushText();
  }
  
  transformJSXText(
    node: t.JSXText,
    template: RumiousTemplate,
    rootElementId: t.Identifier,
    contextId: t.Identifier,
  ) {
    
    let createTextNodeAst = t.callExpression(
      t.memberExpression(
        t.identifier('document'),
        t.identifier('createTextNode'),
      ),
      [
        t.stringLiteral(node.value),
      ]
    );
    
    template.stats.push(
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(
            rootElementId,
            t.identifier('appendChild'),
          ),
          [createTextNodeAst]
        )
      )
    );
  }
  
  transformAttribute(
    name: t.JSXIdentifier | t.JSXNamespacedName,
    value: any
  ): t.ObjectProperty {
    let attrName = '';
    
    if (t.isJSXIdentifier(name)) {
      attrName = name.name;
    } else if (t.isJSXNamespacedName(name)) {
      attrName = `${name.namespace.name}:${name.name.name}`;
    }
    
    return t.objectProperty(
      t.identifier(attrName),
      this.transformAttributeValue(value)
    );
  }
  
  transformAttributeValue(
    value: any,
  ): t.Expression {
    if (t.isStringLiteral(value)) return value;
    if (t.isJSXExpressionContainer(value)) {
      if (t.isJSXEmptyExpression(value.expression)) return t.nullLiteral();
      return value.expression;
    }
    throw new Error('RumiousCompileError: Unspport value type !');
  }
  
  transformComponent(
    node: t.JSXElement,
    template: RumiousTemplate,
    rootElementId: t.Identifier,
    contextId: t.Identifier,
  ) {
    
    let name = "";
    if (t.isJSXIdentifier(node.openingElement.name)) {
      name = node.openingElement.name.name;
    } else {
      throw new Error('RumiousCompileError: Unspport component name !');
    }
    
    if (name === 'Fragment') {
      this.transformNodes(
        node.children,
        template,
        rootElementId,
        contextId,
      );
      return;
    }
    
    if (name === 'List') {
      
      /*
        listRender(
          anchor,
          context,
          item=> <h1>item</h1>,
          key=> key
        )
      */
    }
    
    let componentFn = this.ensureImport('createComponent', 'rumious');
    let elementId = this.path.scope.generateUidIdentifier('ele_');
    let slotId = this.path.scope.generateUidIdentifier('slot_');
    let ctxId = this.path.scope.generateUidIdentifier('ctx_');
    
    let [attrAst, directiveAst] = this.transformJSXAttribute(
      node,
      template,
      elementId,
      rootElementId,
      contextId
    );
    
    let createComponentAst = t.variableDeclaration('const', [
      t.variableDeclarator(
        t.arrayPattern([
          elementId,
          slotId,
          ctxId
        ]),
        t.callExpression(componentFn, [
          rootElementId,
          t.identifier(name),
          attrAst
        ])
      )
    ]);
    
    template.stats.push(createComponentAst);
    //template.stats.push(...directiveAst);
    
    this.transformNodes(
      node.children,
      template,
      slotId,
      ctxId,
    );
  }
  
  transformJSXExpressionContainer(
    node: t.JSXExpressionContainer,
    template: RumiousTemplate,
    rootElementId: t.Identifier,
    contextId: t.Identifier,
  ) {
    let expression: t.Expression;
    if (t.isExpression(node.expression)) {
      expression = node.expression
    } else {
      throw new Error('RumiousCompileError: Unspport value type !');
    }
    
    let createDynamicValueFn = this.ensureImport('createDynamicValue', 'rumious');
    template.stats.push(
      t.expressionStatement(
        t.callExpression(
          template.scope.appendChildFn,
          [
            rootElementId,
            t.callExpression(
              createDynamicValueFn,
              [contextId, expression]
            )
          ]
        )
      )
    );
    
  }
  
  transformJSXAttribute(
    node: t.JSXElement,
    template: RumiousTemplate,
    targetId: t.Identifier,
    rootElementId: t.Identifier,
    contextId: t.Identifier,
  ): [t.ObjectExpression, t.Statement[]] {
    let objectItemsAst: t.ObjectProperty[] = [];
    let directiveAst: t.Statement[] = [];
    
    
    let attributes = node.openingElement.attributes;
    for (let attr of attributes) {
      if (t.isJSXSpreadAttribute(attr)) continue;
      
      let attrName = attr.name;
      let attrValue = attr.value;
      
      if (t.isJSXIdentifier(attrName) && SINGLE_DIRECTIVES.includes(attrName.name)) {
        directiveAst.push(this.transformDirective(
          attrName.name,
          '',
          attrValue,
          template,
          targetId,
          rootElementId,
          contextId
        ));
      } else if (t.isJSXNamespacedName(attrName)) {
        let namespace_ = attrName.namespace.name;
        let name = attrName.name.name;
        if (NAMESPACED_DIRECTIVES.includes(namespace_)) {
          directiveAst.push(this.transformDirective(
            namespace_,
            name,
            attrValue,
            template,
            targetId,
            rootElementId,
            contextId
          ));
        }
      } else if (t.isJSXIdentifier(attrName)) objectItemsAst.push(this.transformAttribute(
        attrName,
        attrValue
      ));
    }
    
    return [
      t.objectExpression(objectItemsAst),
      directiveAst
    ];
  }
  
  transformDirective(
    name: string,
    modifier: string,
    value: any,
    template: RumiousTemplate,
    targetId: t.Identifier,
    rootElementId: t.Identifier,
    contextId: t.Identifier,
  ): t.Statement {
    let directivesObj = this.ensureImport('directives', 'rumious');
    if (name === 'on') {
      this.ensureEvent(modifier, template);
    }
    
    return t.expressionStatement(
      t.callExpression(
        t.memberExpression(
          directivesObj,
          t.identifier(name)
        ),
        [contextId, t.stringLiteral(modifier), targetId, this.transformAttributeValue(value)]
      )
    );
  }
  
  transformJSXElement(
    node: t.JSXElement,
    template: RumiousTemplate,
    rootElementId: t.Identifier,
    contextId: t.Identifier,
  ) {
    let elementName = node.openingElement.name;
    let name = "";
    let isComponent = false;
    if (t.isJSXIdentifier(elementName)) {
      if (isValidComponentName(elementName.name)) isComponent = true;
      name = elementName.name
    } else {
      throw new Error(`RumiousCompileError: Unsupported element name !`);
    }
    
    if (isComponent) return this.transformComponent(
      node,
      template,
      rootElementId,
      contextId
    );
    else {
      let elementFn = this.ensureImport('element', 'rumious');
      let elementId = this.path.scope.generateUidIdentifier('ele_');
      
      let [attrAst, directiveAst] = this.transformJSXAttribute(
        node,
        template,
        elementId,
        rootElementId,
        contextId
      );
      
      let createElementAst = t.variableDeclaration('const', [
        t.variableDeclarator(
          elementId,
          t.callExpression(
            elementFn,
            [
              rootElementId,
              t.stringLiteral(name),
              attrAst
            ]
          )
        )
      ]);
      
      template.stats.push(createElementAst);
      template.stats.push(...directiveAst);
      
      this.transformNodes(
        node.children,
        template,
        elementId,
        contextId
      );
    }
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
          elements: {},
          events: [],
          stats: [],
          scope: {
            appendChildFn: this.ensureImport('appendChild', 'rumious'),
            rootElement: path.scope.generateUidIdentifier('root'),
            templateRoot: path.scope.generateUidIdentifier('tmpl'),
            context: path.scope.generateUidIdentifier('ctx'),
            generateIdentifier: (prefix ? : string) => path.scope.generateUidIdentifier(prefix)
          }
        }
        
        this.transformJSXElement(
          path.node,
          data,
          data.scope.rootElement,
          data.scope.context
        );
        
        
        
        const elements: Record < string, any >= {}
        const templateCreateFn = this.ensureImport('createTemplate', 'rumious');
        
        
        const templateFn = t.callExpression(
          templateCreateFn,
          [
            t.arrowFunctionExpression(
              [
                data.scope.rootElement,
                data.scope.context
              ],
              t.blockStatement([
                ...data.stats,
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
    const delegateEventsFn = this.ensureImport('delegateEvents', 'rumious');
    
    
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
    this.ast.program.body.push(t.expressionStatement(t.callExpression(
      delegateEventsFn,
      [valueToAST(this.events)]
    )))
    return generate(this.ast, {}, this.code).code;
  }
}

export function compile(code: string, filename: string = '.js'): string {
  let transformer = new RumiousJSXTransformer(code, filename);
  return transformer.generate();
}