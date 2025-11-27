const App = {
  state: {
    products: [],
    knownNames: {},
    selectedProductIndex: null,
    selectedBatchIndex: null,
    fileHandle: null,
    sortMode: "added",
    selectedTable: "left",
    shopId: "sklep1",
  },
  object:{
    btn: {},
    input: {},
    table: {},
    custom: {},
  },
  io: {},
  ui: {
    init: {},
  },
  dat: {
    create: {},
    delete: {},
    edit: {},
    update: {},
  },
  utils: {},
  history: {
    undoStack: [],
    redoStack: [],
    limit: 50,
  },
  keyboard: {},
  context: {
    privateEvent: null,
    defaultItems: [],
    ProductItems: [],
    initialized: false,
    currentAreaId: null,
    currentContext: null,
  },
  validation: {
    errors: {},
  },
}

document.addEventListener("DOMContentLoaded", () => {
  App.ui.init.cacheObj();
  App.ui.init.bindEvents();
  App.keyboard.init();
  App.io.restoreSelectedShop();
  App.io.loadFromCloud();
});
