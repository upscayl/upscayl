import "../styles/globals.css";
import Head from "next/head";

const MyApp = ({ Component, pageProps }) => {
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
