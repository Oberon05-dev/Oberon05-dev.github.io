window.App = window.App || {};
App.dat.create = App.dat.create || {};


App.dat.create.product = function addProduct() {

  if (App.validation.isNameSet()) { App.validation.isPluSet(); return; }
  else if (App.validation.isPluSet()) return;

  App.history.capture("Dodaj produkt");

  const y = window.scrollY;
  const nazwa = App.object.input.ProductName.value.trim();
  const plu = App.object.input.Plu.value.trim();

  App.utils.rememberName(plu, nazwa);

  const nowyProdukt = {
    nazwa: nazwa,
    plu: plu,
    partie: []
  };

  App.state.products.push(nowyProdukt);
  loguj(`✅ Dodano produkt: ${nazwa} (${plu})`);

  App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);
  window.scrollTo(0, y);

  document.getElementById("nowa-nazwa").value = "";
  document.getElementById("nowe-plu").value = "";

  App.ui.notify('Produkt dodany', 'success');
}

App.dat.create.batch = function addBatch() {

  const y = window.scrollY;

  const dataInput = document.getElementById("partia-data");

  const data = (dataInput?.value || "").trim();

  if (App.validation.isDateSet(App.state)) return;

  App.history.capture("dodaj partie");

  const nazwaPole = document.getElementById("nowa-nazwa");
  const pluPole = document.getElementById("nowe-plu");

  const nazwaZForm = nazwaPole ? nazwaPole.value.trim() : "";
  const pluZForm = pluPole ? pluPole.value.trim() : "";

  let targetIndex = -1;

  if (pluZForm) {
    targetIndex = App.utils.getOrCreateProductByPLU(pluZForm, nazwaZForm);
  } else if (!App.validation.isProductExist(App.state)) {
    targetIndex = App.state.selectedProductIndex;
  } else {
    loguj("⚠️ Nie wybrano produktu i nie podano PLU w formularzu produktu.");
    App.ui.notify("Nie wybrano produktu ani PLU", "error");
    return;
  }

  const produkt = App.state.products[targetIndex];
  produkt.partie = Array.isArray(produkt.partie) ? produkt.partie : [];
  produkt.partie.push({ data, sztuki: 1, zgloszone: false });

  loguj(`✅ Dodano partię (${data}) do: ${produkt.nazwa} (${produkt.plu})`);
  App.ui.notify(`Dodano partię: ${data}`, "info");

  // Odśwież widoki
  App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);
  App.ui.renderTable("batch", App.object.table.Products, App.object.table.Batch, App.state.products, targetIndex);

  window.scrollTo(0, y);
  //selectedProductIndex = App.state.products.length;

  // Wyczyść pola partii
  if (dataInput) dataInput.value = "";

  if (pluZForm) {
    if (nazwaPole) nazwaPole.value = "";
    if (pluPole) pluPole.value = "";
    loguj("🧹 Wyczyszczono pola Nazwa/PLU po dodaniu partii do wskazanego produktu.");
  }
}