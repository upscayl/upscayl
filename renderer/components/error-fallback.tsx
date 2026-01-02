import { ResetSettingsButton } from "@/components/sidebar/settings-tab/reset-settings-button";
import { SkullIcon } from "lucide-react";
import { FallbackProps } from "react-error-boundary";

function ErrorFallback({ error }: FallbackProps) {
  return (
    <div className="bg-base-300 flex h-screen w-screen flex-col items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center justify-center gap-2">
        <SkullIcon className="h-10 w-10" />
        <p className="max-w-lg text-center text-lg font-semibold text-balance">
          {error?.message
            ? `An error "${error.message}" occurred in the app.`
            : "An error occurred in the app."}{" "}
        </p>
        <p className="mb-2 max-w-sm text-center text-balance">
          Please check the console for more information by pressing F12 or
          Ctrl/⌘+Option+I.
        </p>
        <ResetSettingsButton hideLabel />
      </div>
    </div>
  );
}

export default ErrorFallback;
