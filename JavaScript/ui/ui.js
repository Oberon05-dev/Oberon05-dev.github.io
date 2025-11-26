window.App = window.App || {};
App.ui = App.ui || {};

//====================
// RENDEROWANIE TABEL
//====================

App.ui.createRow = function createRow(type, data, index, TableObj, parentIndex){
  if (type == "product"){
    const tr = document.createElement("tr");

    const toReport = Array.isArray(data.partie) && data.partie.some(
      batch => App.utils.countDaysTo(batch.data) <= 29
    );
    const critical = Array.isArray(data.partie) && data.partie.some(
      batch => App.utils.countDaysTo(batch.data) <= 0
    );

    if (toReport) tr.classList.add("zgloszenie");
    if (critical) {tr.classList.add("krytyczne")};

    tr.innerHTML = `
      <td class="pr">${data.nazwa}</td>
      <td class="pr">${data.plu}</td>
    `;

    App.ui.listeners.productClick(tr, index, data);
    App.ui.listeners.productDbClick(tr, TableObj, data, index);

    if (index == App.state.selectedProductIndex) {
      App.ui.setActive(tr);
    }

    return tr;
  } else if (type == "batch"){
    const tr = document.createElement("tr");
    const days = App.utils.countDaysTo(data.data)

    if (days <= 29) tr.classList.add("zgloszenie");
    if (days <= 0) {tr.classList.add("krytyczne")};

    const checked = !!data.zgloszone;

    tr.innerHTML = `
      <td class="bh">${data.data}</td>
      <td class="bh">
        <label>
            <input type="checkbox" class="zg-checkbox" ${checked ? "checked" : ""}>
            </input>
          </label>
      </td>
      <td>${days} dni</td>
    `;

    App.ui.listeners.batchClick(tr, index, TableObj);
    App.ui.listeners.batchCheckbox(tr, parentIndex, index);
    App.ui.listeners.batchDbClick(tr, TableObj, data, index, parentIndex);

    if (index == App.state.selectedBatchIndex) {
      App.ui.setActive(tr);
    }

    return tr;
  }
}

App.ui.renderTable = function renderTable(type, ProductTable, BatchTable, products, index) {
  if (type == "product"){
    App.ui.clearTable(ProductTable);

    let items = products.map((p, i) => ({ p, i, score: App.utils.minDaysForProduct(p) }));

    if (App.state.sortMode === "expiry") {
      items.sort((a, b) => a.score - b.score);
    }

    items.forEach(({ p, i }) => {
      ProductTable.appendChild(App.ui.createRow("product", p, i, ProductTable, undefined));
    });

    loguj(`📋 Wyświetlono ${products.length} produktów (${App.state.sortMode === "expiry" ? "sort: termin" : "sort: dodawanie"})`);
  }
  else if (type == "batch") {
    App.ui.clearTable(BatchTable);
    if (index == null || index < 0 || index >= products.length) {
      BatchTable.innerHTML = "<tr><td colspan='3'>Brak danych o partiach</td></tr>";
      return;
    }
    const product = products[index];
    const batches = (product.partie) ? product.partie : [];
    if (batches.length === 0) {
      BatchTable.innerHTML = "<tr><td colspan='3'>Brak danych o partiach</td></tr>";
      return;
    }

    batches.forEach((batch, i) => {
      BatchTable.appendChild(App.ui.createRow("batch", batch, i, BatchTable, index));
    });
  }
}

App.ui.setActive = function setActive(tr) {
  tr.classList.add("aktywne");
}

App.ui.clearTable = function(tbody) {
  tbody.innerHTML = "";
  loguj("✅ Wyczyszczono tabele")
}

App.ui.Flash = function (object, color, duration = 650) {
  const prev = {
      backgroundColor: object.style.backgroundColor,
      transition: object.style.transition,
    };

    object._flashPrev = prev;

  const bgColor = App.ui.hexToRgba(color) ?? 'transparent';
  object.style.transition = 'background-color 600ms ease-in, background-color 200ms ease-out';

  object.style.backgroundColor = bgColor;

  object._flashTimer = setTimeout(() => {
      object.style.backgroundColor = prev.backgroundColor;

      object._flashCleanup = setTimeout(() => {
        object.style.transition = prev.transition;
      }, 200);
  }, duration);
}

App.ui.stopFlash = function (object) {
  if (!object) return;

  if (object._flashTimer) clearTimeout(object._flashTimer);
  if (object._flashCleanup) clearTimeout(object._flashCleanup);

  if (object._flashPrev) {
    object.style.backgroundColor = object._flashPrev.backgroundColor;
    object.style.transition = object._flashPrev.transition;
  }

  object._flashTimer = null;
  object._flashCleanup = null;
  object._flashPrev = null;
};

App.ui.hexToRgba = function(hex, alpha = 0.65) {
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

App.ui.notify = function(message, type = 'info', time = 3000) {
  const container = document.getElementById('notifications');
  if (!container) return;

  const note = document.createElement('div');
  note.className = `notification ${type}`;
  note.textContent = message;
  container.appendChild(note);

  const color = getComputedStyle(note).backgroundColor;
  container.style.setProperty('--notif-color', color);
  container.classList.add('active');

  requestAnimationFrame(() => note.classList.add('show'));

  setTimeout(() => {
    note.classList.remove('show');
    note.addEventListener(
      'transitionend',
      () => {
        note.remove();
        if (container.children.length === 0) {
          container.classList.remove('active');
          container.style.removeProperty('--notif-color');
        }
      },
      { once: true }
    );
  }, time);
};


// Przykłady

// App.ui.notify('Błąd zapisu', 'error');
