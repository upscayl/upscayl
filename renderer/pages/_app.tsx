import "../styles/globals.css";
import Head from "next/head";
import { AppProps } from "next/app";
import { Provider } from "jotai";
import "react-tooltip/dist/react-tooltip.css";
import { Toaster } from "@/components/ui/toaster";
import posthog from "posthog-js";
import { useEffect } from "react";
import { PostHogProvider } from "posthog-js/react";

const MyApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    posthog.init("phc_QMcmlmComdofjfaRPzoN4KV9ziV2KgOwAOVyu4J3dIc", {
      api_host: "https://us.i.posthog.com",
      person_profiles: "identified_only",
      // Enable debug mode in development
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") posthog.debug();
      },
    });
  }, []);

  return (
    <>
      <Head>
        <title>Upscayl</title>
      </Head>

      <Provider>
        <PostHogProvider client={posthog}>
          <Component {...pageProps} data-theme="upscayl" />
          <Toaster />
        </PostHogProvider>
      </Provider>
    </>
  );
};

export default MyApp;
