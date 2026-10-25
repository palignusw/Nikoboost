<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Focused maintenance

Start with the files directly relevant to the requested change. Read related imports or consumers only when needed; avoid scanning or rereading the whole project for local work. Keep dungeon lessons, playback, styles and editable mechanic data isolated in their own modules. Verification policy requested by the project owner:

- Small changes: inspect only affected files and run only relevant lint/tests. Do not run a production build unless the change warrants it.
- Large changes: check TypeScript and relevant tests; run a production build before completion when justified by the scope.
- When a check fails, fix that issue and rerun the failed or affected check. Do not repeat checks that already passed unless subsequent changes invalidate them.
- For UI changes, verify both mobile and desktop layouts.
- Check GitHub Actions only at meaningful milestones; do not poll frequently. Preserve correctness and quality while minimizing unnecessary tool calls and context.
- Read and print only the relevant error lines or a short log tail, never entire large logs.
- Existing automatic GitHub CI may still run after a push. Do not manually start an extra full run for a small fix, and do not weaken or disable repository checks without an explicit request.

Keep tool output and progress reports concise.
