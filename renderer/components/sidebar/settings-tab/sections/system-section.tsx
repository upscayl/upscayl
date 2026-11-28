import React from "react";
import TurnOffNotificationsToggle from "../turn-off-notifications-toggle";
import AutoUpdateToggle from "../auto-update-toggle";
import EnableContributionToggle from "../enable-contributions-toggle";
import { ResetSettingsButton } from "../reset-settings-button";
import SystemInfo from "../system-info";
import { FEATURE_FLAGS } from "@common/feature-flags";
import { UpscaylCloudModal } from "@/components/upscayl-cloud-modal";
import { useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";

interface IProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setDontShowCloudModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function SystemSection({ show, setShow, setDontShowCloudModal }: IProps) {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-5">
      <div data-setting="notifications">
        <TurnOffNotificationsToggle />
      </div>
      <div data-setting="auto-update">
        <AutoUpdateToggle />
      </div>
      <div data-setting="contributions">
        <EnableContributionToggle />
      </div>

      <hr />

      <div data-setting="reset-settings">
        <ResetSettingsButton />
      </div>

      <hr />

      {FEATURE_FLAGS.SHOW_UPSCAYL_CLOUD_INFO && (
        <>
          <button
            className="rounded-btn bg-success shadow-success/40 animate-pulse p-1 text-sm text-slate-50 shadow-lg"
            onClick={() => setShow(true)}
          >
            {t("Introducing Upscayl Cloud!")}
          </button>

          <UpscaylCloudModal
            show={show}
            setShow={setShow}
            setDontShowCloudModal={setDontShowCloudModal}
          />
        </>
      )}

      <div data-setting="system-info">
        <SystemInfo />
      </div>
    </div>
  );
}

export default SystemSection;
