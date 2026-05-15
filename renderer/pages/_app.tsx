import "../styles/globals.css";
import { Provider } from "jotai";
import "react-tooltip/dist/react-tooltip.css";
import { Toaster } from "@/components/ui/toaster";
import { Tooltip } from "react-tooltip";
import PostHogProviderWrapper from "@/components/posthog-provider-wrapper";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-theme="upscayl">
      <Provider>
        <PostHogProviderWrapper>
          {children}
          <Toaster />
          <Tooltip
            className="z-[999] max-w-sm break-words !bg-secondary"
            id="tooltip"
          />
        </PostHogProviderWrapper>
      </Provider>
    </div>
  );
};

export default AppProviders;
