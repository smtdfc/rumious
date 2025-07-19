import * as parser from '@babel/parser';
import type { ParserPlugin } from '@babel/parser';
import _traverse, { NodePath } from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';
import {
  CompilerOptions,
  SourceMetadata,
  CompileResult,
} from '../types/index.js';
import { ImportHelper } from './imports.js';
import { Context, CompileDirective } from './context.js';
import {
  getElementNameAsString,
  getAttrNameAsString,
  getElementNameAsExpr,
  isComponentName,
} from './name.js';
import { getAttrValue, getAttrAsValue } from './value.js';
import { SINGLE_DIRECTIVES, DOUBLE_DIRECTIVES } from './directives.js';
import { mergePrimitives } from '../utils/index.js';

const traverse = (
  typeof _traverse === 'function' ? _traverse : (_traverse as any).default
) as any;

const generate = (
  typeof _generate === 'function' ? _generate : (_generate as any).default
) as any;

export class Compiler {
  public eventNames: string[] = [];
  public environment: string;
  constructor(public options: Partial < CompilerOptions > = {}) {
    this.environment = options.environment ?? '@rumious/browser';
  }
  
  generateUId(context: Context, name: string): t.Identifier {
    if (!context.program)
      throw Error('RumiousCompileError: Cannot create unique identifier !');
    const id = context.program.scope.generateUidIdentifier(name);
    return id;
  }
  
  transfomDirective(
    context: Context,
    target: t.Identifier,
    name: string,
    value: t.Expression,
  ): t.Statement {
    const splitted = name.split(':');
    const dName = splitted[0];
    const dModifier = splitted[1] ?? '';
    
    if (dName == 'bind') {
      const reactiveFn = context.importHelper.requireId(
        context,
        'reactive',
        this.environment,
      );
      //spec: reactive(context,function, value)
      return t.expressionStatement(
        t.callExpression(reactiveFn, [
          context.scope.rootCtx,
          t.arrowFunctionExpression(
            [t.identifier('value')],
            t.assignmentExpression(
              '=',
              t.memberExpression(target, t.identifier(dModifier)),
              t.identifier('value'),
            ),
            false,
          ),
          value,
        ]),
      );
    }
    
    if (dName == 'attr') {
      const reactiveFn = context.importHelper.requireId(
        context,
        'reactive',
        this.environment,
      );
      return t.expressionStatement(
        t.callExpression(reactiveFn, [
          context.scope.rootCtx,
          t.arrowFunctionExpression(
            [t.identifier('value')],
            t.callExpression(
              t.memberExpression(target, t.identifier('setAttribute')),
              [t.stringLiteral(dModifier), t.identifier('value')],
            ),
            false,
          ),
          value,
        ]),
      );
    }
    
    if (dName == 'ref') {
      //spec: ref(context, element,value)
      const refFn = context.importHelper.requireId(
        context,
        'ref',
        this.environment,
      );
      return t.expressionStatement(
        t.callExpression(refFn, [context.scope.rootCtx, target, value]),
      );
    }
    
    if (dName == 'view') {
      //spec: view(context, element,value)
      const viewFn = context.importHelper.requireId(
        context,
        'view',
        this.environment,
      );
      return t.expressionStatement(
        t.callExpression(viewFn, [context.scope.rootCtx, target, value]),
      );
    }
    
    if (dName == 'model') {
      const detectValueChangeFn = context.importHelper.requireId(
        context,
        'detectValueChange',
        this.environment,
      );
      const setStateValueFn = context.importHelper.requireId(
        context,
        'setStateValue',
        this.environment,
      );
      
      return t.expressionStatement(
        t.callExpression(detectValueChangeFn, [
          t.arrowFunctionExpression(
            [t.identifier('value')],
            t.callExpression(setStateValueFn, [value, t.identifier('value')]),
            false,
          ),
          target,
        ]),
      );
    }
    
    
    if (dName == 'on') {
      const createEventFn = context.importHelper.requireId(
        context,
        'createEvent',
        this.environment,
      );
      this.eventNames.push(dModifier);
      return t.expressionStatement(
        t.callExpression(createEventFn, [
          context.scope.rootCtx,
          target,
          t.stringLiteral(dModifier),
          value,
        ]),
      );
    }
    
    const directiveObjId = context.importHelper.requireId(
      context,
      'directives',
      this.environment,
    );
    //spec: directives[<name>](context,target, modifier,value)
    return t.expressionStatement(
      t.callExpression(
        t.memberExpression(directiveObjId, t.identifier(dName)),
        [context.scope.rootCtx, target, t.stringLiteral(dModifier), value],
      ),
    );
  }
  
