import assert from "node:assert";
import footer, { formatExtensionStatusLine, measureWidth } from "./stats-footer.ts";

assert.equal(formatExtensionStatusLine(new Map(), 100), null);
assert.equal(formatExtensionStatusLine(new Map([["blank", " \n\t "]]), 100), null);
assert.equal(formatExtensionStatusLine(new Map([["x", "hello"]]), 0), null);
assert.equal(formatExtensionStatusLine(new Map([["z", "last"], ["a", "first\n\t value"]]), 100), "first value  last");
const colored = "\x1b[32mCodex 7d:64% left\x1b[0m";
assert.equal(formatExtensionStatusLine(new Map([["codex", colored]]), 100), colored);
for (const width of [1, 2, 10, 30, 50, 100]) {
 const line = formatExtensionStatusLine(new Map([["codex", "Codex 5h:81% left 7d:64% left ▸ 漢字"]]), width);
 assert.ok(line !== null && measureWidth(line) <= width);
}

// Exercise the real renderer: existing lines stay identical, statuses are
// picked up on subsequent renders, and removal restores the two-line footer.
const handlers = new Map();
footer({ on: (name: string, handler: any) => handlers.set(name, handler) } as any);
let component: any;
const statuses = new Map<string, string>();
const ctx = {
 cwd: "/tmp", mode: "tui", thinkingLevel: "medium",
 model: { provider: "openai-codex", id: "test", contextWindow: 100000 },
 getContextUsage: () => ({ percent: 10, contextWindow: 100000 }),
 sessionManager: { getEntries: () => [] },
 ui: { setFooter: (factory: any) => {
  component = factory({ requestRender() {} }, { fg: (_color: string, text: string) => text }, {
   getGitBranch: () => null,
   getExtensionStatuses: () => statuses,
   onBranchChange: () => () => {},
  });
 } },
};
handlers.get("session_start")({}, ctx);
const original = component.render(150);
assert.equal(original.length, 2);
statuses.set("codex", "Codex 7d:64% left");
const withStatus = component.render(150);
assert.deepEqual(withStatus.slice(0, 2), original);
assert.equal(withStatus[2], "Codex 7d:64% left");
statuses.clear();
assert.deepEqual(component.render(150), original);
component.dispose();
handlers.get("session_shutdown")();
console.log("Extension status tests passed");
