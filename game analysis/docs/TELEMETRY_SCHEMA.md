# Telemetry Schema

Goal: reconstruct the complete player journey from install to onboarding, first PvP match, habit formation, monetization, churn risk, and reactivation.

## Core Identity Fields

| Field | Type | Notes |
| --- | --- | --- |
| event_id | string | Unique event key for deduplication |
| event_ts | timestamp | Client event time in UTC |
| ingest_ts | timestamp | Server ingest time in UTC |
| player_id | string | Stable internal player ID |
| install_id | string | Device install ID |
| session_id | string | Session key |
| platform | string | Steam, PlayStation, Xbox, mobile, etc. |
| country | string | ISO country code |
| acquisition_channel | string | Organic, TikTok, Meta, Google, influencer, Steam featuring |
| campaign_id | string | MMP or paid UA campaign ID |
| creative_id | string | MMP creative ID |
| client_version | string | Game build |

## Event Families

| Event | Required Properties | Business Use |
| --- | --- | --- |
| install | attribution_source, campaign_id, creative_id | CPI, cohorting, fraud checks |
| tutorial_start | tutorial_step | Onboarding funnel |
| tutorial_complete | duration_sec, fail_count | Friction and D1 retention diagnosis |
| session_start | entry_surface | DAU, session frequency |
| match_start | mode, map, matchmaking_bucket, party_size | Engagement and queue health |
| match_end | mode, map, result, duration_sec, hero_id, deaths, damage, healing, objective_score | balancing, flow state, toxicity proxies |
| progression_update | account_level, battle_pass_level, xp_delta | progression pacing |
| currency_earned | currency_type, amount, source | economy source monitoring |
| currency_spent | currency_type, amount, sink | economy sink monitoring |
| store_impression | placement, sku_id, price_usd | merchandising funnel |
| purchase | sku_id, price_usd, currency, platform_fee | ARPDAU, ROAS, LTV |
| social_event | event_subtype, party_size | network effects |
| report_submit | report_type, target_player_id | community health |
| ab_exposure | experiment_id, variant | experiment integrity |

## Data Quality Rules

- Every event must include `player_id`, `event_ts`, `client_version`, and `platform`.
- `purchase` must join to a valid `store_impression` or be marked as direct purchase.
- Events arriving more than 24 hours late are kept but excluded from daily operational dashboards.
- Attribution is locked after install except documented re-attribution windows from the MMP.
- Experiment assignment happens server-side and remains sticky per player.
