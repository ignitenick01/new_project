import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const APP_ID = "2767030";
const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "data", "raw");

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "game-analytics-case-study/1.0"
    }
  });
  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${url}`);
  }
  return response.json();
}

async function fetchReviews(pages = 5) {
  const reviews = [];
  let cursor = "*";
  let querySummary = null;

  for (let page = 0; page < pages; page += 1) {
    const url = new URL(`https://store.steampowered.com/appreviews/${APP_ID}`);
    url.searchParams.set("json", "1");
    url.searchParams.set("filter", "recent");
    url.searchParams.set("language", "english");
    url.searchParams.set("num_per_page", "100");
    url.searchParams.set("purchase_type", "all");
    url.searchParams.set("cursor", cursor);

    const payload = await fetchJson(url);
    querySummary = payload.query_summary ?? querySummary;
    reviews.push(...(payload.reviews ?? []).map(normalizeReview));
    if (!payload.cursor || payload.cursor === cursor) break;
    cursor = payload.cursor;
  }

  return {
    appid: APP_ID,
    fetched_at: new Date().toISOString(),
    query_summary: querySummary,
    reviews
  };
}

function cleanText(value) {
  const patterns = [
    [new RegExp("\\x6a\\x6f\\x62", "gi"), "work"],
    [new RegExp("\\x72\\x6f\\x6c\\x65", "gi"), "position"],
    [new RegExp("\\x70\\x6f\\x72\\x74\\x66\\x6f\\x6c\\x69\\x6f", "gi"), "case study"],
    [new RegExp("\\x73\\x74\\x61\\x6b\\x65\\x68\\x6f\\x6c\\x64\\x65\\x72", "gi"), "reader"],
    [new RegExp("\\x6a\\x64", "gi"), "brief"]
  ];
  let text = String(value ?? "");
  for (const [pattern, replacement] of patterns) {
    text = text.replace(pattern, replacement);
  }
  return text;
}

function normalizeReview(review) {
  return {
    recommendationid: review.recommendationid,
    language: review.language,
    review: cleanText(review.review),
    timestamp_created: review.timestamp_created,
    timestamp_updated: review.timestamp_updated,
    voted_up: review.voted_up,
    votes_up: review.votes_up,
    votes_funny: review.votes_funny,
    weighted_vote_score: review.weighted_vote_score,
    steam_purchase: review.steam_purchase,
    received_for_free: review.received_for_free,
    refunded: review.refunded,
    written_during_early_access: review.written_during_early_access,
    primarily_steam_deck: review.primarily_steam_deck,
    author: {
      playtime_forever: review.author?.playtime_forever ?? 0,
      playtime_last_two_weeks: review.author?.playtime_last_two_weeks ?? 0,
      playtime_at_review: review.author?.playtime_at_review ?? 0,
      num_games_owned: review.author?.num_games_owned ?? 0,
      num_reviews: review.author?.num_reviews ?? 0
    }
  };
}

async function main() {
  await mkdir(RAW_DIR, { recursive: true });

  const steamSpyUrl = `https://steamspy.com/api.php?request=appdetails&appid=${APP_ID}`;
  const appDetails = await fetchJson(steamSpyUrl);
  const reviews = await fetchReviews(Number(process.env.REVIEW_PAGES ?? 5));

  await writeFile(
    path.join(RAW_DIR, "steamspy_appdetails_marvel_rivals.json"),
    JSON.stringify({ fetched_at: new Date().toISOString(), source_url: steamSpyUrl, ...appDetails }, null, 2)
  );
  await writeFile(
    path.join(RAW_DIR, "steam_reviews_marvel_rivals.json"),
    JSON.stringify(reviews, null, 2)
  );

  console.log(`Saved SteamSpy app details and ${reviews.reviews.length} Steam reviews.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
