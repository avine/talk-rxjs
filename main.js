/* --- css --- */

// Reveal
import "./node_modules/reveal.js/dist/reveal.css";
import "./styles/theme.scss";

// Highlight
import "./node_modules/highlight.js/styles/atom-one-dark.css"; // Choose between "atom-one-light.css" and "./atom-one-dark.css"

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

const deck = new Reveal({
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

deck.initialize();

// Trigger Confetti by pressing "C" key
import confetti from 'canvas-confetti';
document.addEventListener('keyup', (keyboardEvent) => {
  if (keyboardEvent.key === 'C') {
    confetti({ particleCount: 200, spread: 365, scalar: 1.5, origin: { y: 0.4 } });
  }
})
