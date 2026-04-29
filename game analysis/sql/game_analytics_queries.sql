-- Databricks/Spark SQL examples for the analytics case study.

-- 1. Player lifecycle retention by install cohort and acquisition channel.
WITH installs AS (
  SELECT player_id, acquisition_channel, MIN(event_date) AS install_date
  FROM game_events
  WHERE event_name = 'install'
  GROUP BY player_id, acquisition_channel
),
activity AS (
  SELECT DISTINCT player_id, event_date
  FROM game_events
  WHERE event_name IN ('session_start', 'match_start', 'purchase')
)
SELECT
  i.install_date,
  i.acquisition_channel,
  COUNT(DISTINCT i.player_id) AS installs,
  COUNT(DISTINCT CASE WHEN datediff(a.event_date, i.install_date) = 1 THEN i.player_id END) AS d1_retained,
  COUNT(DISTINCT CASE WHEN datediff(a.event_date, i.install_date) = 7 THEN i.player_id END) AS d7_retained,
  COUNT(DISTINCT CASE WHEN datediff(a.event_date, i.install_date) = 14 THEN i.player_id END) AS d14_retained
FROM installs i
LEFT JOIN activity a
  ON i.player_id = a.player_id
GROUP BY i.install_date, i.acquisition_channel;

-- 2. Onboarding funnel.
SELECT
  acquisition_channel,
  COUNT(DISTINCT CASE WHEN event_name = 'install' THEN player_id END) AS installs,
  COUNT(DISTINCT CASE WHEN event_name = 'tutorial_start' THEN player_id END) AS tutorial_starts,
  COUNT(DISTINCT CASE WHEN event_name = 'tutorial_complete' THEN player_id END) AS tutorial_completes,
  COUNT(DISTINCT CASE WHEN event_name = 'match_start' THEN player_id END) AS first_match_players,
  COUNT(DISTINCT CASE WHEN event_name = 'purchase' THEN player_id END) AS payers
FROM game_events
GROUP BY acquisition_channel;

-- 3. Mode and map balancing.
SELECT
  mode,
  map,
  COUNT(*) AS matches,
  AVG(CASE WHEN result = 'win' THEN 1 ELSE 0 END) AS win_rate,
  percentile_approx(duration_sec, 0.5) AS p50_duration_sec,
  AVG(player_deaths) AS avg_deaths,
  AVG(currency_earned) AS avg_soft_currency_earned
FROM match_end_events
GROUP BY mode, map
HAVING matches >= 500;

-- 4. UA payback and ROAS.
SELECT
  campaign_id,
  creative_id,
  SUM(spend_usd) AS spend,
  SUM(installs) AS installs,
  SUM(spend_usd) / NULLIF(SUM(installs), 0) AS cpi,
  SUM(d7_revenue_usd) / NULLIF(SUM(spend_usd), 0) AS d7_roas,
  SUM(d30_revenue_usd) / NULLIF(SUM(spend_usd), 0) AS d30_roas
FROM ua_daily
GROUP BY campaign_id, creative_id;

-- 5. A/B test conversion summary.
SELECT
  experiment_id,
  variant,
  COUNT(DISTINCT player_id) AS exposed_players,
  AVG(CASE WHEN made_purchase_7d THEN 1 ELSE 0 END) AS purchase_rate_7d,
  AVG(revenue_7d) AS arpu_7d,
  AVG(CASE WHEN retained_d7 THEN 1 ELSE 0 END) AS d7_retention
FROM experiment_player_metrics
GROUP BY experiment_id, variant;
