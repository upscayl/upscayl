import { translationAtom } from "@/atoms/translations-atom";
import { enableContributionAtom } from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";

const EnableContributionToggle = () => {
  const [enableContribution, setEnableContribution] = useAtom(
    enableContributionAtom,
  );
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">
        {t("SETTINGS.ENABLE_CONTRIBUTION.TITLE")}
      </p>
      <p className="text-xs text-base-content/80">
        {t("SETTINGS.ENABLE_CONTRIBUTION.DESCRIPTION")}
      </p>
      <input
        type="checkbox"
        className="toggle"
        checked={enableContribution}
        onClick={() => {
          setEnableContribution((prev) => !prev);
        }}
      />
    </div>
  );
};

export default EnableContributionToggle;
