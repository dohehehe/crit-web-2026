import { readFileSync } from "node:fs";
import { join } from "node:path";

const breakpointsPath = join(process.cwd(), "src/app/breakpoints.css");

function collectBreakpointVars(root) {
  const vars = {};

  root.walkRules((rule) => {
    if (rule.selector !== ":root") {
      return;
    }

    rule.walkDecls((decl) => {
      if (decl.prop.startsWith("--breakpoint-")) {
        vars[decl.prop] = decl.value.trim();
      }
    });
  });

  if (Object.keys(vars).length > 0) {
    return vars;
  }

  const css = readFileSync(breakpointsPath, "utf8");

  for (const match of css.matchAll(/(--breakpoint-[\w-]+)\s*:\s*([^;]+);/g)) {
    vars[match[1]] = match[2].trim();
  }

  return vars;
}

function resolveMediaParams(params, vars) {
  return params.replace(/var\((--breakpoint-[\w-]+)\)/g, (full, name) => {
    if (!vars[name]) {
      return full;
    }

    return vars[name];
  });
}

export default function postcssBreakpointMedia() {
  return {
    postcssPlugin: "postcss-breakpoint-media",
    Once(root) {
      const vars = collectBreakpointVars(root);

      root.walkAtRules("media", (atRule) => {
        if (!atRule.params.includes("var(--breakpoint-")) {
          return;
        }

        atRule.params = resolveMediaParams(atRule.params, vars);
      });
    },
  };
}

postcssBreakpointMedia.postcss = true;
