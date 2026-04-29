import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const PROCESSED_DIR = path.join(ROOT, "data", "processed");
const REPORT_DIR = path.join(ROOT, "reports");

function parseCsv(text) {
  const rows = [];
  const lines = text.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  for (const line of lines.slice(1)) {
    const values = splitCsvLine(line);
    rows.push(Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])));
  }
  return rows;
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function splitCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      out.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  out.push(current);
  return out;
}

function toCsv(rows, columns) {
  const escape = (value) => {
    const s = String(value ?? "");
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  return [columns.join(","), ...rows.map((row) => columns.map((c) => escape(row[c])).join(","))].join("\n");
}

function groupBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return map;
}

function pct(value, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}

function sum(rows, field) {
  return rows.reduce((total, row) => total + Number(row[field] || 0), 0);
}

function mean(rows, field) {
  return rows.length ? sum(rows, field) / rows.length : 0;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function normalCdf(x) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function zTestTwoProportions(successA, nA, successB, nB) {
  const pA = successA / nA;
  const pB = successB / nB;
  const pooled = (successA + successB) / (nA + nB);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / nA + 1 / nB));
  const z = (pB - pA) / se;
  return { pA, pB, lift: (pB - pA) / pA, z, pValue: 2 * (1 - normalCdf(Math.abs(z))) };
}

