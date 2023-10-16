import { createClient } from "@vercel/kv";
import axios from "axios";

import { TWITTER_API_ACCESS_TOKEN, TWITTER_API_URL } from "~/config";

const twitterApi = axios.create({
  baseURL: TWITTER_API_URL,
  headers: {
    Authorization: `Bearer ${TWITTER_API_ACCESS_TOKEN}`,
  },
});

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

export class Twitter {
  /**
   * Expire time in milliseconds.
   */
  cacheExpireTime: number;

  private rawTweets: RawTweet[] = [];
  private rawUsers: RawUser[] = [];
  private rawMedia: RawMedia[] = [];

  /**
   * @param cacheExpireTime Expire time in milliseconds. (7 days by default)
   *
   * It should be enought if we wanna get tweets from 35 tokens every 7 days.
   */
  constructor(cacheExpireTime: number = 1000 * 60 * 60 * 24 * 7) {
    this.cacheExpireTime = cacheExpireTime;
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
    const {
      data: {
        data: tweets,
        includes: { users, media },
      },
    } = await twitterApi.get(
      `/tweets/search/recent?query=${encodeURIComponent(
        `from:${userId}`
      )}&max_results=10&tweet.fields=created_at&expansions=author_id,attachments.media_keys&media.fields=media_key,type,url&user.fields=description,profile_image_url,url`
    );

    this.rawTweets = tweets;
    this.rawUsers = users;
    this.rawMedia = media;

    return this.tweets;
  }

  /**
   * Returns the tweets associated with the userId passed as a parameter,
   * if it finds them in cache it returns them if not it makes a request
   * to Twitter and then caches the result
   *
   * @param userId a search string (e.g. "osmosiszone")
   * @returns An array of tweet's objects
   */
  async getUserTweets(userId: string) {
    const twitter = createClient({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });

    let cachedTweets = await twitter.get<RichTweet[]>(userId);

    if (!cachedTweets) {
      cachedTweets = await this.internalGetUserTweets(userId);

      twitter.set(userId, cachedTweets, { px: this.cacheExpireTime, nx: true });
    }

    return cachedTweets;
  }

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
