import "../styles/globals.css";
import Head from "next/head";
import { AppProps } from "next/app";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Upscayl</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
