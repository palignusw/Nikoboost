<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Focused maintenance

Start with the files directly relevant to the requested change. Read related imports or consumers only when needed; avoid scanning or rereading the whole project for local work. Keep dungeon lessons, playback, styles and editable mechanic data isolated in their own modules. Use targeted local checks; rely on the required CI workflow for the full regression suite. Keep tool output and progress reports concise.
