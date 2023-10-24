export default () => ({
  id: "copyCode",

  init: (deck) => {
    const createCopyCodeButton = (callback) => {
      const button = document.createElement("button");
      button.title = "Copy code to clipboard";
      button.className = "copy-code";
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" style="width: 1em; height: 1em" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2Zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6ZM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2Z"/>
        </svg>
      `;
      let timeout;
      button.addEventListener("click", () => {
        callback?.();
        clearTimeout(timeout);
        button.classList.add("copy-code--active");
        timeout = setTimeout(
          () => button.classList.remove("copy-code--active"),
          500
        );
      });
      return button;
    };

    const copyCodeToClipboard = (pre) => {
      const code = pre.querySelector("code");
      const div = document.createElement("div");
      div.innerHTML = code.innerHTML.replaceAll("</tr>", "</tr>\n");
      navigator.clipboard.writeText(div.textContent);
    };

    deck
      .getSlidesElement()
      .querySelectorAll("pre")
      .forEach((pre) =>
        pre.appendChild(createCopyCodeButton(() => copyCodeToClipboard(pre)))
      );
  },
});
