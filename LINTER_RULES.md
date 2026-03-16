## CFML Linter Rules (initial set)

### `cfquery-unscoped-variable`

- **Purpose**: Warn when hash parameters inside cfquery SQL use unscoped variables.
- **Where it runs**: On `hash_param (cf_identifier_path ...)` nodes in `cfquery` SQL.
- **Behavior**:
  - If the root identifier of `cf_identifier_path` is *not* a known CF scope (`variables`, `arguments`, `local`, `session`, `application`, `server`, `request`, `cgi`, `cookie`), the rule reports a warning.
- **Example**:
  - **Warn**: `WHERE id = #id#`
  - **OK**: `WHERE id = #arguments.id#`

### `cfquery-missing-parameterization`

- **Purpose**: Encourage parameterized values in cfquery WHERE and JOIN conditions.
- **Where it runs**: On `binary_expression` nodes whose parent or grandparent is a `where_clause` or `join_clause`.
- **Behavior**:
  - If one side of the comparison is a `string` literal and the other side looks like a user value (`identifier` or `hash_param`), the rule reports a warning suggesting use of `cfqueryparam` or parameter placeholders.

### `cfml-global-scope-write`

- **Purpose**: Highlight writes into global/shared CF scopes.
- **Where it runs**: On `assignment_expression` nodes.
- **Behavior**:
  - If the left-hand side is a `member_expression` whose root identifier is `APPLICATION`, `SESSION`, `SERVER`, or `CLIENT` (case-insensitive), the rule reports a warning.
- **Example**:
  - **Warn**: `APPLICATION.settings = {...};`

