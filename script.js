//===========================
// CONFIG I BLOBALNE ZMIENNE
//===========================
const tbodyProdukty = document.getElementById("produkty");
const tbodyPartie = document.getElementById("partie");
const btnDodaj = document.getElementById("dodaj-produkt-btn");
const btnDodajPartie = document.getElementById("dodaj-partie-btn");
const openBtn = document.getElementById("open-editable");
const saveBtn = document.getElementById("save-file");
const btnUsun = document.getElementById("usun-produkt-btn");
const btnUsunPartia = document.getElementById("usun-partie");
const sorterAdded = document.getElementById("sort-added");
const sorterExpiry = document.getElementById("sort-expiry");

const leftForm = document.getElementById("formularz-produktu");
const rightBox = document.getElementById("dodawanie-partii");

let selectedProductIndex = -1
let selectedBatchIndex = -1
let fileHandle = null;
let sortMode = "added";

// czekanie na załadownaie strony i inmport obiektów
document.addEventListener("DOMContentLoaded", () => {
  btnDodaj.addEventListener("click", dodajProdukt);
  if (btnDodajPartie) btnDodajPartie.addEventListener("click", dodajPartie);
  if (openBtn) openBtn.addEventListener("click", App.io.openEditableFile);
  if (saveBtn) saveBtn.addEventListener("click", App.io.saveToFile);
  if (btnUsun) btnUsun.addEventListener("click", usunProdukt);
  if (btnUsunPartia) btnUsunPartia.addEventListener("click", usunPartie);
  if (sorterAdded && sorterExpiry) {
    sorterAdded.addEventListener("change", () => setSortMode("added"));
    sorterExpiry.addEventListener("change", () => setSortMode("expiry"));
  }

  if (!leftForm || !rightBox) return;
  const toggleChrome = () => {
    const stuck = window.scrollY > 10;
    leftForm.classList.toggle("is-stuck", stuck);
    rightBox.classList.toggle("is-stuck", stuck);
  };

  window.addEventListener("scroll", toggleChrome, {passive: true});
  toggleChrome();
});

//====================
// RENDEROWANIE TABEL
//====================

function createRow(type, data, index, tbodyBatches){
  if (type == "product"){
    const tr = document.createElement("tr");

    const toReport = Array.isArray(data.partie) && data.partie.some(
      batch => countDaysTo(batch.data) <= 29
    );
    const critical = Array.isArray(data.partie) && data.partie.some(
      batch => countDaysTo(batch.data) <= 0
    );

    if (toReport) tr.classList.add("zgloszenie");
    if (critical) {tr.classList.add("krytyczne")};

    tr.innerHTML = `
      <td>${data.nazwa}</td>
      <td>${data.plu}</td>
    `;

    tr.addEventListener("click", () => {
      loguj(`📂 Otwieram produkt ${index}: ${data.nazwa}`);
      selectedProductIndex = index;
      selectedBatchIndex = null;
      setActive(tr);
      renderTable("batch", tbodyProdukty, tbodyPartie, App.state.products, index);
    });
    return tr;
  } else if (type == "batch"){
    const tr = document.createElement("tr");
    const days = countDaysTo(data.data)

    if (days <= 29) tr.classList.add("zgloszenie");
    if (days <= 0) {tr.classList.add("krytyczne")};

    tr.innerHTML = `
      <td>${data.data}</td>
      <td>${data.sztuki}</td>
      <td>${days} dni</td>
    `;

    // zaznaczanie partii (toggle)
    tr.addEventListener("click", () => {
      const on = tr.classList.contains("aktywne");
      tbodyBatches?.querySelectorAll("tr").forEach(r => r.classList.remove("aktywne"));
      if (!on) tr.classList.add("aktywne");
      selectedBatchIndex = on ? null : index;
    });

    return tr;
  }
}

