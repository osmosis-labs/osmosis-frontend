import { apiClient, camelCaseToSnakeCase } from "@osmosis-labs/utils";

import { authHeaders, CoingeckoVsCurrencies, DETAILS_API_URL } from ".";

export interface CoingeckoReposUrl {
  github: string[];
  bitbucket: string[];
}

export interface CoingeckoCoinLinks {
  homepage?: string[];
  blockchain_site: string[];
  official_forum_url: string[];
  chat_url: string[];
  announcement_url: string[];
  twitter_screen_name?: string;
  facebook_username: string;
  bitcointalk_thread_identifier: string;
  telegram_channel_identifier: string;
  subreddit_url: string;
  repos_url: CoingeckoReposUrl;
}

export interface CoingeckoImage {
  thumb: string;
  small: string;
  large: string;
}

export interface CoingeckoCommunityData {
  facebook_likes: any;
  twitter_followers: number;
  reddit_average_posts_48h: number;
  reddit_average_comments_48h: number;
  reddit_subscribers: number;
  reddit_accounts_active_48h: number;
  telegram_channel_user_count: number;
}

export interface CoingeckoCodeAdditionsDeletions4Weeks {
  additions: number;
  deletions: number;
}

export interface CoingeckoDeveloperData {
  forks: number;
  stars: number;
  subscribers: number;
  total_issues: number;
  closed_issues: number;
  pull_requests_merged: number;
  pull_request_contributors: number;
  code_additions_deletions_4_weeks: CoingeckoCodeAdditionsDeletions4Weeks;
  commit_count_4_weeks: number;
  last_4_weeks_commit_activity_series: number[];
}

export interface CoingeckoCoin {
  id: string;
  symbol: string;
  name: string;
  asset_platform_id: any;
  platforms: { [key: string]: any };
  detail_platforms: { [key: string]: any };
  block_time_in_minutes: number;
  hashing_algorithm: any;
  categories: string[];
  preview_listing: boolean;
  public_notice: any;
  additional_notices: any[];
  localization: { [key: string]: string };
  description: { [key: string]: string };
  links: CoingeckoCoinLinks;
  image: CoingeckoImage;
  country_origin: string;
  genesis_date: any;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
  watchlist_portfolio_users: number;
  market_cap_rank: number;
  coingecko_rank: number;
  coingecko_score: number;
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;
  community_data: CoingeckoCommunityData;
  developer_data: CoingeckoDeveloperData;
  status_updates: any[];
  last_updated: string;
}

interface QueryCoinOptions {
  tickers?: boolean;
  marketData?: boolean;
  communityData?: boolean;
  developerData?: boolean;
  sparkline?: boolean;
}

export async function queryCoingeckoCoin(
  id: string,
  lang = "en",
  options: QueryCoinOptions = {
    tickers: false,
    sparkline: false,
    marketData: false,
    communityData: true,
    developerData: true,
  }
) {
  const url = new URL(`/api/v3/coins/${id}`, DETAILS_API_URL);

  url.searchParams.append("locale", lang);

  if (options) {
    for (const [key, value] of Object.entries(options)) {
      url.searchParams.append(camelCaseToSnakeCase(key), value);
    }
  }

  return apiClient<CoingeckoCoin>(url.toString(), {
    headers: authHeaders,
  });
}

export async function queryCoingeckoCoins(
  ids: string[],
  vsCurrency: CoingeckoVsCurrencies = "usd",
  lang = "en"
) {
  const url = new URL("/api/v3/coins/markets", DETAILS_API_URL);

  url.searchParams.append("vs_currency", vsCurrency);
  url.searchParams.append("locale", lang);
  url.searchParams.append("ids", ids.join(","));

  return apiClient<CoingeckoCoin[]>(url.toString(), {
    headers: authHeaders,
  });
}
