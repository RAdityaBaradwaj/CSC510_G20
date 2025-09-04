
# CSC 510 — Project 1b1  
**Food Delivery System: Problem Amplification**

**Group 20**  
- Aanand Sreekumaran Nair Jayakumari  
- Sanjana Chandrashekar  
- Aditya Baradwaj Rajan  

---

## Core Platform Flows (UC1–UC10)

---

**UC1 – Sign Up / Verify Account**

* **Primary Actor:** Customer
* **Stakeholders & Interests:** Customer (access), Platform Admin (fraud prevention)
* **Preconditions:** Valid phone/email; internet access.
* **Postconditions:** Account created and verified.
* **Main Success Scenario:**

  1. Customer selects “Sign Up.”
  2. System collects details (phone, email, password, or SSO).
  3. Verification code sent.
  4. Customer enters code; system validates.
  5. Account activated and logged.
* **Alternate Flow:** A1 – Social sign-in (Google/Apple).
* **Exception:** E1 – Invalid code → resend allowed.
* **Business Rules:** PCI DSS identity verification requirements.

---

**UC2 – Manage Addresses / Delivery Preferences**

* **Primary Actor:** Customer
* **Stakeholders & Interests:** Customer (convenience), Courier (routing), Platform (coverage compliance)
* **Preconditions:** User authenticated.
* **Postconditions:** Address saved with preferences.
* **Main Success Scenario:**

  1. Customer adds address.
  2. System geocodes and validates coverage.
  3. Customer sets labels and instructions (e.g., gate code).
  4. Address stored with preferences.
* **Alternate Flow:** A1 – Ambiguous address → system requests landmarks.
* **Exception:** E1 – Address out of service area → error message.
* **Business Rules:** Geofencing and service coverage rules.

---

**UC3 – Browse Restaurants / Menus**

* **Primary Actor:** Customer
* **Stakeholders & Interests:** Customer (choice), Restaurant (exposure), Platform Ads/Search (revenue)
* **Preconditions:** Customer set a valid delivery address.
* **Postconditions:** Menus shown with availability and fees.
* **Main Success Scenario:**

  1. Customer opens app.
  2. System filters restaurants by location and hours.
  3. Customer applies filters (price, cuisine, dietary).
  4. Menu displayed with fees, ETA, ratings.
* **Alternate Flow:** A1 – Restaurant offline → hide.
* **Exception:** E1 – Item unavailable → suggest substitute.
* **Business Rules:** Transparency laws for menu/fees.

---

**UC4 – Build Cart / Customize Items**

* **Primary Actor:** Customer
* **Stakeholders & Interests:** Customer (customization), Restaurant (order accuracy)
* **Preconditions:** Menu open.
* **Postconditions:** Cart finalized with totals.
* **Main Success Scenario:**

  1. Customer selects item and options.
  2. System updates price dynamically.
  3. Customer adds multiple items.
  4. Taxes and fees calculated.
  5. Cart total displayed.
* **Alternate Flow:** A1 – Conflicting options → prompt resolution.
* **Exception:** E1 – Cart minimum not met → suggest add-ons.
* **Business Rules:** Menu consistency with restaurant POS.

---

**UC5 – Apply Promotions / Fees Disclosure**

* **Primary Actor:** Customer
* **Stakeholders & Interests:** Customer (savings), Marketing (promotion use), Finance (correct fee application)
* **Preconditions:** Cart contains items.
* **Postconditions:** Discounts and fees applied.
* **Main Success Scenario:**

  1. Customer applies coupon or system auto-applies promo.
  2. System recalculates subtotal, fees, and taxes.
  3. Customer reviews transparent fee breakdown.
* **Alternate Flow:** A1 – Promo ineligible → error message.
* **Exception:** E1 – Conflicting promos → apply best eligible.
* **Business Rules:** Fee disclosure regulations.

---

**UC6 – Checkout / Payment**

* **Primary Actor:** Customer
* **Stakeholders & Interests:** Customer (order placed), Payment Processor (authorization), Finance (settlement)
* **Preconditions:** Validated cart.
* **Postconditions:** Order placed, payment authorized.
* **Main Success Scenario:**

  1. Customer chooses delivery time.
  2. Selects payment method.
  3. System authorizes payment.
  4. Order confirmed and logged.
* **Alternate Flow:** A1 – Save payment method on file.
* **Exception:** E1 – Payment fails → retry or alternate method.
* **Business Rules:** PCI DSS compliance.

---

**UC7 – Restaurant Accepts / Prepares Order**

