document.addEventListener("DOMContentLoaded", () => {
    const debugToggle = document.getElementById("debug-toggle");
    const debugPanel = document.getElementById("debug-panel");

    debugToggle.addEventListener("change", () => {
        const aktywny = debugToggle.checked;
        debugPanel.style.display = aktywny ? "block" : "none"
    });
});

function loguj(tresc) {
  const out = document.getElementById("terminal-output");
  if (!out) return;

  const linia = document.createElement("div");
  linia.textContent = `[${new Date().toLocaleTimeString()}] ${tresc}`;
  out.appendChild(linia);
  out.scrollTop = out.scrollHeight; // auto scroll do dołu
}

function wyczyscTerminal() {
  const out = document.getElementById("terminal-output");
  if (out) out.innerHTML = "";
  loguj("✅ Terminal wyczyszczony.");
}
