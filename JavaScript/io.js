App.io = App.io || {};

//===============================
// WCZYTYWANIE/ZAPISYWANIE PLIKU
//===============================

// Otwórz plik przez File System Access API (daje prawo zapisu)
App.io.openEditableFile = async function openEditableFile() {
  if (!window.showOpenFilePicker) {
    loguj("⚠️ Twoja przeglądarka nie wspiera zapisu bez pobierania. Użyję pobierania pliku jako fallback.");
    App.ui.notify(`Twoja przeglądarka nie wspiera zapisu bez pobierania. Program Użyje pobierania pliku`, "info");
    return;
  }
  try {
    const [handle] = await window.showOpenFilePicker({
      multiple: false,
      types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
    });

    App.state.fileHandle = handle;
    loguj("🔗 Uchwyt ustawiony: " + (App.state.fileHandle ? "OK" : "BRAK"));

    const file = await handle.getFile();
    const text = await file.text();

    // NEW: dopilnuj inicjalizacji słownika w stanie
    App.state.knownNames = App.state.knownNames || {}; // NEW

    let products = [];
    let knownNames = {}; // NEW
    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        // stary format: sama tablica produktów
        products = parsed;
        knownNames = {}; // NEW
      } else if (parsed && typeof parsed === "object") {
        // NEW: nowy format: { products: [...], knownNames: {...} }
        products   = Array.isArray(parsed.products) ? parsed.products : [];
        knownNames = parsed.knownNames && typeof parsed.knownNames === "object" ? parsed.knownNames : {};
      } else {
        loguj("⚠️ Plik ma nieobsługiwaną strukturę – wczytuję pustą listę.");
        App.ui.notify(`Plik ma nieobsługiwaną strukturę – wczytuję pustą listę.`, "error");
      }
    } catch (e) {
      loguj("❌ Błędny JSON – wczytuję pustą listę.");
      App.ui.notify(`Bląd - wczytuję pustą listę.`, "error");
    }

    if (Object.keys(knownNames).length === 0) {
      for (const p of products) {
        const kod = String(p?.plu ?? "").trim();
        const naz = String(p?.nazwa ?? "").trim();
        if (kod && naz && !knownNames[kod]) knownNames[kod] = naz;
      }
    }
    else {
      for (const p of products) {
        const kod = String(p?.plu ?? "").trim();
        const naz = String(p?.nazwa ?? "").trim();
        if (kod && naz && !knownNames[kod]) {
          knownNames[kod] = naz;
        }
      }
    }

    App.state.products   = products;
    App.state.knownNames = knownNames;     

    App.state.selectedProductIndex = 0;
    App.state.selectedBatchIndex = 0;
    App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);
    App.ui.renderTable("batch", App.object.table.Products, App.object.table.Batch, App.state.products, App.state.selectedProductIndex);

    const pathBox = document.getElementById("opened-path");
    if (pathBox) pathBox.textContent = `Otwarto: ${file.name}`;

    loguj(`✅ Załadowano i przypięto plik do edycji: ${file.name} — produkty: ${products.length}, knownNames: ${Object.keys(knownNames).length}`);
    App.ui.notify(`Załadowano i przypięto plik do edycji`, "success");
  } catch (err) {
    loguj(`❌ Anulowano lub błąd otwierania pliku: ${err.message}`);
    App.ui.notify(`Anulowano lub błąd otwierania pliku`, "error");
  }
};

App.io.saveToFile = async function saveToFile() {
  try {
    const handle = App.state.fileHandle;
    if (!handle) {
      loguj("⚠️ Brak uchwytu pliku. Najpierw użyj 'Otwórz plik (edycja)'.");
      App.ui.notify(`Brak pliku. Najpierw otwórz plik`, "error");
      return;
    }

    // NEW: zawsze zapisuj obiekt z dwoma polami
    const payload = {                                   // NEW
      products: Array.isArray(App.state.products) ? App.state.products : [],
      knownNames: App.state.knownNames || {}
    };                                                  // NEW
    const json = JSON.stringify(payload, null, 2);      // CHANGED (zamiast samej tablicy)

    // zapis „in place” – bez pobierania nowego pliku
    if (handle && handle.createWritable) {
      // Uwaga: w Twoim kodzie wywołujesz App.io.ensurePermission – jeśli nie masz jej, użyj globalnej ensurePermission
      const ok = typeof App.io.ensurePermission === "function"
        ? await App.io.ensurePermission(handle, true)
        : await ensurePermission(handle, true);         // NEW (bezpieczny fallback)

      if (!ok) { loguj("⚠️ Brak uprawnień do zapisu."); return; }

      const writable = await handle.createWritable();
      await writable.write(new Blob([json], { type: "application/json" }));
      await writable.close();

      loguj("💾 Nadpisano wybrany plik.");
      App.ui.notify(`Zapisano Plik`, "success");
      return;
    }

    // fallback – gdy createWritable niedostępne
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dane.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    loguj("⬇️ createWritable niedostępne – pobrano dane jako dane.json (fallback).");
  } catch (err) {
    loguj(`❌ Błąd zapisu: ${err.message}`);
  }
};

App.io.saveToExport = function(filename, dataObj) {
  const json = JSON.stringify(dataObj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;   // 👈 wymuszenie katalogu i nazwy
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
  loguj(`⬇️ Zapisano plik w folderze export/: ${filename}`);
};


App.io.ensurePermission = async function ensurePermission(handle, write = false) {
  if (!handle || !handle.queryPermission) return false;

  const opts = { mode: write ? "readwrite" : "read" };
  const state = await handle.queryPermission(opts);
  if (state === "granted") return true;
  if (state === "prompt") {
    const req = await handle.requestPermission(opts);
    return req === "granted";
  }
  loguj("brak permisji");
  return false;
}