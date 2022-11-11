import "../styles/globals.css";
import Head from "next/head";
import { AppProps } from "next/app";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <div data-theme="dark">
      <Head>
        <title>Upscayl</title>
      </Head>
      <Component {...pageProps} />
    </div>
  );
};

export default MyApp;
