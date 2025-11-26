window.App = window.App || {};
App.dat.delete = App.dat.delete || {};

App.dat.delete.product = function deleteProduct() {

  const y = window.scrollY; 

  if (App.validation.isProductSelected(App.state)) return;

  const produkt = App.state.products[App.state.selectedProductIndex];

  // todo: oddzielne okienko nie orzez przeglądarke 
  // (może nawet guzior który rozbija się na 2 części tak/nie)
  if (!confirm(`Czy na pewno chcesz usunąć produkt: ${produkt.nazwa} (${produkt.plu})?`)) {
    return;
  }

  App.history.capture("usuń produkt");

  App.state.products.splice(App.state.selectedProductIndex, 1); // usuń 1 element z tablicy
  loguj(`🗑️ Usunięto produkt: ${produkt.nazwa} (${produkt.plu})`);
  App.ui.notify(`Usunięto produkt: ${produkt.nazwa}`, "info");
  
  App.state.selectedProductIndex -= 1;
  App.ui.clearTable(App.object.table.Batch);
  App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);

  window.scrollTo(0, y); 
}

App.dat.delete.batch = function deleteBatch() {

  const y = window.scrollY;
  const produkt = App.state.products[App.state.selectedProductIndex];

  if (App.validation.isProductSelected(App.state)) return;
  if (App.validation.isBatchSelected(App.state)) return;
  if (App.validation.isProductExist(App.state)) return;
  if (App.validation.isBatchExist(App.state)) return;

  const potw = confirm(`Usunąć partię ${produkt.partie[App.state.selectedBatchIndex].data}?`);
  if (!potw) return;

  App.history.capture("usun partie");

  produkt.partie.splice(App.state.selectedBatchIndex, 1);
  App.state.selectedBatchIndex = null;

  // odśwież widoki
  App.ui.renderTable("batch", App.object.table.Products, App.object.table.Batch, App.state.products, App.state.selectedProductIndex);
  App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);

  window.scrollTo(0, y);

  loguj("🗑️ Partia usunięta.");
  App.ui.notify("Usunięto partię", "info");
}