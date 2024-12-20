import "../styles/globals.css";
import Head from "next/head";
import { AppProps } from "next/app";
import { Provider } from "jotai";
import "react-tooltip/dist/react-tooltip.css";
import { Toaster } from "@/components/ui/toaster";
import { Tooltip } from "react-tooltip";
import PostHogProviderWrapper from "@/components/posthog-provider-wrapper";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Upscayl</title>
      </Head>
      <base href="./" />

      <Provider>
        <PostHogProviderWrapper>
          <Component {...pageProps} data-theme="upscayl" />
          <Toaster />
          <Tooltip
            className="z-[999] max-w-sm break-words !bg-secondary"
            id="tooltip"
          />
        </PostHogProviderWrapper>
      </Provider>
    </>
  );
};

export default MyApp;
