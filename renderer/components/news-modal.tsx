import { newsAtom, showNewsModalAtom } from "@/atoms/news-atom";
import { translationAtom } from "@/atoms/translations-atom";
import matter, { GrayMatterFile } from "gray-matter";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const NewsModal = () => {
  const t = useAtomValue(translationAtom);

  const [news, setNews] = useAtom(newsAtom);
  const [showNewsModal, setShowNewsModal] = useAtom(showNewsModalAtom);

  useEffect(() => {
    // TODO: ADD AN ABOUT TAB
    if (window && window.navigator.onLine === false) return;
    try {
      fetch("https://raw.githubusercontent.com/upscayl/upscayl/main/news.md", {
        cache: "no-cache",
      })
        .then((res) => {
          return res.text();
        })
        .then((result) => {
          const newsData = result;
          if (!newsData) {
            console.log("📰 Could not fetch news data");
            return;
          }
          const markdownData = matter(newsData);
          if (!markdownData) return;
          if (markdownData && markdownData.data.dontShow) {
            return;
          }
          if (
            markdownData &&
            news &&
            markdownData?.data?.version === news?.data?.version
          ) {
            console.log("📰 News is up to date");
            if (showNewsModal === false) {
              setShowNewsModal(false);
            }
          } else if (markdownData) {
            setNews(matter(newsData));
            setShowNewsModal(true);
          }
        });
    } catch (error) {
      console.log("Could not fetch Upscayl News");
    }
  }, [news]);

  return (
    <dialog className={`modal ${showNewsModal && "modal-open"}`}>
      <div className="modal-box flex flex-col items-center gap-4 text-center">
        <button
          className="btn btn-circle absolute right-4 top-2"
          onClick={() => {
            setShowNewsModal(false);
            setNews((prev) => ({ ...prev, seen: true }));
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <rect
              x="0"
              y="0"
              width="24"
              height="24"
              fill="none"
              stroke="none"
            />
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="1.5"
              d="m8.464 15.535l7.072-7.07m-7.072 0l7.072 7.07"
            />
          </svg>
        </button>

        <div>
          {news && (
            <Markdown remarkPlugins={[remarkGfm]} className="prose">
              {news.content}
            </Markdown>
          )}
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button
          onClick={() => {
            setShowNewsModal(false);
            setNews((prev) => ({ ...prev, seen: true }));
          }}
        >
          {t("APP.DIALOG_BOX.CLOSE")}
        </button>
      </form>
    </dialog>
  );
};
