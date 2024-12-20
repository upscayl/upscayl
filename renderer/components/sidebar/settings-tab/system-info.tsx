import useSystemInfo from "@/components/hooks/use-system-info";
import useTranslation from "@/components/hooks/use-translation";
import React from "react";

const SystemInfo = () => {
  const { systemInfo } = useSystemInfo();
  const t = useTranslation();

  if (!systemInfo) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-sm font-medium">{t("SETTINGS.SYSTEM_INFO.TITLE")}</p>
      <div className="flex flex-col gap-3 rounded-sm bg-base-200 p-4 text-xs">
        {Object.keys(systemInfo || {}).map((key) => (
          <div key={key} className="flex flex-col">
            <p className="font-mono capitalize">{key}:</p>
            {typeof systemInfo[key] === "object" ? (
              <div className="ml-2">
                {Object.keys(systemInfo[key]).map((subKey) => (
                  <div key={subKey} className="flex flex-row gap-1">
                    <p className="font-mono">{subKey}:</p>
                    <p className="font-mono font-semibold">
                      {systemInfo[key][subKey]}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-mono font-semibold">{systemInfo[key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemInfo;
