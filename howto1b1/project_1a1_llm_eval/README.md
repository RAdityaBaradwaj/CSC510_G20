# 1a1 LLM Evaluation Kit

**Date:** 2025-09-03

This kit helps you:
1) Read and incorporate web-based supplemental materials (health & food-tax regulations).
2) Triple your **use case** list.
3) Compare **zero-shot vs careful prompting** across **ChatGPT** and **Claude**.
4) Ask both LLMs what’s **missing** in your 1a1 deliverables.

## Folder Map
```
project_1a1_llm_eval/
├── data/
│   ├── supplementals/          # Put downloaded PDFs/HTML notes here (FDA Food Code, state tax guidance, etc.)
│   └── last_week/              # Drop last week's deliverables: use_cases.md, stakeholder_map.md, etc.
├── prompts/                    # Copy-paste these into ChatGPT/Claude
├── results/                    # Paste model outputs here
├── evaluation/                 # Checklists and spreadsheets for comparisons
├── scripts/                    # How to run via UI/APIs (optional)
└── use_cases/                  # Expanded list we generate today
```

## Quickstart (15–30 min)
1. **Drop your docs** into `data/last_week/` (your use cases, stakeholder notes).
2. **Download supplemental regs** (see Step 1 in `scripts/step_by_step.md`) and put them in `data/supplementals/`.
3. Open `prompts/` and use the **Zero‑shot** then **Careful** prompts in ChatGPT and Claude.
4. Save outputs in `results/` and run the checklist in `evaluation/checklist.md`.
5. Compare the two models and pick the best ideas to merge into `use_cases/expanded_use_cases.md`.
