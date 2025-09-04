# Step-by-step: With-Me Playbook

> Follow these steps in order. Copy/paste the indicated prompts into ChatGPT and Claude.

---
## Step 1 — Gather and skim supplemental materials (health & food tax)
1. Download:
   - FDA Food Code 2022 (PDF) and the FDA page on the FASTER Act (sesame as the 9th allergen).
   - Your state’s Dept. of Revenue guidance on **prepared food** taxes and local **meal taxes**.
   - Marketplace facilitator rules for sales tax collection in your state.
   - Any recent city-level rules on delivery fee caps or “enhanced services” fees for delivery apps.

2. Save all files in `data/supplementals/` and make 5–10 bullet notes per source (what’s relevant for a food delivery system).

> Tip: In ChatGPT/Claude, paste your bullet notes **instead of** whole PDFs to avoid context-limit issues, then attach/link the PDFs only if you need exact quoting.

---
## Step 2 — Prime the models on “what is a use case”
Open each model and run **prompts/use_case_primer.md** first. This teaches the model the format and grading rubric we expect.

---
## Step 3 — Expand your use case list (x3)
1. Put your last-week file (e.g., `use_cases.md`) in `data/last_week/`.
2. Copy **prompts/expand_zero_shot.txt** into ChatGPT. Provide your bullet notes (Step 1) as CONTEXT.
3. Save output as `results/chatgpt_zero_shot.md`.
4. Repeat using **prompts/expand_careful.txt** → `results/chatgpt_careful.md`.
5. Repeat both prompts in Claude → `results/claude_zero_shot.md` and `results/claude_careful.md`.

---
## Step 4 — Ask the models “what’s missing?” in 1a1
Use **prompts/find_gaps_zero_shot.txt** and **prompts/find_gaps_careful.txt** with your last-week deliverables in context.
Save outputs to `results/` accordingly.

---
## Step 5 — Evaluate
Open `evaluation/checklist.md` and score each run. Log notable ideas in `evaluation/eval_template.csv`.

---
## Step 6 — Merge
Pick the best non-duplicative use cases and paste into `use_cases/expanded_use_cases.md`. Keep your canonical doc here.
