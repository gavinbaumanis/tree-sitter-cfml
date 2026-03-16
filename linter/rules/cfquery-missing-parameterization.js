// Rule: cfquery-missing-parameterization
// Look for suspicious binary expressions inside WHERE and JOIN conditions
// that compare an identifier to a raw string literal rather than using
// parameters or cfqueryparam.

function isPotentiallyUserValue(node, source) {
  if (node.type === "hash_param") return true;
  if (node.type === "identifier") {
    const name = source.slice(node.startIndex, node.endIndex).toLowerCase();
    return !["true", "false", "null"].includes(name);
  }
  return false;
}

module.exports = {
  id: "cfquery-missing-parameterization",
  meta: {
    description: "Prefer parameterized values in cfquery WHERE and JOIN conditions",
    defaultSeverity: "warning",
  },
  create(context) {
    const { source } = context;

    return {
      visitNode(node) {
        // We only care about binary expressions
        if (node.type !== "binary_expression") return;

        // Heuristic: parent is where_clause or join_clause condition
        const parent = node.parent;
        if (!parent) return;
        const parentType = parent.type;
        const grand = parent.parent;

        const isWhere =
          parentType === "where_clause" ||
          (grand && grand.type === "where_clause");
        const isJoinCondition =
          parentType === "join_clause" ||
          (grand && grand.type === "join_clause");

        if (!isWhere && !isJoinCondition) return;

        const left = node.namedChild(0);
        const right = node.namedChild(1);
        if (!left || !right) return;

        const leftIsUser = isPotentiallyUserValue(left, source);
        const rightIsUser = isPotentiallyUserValue(right, source);

        // If one side is a raw string and the other looks like a user value,
        // suggest parameterization.
        if (
          (left.type === "string" && rightIsUser) ||
          (right.type === "string" && leftIsUser)
        ) {
          context.report({
            node,
            message:
              "Suspicious string literal in cfquery condition; consider using cfqueryparam or parameter placeholders instead of inlined values.",
          });
        }
      },
    };
  },
};

