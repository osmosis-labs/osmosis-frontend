import { createClient } from "@vercel/kv";
import axios from "axios";

import { TWITTER_API_ACCESS_TOKEN, TWITTER_API_URL } from "~/config";

const twitterApi = axios.create({
  baseURL: TWITTER_API_URL,
  headers: {
    Authorization: `Bearer ${TWITTER_API_ACCESS_TOKEN}`,
  },
});

export interface RichTweet {
  id: string;
  text: string;
  createdAt: string;
  user: {
    username: string;
    name: string;
    profilePictureUrl: string | null;
    url: string | null;
  };
  previewImage: string | null;
}

export interface TwitterServiceInterface {
  getRecentTweets: (query: string) => Promise<RichTweet[]>;
}

const TwitterInternal: TwitterServiceInterface = {
  /**
   * Make a request to Twitter services to search for tweets based on a query.
   *
   * @param query a search string (e.g. "#osmo")
   * @returns An array of tweet's objects
   */
  getRecentTweets: async (query: string) => {
    const {
      data: {
        data: tweets,
        includes: { users, media },
      },
    } = await twitterApi.get(
      `/tweets/search/recent?query=${encodeURIComponent(
        query
      )}&max_results=10&tweet.fields=created_at&expansions=author_id,attachments.media_keys&media.fields=media_key,type,url&user.fields=description,profile_image_url,url`
    );

    return tweets.map((tweet: any) => {
      const userTweet = users.find((u: any) => u.id === tweet.author_id);
      let mediaTweet: any | undefined;
      tweet.attachments?.media_keys.forEach((media_key: any) => {
        mediaTweet = media.find(
          (m: any) => m.media_key === media_key && m.type === "photo"
        );
        if (mediaTweet) {
          return;
        }
      });

      return {
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        user: {
          username: userTweet.username,
          name: userTweet.name,
          profilePictureUrl: userTweet.profile_image_url ?? null,
          url: userTweet.url ?? null,
        },
        previewImage: mediaTweet !== undefined ? mediaTweet.url : null,
      };
    });
  },
};

/**
 * Expire time in milliseconds. (31 days)
 */
const CACHE_EXPIRE_TIME = 1000 * 60 * 60 * 24 * 31;

export const Twitter: TwitterServiceInterface = {
  /**
   * Returns the tweets associated with the query passed as a parameter,
   * if it finds them in cache it returns them if not it makes a request
   * to Twitter and then caches the result
   *
   * @param query a search string (e.g. "#osmo")
   * @returns An array of tweet's objects
   */
  getRecentTweets: async (query: string) => {
    const twitter = createClient({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });

    let cachedTweets = await twitter.get<RichTweet[]>(query);

    if (!cachedTweets) {
      cachedTweets = await TwitterInternal.getRecentTweets(query);

      twitter.set(query, cachedTweets, { px: CACHE_EXPIRE_TIME, nx: true });
    }

    return cachedTweets;
  },
};
