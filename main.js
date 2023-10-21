/* --- css --- */

// Reveal
import "./node_modules/reveal.js/dist/reveal.css";
import "./styles/reveal-theme.scss";

// Highlight
import "./node_modules/highlight.js/styles/atom-one-light.css";

// Custom
import "./styles/custom.scss";

/* --- js --- */

// Reveal core
import Reveal from "reveal.js";

// Reveal plugins
import Markdown from "reveal.js/plugin/markdown/markdown";
import Highlight from "reveal.js/plugin/highlight/highlight";
import Notes from "reveal.js/plugin/notes/notes";
import CopyCode from "reveal.js-copycode/plugin/copycode/copycode";

Reveal.initialize({
  hash: true,
  transition: "fade",
  margin: 0.06,
  width: 1920,
  height: 1080,
  minScale: 0.2,
  maxScale: 2.0,
  center: false,
  plugins: [Markdown, Highlight, Notes, CopyCode],

  copycode: {
    display: "icons", // "text"|"icons"|"both"
    style: {
      copybg: "#ddd",
      copiedbg: "#eee",
      copycolor: "#333",
      copiedcolor: "#333",
      copyborder: "1px solid #bbb", // e.g. "1px solid blue"
      copiedborder: "",
      scale: 1.25,
      offset: 0.25, // in em units
      radius: 0.25, // in em units
    },
  },
});
