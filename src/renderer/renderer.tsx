/**
 * React renderer.
 */
// Import the styles here to process them with webpack
import "_public/style.css";

import App from "_renderer/App";
import * as React from "react";
import { createRoot } from "react-dom/client";

const container = document.getElementById("app");
const root = createRoot(container!);
root.render(<App />);
