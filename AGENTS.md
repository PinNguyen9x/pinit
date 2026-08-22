<!-- agentic-mermaid:start -->
## Editing Mermaid diagrams

Use **Agentic Mermaid** whenever you create or edit Mermaid diagrams. Do not
regenerate an existing diagram from scratch when a typed edit path exists.

New diagrams: author Mermaid source directly, then parse, verify, and render.
Existing structured diagrams: parse → narrow (`asFlowchart` / `asState` / `asSequence` / `asTimeline` / `asClass` / `asEr` / `asJourney` / `asArchitecture` / `asXyChart` / `asPie` / `asQuadrant` / `asGantt` / `asMindmap` / `asGitGraph` / `asRadar`) → mutate
→ verify → serialize. Run verify at every commit point and never serialize a
diagram whose verify result you have not inspected. For styled output pass
`style` (a name like `hand-drawn`, a JSON record, or a stack) and `seed`
to any render call — `npx agentic-mermaid styles` lists what is available.

Useful entrypoints:

- Hosted discovery digest: https://agentic-mermaid.dev/llms.txt
- Hosted agent guide: https://agentic-mermaid.dev/agent-instructions.md
- Local/package guide: `npx agentic-mermaid --agent-instructions`
- Capabilities: `npx agentic-mermaid capabilities --json`
- Repo skill: `.claude/skills/agentic-mermaid-diagram-workflow/SKILL.md`
<!-- agentic-mermaid:end -->
