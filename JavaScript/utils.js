window.App = window.App || {};
App.utils = App.utils || {};

App.utils.countDaysTo = function countDaysTo(dataStr, today = new Date()) {
  const target = new Date(dataStr);

  //zabezpieczenie w przypadku braku daty
  if (Number.isNaN(target.getTime())) return null; 

  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end   = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = end - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

App.utils.extractDate = function extractDate(date){
  return [ 
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ]
}

App.utils.minDaysForProduct = function minDaysForProduct(prod) {
  if (!Array.isArray(prod?.partie) || prod.partie.length === 0) return Infinity;
  let min = Infinity;
  for (const b of prod.partie) {
    const d = App.utils.countDaysTo(b.data);
    if (d == null) continue;
    if (d < min) min = d;
  }
  return min;
}

App.utils.getProductNameByPlu = function (plu) {
  const kod = App.utils.normalizePlu(plu);
  if (!kod) return null;

  const fDictionary = App.state.knownNames[kod];
  if (fDictionary) return fDictionary;

  const p = (App.state.products || []).find(x => App.utils.normalizePlu(x.plu) === kod);
  if (p?.nazwa) {
    App.state.knownNames[kod] = p.nazwa;
    return p.nazwa;
  }
  return null;
}

App.utils.rememberName = function (plu, name) {
  const code = App.utils.normalizePlu(plu);
  const sName = String(name ?? "").trim();

  if (!code || !name) return false;

  App.state.knownNames[code] = sName;
}

App.utils.getOrCreateProductByPLU = function (plu, nazwa = "") {
  let idx = App.state.products.findIndex(p => p.plu === plu);
  if (idx === -1) {
    const nowy = { nazwa: nazwa?.trim() || "(bez nazwy)", plu, partie: [] };
    App.state.products.push(nowy);
    idx = App.state.products.length - 1;
    loguj(`🆕 Utworzono nowy produkt: ${nowy.nazwa} (${plu})`);
  } else {
    if (nazwa && App.state.products[idx].nazwa === "(bez nazwy)") {
      App.state.products[idx].nazwa = nazwa.trim();
    }
  }
  return idx;
};

App.utils.normalizePlu = function (v) {
  return String(v ?? "").trim();
}

App.utils.setSortMode = function (mode) {
  App.state.sortMode = (mode === "expiry") ? "expiry" : "added";
  loguj(`↕️ Sortowanie: ${App.state.sortMode === "expiry" ? "Termin (najbliższe na górze)" : "Dodawanie (oryginalna kolejność)"}`);

  App.ui.renderTable(
    "product",
    App.object.table.Products,
    App.object.table.Batch,
    App.state.products
  );

  if (typeof App.state.selectedProductIndex === "number" && App.state.selectedProductIndex >= 0) {
    App.ui.renderTable(
      "batch",
      App.object.table.Products,
      App.object.table.Batch,
      App.state.products,
      App.state.selectedProductIndex
    );
  }
};

App.utils.pasteFromClipboard = async function () {
    try {
        const text = await navigator.clipboard.readText();
        if (!text) return;

        const target = App.ui.context.privateEvent?.target;
        if (!target) return;

        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
            target.value = text;
            target.dispatchEvent(new Event("input")); // aktualizacja UI
            App.ui.notify("Wklejono zawartość")
            App.history.capture("wklejenie");
        }

    } catch (err) {
        console.error("Clipboard paste error:", err);
    }
};
