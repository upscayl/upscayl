import "../styles/globals.css";
import Head from "next/head";
import { AppProps } from "next/app";
import { useEffect } from "react";
import { themeChange } from "theme-change";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Upscayl</title>
      </Head>
      <Component {...pageProps} data-theme="dark" />
    </>
  );
};

export default MyApp;