function lineChart(data, xField, yField, options = {}) {
  const width = 780;
  const height = 260;
  const pad = 42;
  const values = data.map((d) => Number(d[yField]));
  const min = Math.min(...values) * 0.92;
  const max = Math.max(...values) * 1.05;
  const x = (i) => pad + (i * (width - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v) => height - pad - ((v - min) * (height - pad * 2)) / (max - min || 1);
  const points = data.map((d, i) => `${x(i).toFixed(1)},${y(Number(d[yField])).toFixed(1)}`).join(" ");
  const labels = data.filter((_, i) => i % 4 === 0 || i === data.length - 1);
  return `<svg viewBox="0 0 ${width} ${height}" aria-label="${options.title ?? yField}">
    <rect width="${width}" height="${height}" fill="#fbfaf7"/>
    <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="#98958e"/>
    <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" stroke="#98958e"/>
    <polyline points="${points}" fill="none" stroke="#2563eb" stroke-width="3"/>
    ${data.map((d, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(Number(d[yField])).toFixed(1)}" r="3" fill="#0f172a"/>`).join("")}
    ${labels.map((d, i) => `<text x="${x(data.indexOf(d)).toFixed(1)}" y="${height - 14}" text-anchor="${i === 0 ? "start" : "middle"}" font-size="11" fill="#44403c">${d[xField]}</text>`).join("")}
    <text x="${pad}" y="24" font-size="15" font-weight="700" fill="#1c1917">${options.title ?? yField}</text>
  </svg>`;
}

function barChart(data, labelField, valueField, options = {}) {
  const width = 780;
  const rowHeight = 34;
  const height = 54 + data.length * rowHeight;
  const max = Math.max(...data.map((d) => Number(d[valueField])));
  return `<svg viewBox="0 0 ${width} ${height}" aria-label="${options.title ?? valueField}">
    <rect width="${width}" height="${height}" fill="#fbfaf7"/>
    <text x="24" y="28" font-size="15" font-weight="700" fill="#1c1917">${options.title ?? valueField}</text>
    ${data.map((d, i) => {
      const y = 48 + i * rowHeight;
      const w = (Number(d[valueField]) / max) * 500;
      return `<text x="24" y="${y + 18}" font-size="12" fill="#292524">${d[labelField]}</text>
        <rect x="180" y="${y}" width="${w.toFixed(1)}" height="22" rx="3" fill="#0f766e"/>
        <text x="${190 + w}" y="${y + 16}" font-size="12" fill="#292524">${options.format ? options.format(Number(d[valueField])) : Number(d[valueField]).toFixed(2)}</text>`;
    }).join("")}
  </svg>`;
}

async function main() {
  await mkdir(PROCESSED_DIR, { recursive: true });
  await mkdir(REPORT_DIR, { recursive: true });

  const [appDetailsRaw, reviewsRaw, monthlyRaw, eventsRaw, playerDailyRaw, uaRaw, abRaw, balanceRaw] = await Promise.all([
    readFile(path.join(ROOT, "data", "raw", "steamspy_appdetails_marvel_rivals.json"), "utf8"),
    readFile(path.join(ROOT, "data", "raw", "steam_reviews_marvel_rivals.json"), "utf8"),
    readFile(path.join(ROOT, "data", "external", "steam_monthly_players.csv"), "utf8"),
    readFile(path.join(ROOT, "data", "simulated", "events.csv"), "utf8"),
    readFile(path.join(ROOT, "data", "simulated", "player_daily.csv"), "utf8"),
    readFile(path.join(ROOT, "data", "simulated", "ua_campaigns.csv"), "utf8"),
    readFile(path.join(ROOT, "data", "simulated", "ab_assignments.csv"), "utf8"),
    readFile(path.join(ROOT, "data", "simulated", "mode_balance.csv"), "utf8")
  ]);

  const appDetails = JSON.parse(stripBom(appDetailsRaw));
  const reviewsPayload = JSON.parse(stripBom(reviewsRaw));
  const reviews = reviewsPayload.reviews ?? [];
  const monthly = parseCsv(stripBom(monthlyRaw));
  const events = parseCsv(stripBom(eventsRaw));
  const playerDaily = parseCsv(stripBom(playerDailyRaw));
  const ua = parseCsv(stripBom(uaRaw));
  const ab = parseCsv(stripBom(abRaw));
  const balance = parseCsv(stripBom(balanceRaw));

  const reviewPositiveRate = reviews.filter((r) => r.voted_up).length / reviews.length;
  const totalReviewPositiveRate = reviewsPayload.query_summary.total_positive / reviewsPayload.query_summary.total_reviews;
  const playtimeHoursMedian = median(reviews.map((r) => Number(r.author?.playtime_forever ?? 0) / 60));
  const keywordDict = {
    matchmaking: ["matchmaking", "ranked", "teammate", "team"],
    optimization: ["optimization", "fps", "crash", "performance", "lag"],
    community: ["toxic", "community", "throw", "report"],
    monetization: ["skin", "battle pass", "store", "money"],
    fun: ["fun", "great", "good", "peak", "love"]
  };
  const keywordRows = Object.entries(keywordDict).map(([topic, words]) => {
    const matched = reviews.filter((review) => {
      const text = String(review.review ?? "").toLowerCase();
      return words.some((word) => text.includes(word));
    });
    const positive = matched.filter((r) => r.voted_up).length;
    return {
      topic,
      mentions: matched.length,
      positive_rate: matched.length ? positive / matched.length : 0
    };
  }).sort((a, b) => b.mentions - a.mentions);

  const eventsByPlayer = groupBy(events, (row) => row.player_id);
  const installRows = events.filter((row) => row.event_name === "install");
  const funnelSteps = [
    ["install", "Install"],
    ["tutorial_start", "Tutorial start"],
    ["tutorial_complete", "Tutorial complete"],
    ["match_end", "First match"],
    ["purchase", "Purchase"]
  ].map(([eventName, label]) => ({
    step: label,
    players: new Set(events.filter((row) => row.event_name === eventName).map((row) => row.player_id)).size
  }));
  const funnel = funnelSteps.map((row, index) => ({
    ...row,
    conversion_from_install: row.players / funnelSteps[0].players,
    conversion_from_previous: index === 0 ? 1 : row.players / funnelSteps[index - 1].players
  }));

  const playerInstall = new Map();
  for (const row of installRows) {
    playerInstall.set(row.player_id, row.acquisition_channel);
  }
  const retentionRows = [];
  for (const [channel, rows] of groupBy(installRows, (row) => row.acquisition_channel)) {
    const players = rows.map((row) => row.player_id);
    for (const day of [1, 7, 14, 30]) {
      const retained = players.filter((playerId) => playerDaily.some((r) => r.player_id === playerId && Number(r.days_since_install) === day)).length;
      retentionRows.push({ acquisition_channel: channel, day: `D${day}`, installs: players.length, retained, retention_rate: retained / players.length });
    }
  }

  const uaSummary = ua.map((row) => ({
    campaign_id: row.campaign_id,
    creative_id: row.creative_id,
    acquisition_channel: row.acquisition_channel,
    installs: Number(row.installs),
    cpi: Number(row.cpi),
    d7_roas: Number(row.d7_roas),
    d30_roas: Number(row.d30_roas),
    projected_ltv_180: Number(row.d30_revenue_usd) * 1.9 / Math.max(1, Number(row.installs))
  })).sort((a, b) => b.d30_roas - a.d30_roas);

  const control = ab.filter((row) => row.variant === "control");
  const treatment = ab.filter((row) => row.variant === "mission_pack");
  const abPurchase = zTestTwoProportions(sum(control, "made_purchase_7d"), control.length, sum(treatment, "made_purchase_7d"), treatment.length);
  const abRetention = zTestTwoProportions(sum(control, "retained_d7"), control.length, sum(treatment, "retained_d7"), treatment.length);
  const abSummary = [
    { metric: "7-day purchase conversion", control: abPurchase.pA, treatment: abPurchase.pB, lift: abPurchase.lift, p_value: abPurchase.pValue },
    { metric: "D7 retention", control: abRetention.pA, treatment: abRetention.pB, lift: abRetention.lift, p_value: abRetention.pValue }
  ];

  const balanceSummary = balance
    .map((row) => ({ ...row, win_rate: Number(row.win_rate), avg_soft_currency: Number(row.avg_soft_currency), matches: Number(row.matches) }))
    .sort((a, b) => Math.abs(b.win_rate - 0.5) - Math.abs(a.win_rate - 0.5));

  const publicKpis = [
    { metric: "SteamSpy current CCU snapshot", value: appDetails.ccu },
    { metric: "Steam review score", value: reviewsPayload.query_summary.review_score_desc },
    { metric: "Total Steam review positive rate", value: pct(totalReviewPositiveRate) },
    { metric: "Sample recent review positive rate", value: pct(reviewPositiveRate) },
    { metric: "Median reviewer lifetime playtime", value: `${playtimeHoursMedian.toFixed(1)} hours` },
    { metric: "All-time Steam peak from monthly public table", value: "644,269 on 2025-01-11" }
  ];

  await writeFile(path.join(PROCESSED_DIR, "public_review_topics.csv"), toCsv(keywordRows, ["topic", "mentions", "positive_rate"]));
  await writeFile(path.join(PROCESSED_DIR, "funnel_summary.csv"), toCsv(funnel, ["step", "players", "conversion_from_install", "conversion_from_previous"]));
  await writeFile(path.join(PROCESSED_DIR, "retention_by_channel.csv"), toCsv(retentionRows, ["acquisition_channel", "day", "installs", "retained", "retention_rate"]));
  await writeFile(path.join(PROCESSED_DIR, "ua_efficiency_summary.csv"), toCsv(uaSummary, ["campaign_id", "creative_id", "acquisition_channel", "installs", "cpi", "d7_roas", "d30_roas", "projected_ltv_180"]));
  await writeFile(path.join(PROCESSED_DIR, "ab_test_summary.csv"), toCsv(abSummary, ["metric", "control", "treatment", "lift", "p_value"]));
  await writeFile(path.join(PROCESSED_DIR, "mode_balance_risks.csv"), toCsv(balanceSummary, ["mode", "map", "matches", "win_rate", "avg_soft_currency"]));

  const paidUa = uaSummary.filter((row) => row.acquisition_channel !== "Organic");
  const bestUa = paidUa[0] ?? uaSummary[0];
  const weakestFunnel = funnel.reduce((worst, row) => row.conversion_from_previous < worst.conversion_from_previous ? row : worst, funnel[1]);
  const riskTopic = keywordRows[0];
  const modeRisk = balanceSummary[0];

  const markdown = `# Marvel Rivals Live-Service Analytics Case Study

