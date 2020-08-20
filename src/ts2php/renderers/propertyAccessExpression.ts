import * as ts from 'typescript';
import { Declaration, DeclFlag } from '../types';
import { ctx, log, LogSeverity } from '../utils/log';
import { getLeftExpr } from '../utils/ast';
import { Context } from '../components/context';
import { insideComponent } from '../components/unusedCodeElimination/usageGraph/nodeData';
import { supportedMathMethods } from './stdlib/math';
import { renderNodes } from '../components/codegen/renderNodes';
import { builtins } from '../internalConfig/jsBuiltins';

export function tPropertyAccessExpression(node: ts.PropertyAccessExpression, context: Context<Declaration>) {
  let [ident, accessor] = renderNodes([node.expression, node.name], context);

  if (ident === '$exports' && !context.scope.getClosure().has('exports')) {
    log('You should use `export` instead of `module.exports = `', LogSeverity.ERROR, ctx(node));
    return '';
  }

  let lExp = getLeftExpr(node.expression);
  if (lExp) {
    let [decl] = context.scope.findByIdent(lExp.getText()) || [];
    if (decl && decl.flags & DeclFlag.External) {
      return context.registry.getExportedIdentifier(context.moduleDescriptor, decl.targetModulePath, node.name.text);
    }
  }

  if (accessor === 'length' && node.parent.kind !== ts.SyntaxKind.PropertyAccessExpression) {
    let type = context.checker.getTypeAtLocation(node.expression);
    if (
      type.isStringLiteral()
      || context.checker.typeToString(type, node.expression, ts.TypeFormatFlags.None) === 'string'
    ) {
      log('Converting .length to strlen(): check your encodings!', LogSeverity.WARN);
      return `strlen(${ident})`;
    }
    return `count(${ident})`;
  }

  if (ident === '$Math') {
    switch (accessor) {
      case 'E':
      case 'LN2':
      case 'LN10':
      case 'LOG2E':
      case 'LOG10E':
      case 'PI':
      case 'SQRT1_2':
      case 'SQRT2':
        return 'M_' + accessor;
      default:
        if (!supportedMathMethods.includes(accessor)) {
          log(`Math: unsupported property (${accessor})`, LogSeverity.ERROR, ctx(node));
        }
        return 'null';
    }
  }

  const isBuiltin = builtins.has(node.expression.getText());
  if (isBuiltin) {
    return `${ident}::${accessor}`;
  }

  if (accessor === 'children' && insideComponent(context.scope)) {
    log(`Accessing ${ident}.children inside react component function: note that accessing props.children` +
      ' won\'t work on server! Use object dereferencing instead.', LogSeverity.WARN, ctx(node));
  }

  return `${ident}["${accessor}"]`;
}