// wyświetlenie tabeli
function renderTable(type, ProductTable, BatchTable, products, index) {
  if (type == "product"){
    clearTable(ProductTable);

    let items = products.map((p, i) => ({ p, i, score: minDaysForProduct(p) }));

    if (sortMode === "expiry") {
      items.sort((a, b) => a.score - b.score);
    }

    items.forEach(({ p, i }) => {
      ProductTable.appendChild(App.ui.createRow("product", p, i, ProductTable));
    });

    loguj(`📋 Wyświetlono ${products.length} produktów (${sortMode === "expiry" ? "sort: termin" : "sort: dodawanie"})`);
  }
  else if (type == "batch") {
    clearTable(BatchTable);
    if (index == null || index < 0 || index >= products.length) {
      BatchTable.innerHTML = "<tr><td colspan='3'>Brak danych o partiach</td></tr>";
      return;
    }
    const product = products[index];
    const batches = (product.partie) ? product.partie : [];
    if (batches.length === 0) {
      BatchTable.innerHTML = "<tr><td colspan='3'>Brak danych o partiach</td></tr>";
      return;
    }

    batches.forEach((batch, i) => {
      tbodyPartie.appendChild(createRow("batch", batch, i, BatchTable));
    });
  }
}

//====================
// MANIPULACJA DANYMI
//====================

function usunProdukt() {
  const y = window.scrollY; 

  if (selectedProductIndex < 0 || selectedProductIndex >= App.state.products.length) {
    loguj("⚠️ Nie wybrano żadnego produktu do usunięcia.");
    return;
  }

  const produkt = App.state.products[selectedProductIndex];

  if (!confirm(`Czy na pewno chcesz usunąć produkt: ${produkt.nazwa} (${produkt.plu})?`)) {
    return;
  }

  App.state.products.splice(selectedProductIndex, 1); // usuń 1 element z tablicy
  loguj(`🗑️ Usunięto produkt: ${produkt.nazwa} (${produkt.plu})`);
  
  selectedProductIndex = -1;
  clearTable(tbodyPartie);
  renderTable("product", tbodyProdukty, tbodyPartie, App.state.products);

  window.scrollTo(0, y); 
}

function dodajProdukt() {
  const y = window.scrollY; 
  const nazwa = document.getElementById("nowa-nazwa").value.trim();
  const plu = document.getElementById("nowe-plu").value.trim();

  if (!nazwa || !plu) {
    loguj("⚠️ Uzupełnij pola: Nazwa i PLU!");
    return;
  }

  const nowyProdukt = {
    nazwa: nazwa,
    plu: plu,
    partie: []
  };

  App.state.products.push(nowyProdukt);
  loguj(`✅ Dodano produkt: ${nazwa} (${plu})`);

  renderTable("product", tbodyProdukty, tbodyPartie, App.state.products);
  window.scrollTo(0, y);

  document.getElementById("nowa-nazwa").value = "";
  document.getElementById("nowe-plu").value = "";
}

function usunPartie() {
  const y = window.scrollY;

  if (selectedProductIndex < 0) { loguj("⚠️ Najpierw wybierz produkt."); return; }
  if (selectedBatchIndex == null) { loguj("⚠️ Wybierz partię do usunięcia."); return; }

  const produkt = App.state.products[selectedProductIndex];
  if (!produkt || !produkt.partie || !produkt.partie[selectedBatchIndex]) {
    loguj(`❌ Nie znaleziono partii ${selectedProductIndex}.`); return;
  }

  const potw = confirm(`Usunąć partię ${produkt.partie[selectedBatchIndex].data}?`);
  if (!potw) return;

  produkt.partie.splice(selectedBatchIndex, 1);
  selectedBatchIndex = null;

  // odśwież widoki
  renderTable("batch", tbodyProdukty, tbodyPartie, App.state.products, selectedProductIndex);
  renderTable("product", tbodyProdukty, tbodyPartie, App.state.products);

  window.scrollTo(0, y);

  loguj("🗑️ Partia usunięta.");
}

function getOrCreateProductByPLU(plu, nazwa = "") {
  let idx = App.state.products.findIndex(p => p.plu === plu);
  if (idx === -1) {
    const nowy = { nazwa: nazwa || "(bez nazwy)", plu, partie: [] };
    App.state.products.push(nowy);
    idx = App.state.products.length - 1;
    loguj(`🆕 Utworzono nowy produkt: ${nowy.nazwa} (${plu})`);
  }
  return idx;
}

