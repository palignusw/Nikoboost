import { parseDocument } from "htmlparser2";
type AnyNode = ReturnType<typeof parseDocument>["children"][number];

export type NoteLine = { text: string; path: string[] };
export type NoteSection = { title: string; date: string | null; lines: NoteLine[] };
const otherEdition = /\bclassic\b|season of discovery|\bhardcore\b|\banniversary\b|\bforever\b/i;
const dateHeading = /^(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, 20\d{2}$/;
const blocked = new Set(["script", "style", "iframe", "object", "embed", "svg", "math", "form", "template", "noscript", "aside"]);
const children = (node: AnyNode): AnyNode[] => "children" in node ? node.children : [];
const tag = (node: AnyNode) => "name" in node ? node.name : "";
function text(node: AnyNode, omitLists = false, depth = 0): string {
  if (depth > 32) throw new Error("Notes text too deeply nested");
  if (blocked.has(tag(node)) || (omitLists && /^(ul|ol)$/.test(tag(node)))) return "";
  if (node.type === "text") return node.data;
  if (tag(node) === "br") return " ";
  return children(node).map((n) => text(n, omitLists, depth + 1)).join("");
}
const clean = (value: string) => value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").replace(/\s+/g, " ").trim();

/** Convert source markup to plain data. No source HTML, URLs, attributes or scripts reach React. */
export function parseMidnightContent(html: string, kind: "patch" | "hotfix"): NoteSection[] {
  const doc = parseDocument(html, { decodeEntities: true });
  const sections: NoteSection[] = [];
  let date: string | null = null;
  let excluded = false;
  let current: NoteSection | null = null;
  let visited = 0;
  const section = (title: string) => {
    current = { title, date, lines: [] };
    sections.push(current);
  };
  const add = (value: string, path: string[] = []) => {
    const valueText = clean(value);
    if (!current || excluded || !valueText || /^developers?[’']?\s*(?:notes?|comments?)\s*:/i.test(valueText)) return;
    current.lines.push({ text: valueText, path });
  };
  const list = (node: AnyNode, path: string[], depth: number) => {
    if (depth > 24 || ++visited > 50000) throw new Error("Notes structure too complex");
    for (const item of children(node)) {
      if (tag(item) !== "li") continue;
      const label = clean(text(item, true));
      const nested = children(item).filter((n) => /^(ul|ol)$/.test(tag(n)));
      // Edition-specific subsections can also be nested inside a shared category.
      if (otherEdition.test(label) && label.length < 120) continue;
      if (nested.length) {
        const isLabel = label.length < 120 && !/[.!?]$/.test(label);
        if (!isLabel) add(label, path);
        for (const sub of nested) list(sub, isLabel && label ? [...path, label] : path, depth + 1);
      } else add(label, path);
    }
  };
  const walk = (nodes: AnyNode[], depth = 0) => {
    if (depth > 24) throw new Error("Notes structure too deep");
    for (const node of nodes) {
      if (++visited > 50000) throw new Error("Notes structure too complex");
      const name = tag(node);
      if (blocked.has(name)) continue;
      const value = clean(text(node));
      if (!value) continue;
      if (/^(h[1-6]|p)$/.test(name)) {
        if (dateHeading.test(value)) { date = value; excluded = false; current = null; continue; }
        const heading = /^h[1-6]$/.test(name) || (kind === "hotfix" && children(node).some((n) => tag(n) === "strong"));
        if (heading) {
          if (/table of contents|new updates are highlighted|^hotfixes$/i.test(value)) continue;
          if (otherEdition.test(value)) { excluded = true; current = null; continue; }
          if (/^(?:world of warcraft:?\s*)?midnight$/i.test(value)) { excluded = false; continue; }
          if (!excluded) section(value);
        } else if (kind === "patch") add(value);
      } else if (/^(ul|ol)$/.test(name)) {
        if (!excluded && current) list(node, [], depth + 1);
      } else if (name === "table") {
        const rows = (ns: AnyNode[]) => { for (const n of ns) { if (tag(n) === "tr") add(children(n).filter((c) => /^(td|th)$/.test(tag(c))).map((c) => clean(text(c))).join(" · ")); else rows(children(n)); } };
        rows(children(node));
      } else if (!children(node).some((n) => /^h[1-6]$/.test(tag(n)) && /table of contents/i.test(clean(text(n))))) walk(children(node), depth + 1);
    }
  };
  walk(doc.children);
  return sections.filter((s) => s.lines.length > 0);
}