  transformJSXAttribute(
    context: Context,
    target: t.Identifier,
    attributes: (t.JSXSpreadAttribute | t.JSXAttribute)[],
  ): [t.ObjectExpression, t.Statement[], CompileDirective] {
    const compileDirective: CompileDirective = {};
    const attributesExpr: t.ObjectProperty[] = [];
    const directiveStats: t.Statement[] = [];
    for (let i = 0; i < attributes.length; i++) {
      const attr = attributes[i];
      if (t.isJSXAttribute(attr)) {
        const [name, isNamespace] = getAttrNameAsString(attr);
        
        if (isNamespace && name.split(':')[0] == 'compile') {
          const modifier = name.split(':')[1];
          switch (modifier) {
            case 'preserveWhitespace':
              compileDirective.preserveWhitespace = getAttrAsValue(attr);
              break;
            default:
              throw new Error(
                `RumiousCompileError: Unsupported modifier '${modifier}' !`,
              );
          }
          continue;
        }
        
        const value = getAttrValue(attr);
        if (
          (!isNamespace && SINGLE_DIRECTIVES.includes(name)) ||
          (isNamespace && DOUBLE_DIRECTIVES.includes(name.split(':')[0]))
        ) {
          directiveStats.push(
            this.transfomDirective(context, target, name, value),
          );
        } else {
          attributesExpr.push(t.objectProperty(t.stringLiteral(name), value));
        }
      }
    }
    
    return [
      t.objectExpression(attributesExpr),
      directiveStats,
      compileDirective,
    ];
  }
  
  transformJSXElement(context: Context, node: t.JSXElement) {
    const openingElement = node.openingElement;
    const attributes = openingElement.attributes;
    const name = openingElement.name;
    let isComponent = false;
    
    const nameStr = getElementNameAsString(name);
    if (t.isJSXIdentifier(name) && isComponentName(nameStr)) isComponent = true;
    if (
      t.isJSXMemberExpression(name) &&
      isComponentName(getElementNameAsString(name.property))
    )
      isComponent = true;
    
    if (isComponent) {
      return this.transfomComponent(context, node);
    }
    
    //spec: element(root,context,tagName,attrs)
    const elementVar = this.generateUId(context, 'ele_');
    const elementFn = context.importHelper.requireId(
      context,
      'element',
      this.environment,
    );
    const [attrs, directives, compileDirectives] = this.transformJSXAttribute(
      context,
      elementVar,
      attributes,
    );
    const elementDec = t.variableDeclaration('const', [
      t.variableDeclarator(
        elementVar,
        t.callExpression(elementFn, [
          context.scope.rootElement,
          context.scope.rootCtx,
          t.stringLiteral(nameStr),
          attrs,
        ]),
      ),
    ]);
    
    context.statements.push(elementDec, ...directives);
    
    const elementContext: Context = {
      importHelper: context.importHelper,
      scope: {
        rootElement: elementVar,
        rootCtx: context.scope.rootCtx,
      },
      statements: [],
      program: context.program,
      compileDirectives: mergePrimitives(
        context.compileDirectives,
        compileDirectives,
      ),
    };
    
    if (node.children.length == 0) return;
    this.transformNodes(elementContext, node.children);
    context.statements.push(...elementContext.statements);
  }
  
  transfomFragmentComponent(context: Context, node: t.JSXElement) {
    const openingElement = node.openingElement;
    const attributes = openingElement.attributes;
    const componentVar = this.generateUId(context, 'frag_');
    const [, , compileDirectives] = this.transformJSXAttribute(
      context,
      componentVar,
      attributes,
    );
    
    const componentContext: Context = {
      importHelper: context.importHelper,
      scope: {
        rootElement: context.scope.rootElement,
        rootCtx: context.scope.rootCtx,
      },
      statements: [],
      program: context.program,
      compileDirectives: mergePrimitives(
        context.compileDirectives,
        compileDirectives,
      ),
    };
    
    this.transformNodes(componentContext, node.children);
    
    context.statements.push(...componentContext.statements);
  }
  
