window.App = window.App || {};
App.dat.edit = App.dat.edit || {};

App.dat.edit.product = function(tr, TableObj, data, index){
  const cells = tr.querySelectorAll("td");
  if (cells.length < 2) return;
  tr.classList.add("editing");
  TableObj?.classList.add("editing");

  const nameCell = cells[0];
  const pluCell = cells[1];

  const nameInput = document.createElement("input");
  nameInput.value = data.nazwa;
  nameInput.classList = "dbInput";
  const pluInput = document.createElement("input");
  pluInput.value = data.plu;
  pluInput.classList = "dbInput";

  nameCell.textContent = "";
  nameCell.appendChild(nameInput);
  pluCell.textContent = "";
  pluCell.appendChild(pluInput);

  let done = false;
  const finish = () => {
    if (done) return; done = true;
    tr.classList.remove("editing");
    TableObj?.classList.remove("editing");
    App.dat.update.product(index, {
      nazwa: nameInput.value.trim(),
      plu: pluInput.value.trim()
    });
    App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);
    App.ui.renderTable("batch", App.object.table.Products, App.object.table.Batch, App.state.products, App.state.selectedProductIndex);
  };

  [nameInput, pluInput].forEach(inp => {
    inp.addEventListener("blur", finish);
    inp.addEventListener("keyup", ev => { if (ev.key === "Enter") finish(); });
  });

  nameInput.focus();
}


App.dat.edit.batch = function (tr, TableObj, data, index, parentIndex) {
    const cells = tr.querySelectorAll("td");
    if (cells.length < 2) return;
    tr.classList.add("editing");
    TableObj?.classList.add("editing");

    const dateCell = cells[0];

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = data.data;
    dateInput.classList = "dbInput";

    dateCell.textContent = "";
    dateCell.appendChild(dateInput);

    let done = false;
    const finish = () => {
        if (done) return; done = true;
        tr.classList.remove("editing");
        TableObj?.classList.remove("editing");
        App.dat.update.batch(parentIndex, index, {
            data: dateInput.value,
        });
        App.ui.renderTable("batch", App.object.table.Products, App.object.table.Batch, App.state.products, parentIndex);
        App.ui.renderTable("product", App.object.table.Products, App.object.table.Batch, App.state.products);
    };

    [dateInput].forEach(inp => {
        inp.addEventListener("blur", finish);
        inp.addEventListener("keyup", ev => { if (ev.key === "Enter") finish(); });
    });

    dateInput.focus();
}