import Link from "next/link";
import React from "react";
import { useTranslation } from "react-multi-lang";

function TwitterSection() {
  const t = useTranslation();
  const tweetContent = `Get ready for Osmocon 2023!\n\nJoin us in Paris for a jam-packed day, connect with some of the greatest industry innovators, and explore the future of Cosmos.\n\nDon't miss out!\n\nGet your tickets now:`;

  return (
    <section className="flex flex-1 flex-col items-start gap-6 self-stretch rounded-5xl border border-osmoverse-800 bg-osmoverse-900 py-10 px-8 md:py-6 md:px-4">
      <header>
        <h6 className="text-lg font-h6 leading-6">
          {t("tokenInfos.followTheConversation")}
        </h6>
      </header>
      <ul className="flex flex-col items-start gap-4 self-stretch">
        <Tweet tweetContent={tweetContent} />
        <Spacer />
        <Tweet tweetContent={tweetContent} />
        <Spacer />
        <Tweet tweetContent={tweetContent} />
      </ul>
    </section>
  );
}

export default TwitterSection;

function Spacer() {
  return <div className="self-stretch border border-osmoverse-700" />;
}

interface TweetProps {
  tweetContent: string;
}

function Tweet({ tweetContent }: TweetProps) {
  return (
    <li className="flex flex-col items-start gap-4 self-stretch py-3">
      <div className="flex-start flex gap-4 self-stretch 1.5xs:flex-col">
        <div className="flex h-13 w-13 items-center gap-3 rounded-full bg-white-high 1.5xs:self-center" />
        <div className="flex flex-[1_0_0] flex-col items-start gap-3 1.5xs:gap-y-6">
          <div className="flex items-center justify-between self-stretch 1.5xs:flex-col 1.5xs:gap-y-2">
            <div className="flex items-center gap-2">
              <p className="text-base font-subtitle1 leading-6 text-osmoverse-100">
                Osmosis 🧪
              </p>
              <Link href={"https://x.com/osmosiszone"} passHref>
                <a
                  target="_blank"
                  className="text-sm font-body2 font-medium leading-5 text-osmoverse-300 hover:underline"
                >
                  @osmosiszone
                </a>
              </Link>
            </div>
            <time className="text-sm font-body2 font-medium leading-5 text-osmoverse-300">
              July 15th
            </time>
          </div>
          <Link href={"https://x.com/osmosiszone"} passHref>
            <a
              target="_blank"
              className="breakspaces self-stretch font-body2 font-medium leading-5 text-osmoverse-300"
            >
              {tweetContent}
              <div className="mt-4 h-[258px] self-stretch rounded-3xl bg-wosmongton-300" />
            </a>
          </Link>
        </div>
      </div>
    </li>
  );
}
