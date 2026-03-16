// Rule registry and traversal for the CFML linter.

const cfqueryUnscopedVariable = require("./cfquery-unscoped-variable");
const cfqueryMissingParameterization = require("./cfquery-missing-parameterization");
const cfmlGlobalScopeWrite = require("./cfml-global-scope-write");

const ALL_RULES = [
  cfqueryUnscopedVariable,
  cfqueryMissingParameterization,
  cfmlGlobalScopeWrite,
];

function getActiveRules(config = {}) {
  const configured = (config && config.rules) || {};

  return ALL_RULES.filter((rule) => {
    const setting = configured[rule.id];
    if (setting === "off" || setting === 0) return false;
    return true;
  });
}

function positionFor(node) {
  const start = node.startPosition;
  const end = node.endPosition;
  return {
    start: { line: start.row, column: start.column },
    end: { line: end.row, column: end.column },
  };
}

function walk(node, visitor) {
  visitor(node);
  for (let i = 0; i < node.childCount; i += 1) {
    walk(node.child(i), visitor);
  }
}

function runRules(tree, context, config = {}) {
  const activeRules = getActiveRules(config);
  if (activeRules.length === 0) return [];

  const allDiagnostics = [];

  for (const rule of activeRules) {
    const ruleContext = {
      ...context,
      report(diag) {
        allDiagnostics.push({
          file: context.filePath,
          ruleId: rule.id,
          severity: rule.meta && rule.meta.defaultSeverity ? rule.meta.defaultSeverity : "warning",
          ...positionFor(diag.node),
          message: diag.message,
        });
      },
    };

    const handler = rule.create(ruleContext);
    if (!handler || typeof handler.visitNode !== "function") continue;

    walk(tree.rootNode, (node) => handler.visitNode(node));
  }

  return allDiagnostics;
}

module.exports = {
  runRules,
};