  transfomIfComponent(context: Context, node: t.JSXElement) {
    const openingElement = node.openingElement;
    const attributes = openingElement.attributes;
    const componentFn = context.importHelper.requireId(
      context,
      'createIfComponent',
      this.environment,
    );
    
    const componentVar = this.generateUId(context, 'if_comp_');
    const [props, , compileDirectives] = this.transformJSXAttribute(
      context,
      componentVar,
      attributes,
    );
    
    const componentDec = t.variableDeclaration('const', [
      t.variableDeclarator(
        componentVar,
        t.callExpression(componentFn, [
          context.scope.rootElement,
          context.scope.rootCtx,
          props,
        ]),
      ),
    ]);
    
    context.statements.push(componentDec);
  }
  
  transfomForComponent(context: Context, node: t.JSXElement) {
    const openingElement = node.openingElement;
    const attributes = openingElement.attributes;
    const componentFn = context.importHelper.requireId(
      context,
      'createForComponent',
      this.environment,
    );
    
    const componentVar = this.generateUId(context, 'for_comp_');
    const [props, , compileDirectives] = this.transformJSXAttribute(
      context,
      componentVar,
      attributes,
    );
    
    const componentDec = t.variableDeclaration('const', [
      t.variableDeclarator(
        componentVar,
        t.callExpression(componentFn, [
          context.scope.rootElement,
          context.scope.rootCtx,
          props,
        ]),
      ),
    ]);
    
    context.statements.push(componentDec);
  }
  
  transfomComponent(context: Context, node: t.JSXElement) {
    const openingElement = node.openingElement;
    const attributes = openingElement.attributes;
    const nameStr = getElementNameAsString(openingElement.name);
    
    if (nameStr === 'If') {
      return this.transfomIfComponent(context, node);
    }
    
    if (nameStr === 'For') {
      return this.transfomForComponent(context, node);
    }
    
    if (nameStr === 'Fragment') {
      return this.transfomFragmentComponent(context, node);
    }
    
    const name = getElementNameAsExpr(openingElement.name);
    const componentFn = context.importHelper.requireId(
      context,
      'createComponent',
      this.environment,
    );
    const componentVar = this.generateUId(context, 'comp_');
    const [props, , compileDirectives] = this.transformJSXAttribute(
      context,
      componentVar,
      attributes,
    );
    
    const componentDec = t.variableDeclaration('const', [
      t.variableDeclarator(
        componentVar,
        t.callExpression(componentFn, [
          context.scope.rootElement,
          context.scope.rootCtx,
          name,
          props,
        ]),
      ),
    ]);
    
    context.statements.push(componentDec);
    
    if (node.children.length == 0) return;
    const componentContext: Context = {
      importHelper: context.importHelper,
      scope: {
        rootElement: this.generateUId(context, 'root'),
        rootCtx: this.generateUId(context, 'ctx'),
      },
      statements: [],
      program: context.program,
      compileDirectives: mergePrimitives(
        context.compileDirectives,
        compileDirectives,
      ),
    };
    
    const createRootFragStat = t.variableDeclaration('const', [
      t.variableDeclarator(
        componentContext.scope.rootElement,
        t.callExpression(
          t.memberExpression(
            t.identifier('document'),
            t.identifier('createDocumentFragment'),
          ),
          [],
        ),
      ),
    ]);
    
    this.transformNodes(componentContext, node.children);
    
    const setSlotCall = t.expressionStatement(
      t.callExpression(
        t.memberExpression(componentVar, t.identifier('setSlot')),
        [
          t.arrowFunctionExpression(
            [componentContext.scope.rootCtx],
            t.blockStatement([
              createRootFragStat,
              ...componentContext.statements,
              t.returnStatement(componentContext.scope.rootElement),
            ]),
            false,
          ),
        ],
      ),
    );
    
    context.statements.push(setSlotCall);
  }
  
