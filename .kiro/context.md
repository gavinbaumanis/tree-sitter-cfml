# tree-sitter-cfml - project context

[Tree-sitter](https://tree-sitter.github.io/) grammars for [ColdFusion Markup Language (CFML)](https://en.wikipedia.org/wiki/ColdFusion_Markup_Language).

The repo ships **four** grammars: three for how CFML is written in files, plus an embedded SQL dialect for `<cfquery>` bodies.

| Grammar    | Scope             | File types   | Description                                                                |
| ---------- | ----------------- | ------------ | -------------------------------------------------------------------------- |
| `cfml`     | `source.cfml`     | `.cfc`       | Components - CFScript in`component {}` or tag-based components             |
| `cfhtml`   | `source.cfhtml`   | `.cfm`       | Templates - HTML with CF tags and hash expressions                         |
| `cfscript` | `source.cfscript` | `.cfs`       | Pure CFScript                                                              |
| `cfquery`  | `source.cfquery`  | _(embedded)_ | SQL inside`<cfquery>` (and similar), with `#hash#` and CF tags in the body |

## Playground

Public browser playground: [cfmleditor.github.io/tree-sitter-cfml](https://cfmleditor.github.io/tree-sitter-cfml/)

## Development

### Requirements

- [tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/creating-parsers#installation) - the `tree-sitter-cli` npm package installs a native binary via `install.js` (e.g. `tree-sitter.exe` on Windows). If `npm run build` cannot find it, run `node scripts/ensure-tree-sitter-cli-binary.js` once or reinstall. Repo scripts run the CLI through `node node_modules/tree-sitter-cli/cli.js`, so a global `tree-sitter` install is optional.
- A C compiler (for native bindings / `node-gyp`).

### Dependency versions (tree-sitter ecosystem)

Versions align with the published [`tree-sitter`](https://www.npmjs.com/package/tree-sitter) npm package and the **0.26.x** CLI used to generate parsers. Dependencies are taken from npm as published (no vendored patches to `tree-sitter` or the CLI).

| Role                        | Package           | Version                                                                                                                                                                                  |
| --------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native binding (peer / dev) | `tree-sitter`     | `0.25.0` (`^0.25.0` peer)                                                                                                                                                                |
| Parser generation CLI       | `tree-sitter-cli` | `0.26.7` (see `tree-sitter.json`)                                                                                                                                                        |
| Native addon                | `node-addon-api`  | `^8.3.0`                                                                                                                                                                                 |
| Native addon                | `node-gyp-build`  | `^4.8.4`                                                                                                                                                                                 |
| Prebuild tooling            | `prebuildify`     | `^6.0.1`                                                                                                                                                                                 |
| Runtime                     | Node.js           | `>=18` and `<24` (`package.json` `engines`). Prefer **Node 22 LTS** (`.nvmrc`) - `tree-sitter@0.25.0` native addon uses C++17; Node 24+ can mismatch headers until upstream supports it. |

### Vendor alignment

- **Engines:** Tests target **Lucee** as the primary reference; valid **Adobe ColdFusion** syntax that overlaps the shared language should still parse sensibly (generic tags or text rather than hard failures for well-formed markup).
- **Tags:** Void or self-closing tags (e.g. `cfqueryparam`) follow engine docs; CFML attribute names are case-insensitive.

### Building

From the repository root, generate all four parsers and refresh generated sources:

```bash
npm run build
```

On Unix, `make generate` runs `tree-sitter generate` in `cfml`, `cfhtml`, `cfscript`, and `cfquery`. Individual directories with a `Makefile` (`cfml`, `cfhtml`, `cfscript`) also support `make` targets there.

**Build warnings:** `tree-sitter generate` may report "unnecessary conflicts" (e.g. expressions vs `_property_name`, hash rules in cfquery). Those conflicts are **declared on purpose** in `common/define-grammar.js`; removing them often breaks generation. Safe to ignore if the build and `npm test` succeed.

### Generating after grammar edits

After changing `common/define-grammar.js` or a dialect `grammar.js`:

```bash
cd cfml && tree-sitter generate
cd cfhtml && tree-sitter generate
cd cfscript && tree-sitter generate
cd cfquery && tree-sitter generate
```

## Project Structure
- `cfml/`, `cfhtml/`, `cfscript/` - Individual grammar directories with grammar.js and src/
- `common/` - Shared code and HTML entities
- `scripts/` - Build and utility scripts
- `test/` - Test files
- `bindings/` - Language bindings (Node, Python, Rust, Go, Swift)
- `queries/` - Tree-sitter queries

## Agent / Cursor conventions

Tracked at the repo root: **`AGENTS.md`** (workflow, done bar, CFML runtime expectations) and **`.cursor/rules/*.mdc`** (enforceable Cursor rules). Use those when using AI or Cursor on this project; do not rely on outdated references to a separate `docs/` copy of rules.
