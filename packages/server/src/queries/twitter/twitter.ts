import { apiClient } from "@osmosis-labs/utils";
import { Redis } from "@upstash/redis";
import { Cache, CacheEntry, cachified } from "cachified";

import {
  KV_STORE_REST_API_TOKEN,
  KV_STORE_REST_API_URL,
  TWITTER_API_ACCESS_TOKEN,
  TWITTER_API_URL,
} from "../../env";

interface RawUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
  url?: string;
}

interface RawMedia {
  media_key: string;
  type: string;
  url: string;
}

interface RawTweetAttachments {
  media_keys: string[];
}

interface RawTweet {
  id: string;
  author_id: string;
  text: string;
  created_at: string;
  attachments: RawTweetAttachments;
}

export interface RichTweet {
  id: string;
  text: string;
  createdAt: string;
  user: {
    username?: string;
    name?: string;
    profilePictureUrl: string | null;
    url: string | null;
  };
  previewImage: string | null;
}

const DEFAULT_TTL = 1000 * 60 * 60 * 24 * 7;

const kvStoreAdapter = (store: Redis): Cache => ({
  set: <T>(key: string, value: CacheEntry<T>) => {
    value.metadata.ttl;
    return store.set(key, value, {
      px: value.metadata.ttl ?? DEFAULT_TTL,
    });
  },
  get: <T>(key: string) => {
    return store.get<T>(key);
  },
  delete: (key) => {
    return store.del(key);
  },
});

export class Twitter {
  /**
   * Expire time in milliseconds.
   */
  cacheExpireTime: number;

  private rawTweets: RawTweet[] = [];
  private rawUsers: RawUser[] = [];
  private rawMedia: RawMedia[] = [];

  private kvStore: Redis;
  private cache: Cache;

  /**
   * @param cacheExpireTime Expire time in milliseconds. (7 days by default)
   *
   * It should be enought if we wanna get tweets from 35 tokens every 7 days.
   */
  constructor(cacheExpireTime: number = DEFAULT_TTL) {
    this.cacheExpireTime = cacheExpireTime;
    this.kvStore = new Redis({
      url: KV_STORE_REST_API_URL!,
      token: KV_STORE_REST_API_TOKEN!,
    });
    this.cache = kvStoreAdapter(this.kvStore);
  }

  /**
   * Make a request to Twitter services to search for tweets based on a userId.
   *
   * By default it returns the most recent ten tweets https://developer.twitter.com/en/docs/twitter-api/tweets/timelines/api-reference/get-users-id-tweets
   *
   * @param userId a search string (e.g. "osmosiszone")
   * @returns An array of tweet's objects
   */
  private async internalGetUserTweets(userId: string) {
    try {
      const url = new URL(
        `2/tweets/search/recent?query=${encodeURIComponent(
          `from:${userId}`
        )}&max_results=10&tweet.fields=created_at&expansions=author_id,attachments.media_keys&media.fields=media_key,type,url&user.fields=description,profile_image_url,url`,
        TWITTER_API_URL
      );

      const {
        data: tweets = [],
        includes: { users, media } = {
          users: [],
          media: [],
        },
      } = await apiClient<{
        data: RawTweet[];
        includes: { users: RawUser[]; media: RawMedia[] };
      }>(url.toString(), {
        headers: {
          Authorization: `Bearer ${TWITTER_API_ACCESS_TOKEN}`,
        },
      });

      this.rawTweets = tweets;
      this.rawUsers = users;
      this.rawMedia = media;

      return this.tweets;
    } catch {
      return [];
    }
  }

  /**
   * Returns the tweets associated with the userId passed as a parameter,
   * if it finds them in cache it returns them if not it makes a request
   * to Twitter and then caches the result
   *
   * @param userId a search string (e.g. "osmosiszone")
   * @returns An array of tweet's objects
   */
  async getUserTweets(userId: string): Promise<RichTweet[]> {
    return cachified({
      key: userId,
      cache: this.cache,
      getFreshValue: () => {
        return this.internalGetUserTweets(userId);
      },
      ttl: this.cacheExpireTime,
    });
  }

  /**
   * Map raw tweets data with users and media info.
   */
  get tweets() {
    return this.rawTweets.map((tweet) => {
      const userTweet = this.rawUsers.find((u) => u.id === tweet.author_id);

      let mediaTweet: RawMedia | undefined;

      tweet.attachments?.media_keys.forEach((media_key) => {
        mediaTweet = this.rawMedia.find(
          (m) => m.media_key === media_key && m.type === "photo"
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
          username: userTweet?.username,
          name: userTweet?.name,
          profilePictureUrl: userTweet?.profile_image_url ?? null,
          url: userTweet?.url ?? null,
        },
        previewImage: mediaTweet !== undefined ? mediaTweet.url : null,
      };
    });
  }
}
