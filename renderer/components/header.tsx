import { FEATURE_FLAGS } from "@common/feature-flags";
import { useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";

export default function Header({ version }: { version: string }) {
  const t = useAtomValue(translationAtom);

  return (
    <a
      href="https://github.com/upscayl/upscayl"
      target="_blank"
      className={`outline-none focus-visible:ring-2`}
    >
      <div className="flex gap-2">
        <img src="./logo.svg" className="size-10 self-center" />

        <div className="flex flex-col items-start justify-start">
          <h1 className="text-lg font-medium text-foreground/80">
            {t`Upscayl`}{" "}
          </h1>
          <p className="text-xs text-muted-foreground">
            {version} {FEATURE_FLAGS.APP_STORE_BUILD && "Mac"}
          </p>
        </div>
      </div>
    </a>
  );
}
