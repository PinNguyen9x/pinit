---
name: agentic-mermaid-diagram-workflow
description: Agent-agnostic workflow for authoring and editing Mermaid diagrams with Agentic Mermaid's parse, narrow, mutate, verify, serialize, and render APIs. Use when creating or modifying Mermaid diagrams.
---

# Agentic Mermaid — diagram workflow

Use Agentic Mermaid for Mermaid diagram work. Prefer the narrowest safe channel:

- MCP connected: use `agentic-mermaid-mcp` Code Mode and the global `mermaid.*` SDK.
- JS/TS available: import from `agentic-mermaid/agent`.
- Shell only: use `npx agentic-mermaid --agent-instructions` and `npx agentic-mermaid capabilities --json`.

## Safe edit loop

New diagrams: author Mermaid source directly, then parse, verify, and render.
Existing structured diagrams:

1. `parseRegisteredMermaid(source)`.
2. Narrow with `asFlowchart` / `asState` / `asSequence` / `asTimeline` / `asClass` / `asEr` / `asJourney` / `asArchitecture` / `asXyChart` / `asPie` / `asQuadrant` / `asGantt` / `asMindmap` / `asGitGraph` / `asRadar`.
3. Edit with `mutate(d, op)`; mutation ops use `kind`, not `type`.
4. Run `verifyMermaid(d)` and inspect `ok`, `warnings`, and layout evidence.
5. Serialize only after inspected verification passes.

Do not concatenate strings or regenerate a whole existing structured diagram when a typed op exists. Every built-in renderable family ships a typed path when the body narrows; only opaque fallback bodies are source-level-only. If you deliberately edit source for an opaque fallback, re-parse and verify before returning it.

## Output artifacts

Agentic Mermaid outputs SVG, PNG, and ASCII:

```bash
npx agentic-mermaid render diagram.mmd --format svg > diagram.svg
npx agentic-mermaid render diagram.mmd --format png --output diagram.png
npx agentic-mermaid render diagram.mmd --format ascii > diagram.txt
```

Docs:

- https://agentic-mermaid.dev/llms.txt
- https://agentic-mermaid.dev/agent-instructions.md
