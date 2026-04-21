# tree-sitter-cfml

[![CI][ci]](https://github.com/cfmleditor/tree-sitter-cfml/actions/workflows/ci.yml)
[![discord][discord]](https://discord.gg/w7nTvsVJhm)
[![matrix][matrix]](https://matrix.to/#/#tree-sitter-chat:matrix.org)
[![npm][npm]](https://www.npmjs.com/package/@cfmleditor/tree-sitter-cfml)
[![crates][crates]](https://crates.io/crates/tree-sitter-cfml)
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/garetheddies)

[Tree-sitter](https://tree-sitter.github.io/) grammars for [ColdFusion Markup Language (CFML)](https://en.wikipedia.org/wiki/ColdFusion_Markup_Language).

There are four grammars: three for CFML in `.cfc`, `.cfm`, and `.cfs` files, and one for SQL inside `<cfquery>` (embedded dialect).

| Grammar    | Scope             | File types   | Description                                                                                                             |
| ---------- | ----------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `cfml`     | `source.cfml`     | `.cfc`       | ColdFusion components - CFScript inside a `component {}` block or tag-based component files                             |
| `cfhtml`   | `source.cfhtml`   | `.cfm`       | CFML template files - HTML with embedded CF tags and hash expressions                                                   |
| `cfscript` | `source.cfscript` | `.cfs`       | Pure CFScript files                                                                                                     |
| `cfquery`  | `source.cfquery`  | _(embedded)_ | SQL inside `<cfquery>` bodies (including QueryExecute-style usage), with `#hash#` interpolation and CF tags in the body |

## References

- [Tree-sitter](https://github.com/tree-sitter/tree-sitter)
- [ColdFusion Markup Language](https://en.wikipedia.org/wiki/ColdFusion_Markup_Language) (Wikipedia overview)
- [Lucee documentation](https://docs.lucee.org/)

## Bindings

Install published artifacts where available; **Python** is built from this repository (not on PyPI yet).

| Language | Package / module | Source |
| -------- | ---------------- | ------ |
| **Node.js** | npm [`@cfmleditor/tree-sitter-cfml`](https://www.npmjs.com/package/@cfmleditor/tree-sitter-cfml) (peer: `tree-sitter` **^0.25**) | [`bindings/node`](bindings/node/) |
| **Rust** | crates.io [`tree-sitter-cfml`](https://crates.io/crates/tree-sitter-cfml) (`tree-sitter` **0.25+**, [`LanguageFn`](https://docs.rs/tree-sitter-language/) via [`tree-sitter-language`](https://crates.io/crates/tree-sitter-language)) | [`bindings/rust`](bindings/rust/) |
| **Python** | `tree-sitter-cfml` — `pip install` from Git or a clone (see below); optional extra **`[core]`** pulls in **`tree-sitter~=0.25.0`** | [`bindings/python`](bindings/python/) |
| **Go** | `go get github.com/cfmleditor/tree-sitter-cfml` — import [`.../bindings/go`](bindings/go); runtime [`go-tree-sitter`](https://github.com/tree-sitter/go-tree-sitter) **v0.25** (see [`go.mod`](go.mod)) | [`bindings/go`](bindings/go/) |

### Binding behavior and query sources

All four bindings expose **every** grammar (**cfml**, **cfhtml**, **cfscript**, **cfquery**). **[`tree-sitter.json`](tree-sitter.json)** lists each dialect; versions line up across **`package.json`**, **`Cargo.toml`**, and **`pyproject.toml`** (Go uses the module path and release tags instead of a version inside **`go.mod`**).

**Node.js** — [`bindings/node/index.d.ts`](bindings/node/index.d.ts) types the export object. Each dialect is `{ name, language }` plus optional **`nodeTypeInfo`** from `node-types.json` (used by **`tree-sitter`** for typed node subclasses). With **`tree-sitter` 0.25**, **`parser.setLanguage(cfhtml)`** and **`parser.setLanguage(cfhtml.language)`** both work.

**Rust** — Uses **`tree-sitter-language`** [`LanguageFn`](https://docs.rs/tree-sitter-language/) for **`tree-sitter` 0.25+**. The crate embeds **`HIGHLIGHTS_QUERY`**, **`INJECTIONS_QUERY`**, and **`TAGS_QUERY`** from **`cfml/queries/`** only (same strings as the Python wheel), plus JSON **`node-types`** text per dialect. It does **not** embed **`cfhtml/`**, **`cfscript/`**, or **`cfquery/`** query files; load those from the repo under each **`cf*/queries/`** when you need dialect-specific highlights or tags.

**Python** — Packaged **`*.scm`** mirror **`cfml/queries/`** (see [CONTRIBUTING](CONTRIBUTING.md)). **`HIGHLIGHTS_QUERY`**, **`INDENTS_QUERY`**, **`INJECTIONS_QUERY`**, and **`TAGS_QUERY`** therefore match the **cfml** grammar’s trees. Pair them with **`language_cfml()`** for correct captures; for **cfhtml** / **cfscript** / **cfquery**, read the matching files from **`cfhtml/queries/`**, **`cfscript/queries/`**, or **`cfquery/queries/`** in a checkout (or ship copies in your app). The package is **[PEP 561](https://peps.python.org/pep-0561/)**-ready (**`py.typed`**).

**Go** — [`bindings/go`](bindings/go/) exposes **`LanguageCfml()`**, **`LanguageCfhtml()`**, **`LanguageCfscript()`**, **`LanguageCfquery()`** only; **CGO** and **`gcc`** are required. Queries are **not** embedded (usual for **`go-tree-sitter`**); load **`.scm`** from this repository.

**CI vs local checks** — [GitHub Actions](.github/workflows/ci.yml) runs **`npm install`**, **`npm test`**, and **`npm run lint`** only (no **`npm run build`**). It does **not** run **`npm run testbindings`**, **`cargo test`**, **`go test`**, or Python tests. Before a release or binding change, run those locally when relevant:

```bash
npm run testbindings
cargo test -p tree-sitter-cfml
CGO_ENABLED=1 go test ./bindings/go/...
python -m unittest bindings.python.tests.test_binding   # from repo root, with package on PYTHONPATH or after pip install -e .
```

## Playground

Browser demo: [cfmleditor.github.io/tree-sitter-cfml](https://cfmleditor.github.io/tree-sitter-cfml/)

## Installation

### Node.js

```bash
npm install @cfmleditor/tree-sitter-cfml
```

```js
const {
  cfml,
  cfhtml,
  cfscript,
  cfquery,
} = require("@cfmleditor/tree-sitter-cfml");
const Parser = require("tree-sitter");

const parser = new Parser();
parser.setLanguage(cfhtml.language);

const tree = parser.parse("<cfif condition>#value#</cfif>");
console.log(tree.rootNode.toString());
```

### Rust

```toml
[dependencies]
tree-sitter = "0.25"
tree-sitter-cfml = "0.26.2"
```

The `tree-sitter` crate should be **0.25+** so the ABI matches the generated parsers (see `LANGUAGE_VERSION` in `cf*/src/parser.c`).

```rust
use tree_sitter_cfml::LANGUAGE_CFML;

let mut parser = tree_sitter::Parser::new();
parser.set_language(&LANGUAGE_CFML.into())
    .expect("Error loading CFML grammar");
// LANGUAGE_CFHTML, LANGUAGE_CFSCRIPT, LANGUAGE_CFQUERY load the same way.
```

### Python

Not published on PyPI yet. From a clone at the repository root:

```bash
pip install ".[core]"
```

Or install from Git without cloning first:

```bash
pip install "tree-sitter-cfml[core] @ git+https://github.com/cfmleditor/tree-sitter-cfml.git"
```

```python
import tree_sitter_cfml as ts_cfml
from tree_sitter import Language, Parser

# cfhtml for .cfm template files
parser = Parser(Language(ts_cfml.language_cfhtml()))
tree = parser.parse(b'<cfif x GT 0>#x#</cfif>')

# cfml for .cfc component files
parser = Parser(Language(ts_cfml.language_cfml()))

# cfscript for .cfs pure script files
parser = Parser(Language(ts_cfml.language_cfscript()))

# cfquery SQL dialect (embedded)
parser = Parser(Language(ts_cfml.language_cfquery()))
```

### Go

```go
import (
    tree_sitter_cfml "github.com/cfmleditor/tree-sitter-cfml/bindings/go"
    sitter "github.com/tree-sitter/go-tree-sitter"
)

parser := sitter.NewParser()
defer parser.Close()

parser.SetLanguage(sitter.NewLanguage(tree_sitter_cfml.LanguageCfml()))
// Also: LanguageCfhtml(), LanguageCfscript(), LanguageCfquery()
```

## Development

Each dialect has `grammar.js`, generated C under `src/`, corpus tests under `test/corpus/`, and queries under `queries/`. Shared scanner code is under `common/`. The multi-grammar CLI and playground config is [`tree-sitter.json`](tree-sitter.json). Upstream docs: [Creating parsers](https://tree-sitter.github.io/tree-sitter/creating-parsers), [CLI](https://tree-sitter.github.io/tree-sitter/cli/overview.html).

### Setup

```bash
git clone https://github.com/cfmleditor/tree-sitter-cfml.git
cd tree-sitter-cfml
```

Use Node **>=18** and **<24** (`package.json` `engines`). Optional: [`.nvmrc`](.nvmrc) with [nvm](https://github.com/nvm-sh/nvm) / [fnm](https://github.com/Schniz/fnm) (`nvm use`).

```bash
npm install
```

That installs dependencies, builds the Node native addon (`node-gyp-build`), and runs `postinstall`, which downloads the tree-sitter CLI binary into `node_modules/tree-sitter-cli/` when needed. Repo `npm` scripts do not require a global `tree-sitter` on `PATH`.

```bash
npm test          # all four grammars
npm run lint      # ESLint
npm run build     # regenerate parsers + rebuild native addon (after grammar edits)
```

#### Windows

Put **GCC** from **MinGW-w64** on your `PATH` (`gcc` / `g++`). This repo uses GCC for **`npm test`** (tree-sitter compile), the **Node** native binding, **Python** extension builds, and **Go** CGO — not MSVC.

**Standalone toolchain (recommended):** install [WinLibs](https://winlibs.com/) with winget, then add the extracted **`mingw64\bin`** directory (contains `gcc.exe`) to your user **PATH**, open a new terminal, and verify:

```powershell
gcc --version
```

Example package (UCRT, POSIX threads):

```powershell
winget install BrechtSanders.WinLibs.POSIX.UCRT
```

The installer path varies by machine; locate `mingw64\bin` under the WinLibs folder (or under `%LOCALAPPDATA%\Microsoft\WinGet\Packages\` after install) and add **that `bin`** to PATH.

**Alternatively:** [MSYS2](https://www.msys2.org/) with `pacman -S mingw-w64-x86_64-gcc`, then prepend **`msys64\mingw64\bin`** to PATH (or develop from an MSYS2 MinGW64 shell).

If **`node-gyp`** still picks Visual Studio instead of MinGW, set `CC` / `CXX` to your MinGW **`gcc`** / **`g++`** for `npm install` / `npm rebuild`, or keep MinGW’s `bin` **before** MSVC entries on `PATH`.

#### macOS

Install the Xcode command-line tools:

```bash
xcode-select --install
```

##### Homebrew

```bash
brew install gcc
```

#### Linux

Install a C/C++ toolchain (for example `build-essential` on Debian/Ubuntu, `gcc` / `clang` plus development headers on other distributions).

#### Go bindings (optional)

[`bindings/go`](bindings/go) uses **CGO**. Use **`CGO_ENABLED=1`** and ensure **`gcc`** is on `PATH` (same MinGW setup as above on Windows). Then from the repo root:

```bash
go test ./bindings/go/...
```

Commit **`go.sum`** alongside **`go.mod`** (`go mod tidy` refreshes it).

#### CI

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): `npm install`, `npm test`, `npm run lint` on Ubuntu, macOS, and Windows (Windows installs **MinGW GCC** via **msys2/setup-msys2** before `npm install`). It does not run `npm run build` (generated `cf*/src/` files are committed) or the extra binding checks listed under **[Bindings: behavior and query sources](#binding-behavior-and-query-sources)**.

#### Tree-sitter CLI

Scripts use [`scripts/tree-sitter-cli.cjs`](scripts/tree-sitter-cli.cjs) (`node node_modules/tree-sitter-cli/cli.js`). A global `tree-sitter-cli` install is optional. If the binary is missing after install:

```bash
node scripts/ensure-tree-sitter-cli-binary.js
```

**From a dialect directory** (after `npm install` at repo root):

```bash
cd cfml
node ../node_modules/tree-sitter-cli/cli.js test
node ../node_modules/tree-sitter-cli/cli.js generate
node ../node_modules/tree-sitter-cli/cli.js parse path/to/file.cfc
```

### Dependency versions

Pinned in `package.json` / `tree-sitter.json`; approximate roles:

| Role                         | Package                    | Version      |
| ---------------------------- | -------------------------- | ------------ |
| Native binding (peer / dev)  | `tree-sitter`              | `0.25.0`     |
| Parser CLI                   | `tree-sitter-cli`          | `0.26.7`     |
| Rust (`LanguageFn` ABI)      | `tree-sitter-language`     | `0.1`        |
| Native addon                 | `node-addon-api`           | `^8.3.0`     |
| Native addon                 | `node-gyp-build`           | `^4.8.4`     |
| Prebuild                     | `prebuildify`              | `^6.0.1`     |
| Python optional runtime      | `tree-sitter` (extra core) | `~=0.25.0`   |
| Go runtime                   | `go-tree-sitter`           | `v0.25.0`    |
| Runtime                      | Node.js                    | `>=18` `<24` |

### CFML engines

Corpus and behavior are checked mainly against [Lucee](https://lucee.org/). Overlapping Adobe ColdFusion syntax should still parse in a reasonable way. Avoid Adobe-only or Lucee-only assumptions in examples or grammar design where portable CFML is enough.

### Building

After changing `common/define-grammar.js` or a `grammar.js`:

```bash
npm run build
```

On Unix, `make generate` at the repo root works if `tree-sitter` is on your `PATH`; otherwise use `npm run build`.

`tree-sitter generate` may warn about “unnecessary conflicts” (expressions vs `_property_name`, **cfscript** `declaration` / `primary_expression`, **cfquery** hash rules, etc.). Those come from `common/define-grammar.js`. If `npm run build` and `npm test` succeed, the warnings can be ignored.

### Testing and helpers

See **[Setup](#setup)** for `npm test`, `npm run lint`, and `npm run build`.

```bash
npm run testbindings  # Node binding smoke test
```

One grammar only: run `test` via the CLI from that dialect’s directory ([above](#setup)), or `npm test` for all four.

**Parse a file:** from the dialect folder (e.g. `cfml` for `.cfc`), use the `parse` subcommand with the same `node ../node_modules/.../cli.js` pattern.

**Playground / WebAssembly (WASM)**

- `npm start` — playground at repo root (`tree-sitter.json`). Run `npm run prestart` first if WASM is stale.
- `npm run prestart` — `tree-sitter build --wasm`
- `npm run playground` — playground in each of `cfml/`, `cfhtml/`, `cfscript/`, `cfquery/`
- `npm run docswasm` — writes `docs/tree-sitter-{cfml,cfhtml,cfscript,cfquery}.wasm` for `docs/` (e.g. GitHub Pages)

## Grammar structure

Shared rules: `common/define-grammar.js`. External scanner: `common/scanner.h` (implicit end tags, CF tag names, hash expressions, raw text).

```
common/
  define-grammar.js
  scanner.h
  tag.h

cfml/          # .cfc
  grammar.js
  src/         # generated
  queries/

cfhtml/        # .cfm
  grammar.js
  src/
  queries/

cfscript/      # .cfs
  grammar.js
  src/
  queries/

cfquery/       # embedded SQL
  grammar.js
  src/
  queries/
```

## Queries

| Grammar    | Highlights | Indents | Injections | Tags |
| ---------- | ---------- | ------- | ---------- | ---- |
| `cfml`     | yes        | yes     | yes        | yes  |
| `cfhtml`   | yes        | yes     | yes        | yes  |
| `cfscript` | yes        | no      | no         | yes  |
| `cfquery`  | yes        | no      | no         | yes  |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bugs and feature requests: [GitHub Issues](https://github.com/cfmleditor/tree-sitter-cfml/issues).

## Security

See [SECURITY.md](SECURITY.md).

## Agent and AI assistant guidance

See [`AGENTS.md`](AGENTS.md).

## License

[MIT](LICENSE)

[ci]: https://img.shields.io/github/actions/workflow/status/cfmleditor/tree-sitter-cfml/ci.yml?logo=github&label=CI
[discord]: https://img.shields.io/discord/1063097320771698699?logo=discord&label=discord
[matrix]: https://img.shields.io/matrix/tree-sitter-chat%3Amatrix.org?logo=matrix&label=matrix
[npm]: https://img.shields.io/npm/v/@cfmleditor/tree-sitter-cfml?logo=npm
[crates]: https://img.shields.io/crates/v/tree-sitter-cfml?logo=rust
