import { useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";

const PreviousRenders = ({
  lstPath,
  upscaylHandler,
  srcFilename,
  setUpscaledImagePath,
  outputPath,
  handleUpImgPathLog,
}: {
  lstPath: any[];
  upscaylHandler: () => Promise<void>;
  srcFilename: string;
  setUpscaledImagePath: (arg: any) => void;
  outputPath: string;
  handleUpImgPathLog?: (
    srcFilename: string,
    datafullPath: string,
    typeEvent: string,
    isDoubleUpscale: boolean,
  ) => Promise<void>;
}) => {
  const t = useAtomValue(translationAtom);

  // retrieve mouse hover direction : https://freelance-drupal.com/en/blog/direction-aware-hover-effect-in-pure-css3-and-javascript
  const getHoverDirection = function (event) {
    var directions = ["top", "right", "bottom", "left"];
    var item = event.currentTarget;

    // Width and height of current item.
    var w = item.offsetWidth;
    var h = item.offsetHeight;

    // Calculate the x/y value of the pointer entering/exiting, relative to the center of the item.
    // Scale (sort of normalize) the coordinate on smallest side to the scale of the longest.
    var x =
      (event.clientX - item.getBoundingClientRect().left - w / 2) *
      (w > h ? h / w : 1);
    var y =
      (event.clientY - item.getBoundingClientRect().top - h / 2) *
      (h > w ? w / h : 1);

    // Calculate the angle to the center the pointer entered/exited
    // and convert to clockwise format (top/right/bottom/left = 0/1/2/3).
    var d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;

    return directions[d];
  };

  return (
    <>
      {lstPath && lstPath.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{t("APP.PREVRENDER.TITLE")}</p>
        </div>
      )}
      {lstPath &&
        lstPath.map((path) => (
          <span
            id="badge-dismiss-dark"
            className="btn btn-primary"
            style={{
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              setUpscaledImagePath(outputPath + "/" + path.srcFile);
              upscaylHandler;

              // Reset hover color
              let elList: NodeListOf<HTMLElement> = document.querySelectorAll(
                "#badge-dismiss-dark",
              );
              elList.forEach(
                (el) => (el.style.backgroundColor = "revert-layer"),
              );

              // Change color on hovering
              e.currentTarget.style.backgroundColor = "#4F46E5";
            }}
            onMouseLeave={(e) => {
              const direction = getHoverDirection(e);
              if (direction === "top" || direction === "bottom")
                // Change color on hovering
                e.currentTarget.style.backgroundColor = "revert-layer";
            }}
          >
            <span
              style={{
                minWidth: "80%",
                maxWidth: "80%",
              }}
            >{`${path.modelUsed}`}</span>
            <button
              title={t("APP.PREVRENDER.CLEAR")}
              type="button"
              className="ms-2 inline-flex items-center rounded-sm bg-transparent p-1 text-sm text-blue-400 hover:bg-blue-200 hover:text-blue-900 dark:hover:bg-blue-800 dark:hover:text-blue-300"
              key={path.srcFile}
              data-dismiss-target="#badge-dismiss-dark"
              aria-label="Remove"
              onClick={(e) => {
                handleUpImgPathLog(srcFilename, path.srcFile, "delete", false);
              }}
            >
              <svg
                className="h-2 w-2"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Remove</span>
            </button>
          </span>
        ))}
    </>
  );
};

export default PreviousRenders;
