# Use Case Primer (Concise)

**Definition.** A *use case* describes how an **actor** achieves a **goal** with the system. It focuses on *observable behavior* and *value delivered*, not internal implementation.

**Template.**
- **ID/Title:** UC-### — Short, verb-y name
- **Primary Actor:** (customer, courier, restaurant staff, admin, tax engine, inspector)
- **Stakeholders & Interests:** who cares and why
- **Preconditions:** what must be true before starting
- **Postconditions (Success Guarantees):** what’s true afterward
- **Main Success Scenario (Basic Flow):** numbered steps 1..N
- **Alternate/Exception Flows:** labeled A1, E1, etc., branching from steps
- **Business Rules / Regulations:** any cited rule (e.g., FDA Food Code section, state tax rule)
- **Open Questions / Risks:** what to validate

**Example.**
- **ID/Title:** UC-014 — Capture Allergen Disclosures for Menu Items
- **Primary Actor:** Restaurant owner
- **Stakeholders & Interests:** diners w/ allergies (safety), restaurant (compliance), platform (trust)
- **Preconditions:** Menu exists; owner authenticated.
- **Postconditions:** Each item lists allergens; allergen data propagates to consumer UI and receipts.
- **Main Success Scenario:**
  1. Owner opens Menu Manager.
  2. For each item, owner selects applicable allergens (e.g., sesame, nuts) from the platform’s list.
  3. System validates entries and flags inconsistencies (e.g., “tahini” implies sesame).
  4. Owner saves changes.
  5. System publishes updated menu; consumer app displays allergens.
- **Alternate/Exception Flows:**
  - **A1 (Bulk import):** Owner uploads CSV; system maps columns and highlights missing fields.
  - **E1 (Unknown ingredient):** Owner marks “unknown”; system requires follow-up before listing.
- **Business Rules / Regulations:** Must include sesame labeling per FASTER Act; display before checkout.
- **Open Questions / Risks:** How to handle cross-contact warnings and restaurants adding sesame to avoid cross-contamination workflows?

**Rubric (for the model).** Good use cases are *goal-oriented*, *testable*, *non-overlapping*, and *traceable* to stakeholders & regulations. Bad use cases are *UI clicks*, *internal implementation*, or *epics* (too big).