* **Primary Actor:** Restaurant Staff
* **Stakeholders & Interests:** Restaurant (prep workflow), Customer (order accuracy), Courier (pickup readiness)
* **Preconditions:** Order routed to restaurant.
* **Postconditions:** Order prepared and marked ready.
* **Main Success Scenario:**

  1. Restaurant receives order on tablet.
  2. Staff accept with estimated prep time.
  3. Kitchen prepares order.
  4. Staff pack and seal order.
  5. Status updated to “Ready for Pickup.”
* **Alternate Flow:** A1 – Out-of-stock item → replacement offered.
* **Exception:** E1 – No response from restaurant → cancel/refund.
* **Business Rules:** Food handling and allergen disclosure compliance.

---

**UC8 – Dispatch / Courier Pickup**

* **Primary Actor:** Courier
* **Stakeholders & Interests:** Courier (earnings), Customer (timely delivery), Platform (logistics)
* **Preconditions:** Restaurant accepted order.
* **Postconditions:** Courier assigned and order picked up.
* **Main Success Scenario:**

  1. System assigns courier by proximity and rating.
  2. Courier navigates to restaurant.
  3. Verifies pickup code.
  4. Collects sealed order.
  5. Updates status to “Picked up.”
* **Alternate Flow:** A1 – Stacked deliveries grouped.
* **Exception:** E1 – Courier cancels → reassign.
* **Business Rules:** Courier compliance and pickup verification rules.

---

**UC9 – Delivery / Proof of Delivery**

* **Primary Actor:** Courier
* **Stakeholders & Interests:** Customer (delivery), Courier (proof for pay), Platform (dispute resolution)
* **Preconditions:** Courier picked up order.
* **Postconditions:** Delivery confirmed and logged.
* **Main Success Scenario:**

  1. Courier follows optimized route.
  2. Arrives at address.
  3. Hands off order.
  4. Captures proof (photo/signature/code).
  5. Status set to “Delivered.”
* **Alternate Flow:** A1 – Contactless delivery photo only.
* **Exception:** E1 – Customer unreachable → escalate to support.
* **Business Rules:** Proof of delivery requirements.

---

**UC10 – Cancellations / Refunds / Post-Order Support**

* **Primary Actor:** Customer
* **Stakeholders & Interests:** Customer (resolution), Support (case handling), Finance (refund accuracy)
* **Preconditions:** Order exists.
* **Postconditions:** Refund/credit applied or support case closed.
* **Main Success Scenario:**

  1. Customer reports cancellation/issue.
  2. System validates order status and telemetry.
  3. Refund/credit offered automatically.
  4. Case logged for QA.
* **Alternate Flow:** A1 – Partial refund applied.
* **Exception:** E1 – Fraud suspected → escalate to manual review.
* **Business Rules:** Consumer protection and refund laws.

---

## Health & Safety Compliance (UC11–UC18)

---

**UC11 – Capture Allergen Disclosures**

* **Primary Actor:** Restaurant Owner
* **Stakeholders & Interests:** Diners (safety), Regulators (compliance), Platform (trust)
* **Preconditions:** Menu exists; owner authenticated.
* **Postconditions:** Each item lists allergens; disclosures shown to customers.
* **Main Success Scenario:**

  1. Owner opens Menu Manager.
  2. Selects menu item.
  3. Tags allergens (nuts, sesame, etc.).
  4. System validates mapping.
  5. Owner saves; platform updates menu.
* **Alternate Flows:** A1 – Bulk CSV import with auto-mapping.
* **Exception:** E1 – Unknown ingredient flagged → listing blocked.
* **Business Rules:** FASTER Act requires sesame labeling.

---

**UC12 – Record Cross-Contact Mitigation**

* **Primary Actor:** Restaurant Staff
* **Stakeholders & Interests:** Diners (safety), Regulators (oversight)
* **Preconditions:** Menu items exist.
* **Postconditions:** Cross-contact precautions logged.
* **Main Success Scenario:**

  1. Staff open compliance checklist.
  2. Select prep area.
  3. Record equipment segregation & cleaning.
  4. Submit entry.
  5. System displays warnings to customers.
* **Alternate Flow:** Default “not segregated” → stronger advisory.
* **Exception:** Missing entry → block menu publishing.
* **Business Rules:** FDA Food Code allergen handling.

---

**UC13 – Courier Hot/Cold Holding Compliance**

