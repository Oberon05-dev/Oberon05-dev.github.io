window.App = window.App || {};
App.ui.context = App.ui.context || {};

App.ui.context.defaultItems = {
  label: "Szybkie akcje",
  items: [
    { 
        id: "Undo", 
        icon: "↩️", 
        label: "Cofnij Edycje", 
        description: "", 
        action: () => App.history?.undo?.(),
        disabled: () => (!App.history?.undoStack?.length),
    },
    "separator",
    { 
        id: "Redo", 
        icon: "↪️", 
        label: "Ponów edycje", 
        description: "", 
        action: () => App.history?.redo?.(),
        disabled: () => !App.history.redoStack.length
    }
  ]
};

App.ui.context.ProductItems = {
  label: "Szybkie akcje",
  items: [
    { 
        id: "Undo", 
        icon: "↩️", 
        label: "Cofnij Edycje", 
        description: "", 
        action: () => App.history?.undo?.(),
        disabled: () => (!App.history?.undoStack?.length),
    },
    "separator",
    { 
        id: "Redo", 
        icon: "↪️", 
        label: "Ponów edycje", 
        description: "", 
        action: () => App.history?.redo?.(),
        disabled: () => !App.history.redoStack.length
    },
    "separator",
    "separator",
    { 
        id: "Edit", 
        icon: "✍️", 
        label: "Edytuj", 
        description: "", 
        action: () => App.ui?.context?.initEdit?.(App.ui.context.privateEvent),
    },
  ]
};

App.ui.context.inputItems = {
  label: "Szybkie akcje",
  items: [
    { 
        id: "Paste", 
        icon: "📋", 
        label: "Wklej", 
        description: "", 
        action: () => App.utils.pasteFromClipboard(),
    }
  ]
};

App.ui.context.init = function (clientX, clientY, type){
    if (App.ui.context.initialized) return;

    let menu = App.object.custom.ContextMenu;
    let header = App.object.custom.ContextHeader;
    let items = App.object.custom.ContextItems

    menu.hidden = true;
    menu.setAttribute("aria-hidden", "true");
    menu.setAttribute("role", "menu");
    menu.tabIndex = -1;

    App.ui.context.show(menu, header, items, clientX, clientY, type);

}

App.ui.context.show = function(menu, header, items, clientX, clientY, type){

    menu.querySelectorAll(".context-menu__header").forEach(el => el.remove());

    header = document.createElement("div");
    header.dataset.role = "title";
    header.className = "context-menu__header";
    header.textContent = type.label
    header.hidden = false;
    menu.prepend(header);

    items.textContent = "";

    type.items.forEach((item) => {
        if (item === "separator") {
            const last = items.lastElementChild;
            if (!last || !last.classList.contains("context-menu__separator")) {
                items.appendChild(App.ui.context.createSeparator());
            }
            return;
        }
            // dodaj guzik
        items.appendChild(App.ui.context.createBtn(item));
    });

    menu.hidden = false;                     // usuwa atrybut ukrycia
    menu.setAttribute("aria-hidden", "false");
    menu.classList.add("is-visible");
        
    menu.style.left = `${clientX}px`;
    menu.style.top  = `${clientY}px`;
}

App.ui.context.hide = function() {
    App.object.custom.ContextMenu.classList.remove("is-visible");
    App.object.custom.ContextMenu.hidden = true;   
}

App.ui.context.createBtn = function(item){
    const button = document.createElement("button");
    button.type = "button";
    button.className = "context-menu__item";

    if (item.id) {
        button.dataset.actionId = String(item.id);
    }
    if (typeof item.disabled === "function" ? !!item.disabled() : !!item.disabled) {
        button.disabled = true;
    }

    const icon = document.createElement("span");
    icon.className = "context-menu__item-icon";
    icon.textContent = item.icon || "";
    button.appendChild(icon);

    const body = document.createElement("div");
    body.className = "context-menu__item-body";

    const label = document.createElement("span");
    label.className = "context-menu__item-label";
    label.textContent = item.label || "";
    body.appendChild(label);

    if (item.description) {
    const desc = document.createElement("span");
    desc.className = "context-menu__item-desc";
    desc.textContent = item.description;
    body.appendChild(desc);
  }

    button.appendChild(body);

    button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (button.disabled) return;

        try {
            if (typeof item.action === "function") {
                item.action();
            }
        } finally {
            if (item.closeOnClick !== false) {
                App.ui.context.hide();
            }
        }
    });

    return button;
}

App.ui.context.createSeparator = function() {
    const divider = document.createElement("div");
    divider.className = "context-menu__separator"
    return divider;
}

// zrobić funckję która sprawdza czy context menu nie pojawi się za krawędzią ekranu

// ustawienia i schowanie pod prawym przyciskiem trybu zaanwansowanego 
// plus przerobienie terminala by można było z niego skożystać gdziekolwiek na liście jesteś
// potem chyba bulk actions


// także plan:
// - naprawa terminala
// - menu ustawień
// - języki
// - bulk manewry
// - konfiguracja skanera
// - system logowania

App.ui.context.initEdit = function(event) {
    const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
    let text = hoveredElement.textContent.trim();
    console.log(text);
    let target
    if (hoveredElement.classList == "pr"){
        target = App.state.products.findIndex(p => p.nazwa === text || p.plu === text);

        App.dat.edit.product(
            hoveredElement.parentElement, 
            App.object.table.Product, 
            App.state.products[target], 
            target
        );
    } else if (hoveredElement.classList == "bh"){
        let parentIndex = -1;
        let batchIndex = -1;

        for (let i = 0; i < App.state.products.length; i++) {
            const produkt = App.state.products[i];
            if (!Array.isArray(produkt.partie)) continue;

            const idx = produkt.partie.findIndex(b => b.data === text);
            if (idx !== -1) {
                parentIndex = i; 
                batchIndex = idx;
                break;
            }
        }
        App.dat.edit.batch(
            hoveredElement.parentElement, 
            App.object.table.Product, 
            App.state.products[parentIndex].partie[batchIndex], 
            batchIndex, 
            parentIndex
        );
    }

    
}