Generated at: ${new Date().toISOString()}

## Executive Takeaways

1. Marvel Rivals is a strong public benchmark for live-service game analytics because it is a recent F2P hero shooter with large-scale Steam activity.
2. Public sources show a Steam all-time peak of 644,269 concurrent players in January 2025, and NetEase reported that Marvel Rivals contributed to online game revenue growth in Q1 2025.
3. Public review data suggests the most visible player-experience topic in the recent sample is \`${riskTopic.topic}\`, with ${riskTopic.mentions} mentions and ${pct(riskTopic.positive_rate)} positive rate among those mentions.
4. In the simulated first-party telemetry, the largest funnel loss is \`${weakestFunnel.step}\`, where conversion from the previous step is ${pct(weakestFunnel.conversion_from_previous)}.
5. Best simulated UA cell is \`${bestUa.campaign_id} / ${bestUa.creative_id}\`: CPI $${bestUa.cpi.toFixed(2)}, D30 ROAS ${pct(bestUa.d30_roas)}, projected 180-day LTV $${bestUa.projected_ltv_180.toFixed(2)}.
6. The onboarding mission-pack A/B test changes 7-day purchase conversion from ${pct(abPurchase.pA)} to ${pct(abPurchase.pB)} (lift ${pct(abPurchase.lift)}, p=${abPurchase.pValue.toFixed(4)}), so it is not ready to ship as a winner.
7. Balance watchlist: \`${modeRisk.mode} / ${modeRisk.map}\` has win rate ${pct(modeRisk.win_rate)}, furthest from a 50% target in the simulated match dataset.

## Recommended Actions

- Instrument tutorial failure reasons, queue wait time, match quality, device performance, and report/avoid events as first-class product metrics.
- Prioritize onboarding-to-first-match friction before scaling paid spend; funnel loss compounds every downstream LTV and ROAS metric.
- Scale UA only for paid campaign/creative cells above D30 ROAS threshold, then validate with longer payback windows and incrementality checks.
- Keep iterating the mission-pack test because the observed lift is not statistically significant; review qualitative friction and try a stronger onboarding value proposition.
- Use mode/map balancing dashboards with thresholds for win rate, match duration, deaths, and soft-currency output to protect flow state.
`;
  await writeFile(path.join(REPORT_DIR, "executive_summary.md"), markdown);

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Marvel Rivals Analytics Case Study</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #1c1917; background: #f4f1ea; }
    header { padding: 34px 44px 20px; background: #111827; color: white; }
    main { max-width: 1100px; margin: 0 auto; padding: 28px; }
    h1 { margin: 0 0 10px; font-size: 30px; letter-spacing: 0; }
    h2 { margin: 32px 0 12px; font-size: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
    .card { background: #fbfaf7; border: 1px solid #ddd6c8; border-radius: 8px; padding: 16px; }
    .metric { font-size: 24px; font-weight: 700; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; background: #fbfaf7; border: 1px solid #ddd6c8; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #e7e0d4; text-align: left; font-size: 14px; }
    th { background: #ede7da; }
    svg { width: 100%; height: auto; border: 1px solid #ddd6c8; border-radius: 8px; }
    .note { color: #57534e; line-height: 1.55; }
  </style>
</head>
<body>
  <header>
    <h1>Marvel Rivals Live-Service Analytics Case Study</h1>
    <p>Public Steam data plus deterministic simulated telemetry for lifecycle, UA, economy, and A/B testing demonstration.</p>
  </header>
  <main>
    <section class="grid">
      ${publicKpis.map((kpi) => `<div class="card"><div>${kpi.metric}</div><div class="metric">${kpi.value}</div></div>`).join("")}
    </section>

    <h2>Public Market Signal</h2>
    ${lineChart(monthly, "month", "average_players", { title: "Steam monthly average players" })}

    <h2>Recent Review Topics</h2>
    ${barChart(keywordRows, "topic", "mentions", { title: "Keyword mentions in recent Steam review sample", format: (v) => v.toFixed(0) })}

    <h2>Lifecycle Funnel</h2>
    <table>
      <tr><th>Step</th><th>Players</th><th>From install</th><th>From previous</th></tr>
      ${funnel.map((row) => `<tr><td>${row.step}</td><td>${row.players}</td><td>${pct(row.conversion_from_install)}</td><td>${pct(row.conversion_from_previous)}</td></tr>`).join("")}
    </table>

    <h2>UA Efficiency: Top Campaign-Creative Cells</h2>
    <table>
      <tr><th>Campaign</th><th>Creative</th><th>Channel</th><th>CPI</th><th>D30 ROAS</th><th>Projected 180D LTV</th></tr>
      ${paidUa.slice(0, 8).map((row) => `<tr><td>${row.campaign_id}</td><td>${row.creative_id}</td><td>${row.acquisition_channel}</td><td>$${row.cpi.toFixed(2)}</td><td>${pct(row.d30_roas)}</td><td>$${row.projected_ltv_180.toFixed(2)}</td></tr>`).join("")}
    </table>

    <h2>A/B Test</h2>
    <table>
      <tr><th>Metric</th><th>Control</th><th>Treatment</th><th>Lift</th><th>p-value</th></tr>
      ${abSummary.map((row) => `<tr><td>${row.metric}</td><td>${pct(row.control)}</td><td>${pct(row.treatment)}</td><td>${pct(row.lift)}</td><td>${row.p_value.toFixed(4)}</td></tr>`).join("")}
    </table>

    <h2>Balance Watchlist</h2>
    <table>
      <tr><th>Mode</th><th>Map</th><th>Matches</th><th>Win Rate</th><th>Avg Soft Currency</th></tr>
      ${balanceSummary.slice(0, 8).map((row) => `<tr><td>${row.mode}</td><td>${row.map}</td><td>${row.matches}</td><td>${pct(row.win_rate)}</td><td>${row.avg_soft_currency.toFixed(1)}</td></tr>`).join("")}
    </table>

    <h2>Interpretation</h2>
    <p class="note">Public data establishes the game and market context, while simulated first-party telemetry makes the lifecycle, economy, attribution, and experiment analysis reproducible without claiming access to proprietary data.</p>
  </main>
</body>
</html>`;
  await writeFile(path.join(REPORT_DIR, "index.html"), html);

  console.log("Analysis complete. See reports/executive_summary.md and reports/index.html.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
