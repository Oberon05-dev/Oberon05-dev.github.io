window.App = window.App || {};
App.dat.update = App.dat.update || {};

App.dat.update.product = function updateProduct(index, { nazwa, plu }) {

  if (App.validation.isProductSelected(App.state)) return;
  if (App.validation.isProductExist(App.state)) return;

  App.history.capture("edycja produktu");

  if (typeof nazwa === "string") App.state.products[index].nazwa = nazwa;
  if (typeof plu === "string") App.state.products[index].plu = plu;

  loguj(`✏️ Zaktualizowano produkt: ${App.state.products[index].nazwa} (${App.state.products[index].plu})`);
  App.ui.notify(`Zakt. produkt: ${App.state.products[index].nazwa}`, "info"); 
};

App.dat.update.batch = function updateBatch(pIndex, bIndex, { data }) {

  if (App.validation.isProductSelected(App.state)) return;
  if (App.validation.isBatchSelected(App.state)) return;
  if (App.validation.isProductExist(App.state)) return;
  if (App.validation.isBatchExist(App.state)) return;

  App.history.capture("edycja partii");

  if (typeof data === "string") App.state.products[pIndex].partie[bIndex].data = data;

  loguj(`✏️ Zaktualizowano partię produktu ${App.state.products[pIndex].nazwa}`);
  App.ui.notify(`Zakt. partię produktu: ${data}`, "info");
};