# Projects and Links

## Related repositories

| Project | Purpose | Repository |
|---|---|---|
| Luna framework | Workspace for Luna worker evaluations, reports, and framework tooling. | https://github.com/SPhillips1337/luna_framework |
| Glyph lab (in-repo) | Sister investigation: agent-facing code encoding / naming codec. | [`labs/glyph/`](labs/glyph/) · discovery [`labs/glyph/LINKS.md`](labs/glyph/LINKS.md) |
| Echoes of Aion | Mature-project operational pilot and earlier diplomacy evaluation target. | https://github.com/SPhillips1337/EchoesOfAion |
| HappyMonkeyAI | Organization attribution for this work. | https://github.com/HappyMonkeyAI |

## Explicitly referenced documentation and protocols

| Project / resource | Link | Context |
|---|---|---|
| Hermes Agent documentation | https://hermes-agent.nousresearch.com/docs | Authoritative documentation for Hermes configuration, operation, and extension. |
| AntigravityAgentsPromptProtocol | https://github.com/SPhillips1337/AntigravityAgentsPromptProtocol | Protocol referenced by Echoes of Aion's `AGENTS.md`. |
| AntigravityAgentsPromptProtocol bootstrap | https://github.com/SPhillips1337/AntigravityAgentsPromptProtocol/blob/main/BOOTSTRAP.md | Bootstrap guidance for the Antigravity protocol. |
| HappyMonkeyAI AgentsProtocol | https://github.com/HappyMonkeyAI/AgentsProtocol | Current AgentsProtocol referenced by the Echoes of Aion project. |
| HappyMonkeyAI AgentsProtocol bootstrap | https://raw.githubusercontent.com/HappyMonkeyAI/AgentsProtocol/main/BOOTSTRAP.md | Bootstrap guidance for the current AgentsProtocol. |

## Code-intelligence projects of interest

These projects were identified as examples of the emerging repository-intelligence / agent-code-navigation tooling category.

| Project | GitHub | Project site / documentation | Relevant capabilities |
|---|---|---|---|
| rag-rat | https://github.com/cq27-dev/rag-rat | https://rag-rat.cq27.dev | Repository indexing, symbol and graph navigation, impact-surface preflight, Git/GitHub history, and source-anchored repository memory via MCP. |
| srclight | https://github.com/srclight/srclight | https://srclight.dev/ | Local code indexing, symbol search, call/dependency relationships, build awareness, semantic search, and MCP access. |
| srclight Claude Code plugin | https://github.com/srclight/claude-code-plugin | — | Plugin and workflow integration for structural code understanding through srclight MCP tools. |

## Related foundations referenced in the category discussion

| Project / standard | Link | Relevance |
|---|---|---|
| Tree-sitter | https://github.com/tree-sitter/tree-sitter | Incremental parsing and syntax trees used by repository-indexing tools. |
| SCIP | https://github.com/sourcegraph/scip | Language-independent code-intelligence index format for compiler-grade symbol relationships. |
| Model Context Protocol | https://github.com/modelcontextprotocol | Tool and context interface used to expose repository intelligence to agents. |

## Evaluation artifacts

| Artifact | Path / link | Context |
|---|---|---|
| Luna worker evaluation report | [`luna-worker-evaluation-report.md`](luna-worker-evaluation-report.md) | Report on the `gpt-5.6-luna` / `openai-codex` bounded worker evaluation. |
| Accepted-peace regression test | `EchoesOfAion/packages/server/tests/turn-resolution/turn-pipeline.test.ts` | Test added during the evaluation (in Echoes of Aion). |
| Luna/Terra pilot evaluation ledger | `EchoesOfAion/.agent/evaluations/2026-09-luna-terra-pilot.md` | Primary record of the bounded model-routing evaluations and their evidence. |
| Agent-legible architecture pilot plan | `EchoesOfAion/.hermes/plans/2026-09-16_140000-agent-legible-architecture-pilot.md` | Design and implementation plan for the repository support layer. |
| Luna/Terra evaluation task packets | `EchoesOfAion/.agent/tasks/` | Individual bounded task objectives, constraints, acceptance criteria, and handoffs. |

## Route details

- Model: `gpt-5.6-luna`
- Provider: `openai-codex`
- Evaluation branch: `feature/aion-phase3`

## Maintenance

Add new projects or references as they are explicitly introduced. Prefer public repository URLs over machine-local paths.
