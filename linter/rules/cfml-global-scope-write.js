// Rule: cfml-global-scope-write
// Warn on writes to global/shared CF scopes like APPLICATION or SESSION.

const GLOBAL_SCOPES = new Set([
  "application",
  "session",
  "server",
  "client",
]);

function getText(node, source) {
  return source.slice(node.startIndex, node.endIndex);
}

module.exports = {
  id: "cfml-global-scope-write",
  meta: {
    description: "Discourage writes to global CF scopes outside of controlled locations",
    defaultSeverity: "warning",
  },
  create(context) {
    const { source } = context;

    return {
      visitNode(node) {
        // cfscript and cfml both have assignment_expression nodes.
        if (node.type !== "assignment_expression") return;

        const left = node.namedChild(0);
        if (!left) return;

        // We are interested in member_expression like APPLICATION.foo = ...
        if (left.type !== "member_expression") return;

        // Find the root identifier on the left side.
        let target = left;
        while (target && target.type === "member_expression") {
          target = target.namedChild(0);
        }

        if (!target || target.type !== "identifier") return;

        const rootName = getText(target, source).toLowerCase();
        if (!GLOBAL_SCOPES.has(rootName)) return;

        context.report({
          node,
          message:
            `Write to global CF scope '${rootName.toUpperCase()}' detected; consider scoping data more narrowly or centralizing such writes.`,
        });
      },
    };
  },
};

