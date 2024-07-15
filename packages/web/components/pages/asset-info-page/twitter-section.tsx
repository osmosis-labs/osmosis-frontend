import { RichTweet } from "@osmosis-labs/server";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FunctionComponent } from "react";

import { EventName, TWITTER_PUBLIC_URL } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";

interface TwitterSectionProps {
  tweets: RichTweet[];
  className?: string;
}

export const TwitterSection: FunctionComponent<TwitterSectionProps> = ({
  tweets,
  className,
}) => {
  const { t } = useTranslation();

  return tweets.length ? (
    <section
      className={`flex flex-1 flex-col items-start gap-11 self-stretch ${className}`}
    >
      <header>
        <h5>{t("tokenInfos.followTheConversation")}</h5>
      </header>
      <ul className="flex flex-col items-start gap-3 self-stretch">
        {tweets.map((tweet, index) => (
          <React.Fragment key={index}>
            {index > 0 && <Spacer />}
            <Tweet {...tweet} />
          </React.Fragment>
        ))}
      </ul>
    </section>
  ) : null;
};

const Spacer = () => {
  return <div className="h-[1px] self-stretch bg-osmoverse-700" />;
};

const Tweet: FunctionComponent<RichTweet> = ({
  id,
  text,
  createdAt,
  user,
  previewImage,
}) => {
  const router = useRouter();
  const { logEvent } = useAmplitudeAnalytics();

  const onTweetLinkClick = () => {
    logEvent([
      EventName.TokenInfo.socialPostClicked,
      { tokenName: router.query.denom as string },
    ]);
  };

  return (
    <li className="flex flex-col items-start gap-4 self-stretch py-3">
      <div className="flex-start flex gap-3 self-stretch 1.5xs:flex-col">
        <div
          className={`flex h-10 w-10 items-center gap-3 overflow-hidden 1.5xs:self-center ${
            !user.profilePictureUrl ? "bg-white-high" : ""
          }`}
        >
          {user.profilePictureUrl ? (
            <Image
              className="h-full w-full rounded-full"
              src={user.profilePictureUrl}
              alt={user.username ?? ""}
              quality={100}
              width={48}
              height={48}
            />
          ) : null}
        </div>
        <div className="flex flex-[1_0_0] flex-col items-start gap-1 1.5xs:gap-y-6">
          <div className="flex items-center gap-1 self-stretch 1.5xs:flex-col 1.5xs:gap-y-2">
            <div className="flex items-center gap-2">
              <p className="text-subtitle1 font-subtitle1 leading-6">
                {user.name}
              </p>
              <Link
                href={user.url ?? `${TWITTER_PUBLIC_URL}/${user.username}`}
                passHref
                target="_blank"
                className="text-body2 font-body2 leading-5 text-osmoverse-500 hover:underline"
                onClick={onTweetLinkClick}
              >
                @{user.username}
              </Link>
            </div>
            <span className="text-body2 font-body2 font-medium leading-5 text-osmoverse-500 1.5xs:hidden">
              ·
            </span>
            <time
              dateTime={createdAt}
              className="text-body2 font-body2 font-medium leading-5 text-osmoverse-500"
            >
              {new Date(createdAt).toDateString()}
            </time>
          </div>
          <Link
            href={`${TWITTER_PUBLIC_URL}/${user.username}/status/${id}`}
            target="_blank"
            className="breakspaces self-stretch text-body1 font-body1 text-osmoverse-200"
            passHref
            onClick={onTweetLinkClick}
          >
            {text}
            {previewImage && (
              <Image
                className="relative mt-3 h-auto w-full max-w-lg self-stretch rounded-xl object-cover"
                src={previewImage}
                quality={100}
                alt="Tweet image"
                width={1200}
                height={675}
              />
            )}
          </Link>
        </div>
      </div>
    </li>
  );
};
