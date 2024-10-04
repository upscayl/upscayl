import UpscaylSVGLogo from "../icons/upscayl-logo-svg";
import useTranslation from "../hooks/use-translation";

const UpscaylLogo = () => {
  const t = useTranslation();

  return (
    <div className="fixed right-2 top-2 z-50 flex items-center justify-center gap-2 rounded-[7px] bg-base-300 px-2 py-1 font-medium text-base-content ">
      <UpscaylSVGLogo className="w-5" />
      {t("TITLE")}
    </div>
  );
};

export default UpscaylLogo;