function dodajPartie() {
  const y = window.scrollY;

  const dataInput = document.getElementById("partia-data");
  const iloscInput = document.getElementById("partia-ilosc");

  const data = (dataInput?.value || "").trim();
  const ilosc = parseInt((iloscInput?.value || "0").trim(), 10);

  if (!data || Number.isNaN(ilosc) || ilosc <= 0) {
    loguj("⚠️ Podaj poprawną datę (YYYY-MM-DD) i dodatnią ilość.");
    return;
  }

  const nazwaPole = document.getElementById("nowa-nazwa");
  const pluPole   = document.getElementById("nowe-plu");

  const nazwaZForm = nazwaPole ? nazwaPole.value.trim() : "";
  const pluZForm   = pluPole ? pluPole.value.trim() : "";

  let targetIndex = -1;

  if (pluZForm) {
    targetIndex = getOrCreateProductByPLU(pluZForm, nazwaZForm);
  } else if (selectedProductIndex >= 0 && selectedProductIndex < App.state.products.length) {
    targetIndex = selectedProductIndex;
  } else {
    loguj("⚠️ Nie wybrano produktu i nie podano PLU w formularzu produktu.");
    return;
  }

  const produkt = App.state.products[targetIndex];
  produkt.partie = Array.isArray(produkt.partie) ? produkt.partie : [];
  produkt.partie.push({ data, sztuki: ilosc });

  loguj(`✅ Dodano partię (${data}, ${ilosc} szt.) do: ${produkt.nazwa} (${produkt.plu})`);

  // Odśwież widoki
  renderTable("product", tbodyProdukty, tbodyPartie, App.state.products);
  renderTable("batch", tbodyProdukty, tbodyPartie, App.state.products, targetIndex);

  window.scrollTo(0, y);
  selectedProductIndex = App.state.products.length;

  // Wyczyść pola partii
  if (dataInput) dataInput.value = "";
  if (iloscInput) iloscInput.value = "";

  if (pluZForm) {
    if (nazwaPole) nazwaPole.value = "";
    if (pluPole) pluPole.value = "";
    loguj("🧹 Wyczyszczono pola Nazwa/PLU po dodaniu partii do wskazanego produktu.");
  }
}

//===============================
// HELPERY
//===============================

// Helper: upewnienie się, czy są uprawnienia (Chrome/Edge/Opera)
async function ensurePermission(handle, write = false) {
  if (!handle || !handle.queryPermission) return false;

  const opts = { mode: write ? "readwrite" : "read" };
  const state = await handle.queryPermission(opts);
  if (state === "granted") return true;
  if (state === "prompt") {
    const req = await handle.requestPermission(opts);
    return req === "granted";
  }
  return false;
}

function countDaysTo(dataStr, today = new Date()) {
  const target = new Date(dataStr);

  //zabezpieczenie w przypadku braku daty
  if (Number.isNaN(target.getTime())) return null; 

  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end   = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const diffMs = end - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function setActive(tr) {
  document.querySelectorAll("#produkty tr").forEach(row => {
    row.classList.remove("aktywne");
  });
  document.querySelectorAll("#partie tr").forEach(row => {
    row.classList.remove("aktywne");
  });

  tr.classList.add("aktywne");
}

function clearTable(tbody) {
  tbody.innerHTML = "";
  loguj("✅ Wyczyszczono tabele")
}

function extractDate(date){
  return [ 
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ]
}

function minDaysForProduct(prod) {
  if (!Array.isArray(prod?.partie) || prod.partie.length === 0) return Infinity;
  let min = Infinity;
  for (const b of prod.partie) {
    const d = countDaysTo(b.data);
    if (d == null) continue;
    if (d < min) min = d;
  }
  return min;
}

function setSortMode(mode){
  sortMode = (mode === "expiry") ? "expiry" : "added";
  loguj(`↕️ Sortowanie: ${sortMode === "expiry" ? "Termin (najbliższe na górze)" : "Dodawanie (oryginalna kolejność)"}`);
  renderTable("product", tbodyProdukty, tbodyPartie, App.state.products);
  if (selectedBatchIndex >= 0) {
    renderTable("batch", tbodyProdukty, tbodyPartie, App.state.products, selected);
  }
}
window.setSortMode = setSortMode; // wygodnie z konsoli
