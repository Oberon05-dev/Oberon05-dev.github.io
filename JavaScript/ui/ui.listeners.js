window.App = window.App || {};
App.ui.listeners = App.ui.listeners || {};

App.ui.listeners.productClick = function(tr, index, data){
    tr.addEventListener("click", () => {
        loguj(`📂 Otwieram produkt ${index}: ${data.nazwa}`);
        App.object.table.Products.querySelectorAll("tr").forEach(tr => {
            tr.classList.remove("aktywne");
        });
        App.state.selectedProductIndex = index;
        App.ui.setActive(tr);
        App.ui.renderTable("batch", App.object.table.Products, App.object.table.Batch, App.state.products, index);
    });
}

App.ui.listeners.productDbClick = function(tr, TableObj, data, index){
    tr.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      App.dat.edit.product(tr, TableObj, data, index);

    })
}

App.ui.listeners.batchClick = function(tr, index){
    tr.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("zg-checkbox")) return;

      const on = tr.classList.contains("aktywne");
      if (!on) tr.classList.add("aktywne");

      App.state.selectedBatchIndex = index;
    });
}

App.ui.listeners.batchCheckbox = function(tr, parentIndex, index){
    tr.querySelector(".zg-checkbox")?.addEventListener("change", (e) =>{
      const val = e.target.checked;

      if (parentIndex == null) return;

      const produkt = App.state.products[parentIndex];
      if (!produkt || !produkt.partie || !produkt.partie[index]) return;

      produkt.partie[index].zgloszone = val;
      loguj(val? "partia zgłoszona":"cofnięto zgłoszenie")
    })
}

App.ui.listeners.batchDbClick = function(tr, TableObj, data, index, parentIndex ){
    tr.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      App.dat.edit.batch(tr, TableObj, data, index, parentIndex);
    });
}