* **Primary Actor:** Courier
* **Stakeholders & Interests:** Diners (safe temps), Restaurant (brand), Platform (liability)
* **Preconditions:** Order contains temp-sensitive items.
* **Postconditions:** Proof of insulated bag logged.
* **Main Success Scenario:**

  1. Courier receives pickup prompt.
  2. Confirms insulated bag use.
  3. Uploads photo proof.
  4. System records compliance.
  5. Delivery proceeds.
* **Alternate Flow:** IoT probe auto-verifies.
* **Exception:** Courier fails to confirm → reassignment triggered.
* **Business Rules:** FDA Food Code food holding.

---

**UC14 – Display Consumer Advisories**

* **Primary Actor:** Customer
* **Stakeholders & Interests:** Diners (risk awareness), Regulators (compliance)
* **Preconditions:** Cart includes raw/undercooked item.
* **Postconditions:** Advisory acknowledged before payment.
* **Main Success Scenario:**

  1. System scans cart at checkout.
  2. Advisory modal displayed.
  3. Customer confirms.
  4. Consent logged.
* **Alternate Flow:** Advisory displayed in local language.
* **Exception:** Customer declines → checkout blocked.
* **Business Rules:** FDA Food Code consumer advisory.

---

**UC15 – Suspend Restaurant on Failed Inspection**

* **Primary Actor:** Platform Admin
* **Stakeholders & Interests:** Regulators (oversight), Diners (safety), Platform (compliance)
* **Preconditions:** Inspection result received.
* **Postconditions:** Restaurant listing suspended.
* **Main Success Scenario:**

  1. System ingests inspection result.
  2. Flags failure.
  3. Admin notified.
  4. Restaurant paused on platform.
* **Alternate Flow:** Auto-reinstatement upon pass.
* **Exception:** Disputed inspection record → manual review.
* **Business Rules:** WAC 246-215 inspection enforcement.

---

**UC16 – Log Food Donation Events**

* **Primary Actor:** Restaurant Manager
* **Stakeholders & Interests:** Community Orgs (supply), Regulators (traceability), Platform (sustainability)
* **Preconditions:** Restaurant enrolled in donation program.
* **Postconditions:** Donation record stored.
* **Main Success Scenario:**

  1. Manager logs donation.
  2. Selects items/quantities.
  3. Chooses recipient.
  4. System validates eligibility.
  5. Record stored, receipt issued.
* **Alternate Flow:** Auto-suggest expiring items.
* **Exception:** Ineligible recipient → record blocked.
* **Business Rules:** Local/state donation rules.

---

**UC17 – Capture Sanitation Attestations**

* **Primary Actor:** Restaurant Manager
* **Stakeholders & Interests:** Diners (confidence), Regulators (oversight), Platform (trust)
* **Preconditions:** Restaurant profile active.
* **Postconditions:** Attestation logged, badge displayed.
* **Main Success Scenario:**

  1. Manager completes sanitation checklist.
  2. Uploads photo proof.
  3. Submits attestation.
  4. Platform validates and displays compliance badge.
* **Alternate Flow:** Quarterly reminders triggered.
* **Exception:** No submission → badge removed.
* **Business Rules:** FDA Food Code sanitation compliance.

---

**UC18 – Approve Food Safety Plan**

* **Primary Actor:** Health Regulator Reviewer
* **Stakeholders & Interests:** Regulators (oversight), Platform (compliance), Restaurants (approval)
* **Preconditions:** Restaurant onboarding.
* **Postconditions:** Approved/rejected plan stored.
* **Main Success Scenario:**

  1. Owner uploads SOP.
  2. System checks required sections.
  3. Reviewer evaluates.
  4. Decision logged.
  5. Platform gates listing.
* **Alternate Flow:** Reviewer requests minor edits.
* **Exception:** Missing section → auto-reject.
* **Business Rules:** WAC 246-215 plan review.

---

## Taxes & Fees (UC19–UC25)

---

**UC19 – Apply Prepared Food Tax**

* **Primary Actor:** Tax Engine
* **Stakeholders & Interests:** Customers (accuracy), Tax Authority (compliance)
* **Preconditions:** Basket finalized; jurisdiction resolved.
* **Postconditions:** Correct tax applied.
* **Main Success Scenario:**

  1. Tax engine determines jurisdiction.
  2. Classifies items.
  3. Applies local rate.
  4. Displays breakdown.
  5. Stores audit trail.
* **Alternate Flow:** Use cached rates if API down.
* **Exception:** Ambiguous address → prompt user.
* **Business Rules:** State/local food tax rules.

---

