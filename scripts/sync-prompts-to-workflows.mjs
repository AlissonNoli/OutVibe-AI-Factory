/**
 * Sync agents/prompts/*.md into the embedded system prompts in n8n workflow JSON.
 * Usage: node scripts/sync-prompts-to-workflows.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const map = [
  {
    wf: "n8n/workflows/02-diretor.json",
    md: "agents/prompts/diretor.md",
    nodeName: "Code — prompt Diretor",
    ver: "diretor-v0.2",
    verOld: "diretor-v0.1",
  },
  {
    wf: "n8n/workflows/03-copywriter.json",
    md: "agents/prompts/copywriter.md",
    nodeName: "Code — prompt Copywriter",
    ver: "copywriter-v0.2",
    verOld: "copywriter-v0.1",
  },
  {
    wf: "n8n/workflows/04-social-media.json",
    md: "agents/prompts/social-media.md",
    nodeName: "Code — prompt Social IG",
    ver: "social-media-ig-v0.2",
    verOld: "social-media-ig-v0.1",
  },
];

function escapeForTemplateLiteral(md) {
  return md.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
}

for (const m of map) {
  const md = fs.readFileSync(path.join(root, m.md), "utf8");
  const wfPath = path.join(root, m.wf);
  const wf = JSON.parse(fs.readFileSync(wfPath, "utf8"));
  const node = wf.nodes.find((n) => n.name === m.nodeName);
  if (!node) {
    console.error("missing node", m.nodeName);
    process.exitCode = 1;
    continue;
  }

  const code = node.parameters.jsCode;
  let newCode;
  if (code.includes("const system = `")) {
    newCode = code.replace(
      /const system = `[\s\S]*?`;/,
      `const system = \`${escapeForTemplateLiteral(md)}\`;`,
    );
  } else if (code.includes('const system = "')) {
    const escaped = JSON.stringify(md).slice(1, -1);
    newCode = code.replace(
      /const system = "[\s\S]*?";\n/,
      `const system = "${escaped}";\n`,
    );
  } else {
    console.error("unknown system style", m.wf);
    process.exitCode = 1;
    continue;
  }

  if (newCode === code) {
    console.error("no replacement applied", m.wf);
    process.exitCode = 1;
    continue;
  }

  node.parameters.jsCode = newCode;
  let out = JSON.stringify(wf, null, 2);
  if (m.verOld) out = out.split(m.verOld).join(m.ver);
  fs.writeFileSync(wfPath, out);
  console.log("synced", m.wf, `(${md.length} chars)`);
}
