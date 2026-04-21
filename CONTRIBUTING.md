# Contributing

1. Follow **[README — Development](README.md#development)** for supported Node versions, `npm install`, `npm test`, and `npm run lint`. Language bindings live under **`bindings/{node,rust,python,go}`** — see **[README — Bindings](README.md#bindings)**.

2. Keep **`npm test`**, **`npm run testbindings`**, and **`npm run lint`** green; CI runs all three.

3. After grammar or scanner changes, run **`npm run build`** and include updated files under each dialect’s `cf*/src/` when the change is finished.

4. When you change **`cfml/queries/*.scm`**, mirror those files into **`bindings/python/tree_sitter_cfml/queries/`** so the Python sdist/wheel matches the packaged query sources.

5. Optional before merging binding or packaging changes (beyond CI): **`cargo test -p tree-sitter-cfml`**, **`CGO_ENABLED=1 go test ./bindings/go/...`**, and **`python -m unittest bindings.python.tests.test_binding`** after **`pip install -e ".[core]"`**. CI runs **`npm test`**, **`npm run testbindings`**, and **`npm run lint`** — see **[README — Binding behavior and query sources](README.md#binding-behavior-and-query-sources)**.

Report bugs and request features via **[GitHub Issues](https://github.com/cfmleditor/tree-sitter-cfml/issues)**. For scope or design questions, open an issue when useful.
