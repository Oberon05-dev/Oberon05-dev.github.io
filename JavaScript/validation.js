window.App = window.App || {};
App.validation = App.validation || {};

const Ok  = (value) => ({ ok: true, value });
const Err = (code, context={}) => ({ ok: false, error: { code, context } });

App.validation.errors = {
    NO_PRODUCT_SELECTED: "wybierz produkt.",
    NO_BATCH_SELECTED: "Wybierz partię.",
    PRODUCT_NOT_EXIST: "Nie znaleziono produktu",
    BATCH_NOT_EXIST: "Nie znaleziono patrii",
    NO_NAME_SET: "Uzupelnij pole nazwa",
    NO_PLU_SET: "Uzupelnij pole PLU",
    NO_DATE_SET: "Uzupelnij pole data"
};

App.validation.isProductSelected = function(state){
    const bad = !state || state.selectedProductIndex == null || state.selectedProductIndex < 0;

    return App.validation.exportResult(App.validation.errors.NO_PRODUCT_SELECTED, bad);
}

App.validation.isBatchSelected = function(state){
    const bad = !state || state.selectedBatchIndex == null || state.selectedBatchIndex < 0;

    return App.validation.exportResult(App.validation.errors.NO_BATCH_SELECTED, bad);
}

App.validation.isProductExist = function(state) {
    const bad = !state || 
    !App.state.products[App.state.selectedProductIndex]

    return App.validation.exportResult(App.validation.errors.PRODUCT_NOT_EXIST, bad);
}

App.validation.isBatchExist = function(state) {
    const bad = !state || 
    !App.state.products[App.state.selectedProductIndex].partie[App.state.selectedBatchIndex];

    return App.validation.exportResult(App.validation.errors.BATCH_NOT_EXIST, bad);
}

App.validation.isNameSet = function() {
    const bad = !App.object.input.ProductName.value.trim()

    return App.validation.exportResult(App.validation.errors.NO_NAME_SET, bad);
}

App.validation.isPluSet = function() {
    const bad = !App.object.input.Plu.value.trim()

    return App.validation.exportResult(App.validation.errors.NO_PLU_SET, bad);
}

App.validation.isDateSet = function() {
    const bad = !App.object.input.BatchDate.value.trim()

    return App.validation.exportResult(App.validation.errors.NO_DATE_SET, bad);
}

App.validation.exportResult = function(errorId, msg) {
        if (msg) {
        const msg = errorId || "Coś poszło nie tak.";
        App.ui?.notify?.(msg, "error");
        loguj("⚠️ " + msg);
        return true;
    }
    return false;
}