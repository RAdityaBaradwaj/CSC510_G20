# Expanded Use Cases (Food Delivery System)

> Seeded from FDA Food Code, allergen labeling (FASTER Act), marketplace facilitator & state/local tax guidance, and city-level fee regulations.

## Health & Safety Compliance
1. **Allergen Disclosure Management** — Restaurant maintains item-level allergens incl. sesame; system enforces display before checkout.
2. **Cross-Contact Warning Workflow** — Flag kitchens with cross-contact risk; surface warnings in cart and on receipt.
3. **Ingredient Provenance Tracking** — Capture supplier & lot for high‑risk ingredients; expose to regulators on request.
4. **Temperature Control Check-in** — Couriers confirm insulated storage and pickup temp for TCS foods; exceptions trigger discard rule.
5. **Food Recall Propagation** — Platform ingests FDA/USDA recalls; auto‑unlist impacted items and notify affected customers.
6. **Sanitation Certificate Verification** — Sync restaurant permits/inspection grades; block menu publishing if expired.
7. **Allergen Filtered Search** — Customers filter menus by excluded allergens; search respects restaurant disclosures.
8. **Menu Change Compliance Review** — New/edited items route through a compliance checklist (allergens, raw/undercooked advisory).

## Taxes, Fees & Jurisdictions
9. **Prepared Food Tax Computation** — Calculate state+local prepared‑meal taxes; show pre‑purchase and on receipts.
10. **Marketplace Facilitator Remittance** — Platform collects/remits where required; merchant statements break out amounts.
11. **Delivery Fee Cap Compliance** — Enforce city-specific caps or “enhanced services” rules; validate fee bundles at checkout.
12. **Bag/Disposable Fee Handling** — Add per-bag or eco fees where applicable; show opt-outs if allowed by law.
13. **Tax Sourcing by Delivery Address** — Determine situs for delivery vs pickup; handle mixed baskets.
14. **Exemptions & Holidays** — Apply tax holidays/exemptions; log rule version used for audits.
15. **Tips & Service Charges Taxability** — Correctly tax tips vs mandatory service charges per jurisdiction.
16. **Merchant Type Overrides** — Grocery vs restaurant vs alcohol seller determine rates and disclosures.

## Ordering & Fulfillment
17. **Verified Substitutions for Allergens** — Suggest safe substitutions and require customer confirmation.
18. **Pickup vs Delivery Safety Guidance** — Provide holding time advice; warn on items exceeding safe transport windows.
19. **Courier Allergy Awareness** — Allow couriers to opt out of allergen-heavy deliveries; safety training acknowledgment.
20. **Contactless Delivery Disclosures** — Ensure safe handoff instructions (e.g., avoiding pet/allergen exposure at door).
21. **Out-of-Stock Safety Handling** — Prevent auto-substituting high-risk allergen items without explicit consent.
22. **Receipt-Level Disclosures** — Include allergens, reheating/storage guidance, and tax breakdown on digital receipts.

## Governance, Audit & Support
23. **Regulatory Audit Export** — One-click export of logs: menu changes, tax rule versions, delivery temps, warnings shown.
24. **Customer Safety Incident Intake** — Triage allergen or illness reports; auto-link orders and notify restaurants.
25. **Restaurant Compliance Dashboard** — Track certificates, inspection results, flagged items, and corrective actions.
26. **Rule Versioning & Replay** — Keep an immutable ledger of which tax/health rules applied at the time of order.
27. **Support Playbooks for Recalls** — Guided workflows for customer support during active recalls.

## Accessibility & Transparency
28. **Plain-Language Allergen Notices** — Localized, readable warnings with icons; screen-reader friendly.
29. **Nutrition & Calorie Display (where required)** — Pull nutrition data and present per jurisdictional requirements.
30. **Consent for Data Sharing with Regulators** — Obtain and log merchant consent for sharing inspection-related data.
31. **User Data Export for Health Incidents** — Allow customers to request their order + allergen-evidence bundle.

## Risk & Fraud
32. **Receipt Tampering Detection** — Detect merchant edits that remove allergen declarations after listing.
33. **Courier Equipment Compliance** — Verify possession of insulated bags for hot/cold transport; suspend if non-compliant.
34. **Policy Abuse for Fee Caps** — Detect circumvention (e.g., relabeling fees as “enhanced services”) and block.

## Developer & Ops
35. **Schema Enforcement for Menu Allergens** — Validate API/CSV uploads against controlled vocab (incl. sesame synonyms).
36. **Simulated Tax Sandbox** — Replay orders across jurisdictions to validate tax outcomes before launch.
