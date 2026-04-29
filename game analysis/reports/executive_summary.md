# Marvel Rivals Live-Service Analytics Case Study

Generated at: 2026-04-29T19:49:28.428Z

## Executive Takeaways

1. Marvel Rivals is a strong public benchmark for live-service game analytics because it is a recent F2P hero shooter with large-scale Steam activity.
2. Public sources show a Steam all-time peak of 644,269 concurrent players in January 2025, and NetEase reported that Marvel Rivals contributed to online game revenue growth in Q1 2025.
3. Public review data suggests the most visible player-experience topic in the recent sample is `fun`, with 179 mentions and 77.1% positive rate among those mentions.
4. In the simulated first-party telemetry, the largest funnel loss is `Purchase`, where conversion from the previous step is 6.4%.
5. Best simulated UA cell is `steam_featuring_2 / creative_3`: CPI $0.71, D30 ROAS 1130.2%, projected 180-day LTV $15.29.
6. The onboarding mission-pack A/B test changes 7-day purchase conversion from 3.5% to 3.5% (lift 0.8%, p=0.9703), so it is not ready to ship as a winner.
7. Balance watchlist: `Arcade / Birnin T'Challa` has win rate 56.0%, furthest from a 50% target in the simulated match dataset.

## Recommended Actions

- Instrument tutorial failure reasons, queue wait time, match quality, device performance, and report/avoid events as first-class product metrics.
- Prioritize onboarding-to-first-match friction before scaling paid spend; funnel loss compounds every downstream LTV and ROAS metric.
- Scale UA only for paid campaign/creative cells above D30 ROAS threshold, then validate with longer payback windows and incrementality checks.
- Keep iterating the mission-pack test because the observed lift is not statistically significant; review qualitative friction and try a stronger onboarding value proposition.
- Use mode/map balancing dashboards with thresholds for win rate, match duration, deaths, and soft-currency output to protect flow state.
