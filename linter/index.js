// Core CFML linter entry point.
// Uses the existing Tree-sitter CFML grammars exposed via this package's
// Node bindings to parse files and run rule-based diagnostics.

const path = require("path");
const Parser = require("tree-sitter");
// The main entry for this package is the compiled Tree-sitter CFML addon.
// It exposes cfml, cfhtml and cfscript language objects.
// eslint-disable-next-line import/no-unresolved
const languages = require("../bindings/node");
const { runRules } = require("./rules");

const LANGUAGE_BY_EXT = {
  ".cfc": "cfml",
  ".cfm": "cfhtml",
  ".cfs": "cfscript",
};

function getLanguageForFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const langKey = LANGUAGE_BY_EXT[ext];
  if (!langKey || !languages[langKey]) {
    return null;
  }
  return languages[langKey];
}

function parseFile(filePath, source) {
  const language = getLanguageForFile(filePath);
  if (!language) {
    return null;
  }

  const parser = new Parser();
  parser.setLanguage(language);
  const tree = parser.parse(source);
  return { tree, languageKey: LANGUAGE_BY_EXT[path.extname(filePath).toLowerCase()] };
}

/**
 * Lint a single CFML/CFHTML/CFScript file.
 *
 * @param {string} filePath
 * @param {string|Buffer} source
 * @param {object} [config]
 * @returns {Array<{file:string, ruleId:string, message:string, severity:string, start:{line:number,column:number}, end:{line:number,column:number}}>}
 */
function lintFile(filePath, source, config = {}) {
  const text = Buffer.isBuffer(source) ? source.toString("utf8") : String(source);
  const parsed = parseFile(filePath, text);

  if (!parsed) {
    return [];
  }

  const { tree, languageKey } = parsed;

  const context = {
    filePath,
    source: text,
    language: languageKey,
  };

  return runRules(tree, context, config);
}

module.exports = {
  lintFile,
  parseFile,
};

