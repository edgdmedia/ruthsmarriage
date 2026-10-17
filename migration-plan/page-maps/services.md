# Services `/services/` (Elementor page 368)

| Section | 1440 | 1024 | 390 |
|---|---|---|---|
| PageHero `pattern` `19e6f6a` | 137+350 | 137+300 | 128+250 |
| Service list `adc6e0d` | 487+3737 | 437+3637 | 378+6373 |
| Footer | 4224+486 | 4074+503 | 6750+1099 |
| **Page** | 4709 | 4576 | 7849 |

## 1. PageHero, variant `pattern` (`_global.md`)
Title "Services".

## 2. Service list
- **Exactly the same alternating A/B rows as `singles-married.md` §2** (templates 153/149, same measurements).
- Source on live: JetEngine's default query of the `service` CPT **without a filter**, so it shows **only the first 6 services**, in this order: One Hour Relationship Clarity Session · One Hour Dating Couples Counseling Session · Six (6) Weeks Individual Therapy Cycle · Private Premarital Counseling Classes · The Dating Couple Coaching Cycle · One Hour Individual Counseling Session.
- **Port behaviour:** list **all** services (both types) ordered by `order`. The 6-item cap is a JetEngine default, not a design choice (added to the audit's Known issues). The page gets longer than live; QA compares the first 6 rows only.
