import { ResetSettingsButton } from "@/components/sidebar/settings-tab/reset-settings-button";
import { SkullIcon } from "lucide-react";
import { FallbackProps } from "react-error-boundary";

function ErrorFallback({ error }: FallbackProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-base-300">
      <div className="flex flex-col items-center justify-center gap-2">
        <SkullIcon className="h-10 w-10" />
        <p className="max-w-lg text-balance text-center text-lg font-semibold">
          {error?.message
            ? `An error "${error.message}" occurred on server.`
            : "An error occurred in the app."}{" "}
        </p>
        <p className="mb-2 max-w-sm text-balance text-center">
          Please check the console for more information by pressing F12 or
          Ctrl/⌘+Option+I.
        </p>
        <ResetSettingsButton hideLabel />
      </div>
    </div>
  );
}

export default ErrorFallback;
