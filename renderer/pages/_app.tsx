import "../styles/globals.css";
import Head from "next/head";
import { AppProps } from "next/app";
import { useEffect } from "react";
import { themeChange } from "theme-change";
import log from "electron-log/renderer";
import { Provider } from "jotai";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Upscayl</title>
      </Head>
      <Provider>
        <Component {...pageProps} data-theme="dark" />
      </Provider>
    </>
  );
};

export default MyApp;
