# Running in ChatGPT (UI)

1) Open `prompts/use_case_primer.md` and paste it into a new chat.
2) Paste your **bullet notes** (from `data/supplementals/`) as CONTEXT.
3) Run `prompts/expand_zero_shot.txt` → save output to `results/chatgpt_zero_shot.md`.
4) Run `prompts/expand_careful.txt` → `results/chatgpt_careful.md`.
5) Repeat with `find_gaps_*` prompts.

**Context window tips (GPT-4.1 / 4o):**
- Prefer bullet summaries over full PDFs.
- If the message is long, split into *separate* messages in the same thread to avoid truncation.
