window.App = window.App || {};
App.ui.init = App.ui.init || {};

//===========================
// CONFIG UI
//===========================

App.ui.init.cacheObj = function cacheObj () {
    App.object.table.Products = document.getElementById("produkty");
    App.object.table.Batch = document.getElementById("partie");

    App.object.btn.AddProduct = document.getElementById("dodaj-produkt-btn");
    App.object.btn.AddBatch = document.getElementById("dodaj-partie-btn");
    App.object.btn.OpenFile = document.getElementById("open-editable");
    App.object.btn.SaveFile = document.getElementById("save-file");
    App.object.btn.cloudLoad = document.getElementById("cloud-load-btn");
    App.object.btn.cloudSave = document.getElementById("cloud-save-btn");
    App.object.btn.DeleteProduct = document.getElementById("usun-produkt-btn");
    App.object.btn.DeleteBatch = document.getElementById("usun-partie");

    App.object.btn.SortByAdded = document.getElementById("sort-added");
    App.object.btn.SortByExpiry = document.getElementById("sort-expiry");

    App.object.input.ShopPicker = document.getElementById("shop-picker");
    App.object.input.Plu = document.getElementById("nowe-plu");
    App.object.input.ProductName = document.getElementById("nowa-nazwa");
    App.object.input.BatchDate = document.getElementById("partia-data");
    App.object.input.Search = document.getElementById("search");

    App.object.custom.TopShadowBar = document.getElementById("top-shadow-bar");
    App.object.custom.LeftForm = document.getElementById("formularz-produktu");
    App.object.custom.RightBox = document.getElementById("dodawanie-partii");
    App.object.custom.SearchBox = document.getElementById("wyszukiwarka");
    App.object.custom.Files = document.getElementById("pliki");
    
    App.object.custom.ContextMenu = document.getElementById("context-menu");
    App.object.custom.ContextHeader = App.object.custom.ContextMenu.querySelector('[data-role="title"]');
    App.object.custom.ContextItems = App.object.custom.ContextMenu.querySelector('[data-role="items"]');
};

App.ui.init.bindEvents = function() {
  const B = App.object.btn;
  const C = App.object.custom;
  const I = App.object.input;

  B.AddProduct?.addEventListener("click", App.dat.create.product);
  B.AddBatch?.addEventListener("click", App.dat.create.batch);
  B.DeleteProduct?.addEventListener("click", App.dat.delete.product);
  B.DeleteBatch?.addEventListener("click", App.dat.delete.batch);
  B.OpenFile?.addEventListener("click", App.io.openEditableFile);
  B.SaveFile?.addEventListener("click", App.io.saveToFile);
  B.cloudLoad.addEventListener("click", App.io.loadFromCloud);
  B.cloudSave.addEventListener("click", App.io.saveToCloud);

  // to do ui listiners
  const searchBar = App.object.input.Search

  searchBar.addEventListener("input", () => {
    const query = searchBar.value.trim().toLowerCase();

    Array.from(App.object.table.Products.querySelectorAll("tr")).forEach(tr => {
      const cells = tr.querySelectorAll("td");
      if (cells.length < 2) return;

      const nazwa = (cells[0].textContent || "").toLowerCase();
      const plu   = (cells[1].textContent || "").toLowerCase();

      const match = nazwa.includes(query) || plu.includes(query);
      tr.style.display = match ? "" : "none";
    });
  });

  if (B.SortByAdded && B.SortByExpiry) {
    B.SortByAdded.addEventListener("change", () => App.utils.setSortMode("added"));
    B.SortByExpiry.addEventListener("change", () => App.utils.setSortMode("expiry"));
  }

  // efekt „znikającego chromu” przy scrollu
  const toggleChrome = () => {
    const stuck = window.scrollY > 10;
    C.LeftForm?.classList.toggle("is-stuck", stuck);
    C.RightBox?.classList.toggle("is-stuck", stuck);
    C.TopShadowBar?.classList.toggle("is-stuck", stuck);
    C.Files?.classList.toggle("is-stuck", stuck);
    C.SearchBox.classList.toggle("is-stuck", stuck);
  };

  if (I.ShopPicker) {
    I.ShopPicker.addEventListener("change", () => {
        const selected = I.ShopPicker.value;

        localStorage.setItem("selectedShop", selected);

        App.state.products = [];

        App.io.loadFromCloud();
        App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, []);
    });
  }

  window.addEventListener("scroll", toggleChrome, { passive: true });
  toggleChrome();
};