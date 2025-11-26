window.App = window.App || {};

// gdzieś bląd, po kliknięciu usun itp. guziory z potwierdzeniem i je anulujesz,
// ctrl-z jakby raz nie dzialal. upewnić się że migawka danych jest robiona po potwierdzeniu.

App.history.clone = function (obj) {
  try { return structuredClone(obj); }
  catch { return JSON.parse(JSON.stringify(obj)); }
};

App.history.getSnapshot = function (label = "") {
  return {
    label,
    state: {
      products: App.history.clone(App.state.products),
      knownNames: App.history.clone(App.state.knownNames),
      selectedProductIndex: App.state.selectedProductIndex,
      selectedBatchIndex: App.state.selectedBatchIndex,
      sortMode: App.state.sortMode,
      selectedTable: App.state.selectedTable,   // << nowy klucz
    }
  };
};

App.history.applySnapshot = function (snap) {
  if (!snap) return;
  const s = snap.state;

  App.state.products = App.history.clone(s.products);
  App.state.knownNames = App.history.clone(s.knownNames);
  App.state.selectedProductIndex = s.selectedProductIndex;
  App.state.selectedBatchIndex = s.selectedBatchIndex;
  App.state.sortMode = s.sortMode;
  App.state.selectedTable = s.selectedTable;

  // odśwież obie tabele
  App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);
  if (Number.isInteger(App.state.selectedProductIndex) && App.state.selectedProductIndex >= 0) {
    App.ui.renderTable("batch", App.object.table.Products, App.object.table.Batch, App.state.products, App.state.selectedProductIndex);
  } else {
    App.ui.clearTable(App.object.table.Batch);
  }

  // przywróć zaznaczenia (aktywne wiersze) po renderze
  const PT = App.object.table.Products;
  const BT = App.object.table.Batch;

  if (Number.isInteger(App.state.selectedProductIndex) && App.state.selectedProductIndex >= 0) {
    const tr = PT?.querySelectorAll("tr")[App.state.selectedProductIndex];
    if (tr) tr.classList.add("aktywne");
  }
  if (Number.isInteger(App.state.selectedBatchIndex) && App.state.selectedBatchIndex >= 0) {
    const tr = BT?.querySelectorAll("tr")[App.state.selectedBatchIndex];
    if (tr) tr.classList.add("aktywne");
  }

  loguj?.(`🔁 Przywrócono: ${snap.label || "(bez nazwy)"} [${App.state.selectedTable}]`);
};

App.history.capture = function (label = "") {
  App.history.undoStack.push(App.history.getSnapshot(label));
  if (App.history.undoStack.length > App.history.limit) App.history.undoStack.shift();
  App.history.redoStack.length = 0;
  loguj?.(`💾 Zapisano krok: ${label}`);
};

App.history.undo = function () {
  const y = window.scrollY;

  if (!App.history.undoStack.length) return loguj?.("↩️ Brak kroków do cofnięcia.");

  const current = App.history.getSnapshot("(auto)");
  const prev = App.history.undoStack.pop();

  App.history.redoStack.push(current);
  App.history.applySnapshot(prev);

  App.ui.notify(`Cofnięto edycje`, "info");

  window.scrollTo(0, y);
};

App.history.redo = function () {
  const y = window.scrollY;

  if (!App.history.redoStack.length) return loguj?.("↪️ Brak kroków do ponowienia.");

  const current = App.history.getSnapshot("(auto)");
  const next = App.history.redoStack.pop();

  App.history.undoStack.push(current);
  App.history.applySnapshot(next);

  App.ui.notify(`Cofnięto cofnięcie`, "info");

  window.scrollTo(0, y);
};
