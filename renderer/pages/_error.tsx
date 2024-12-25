import ResetButton from "@/components/main-content/reset-button";
import { ResetSettingsButton } from "@/components/sidebar/settings-tab/reset-settings-button";
import { SkullIcon } from "lucide-react";

function Error({ statusCode }) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-base-300">
      <div className="flex flex-col items-center justify-center gap-2">
        <SkullIcon className="h-10 w-10" />
        <p className="max-w-lg text-balance text-center text-lg font-semibold">
          {statusCode
            ? `An error ${statusCode} occurred on server.`
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

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