**UC20 – Remit Marketplace Facilitator Taxes**

* **Primary Actor:** Finance Team
* **Stakeholders & Interests:** Tax Authorities (collection), Restaurants (liability transfer)
* **Preconditions:** Taxes collected.
* **Postconditions:** Taxes remitted per jurisdiction.
* **Main Success Scenario:**

  1. Aggregate taxable orders.
  2. Generate remittance file.
  3. Submit via state portal.
  4. Confirmation logged.
* **Alternate Flow:** On-demand reports for audits.
* **Exception:** Missing jurisdiction mapping.
* **Business Rules:** Marketplace facilitator laws.

---

**UC21 – Enforce City Fee Caps**

* **Primary Actor:** Checkout Service
* **Stakeholders & Interests:** Customers (fair pricing), City Governments (compliance), Platform (liability)
* **Preconditions:** Cart ready.
* **Postconditions:** Fees capped at legal max.
* **Main Success Scenario:**

  1. Detect city fee cap rule.
  2. Compare fees.
  3. Enforce cap.
  4. Display adjusted fees.
* **Alternate Flow:** Auto-load updated caps.
* **Exception:** Fee cap conflict flagged.
* **Business Rules:** City ordinances.

---

**UC22 – Apply Bag & Packaging Fees**

* **Primary Actor:** Checkout Service
* **Stakeholders & Interests:** Customers (transparency), Regulators (environmental)
* **Preconditions:** Order includes packaging.
* **Postconditions:** Fee applied and displayed.
* **Main Success Scenario:**

  1. System detects bag usage.
  2. Applies per-bag fee.
  3. Adds to subtotal.
  4. Shows on receipt.
* **Alternate Flow:** Estimate bag count auto-adjusted.
* **Exception:** Fee table missing → log error.
* **Business Rules:** State/local packaging fee rules.

---

**UC23 – Delivery Zone Surcharges**

* **Primary Actor:** Checkout Service
* **Stakeholders & Interests:** Customers (clarity), Regulators (compliance), Platform (revenue)
* **Preconditions:** Address entered.
* **Postconditions:** Surcharge applied.
* **Main Success Scenario:**

  1. System maps address to zone.
  2. Applies surcharge if applicable.
  3. Updates total.
  4. Stores for reporting.
* **Alternate Flow:** Waived via promo.
* **Exception:** Zone unidentified → escalate.
* **Business Rules:** Delivery zoning ordinances.

---

**UC24 – Audit Vendor Shelf Prices**

* **Primary Actor:** Platform Analyst
* **Stakeholders & Interests:** Regulators (monitoring), Merchants (fair pricing), Platform (auditability)
* **Preconditions:** Monitoring cycle open.
* **Postconditions:** Shelf prices recorded.
* **Main Success Scenario:**

  1. Analyst issues price request.
  2. Merchant submits list.
  3. System validates.
  4. Data stored for audits.
* **Alternate Flow:** API ingestion from POS.
* **Exception:** No submission → flag violation.
* **Business Rules:** WIC monitoring requirements.

---

**UC25 – Track WIC/SNAP Eligible Items**

* **Primary Actor:** Compliance Service
* **Stakeholders & Interests:** Customers (benefits access), Regulators (program integrity), Platform (compliance)
* **Preconditions:** Merchant onboarded, catalog available.
* **Postconditions:** Eligible items flagged.
* **Main Success Scenario:**

  1. System maps catalog to WIC/SNAP list.
  2. Marks eligible items.
  3. Enforces tender restrictions.
  4. Exports compliance reports.
* **Alternate Flow:** Auto-update when SKUs change.
* **Exception:** Item no longer eligible → flag.
* **Business Rules:** Federal SNAP/WIC guidelines.

---

## Operations & Governance (UC26–UC30)

---

**UC26 – Onboard New Restaurant with Permit Verification**

* **Primary Actor:** Platform Admin
* **Stakeholders & Interests:** Restaurants (approval), Regulators (permits), Platform (liability)
* **Preconditions:** Merchant applies.
* **Postconditions:** Restaurant approved or rejected.
* **Main Success Scenario:**

  1. Merchant submits application.
  2. Uploads permits/licenses.
  3. System validates.
  4. Admin reviews.
  5. Restaurant published if approved.
* **Alternate Flow:** API validation with business registry.
* **Exception:** Expired permit → reject.
* **Business Rules:** Local licensing requirements.

---

**UC27 – Manage DFDO Exemptions**

