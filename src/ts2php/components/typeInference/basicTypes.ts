import * as ts from 'typescript';
import { MethodsTypes } from '../../types';
import { checkCustomTypehints } from './customTypehints';
import { typeMap } from './basicTypesMap';

/**
 * Check if node has proper inferred type identified by typeString
 *
 * @param node
 * @param checker
 * @param typeString
 */
export function hasType(node: ts.Node, checker: ts.TypeChecker, typeString: string): boolean {
  let nd: ts.Node = (node as ts.PropertyAccessExpression).expression;
  let type = checker.getTypeAtLocation(nd);
  return typeString === checker.typeToString(type, nd, ts.TypeFormatFlags.None);
}

/**
 * Check if node has inferred type identified as iterable
 *
 * @param node
 * @param checker
 */
export function hasArrayType(node: ts.Node, checker: ts.TypeChecker): boolean {
  let nd: ts.Node = (node as ts.PropertyAccessExpression).expression;
  let type = checker.getTypeAtLocation(nd);
  return _parseArrayType(type, checker) === 'array';
}

/**
 * Get primitive type description as string for use in phpdoc
 *
 * @param node
 * @param checker
 */
export function getPhpPrimitiveType(node: ts.Node, checker: ts.TypeChecker) {
  const type = checker.getTypeAtLocation(node);
  return _describeNodeType(node, type, checker);
}

/**
 * Get primitive type description as string for use in phpdoc
 *
 * @param node
 * @param argList
 * @param checker
 */
export function getPhpPrimitiveTypeForFunc(node: ts.FunctionExpression | ts.ArrowFunction | ts.FunctionDeclaration, argList: string[], checker: ts.TypeChecker): MethodsTypes | undefined {
  const signature = checker.getSignatureFromDeclaration(node);
  if (!signature) {
    // Not functional type?
    return;
  }

  const params: { [key: string]: string } = {};
  for (let i = 0; i < node.parameters.length; i++) {
    const param = node.parameters[i].name;
    if (param.kind === ts.SyntaxKind.Identifier) {
      params[argList[i]] = getPhpPrimitiveType(param, checker);
    } else {
      params[argList[i]] = 'var'; // TODO: more specific typing? (applies for destructured objects too!)
    }
  }

  const returnType = checker.getReturnTypeOfSignature(signature);
  const rettype = _describeNodeType(undefined, returnType, checker);

  return {
    args: params,
    return: rettype
  };
}

function _parseArrayType(node: ts.Type, checker: ts.TypeChecker, excludeObjects = true) {
  let typeNode = checker.typeToTypeNode(node);
  if (!typeNode) {
    return false;
  }

  // Support for array-like type aliases and interfaces
  // e.g. type GridChildren = Array<Array<JSX.Element | undefined>>;
  if (typeNode.kind === ts.SyntaxKind.TypeReference) {
    const sym = node.symbol || node.aliasSymbol;
    const decls = sym.getDeclarations() as ts.Declaration[];
    const [ifaceDecl] = decls.filter((d) => d.kind === ts.SyntaxKind.InterfaceDeclaration);
    if (!ifaceDecl) {
      return false;
    }

    let isObjectType = false;
    if (!excludeObjects) {
      isObjectType = (ifaceDecl as ts.InterfaceDeclaration).members.length > 0;
    }
    if (isObjectType || (ifaceDecl as ts.InterfaceDeclaration).name.text === 'Array') {
      return 'array';
    }
  }

  if (!excludeObjects && typeNode.kind === ts.SyntaxKind.TypeLiteral) {
    return 'array';
  }

  if (typeNode.kind === ts.SyntaxKind.ArrayType || typeNode.kind === ts.SyntaxKind.TupleType) {
    return 'array';
  }

  return false;
}

const _transformTypeName = (type: ts.Type, checker: ts.TypeChecker) => (t: string) => {
  const arrType = _parseArrayType(type, checker, false);
  if (arrType) {
    return arrType;
  }
  return typeMap[t] || 'var';
};

function _describeNodeType(node: ts.Node | undefined, type: ts.Type, checker: ts.TypeChecker) {
  const customTypehints = checkCustomTypehints(type, checker);
  if (customTypehints) {
    const types = customTypehints.foundTypes.map((t) => {
      if (typeof t === 'string') {
        return t;
      }
      // Some of union members may be literal types
      return _describeAsApparentType(t, checker);
    }).filter((t) => !customTypehints.typesToDrop.includes(t));
    return Array.from(new Set((<string[]>[])
      .concat(types)))
      .join('|');
  }

  const strTypes = checker.typeToString(type, node, ts.TypeFormatFlags.None)
    .split('|')
    .map((t) => t.replace(/^\s+|\s+$/g, ''))
    .map(_transformTypeName(type, checker));

  if (strTypes.includes('var')) {
    const types = type.isUnionOrIntersection() ? type.types : [type];

    const appStrTypes = types.map((t) => {
      return _describeAsApparentType(t, checker);
    });

    if (appStrTypes.includes('var')) {
      return 'var';
    }

    return Array.from(new Set((<string[]>[])
      .concat(strTypes.filter((t) => t !== 'var'))
      .concat(appStrTypes)))
      .join('|');
  }

  return Array.from(new Set((<string[]>[])
    .concat(strTypes)))
    .join('|');
}

// Check parent types: Number for 1, String for "asd" etc
function _describeAsApparentType(t: ts.Type, checker: ts.TypeChecker) {
  const appType = checker.getApparentType(t);
  const appStrType = checker.typeToString(appType).toLowerCase()
    .replace(/^\s+|\s+$/g, '');
  return _transformTypeName(t, checker)(appStrType);
}