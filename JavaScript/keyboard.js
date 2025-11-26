window.App = window.App || {};
App.keyboard = App.keyboard || {};

App.keyboard.init = function() {

    // to jest myszka może rozdziele później
    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
        
        if (hoveredElement.tagName != 'TD') {
            App.ui.context.init(event.clientX, event.clientY, App.ui.context.defaultItems);
            return;
        } if (hoveredElement.classList == "pr" || hoveredElement.classList == "bh") {
            App.ui.context.privateEvent = event;
            App.ui.context.init(event.clientX, event.clientY, App.ui.context.ProductItems);
            return;
        }

        
    });

    document.addEventListener("click", (event) => {
        App.ui.context.hide(App.object.custom.ContextMenu);
    });

    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey) {
        const key = e.key.toLowerCase();
        if (key === "j") {
            e.preventDefault();
            e.stopPropagation();
            loguj(`⛔ Zablokowano skrót Ctrl+${key.toUpperCase()}`);
            return false;
        }

        if (key === "f") {
            e.preventDefault();
            if (document.activeElement.id === "search"){
            loguj("search mode");
            return;
            };
            let PluInput = App.object.input.Plu;
            PluInput.value = "";
            PluInput.focus();
        }

            // UNDO
            if (key === "z") {
                e.preventDefault();
                App.history.undo();
                return;

            }
            // REDO
            if (key === "y") {
                e.preventDefault();
                App.history.redo();
                return;
            }
            // REDO alternate
            if (key === "z" && e.shiftKey) {
                e.preventDefault();
                App.history.redo();
                return;
            }
        }

        if (e.key == "Enter") {
            const activeEl = document.activeElement;
            if (activeEl.id === "search"){
                App.ui.skanFlash(App.object.input.SearchBox);
                return;
            };

            if (activeEl && activeEl.classList.contains("dbInput")){
                const y = window.scrollY;
                App.ui.clearTable(App.object.table.Batch);
                App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);
                App.ui.renderTable("batch", App.object.table.Products, App.object.table.Batch, App.state.products, App.state.selectedProductIndex);
                window.scrollTo(0, y);
                return;
            }

            const foundedName = App.utils.getProductNameByPlu(App.object.input.Plu.value.trim());
            loguj(foundedName);
            App.object.input.ProductName.value = foundedName;
            App.object.input.BatchDate.focus();
            App.ui.skanFlash(App.object.input.LeftForm);
        }

        if (e.key == "ArrowRight") {
            e.preventDefault();
            if (App.state.selectedTable == "left"){
                App.state.selectedTable = "right";
                App.ui.stopFlash(App.object.table.Products);
                App.ui.Flash(App.object.table.Batch, "#949494");
                // console.log(App.state.selectedTable);
            } else {
                return;
            }
        }

        if (e.key == "ArrowLeft") {
            e.preventDefault();
            if (App.state.selectedTable == "right"){
                App.state.selectedTable = "left";
                App.ui.stopFlash(App.object.table.Batch);
                App.ui.Flash(App.object.table.Products, "#949494");
                // console.log(App.state.selectedTable);
            } else {
                return;
            }
        }

        // poprawić optymalizację i wyłączać aktywne a odświerzać tylko batch table
        // scroll strony ma być przesuwany razem z selectedProduct

        if (e.key == "ArrowDown") {
            e.preventDefault();
            console.log(App.state.products[App.state.selectedProductIndex].length);
            if (App.state.selectedTable == "left") {
                if (App.state.selectedProductIndex + 1 == App.state.products.length){
                    return
                } else {
                    App.state.selectedProductIndex += 1;
                }
            } else {
                if (App.state.selectedBatchIndex + 1 == App.state.products[App.state.selectedProductIndex].length){
                    return
                } else {
                    App.state.selectedBatchIndex += 1;
                }
            }

            App.ui.clearTable(App.object.table.Batch);
            App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);
            App.ui.renderTable("batch", App.object.table.Products, App.object.table.Batch, App.state.products, App.state.selectedProductIndex);
        }
        
        if (e.key == "ArrowUp") {
            e.preventDefault();
            if (App.state.selectedTable == "left") {
                if (App.state.selectedProductIndex - 1 == -1){
                    return
                } else {
                    App.state.selectedProductIndex -= 1;
                }
            } else {
                if (App.state.selectedBatchIndex - 1 == -1){
                    return
                } else {
                    App.state.selectedBatchIndex -= 1;
                }
            }

            App.ui.clearTable(App.object.table.Batch);
            App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);
            App.ui.renderTable("batch", App.object.table.Products, App.object.table.Batch, App.state.products, App.state.selectedProductIndex);
        }
        
    });
}