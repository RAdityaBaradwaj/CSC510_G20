# Running in Claude (UI)

1) Paste `prompts/use_case_primer.md` to prime the model.
2) Paste your bullet notes (from `data/supplementals/`).
3) Run `prompts/expand_zero_shot.txt` → save as `results/claude_zero_shot.md`.
4) Run `prompts/expand_careful.txt` → `results/claude_careful.md`.
5) Repeat with `find_gaps_*` prompts.

**Context window tips (Claude Sonnet 4):**
- 200K tokens typical; up to 1M via API/enterprise variants. Summarize long PDFs into bullets.
