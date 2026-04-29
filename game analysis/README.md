# Marvel Rivals Game Analytics Case Study

This is a compact end-to-end analytics case study for a live-service game. It combines public market data with simulated first-party telemetry to explore product health, player lifecycle, economy balance, experiments, and paid acquisition efficiency.

## Why This Game

`Marvel Rivals` is used as the benchmark example because it is a recent free-to-play online hero shooter with large public market signals:

- Steam App ID: `2767030`
- Developer and publisher: NetEase Games
- Public Steam all-time peak: `644,269` concurrent players on January 11, 2025
- Public sources show sustained 2025-2026 Steam activity, making it a useful live-service analytics case study

## Project Contents

| Path | Purpose |
| --- | --- |
| `docs/TELEMETRY_SCHEMA.md` | Proposed end-to-end telemetry schema for player journey reconstruction |
| `docs/DATA_SOURCES.md` | Public data sources, context sources, and simulation caveats |
| `scripts/fetch_public_steam_data.js` | Downloads public SteamSpy and Steam review data |
| `scripts/generate_simulated_telemetry.js` | Creates deterministic internal-style telemetry for lifecycle, UA, economy, and A/B analysis |
| `scripts/analyze.js` | Produces processed KPI tables and presentation-ready reports |
| `sql/game_analytics_queries.sql` | Databricks/Spark SQL query examples |
| `data/raw/` | Public data snapshots from Steam-related APIs |
| `data/simulated/` | Synthetic first-party telemetry |
| `data/processed/` | Analysis-ready KPI tables |
| `reports/executive_summary.md` | Concise written summary |
| `reports/index.html` | Simple visual report/dashboard |

## How To Reproduce

Requirements:

- Node.js 20 or newer
- No npm packages are required

Run the full pipeline:

```bash
npm run build
```

If npm is unavailable, run the scripts directly:

```bash
node scripts/fetch_public_steam_data.js
node scripts/generate_simulated_telemetry.js
node scripts/analyze.js
```

Open `reports/index.html` for the visual report, or read `reports/executive_summary.md` for the concise summary.

## Analysis Methods Demonstrated

- Telemetry event schema design
- Public market and sentiment signal extraction
- Onboarding funnel analysis
- D1/D7/D14/D30 retention by acquisition channel
- Mode/map balancing watchlist
- Economy source/sink monitoring
- UA campaign and creative de-averaging
- CPI, D7/D30 ROAS, and projected LTV
- Two-proportion z-test for A/B conversion analysis
- Databricks/Spark SQL modeling examples

## Key Caveat

Real lifecycle, economy, experiment, and attribution data for a commercial game is proprietary. This project uses real public Steam-related data for market context and deterministic synthetic telemetry for reproducible analysis. Synthetic outputs should be interpreted as a hypothetical operating model for a similar F2P hero shooter, not as claims about NetEase's internal metrics.

## Analysis Question

The project answers the practical business question:

> If we were operating a new US live-service hero shooter, what would we track, where would players drop, which cohorts would scale, and how would we decide whether a product experiment is ready to ship?

The final recommendation is to fix onboarding-to-first-match friction and protect match quality before scaling paid acquisition, then scale only the campaign/creative cohorts that clear payback thresholds.
