import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data", "simulated");
const START = new Date("2026-01-01T00:00:00Z");
const PLAYERS = 2500;
const DAYS = 90;

function mulberry32(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260429);
const channels = [
  { name: "Organic", cpi: 0, quality: 1.08 },
  { name: "TikTok", cpi: 2.1, quality: 0.92 },
  { name: "Meta", cpi: 3.6, quality: 1.02 },
  { name: "Google UAC", cpi: 4.1, quality: 1.13 },
  { name: "Influencer", cpi: 2.8, quality: 1.18 },
  { name: "Steam Featuring", cpi: 0.7, quality: 1.24 }
];
const regions = ["US", "CA", "GB", "DE", "FR", "BR", "JP", "KR"];
const devices = ["high_end_pc", "mid_pc", "low_pc", "steam_deck"];
const modes = ["Quick Match", "Competitive", "Arcade", "PvE Event"];
const maps = ["Tokyo 2099", "Yggsgard", "Hell's Heaven", "Spider-Islands", "Birnin T'Challa"];

function pick(items, weights = null) {
  if (!weights) return items[Math.floor(rand() * items.length)];
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rand() * total;
  for (let i = 0; i < items.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items.at(-1);
}

function dateAdd(base, days, hour = 12) {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, Math.floor(rand() * 60), Math.floor(rand() * 60), 0);
  return d.toISOString();
}

function csvEscape(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

function toCsv(rows, columns) {
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","))
  ].join("\n");
}

