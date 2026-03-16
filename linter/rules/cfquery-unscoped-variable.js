// Rule: cfquery-unscoped-variable
// Warn on hash parameters inside cfquery SQL whose root identifier does not
// appear to be a well-known CF scope (variables/arguments/local/session/etc).

const KNOWN_SCOPES = new Set([
  "variables",
  "arguments",
  "local",
  "session",
  "application",
  "server",
  "request",
  "cgi",
  "cookie",
]);

function getText(node, source) {
  return source.slice(node.startIndex, node.endIndex);
}

module.exports = {
  id: "cfquery-unscoped-variable",
  meta: {
    description: "Discourage unscoped CF variables inside cfquery SQL hash parameters",
    defaultSeverity: "warning",
  },
  create(context) {
    const { source } = context;

    return {
      visitNode(node) {
        if (node.type !== "hash_param") return;

        const pathNode = node.namedChildren.find((n) => n.type === "cf_identifier_path");
        if (!pathNode || pathNode.namedChildCount === 0) return;

        const rootIdent = pathNode.namedChild(0);
        if (!rootIdent || rootIdent.type !== "identifier") return;

        const rootName = getText(rootIdent, source).toLowerCase();
        if (!KNOWN_SCOPES.has(rootName)) {
          context.report({
            node,
            message:
              "Hash parameter inside cfquery SQL uses an unscoped variable; consider qualifying with a CF scope (e.g. arguments.id, variables.id).",
          });
        }
      },
    };
  },
};