* **Primary Actor:** Restaurant Owner
* **Stakeholders & Interests:** Regulators (clarity), Platform (compliance), Diners (transparency)
* **Preconditions:** Restaurant claims DFDO status.
* **Postconditions:** Exemptions applied.
* **Main Success Scenario:**

  1. Owner selects DFDO profile.
  2. Provides required disclosures.
  3. System validates.
  4. DFDO status displayed.
* **Alternate Flow:** Periodic re-attestation.
* **Exception:** Missing evidence → revert to normal rules.
* **Business Rules:** DFDO exemption policies.

---

**UC28 – Handle Alcohol & Age-Gated Orders**

* **Primary Actor:** Customer / Courier
* **Stakeholders & Interests:** Regulators (liquor boards), Platform (liability), Customers (access)
* **Preconditions:** Cart includes alcohol/tobacco.
* **Postconditions:** Verified or blocked order.
* **Main Success Scenario:**

  1. Customer adds restricted item.
  2. System prompts for ID.
  3. ID verified digitally.
  4. Courier rechecks ID at handoff.
  5. Confirmation logged.
* **Alternate Flow:** Manual ID upload.
* **Exception:** ID invalid → order canceled.
* **Business Rules:** Alcohol/tobacco laws.

---

**UC29 – Manage Courier Payments & Withholdings**

* **Primary Actor:** Finance System
* **Stakeholders & Interests:** Couriers (income), Regulators (tax compliance), Platform (payout integrity)
* **Preconditions:** Completed deliveries logged.
* **Postconditions:** Payouts processed.
* **Main Success Scenario:**

  1. System aggregates earnings.
  2. Deducts fees/taxes.
  3. Generates payout schedule.
  4. Disburses funds.
  5. Sends statement to courier.
* **Alternate Flow:** Instant payout for fee.
* **Exception:** Bank transfer failure.
* **Business Rules:** Labor/tax laws.

---

**UC30 – Report Abuse or Fraud**

* **Primary Actor:** Any User (Customer, Courier, Merchant)
* **Stakeholders & Interests:** Trust & Safety (oversight), Platform (brand integrity), Regulators (fraud prevention)
* **Preconditions:** User logged in.
* **Postconditions:** Report filed, tracked.
* **Main Success Scenario:**

  1. User selects “Report Issue.”
  2. Chooses category (abuse/fraud).
  3. Submits details.
  4. System logs report.
  5. Trust & Safety notified.
* **Alternate Flow:** Anonymous submission accepted.
* **Exception:** False/fraudulent report detected.
* **Business Rules:** Trust & Safety policy, fraud statutes.

---

## Reflection

---

Comparing the four documents highlights how both the prompting style and the model identity shape the quality and direction of the use case expansions. The zero-shot versions tended to prioritize breadth, generating many distinct titles across operational, compliance, and user-facing domains. However, they often sacrificed depth; steps were sometimes generic, and important regulatory nuances were flattened. By contrast, the careful prompts elicited more structured flows. For instance, ChatGPT careful consistently produced preconditions, postconditions, and alternate flows that were concrete and testable, while Claude careful leaned into narrative completeness, offering smoother prose but occasionally less precision in mapping to explicit regulatory citations.

One striking difference was in how regulatory and tax issues were treated. ChatGPT careful surfaced specific obligations like bag fees, marketplace facilitator rules, and allergen disclosures with business rule references. Claude zero-shot mentioned compliance but in a more high-level fashion, sometimes collapsing multiple legal categories into one broad use case. This contrast suggests that careful prompting helps surface fine-grained statutory hooks, while zero-shot defaults to a more thematic sweep. Stakeholder coverage also diverged: ChatGPT emphasized regulators, finance, and support in distinct cases, whereas Claude introduced more customer-centric or operational perspectives, sometimes overlooking tax authorities but inventively framing issues like trust and safety.

A few insights stood out. First, Claude careful introduced accessibility-related flows that ChatGPT missed, underscoring how narrative framing can broaden inclusivity. Second, ChatGPT careful uniquely emphasized cross-contact allergen mitigation, a compliance nuance absent from Claude’s sets. Finally, both models neglected certain areas (like recurring courier safety risks) until prompted carefully, showing that safety is not a “default” stakeholder concern for either model.

Looking ahead, these observations suggest a blended strategy: begin with zero-shot generation to maximize breadth, then refine with careful prompting to deepen specificity, regulatory grounding, and testability. Alternating between models and prompt styles may produce the most comprehensive and balanced use case catalogue.


---

## Costs

---
ChatGPT plus - $20
Claude free - $0
