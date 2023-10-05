import Link from "next/link";
import React, { FunctionComponent } from "react";
import { useTranslation } from "react-multi-lang";

import { RichTweet } from "~/services/twitter";

interface TwitterSectionProps {
  tweets: RichTweet[];
}

const TwitterSection: FunctionComponent<TwitterSectionProps> = ({ tweets }) => {
  const t = useTranslation();

  return tweets.length ? (
    <section className="flex flex-1 flex-col items-start gap-6 self-stretch rounded-5xl border border-osmoverse-800 bg-osmoverse-900 py-10 px-8 md:py-6 md:px-4">
      <header>
        <h6 className="text-lg font-h6 leading-6">
          {t("tokenInfos.followTheConversation")}
        </h6>
      </header>
      <ul className="flex flex-col items-start gap-4 self-stretch">
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

export default TwitterSection;

function Spacer() {
  return <div className="self-stretch border border-osmoverse-700" />;
}

const Tweet: FunctionComponent<RichTweet> = ({
  id,
  text,
  createdAt,
  user,
  previewImage,
}) => {
  return (
    <li className="flex flex-col items-start gap-4 self-stretch py-3">
      <div className="flex-start flex gap-4 self-stretch 1.5xs:flex-col">
        <div className="flex h-13 w-13 items-center gap-3 overflow-hidden rounded-full bg-white-high 1.5xs:self-center">
          <img className="h-full w-full" src={user.profilePictureUrl} alt="" />
        </div>
        <div className="flex flex-[1_0_0] flex-col items-start gap-3 1.5xs:gap-y-6">
          <div className="flex items-center justify-between self-stretch 1.5xs:flex-col 1.5xs:gap-y-2">
            <div className="flex items-center gap-2">
              <p className="text-base font-subtitle1 leading-6 text-osmoverse-100">
                {user.name}
              </p>
              <Link
                href={user.url ?? `https://x.com/${user.username}`}
                passHref
              >
                <a
                  target="_blank"
                  className="text-sm font-body2 font-medium leading-5 text-osmoverse-300 hover:underline"
                >
                  @{user.username}
                </a>
              </Link>
            </div>
            <time className="text-sm font-body2 font-medium leading-5 text-osmoverse-300">
              {new Date(createdAt).toDateString()}
            </time>
          </div>
          <Link href={`https://x.com/${user.username}/status/${id}`} passHref>
            <a
              target="_blank"
              className="breakspaces self-stretch font-body2 font-medium leading-5 text-osmoverse-300"
            >
              {text}
              {previewImage && (
                <div className="mt-4 max-h-[258px] self-stretch rounded-3xl">
                  <img
                    className="max-h-[258px] w-full object-contain object-left"
                    src={previewImage}
                    alt=""
                  />
                </div>
              )}
            </a>
          </Link>
        </div>
      </div>
    </li>
  );
};
