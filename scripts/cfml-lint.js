#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { lintFile } = require("../linter");

function isCfmlFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === ".cfc" || ext === ".cfm" || ext === ".cfs";
}

function collectFilesFromArg(arg, out) {
  const stat = fs.statSync(arg);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(arg)) {
      const full = path.join(arg, entry);
      const s = fs.statSync(full);
      if (s.isDirectory()) {
        collectFilesFromArg(full, out);
      } else if (isCfmlFile(full)) {
        out.push(full);
      }
    }
  } else if (isCfmlFile(arg)) {
    out.push(arg);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: cfml-lint <files-or-directories>");
    process.exit(1);
  }

  const files = [];
  for (const arg of args) {
    collectFilesFromArg(path.resolve(arg), files);
  }

  if (files.length === 0) {
    console.error("No CFML files found to lint.");
    process.exit(1);
  }

  let hadErrors = false;

  for (const filePath of files) {
    const source = fs.readFileSync(filePath, "utf8");
    const diagnostics = lintFile(filePath, source, {});

    for (const diag of diagnostics) {
      const severity = diag.severity || "warning";
      if (severity === "error") {
        hadErrors = true;
      }
      const line = (diag.start && diag.start.line != null ? diag.start.line + 1 : 0);
      const column = (diag.start && diag.start.column != null ? diag.start.column + 1 : 0);
      console.log(
        `${filePath}:${line}:${column} [${severity}] ${diag.ruleId}: ${diag.message}`,
      );
    }
  }

  process.exit(hadErrors ? 1 : 0);
}

if (require.main === module) {
  main();
}