  transformNodes(
    context: Context,
    
    nodes: any[],
  ) {
    let textBuffer = '';
    const appendTextFn = context.importHelper.requireId(
      context,
      'appendText',
      this.environment,
    );
    const flushText = () => {
      if (textBuffer !== '') {
        context.statements.push(
          t.expressionStatement(
            t.callExpression(appendTextFn, [
              context.scope.rootElement,
              t.stringLiteral(textBuffer),
            ]),
          ),
        );
      }
      textBuffer = '';
    };
    
    const preserveWhitespace: unknown =
      context.compileDirectives.preserveWhitespace;
    for (const node of nodes) {
      if (t.isJSXText(node)) {
        let text = node.value;
        switch (preserveWhitespace) {
          case true:
            break;
          case 'smart':
            text = text
              .replace(/[ \t]*\n[ \t]*/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            break;
          default:
            text = text.replace(/\s+/g, ' ').trim();
        }
        textBuffer += text;
      } else {
        flushText();
        if (t.isJSXElement(node)) {
          this.transformJSXElement(context, node);
        } else if (t.isJSXExpressionContainer(node)) {
          this.transformJSXExpressionContainer(context, node);
        } else if (t.isJSXFragment(node)) {
          this.transformNodes(context, node.children);
        }
      }
    }
    flushText();
  }
  
  transformJSXExpressionContainer(
    context: Context,
    node: t.JSXExpressionContainer,
  ) {
    const expression = node.expression;
    if (t.isJSXEmptyExpression(expression)) return;
    const appendDynamicValueFn = context.importHelper.requireId(
      context,
      'appendDynamicValue',
      this.environment,
    );
    const appendDynamicValueStat = t.expressionStatement(
      t.callExpression(appendDynamicValueFn, [
        context.scope.rootCtx,
        context.scope.rootElement,
        expression,
      ]),
    );
    
    context.statements.push(appendDynamicValueStat);
  }
  
  transformAst(ast: t.File) {
    const context: Context = {
      importHelper: new ImportHelper(),
      scope: {
        rootElement: t.identifier(`root_${Date.now()}`),
        rootCtx: t.identifier(`ctx_${Date.now()}`),
      },
      statements: [],
      compileDirectives: {
        preserveWhitespace: true,
      },
    };
    
    traverse(ast, {
      Program: (path: NodePath) => {
        context.program = path;
        context.scope.rootElement = this.generateUId(context, 'root');
        context.scope.rootCtx = this.generateUId(context, 'ctx');
      },
      
      JSXAttribute: (path: NodePath) => {
        console.log(path);
      },
      
      JSXElement: (path: NodePath < t.JSXElement > ) => {
        const localContext: Context = {
          importHelper: context.importHelper,
          scope: {
            rootElement: this.generateUId(context, 'root'),
            rootCtx: this.generateUId(context, 'ctx'),
          },
          statements: [],
          program: context.program,
          compileDirectives: {
            preserveWhitespace: true,
          },
        };
        
        this.transformJSXElement(localContext, path.node);
        
        const createRootFragStat = t.variableDeclaration('const', [
          t.variableDeclarator(
            localContext.scope.rootElement,
            t.callExpression(
              t.memberExpression(
                t.identifier('document'),
                t.identifier('createDocumentFragment'),
              ),
              [],
            ),
          ),
        ]);
        
        const template = t.arrowFunctionExpression(
          [localContext.scope.rootCtx],
          t.blockStatement([
            createRootFragStat,
            ...localContext.statements,
            t.returnStatement(localContext.scope.rootElement),
          ]),
        );
        
        path.replaceWith(template);
      },
    });
    
    const eventDelegateFn = context.importHelper.requireId(
      context,
      'eventDelegate',
      this.environment,
    );
    const eventNameStrLiterals = t.arrayExpression(
      this.eventNames.map((name) => t.stringLiteral(name)),
    );
    const eventDelegateStat = t.expressionStatement(
      t.callExpression(eventDelegateFn, [eventNameStrLiterals]),
    );
    
    ast.program.body.push(eventDelegateStat);
    
    ast.program.body.unshift(...context.importHelper.generateImportDec());
  }
  
  compile(code: string, metadata: SourceMetadata): CompileResult {
    const filename = metadata.filename;
    const isTSX = filename.endsWith('.tsx');
    const isTS = filename.endsWith('.ts') || isTSX;
    const plugins: ParserPlugin[] = ['jsx'];
    
    if (isTS || isTSX) plugins.push('typescript');
    
    const ast = parser.parse(code, {
      sourceType: metadata.type,
      ranges: true,
      plugins,
    });
    
    this.transformAst(ast);
    
    const compiled = generate(
      ast,
      {
        comments: false,
        concise: false,
        compact: false,
        sourcemap: true,
        sourceFileName: metadata.filename,
        jsescOption: { minimal: true },
      },
      code,
    );
    
    return {
      code: compiled.code,
      map: compiled.map,
    };
  }
}