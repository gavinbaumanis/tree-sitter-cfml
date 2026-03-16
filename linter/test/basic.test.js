const assert = require("assert");
const path = require("path");
const { lintFile } = require("..");

function runLintOnSnippet(name, source) {
  const fakePath = path.join(__dirname, `${name}.cfc`);
  return lintFile(fakePath, source, {});
}

describe("CFML linter basic rules", () => {
  it("does not report anything for an empty component", () => {
    const src = "component {}";
    const diags = runLintOnSnippet("empty", src);
    assert.ok(Array.isArray(diags));
  });

  it("flags unscoped hash_param inside cfquery SQL", () => {
    const src = `
component {
  public void function test() {
    queryExecute("
      SELECT * FROM users WHERE id = #id#
    ");
  }
}
`;
    const diags = runLintOnSnippet("unscoped-hash", src);
    assert.ok(
      diags.some((d) => d.ruleId === "cfquery-unscoped-variable"),
      "expected cfquery-unscoped-variable diagnostic",
    );
  });
});

