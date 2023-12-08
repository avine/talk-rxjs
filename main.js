/* --- css --- */

// Reveal
import "./node_modules/reveal.js/dist/reveal.css";
import "./styles/theme.scss";

// Highlight
import "./node_modules/highlight.js/styles/atom-one-dark.css";

// CopyCode
import "./plugins/copy-code/copy-code.scss";

// Custom
import "./styles/custom.scss";

/* --- js --- */

// Reveal core
import Reveal from "reveal.js";

// Reveal plugins
import Markdown from "reveal.js/plugin/markdown/markdown";
import Highlight from "reveal.js/plugin/highlight/highlight";
import Notes from "reveal.js/plugin/notes/notes";
import CopyCode from "./plugins/copy-code/copy-code";

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
});

// Trigger Confetti by pressing "c" key
import confetti from 'canvas-confetti';
document.addEventListener('keyup', (keyboardEvent) => {
  if (keyboardEvent.key === 'c') {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.65 } });
  }
})