function bernoulli(p) {
  return rand() < Math.max(0, Math.min(1, p));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const events = [];
  const playerDaily = [];
  const abRows = [];
  const uaRowsByKey = new Map();
  const modeRows = [];
  let eventSeq = 1;

  function addEvent(row) {
    events.push({
      event_id: `evt_${String(eventSeq).padStart(8, "0")}`,
      ...row
    });
    eventSeq += 1;
  }

  for (let i = 1; i <= PLAYERS; i += 1) {
    const playerId = `p_${String(i).padStart(6, "0")}`;
    const channel = pick(channels, [0.28, 0.19, 0.18, 0.13, 0.12, 0.1]);
    const campaignId = channel.name === "Organic" ? "organic" : `${channel.name.toLowerCase().replaceAll(" ", "_")}_${1 + Math.floor(rand() * 3)}`;
    const creativeId = channel.name === "Organic" ? "organic" : `creative_${1 + Math.floor(rand() * 6)}`;
    const region = pick(regions, [0.42, 0.07, 0.1, 0.08, 0.07, 0.09, 0.08, 0.09]);
    const device = pick(devices, [0.34, 0.42, 0.18, 0.06]);
    const installDay = Math.floor(rand() * 55);
    const skill = rand();
    const abVariant = rand() < 0.5 ? "control" : "mission_pack";
    const quality = channel.quality * (device === "low_pc" ? 0.83 : 1) * (region === "US" ? 1.06 : 1);
    const tutorialStart = bernoulli(0.94);
    const tutorialComplete = tutorialStart && bernoulli(0.78 * quality + 0.08 * skill);
    const firstMatch = tutorialComplete && bernoulli(0.91 * quality);
    const purchaseLift = abVariant === "mission_pack" ? 1.14 : 1;
    const payer = firstMatch && bernoulli((0.055 + 0.08 * skill) * quality * purchaseLift);

    addEvent({
      event_ts: dateAdd(START, installDay, 10),
      event_date: dateAdd(START, installDay, 10).slice(0, 10),
      player_id: playerId,
      session_id: `s_${playerId}_0`,
      event_name: "install",
      acquisition_channel: channel.name,
      campaign_id: campaignId,
      creative_id: creativeId,
      platform: "Steam",
      country: region,
      device_tier: device,
      mode: "",
      map: "",
      value_usd: 0,
      currency_delta: 0,
      result: ""
    });
    if (tutorialStart) {
      addEvent({ event_ts: dateAdd(START, installDay, 11), event_date: dateAdd(START, installDay, 11).slice(0, 10), player_id: playerId, session_id: `s_${playerId}_0`, event_name: "tutorial_start", acquisition_channel: channel.name, campaign_id: campaignId, creative_id: creativeId, platform: "Steam", country: region, device_tier: device, mode: "Onboarding", map: "Training Room", value_usd: 0, currency_delta: 0, result: "" });
    }
    if (tutorialComplete) {
      addEvent({ event_ts: dateAdd(START, installDay, 12), event_date: dateAdd(START, installDay, 12).slice(0, 10), player_id: playerId, session_id: `s_${playerId}_0`, event_name: "tutorial_complete", acquisition_channel: channel.name, campaign_id: campaignId, creative_id: creativeId, platform: "Steam", country: region, device_tier: device, mode: "Onboarding", map: "Training Room", value_usd: 0, currency_delta: 250, result: "complete" });
    }

    const dayActivity = [];
    for (let day = 0; day < DAYS - installDay; day += 1) {
      const habit = firstMatch ? 1 : 0.45;
      const decay = Math.exp(-day / (16 + skill * 20));
      const comeback = day > 21 && bernoulli(0.012) ? 0.25 : 0;
      const activeProb = day === 0 ? 0.96 : (0.42 * quality * habit + 0.16 * skill) * decay + comeback;
      if (!bernoulli(activeProb)) continue;
      dayActivity.push(day);

      const sessionCount = 1 + (bernoulli(0.22 + 0.2 * skill) ? 1 : 0) + (bernoulli(0.05) ? 1 : 0);
      let dailyRevenue = 0;
      let matches = 0;
      for (let s = 0; s < sessionCount; s += 1) {
        const sessionId = `s_${playerId}_${day}_${s}`;
        addEvent({ event_ts: dateAdd(START, installDay + day, 15 + s), event_date: dateAdd(START, installDay + day, 15 + s).slice(0, 10), player_id: playerId, session_id: sessionId, event_name: "session_start", acquisition_channel: channel.name, campaign_id: campaignId, creative_id: creativeId, platform: "Steam", country: region, device_tier: device, mode: "", map: "", value_usd: 0, currency_delta: 0, result: "" });
        const matchCount = firstMatch ? 1 + Math.floor(rand() * (2 + Math.round(skill * 4))) : 0;
        for (let m = 0; m < matchCount; m += 1) {
          const mode = pick(modes, [0.48, 0.28, 0.13, 0.11]);
          const map = pick(maps);
          const winProb = mode === "Competitive" ? 0.49 + (skill - 0.5) * 0.16 : 0.52 + (skill - 0.5) * 0.1;
          const won = bernoulli(winProb);
          const duration = Math.round(390 + rand() * 620 + (mode === "Competitive" ? 90 : 0));
          matches += 1;
          addEvent({ event_ts: dateAdd(START, installDay + day, 16 + s), event_date: dateAdd(START, installDay + day, 16 + s).slice(0, 10), player_id: playerId, session_id: sessionId, event_name: "match_end", acquisition_channel: channel.name, campaign_id: campaignId, creative_id: creativeId, platform: "Steam", country: region, device_tier: device, mode, map, value_usd: 0, currency_delta: won ? 90 : 55, result: won ? "win" : "loss" });
        }
      }
      if (payer && bernoulli(day <= 7 ? 0.11 : 0.035)) {
        dailyRevenue = pick([4.99, 9.99, 19.99, 49.99], [0.52, 0.31, 0.13, 0.04]);
        addEvent({ event_ts: dateAdd(START, installDay + day, 20), event_date: dateAdd(START, installDay + day, 20).slice(0, 10), player_id: playerId, session_id: `s_${playerId}_${day}_purchase`, event_name: "purchase", acquisition_channel: channel.name, campaign_id: campaignId, creative_id: creativeId, platform: "Steam", country: region, device_tier: device, mode: "", map: "", value_usd: dailyRevenue, currency_delta: 0, result: "" });
      }
      playerDaily.push({
        player_id: playerId,
        install_date: dateAdd(START, installDay, 10).slice(0, 10),
        activity_date: dateAdd(START, installDay + day, 10).slice(0, 10),
        days_since_install: day,
        acquisition_channel: channel.name,
        campaign_id: campaignId,
        creative_id: creativeId,
        country: region,
        device_tier: device,
        active: 1,
        matches,
        revenue_usd: dailyRevenue.toFixed(2)
      });
    }

    const revenue7 = playerDaily
      .filter((r) => r.player_id === playerId && r.days_since_install <= 7)
      .reduce((sum, r) => sum + Number(r.revenue_usd), 0);
    abRows.push({
      player_id: playerId,
      experiment_id: "xp_onboarding_mission_pack",
      variant: abVariant,
      exposed_date: dateAdd(START, installDay, 10).slice(0, 10),
      retained_d7: dayActivity.includes(7) ? 1 : 0,
      made_purchase_7d: revenue7 > 0 ? 1 : 0,
      revenue_7d: revenue7.toFixed(2)
    });

    const uaKey = `${campaignId}|${creativeId}`;
    const current = uaRowsByKey.get(uaKey) ?? { campaign_id: campaignId, creative_id: creativeId, acquisition_channel: channel.name, installs: 0, spend_usd: 0, d7_revenue_usd: 0, d30_revenue_usd: 0 };
    current.installs += 1;
    current.spend_usd += channel.cpi * (0.85 + rand() * 0.35);
    current.d7_revenue_usd += revenue7;
    current.d30_revenue_usd += playerDaily
      .filter((r) => r.player_id === playerId && r.days_since_install <= 30)
      .reduce((sum, r) => sum + Number(r.revenue_usd), 0);
    uaRowsByKey.set(uaKey, current);
  }

  const matchEnds = events.filter((event) => event.event_name === "match_end");
  for (const mode of modes) {
    for (const map of maps) {
      const subset = matchEnds.filter((event) => event.mode === mode && event.map === map);
      if (!subset.length) continue;
      modeRows.push({
        mode,
        map,
        matches: subset.length,
        win_rate: (subset.filter((event) => event.result === "win").length / subset.length).toFixed(4),
        avg_soft_currency: (subset.reduce((sum, event) => sum + Number(event.currency_delta), 0) / subset.length).toFixed(1)
      });
    }
  }

  const uaRows = [...uaRowsByKey.values()].map((row) => ({
    ...row,
    spend_usd: row.spend_usd.toFixed(2),
    cpi: (row.spend_usd / row.installs).toFixed(2),
    d7_revenue_usd: row.d7_revenue_usd.toFixed(2),
    d30_revenue_usd: row.d30_revenue_usd.toFixed(2),
    d7_roas: (row.d7_revenue_usd / Math.max(row.spend_usd, 1)).toFixed(4),
    d30_roas: (row.d30_revenue_usd / Math.max(row.spend_usd, 1)).toFixed(4)
  }));

  await writeFile(path.join(OUT_DIR, "events.csv"), toCsv(events, ["event_id", "event_ts", "event_date", "player_id", "session_id", "event_name", "acquisition_channel", "campaign_id", "creative_id", "platform", "country", "device_tier", "mode", "map", "value_usd", "currency_delta", "result"]));
  await writeFile(path.join(OUT_DIR, "player_daily.csv"), toCsv(playerDaily, ["player_id", "install_date", "activity_date", "days_since_install", "acquisition_channel", "campaign_id", "creative_id", "country", "device_tier", "active", "matches", "revenue_usd"]));
  await writeFile(path.join(OUT_DIR, "ab_assignments.csv"), toCsv(abRows, ["player_id", "experiment_id", "variant", "exposed_date", "retained_d7", "made_purchase_7d", "revenue_7d"]));
  await writeFile(path.join(OUT_DIR, "ua_campaigns.csv"), toCsv(uaRows, ["campaign_id", "creative_id", "acquisition_channel", "installs", "spend_usd", "cpi", "d7_revenue_usd", "d30_revenue_usd", "d7_roas", "d30_roas"]));
  await writeFile(path.join(OUT_DIR, "mode_balance.csv"), toCsv(modeRows, ["mode", "map", "matches", "win_rate", "avg_soft_currency"]));

  console.log(`Generated ${events.length} events for ${PLAYERS} simulated players.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
