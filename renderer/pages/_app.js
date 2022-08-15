import { ThemeProvider } from "next-themes";
import "../styles/globals.css";
import Head from "next/head";

const MyApp = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>DeskCut</title>
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem="true"
      >
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
};

export default MyApp;
