# Data Sources

This project uses a mix of public data and clearly labeled simulated first-party telemetry.

## Public Data

- Steam Reviews API: `https://store.steampowered.com/appreviews/2767030`
  - Used fields: review vote, playtime, timestamps, review text, author metadata.
  - The fetch script stores a reproducible raw JSON snapshot in `data/raw/steam_reviews_marvel_rivals.json`.
- SteamSpy API: `https://steamspy.com/api.php?request=appdetails&appid=2767030`
  - Used fields: developer, publisher, tags, genre, review counts, CCU.
  - The fetch script stores a reproducible raw JSON snapshot in `data/raw/steamspy_appdetails_marvel_rivals.json`.
- Steambase monthly player table for Marvel Rivals:
  - Used fields: monthly average players and monthly peak players.
  - Stored as `data/external/steam_monthly_players.csv` with source label.

## Context Sources

- SteamDB reports an all-time Steam peak of 644,269 concurrent players on January 11, 2025.
- NetEase's Q1 2025 financial release states that newly launched titles including Marvel Rivals contributed to online game revenue growth.
- SteamSpy describes itself as a Steam stats service based on Valve Web API profile sampling; its ownership data is estimated and should not be treated as exact.

## Simulated Data

Lifecycle telemetry, level/economy balancing, A/B testing, UA efficiency, and MMP-style attribution are normally internal datasets and are not publicly available for a live commercial game. To keep the analysis reproducible without claiming proprietary access, the project generates deterministic synthetic datasets:

- `data/simulated/player_daily.csv`
- `data/simulated/events.csv`
- `data/simulated/ua_campaigns.csv`
- `data/simulated/ab_assignments.csv`
- `data/simulated/mode_balance.csv`

The simulation is designed to be realistic enough for analytical exploration, but all conclusions from simulated data are framed as product recommendations for a hypothetical similar F2P hero shooter, not claims about NetEase's private metrics.
