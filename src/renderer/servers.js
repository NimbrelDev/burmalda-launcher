// --- SERVERS TAB ---
async function loadSavedServers() {
  savedServers = await window.api.getSavedServers();
  renderServersUI();
}

function renderServersUI() {
  if (popularServersGrid) {
    popularServersGrid.innerHTML = '';
    POPULAR_SERVERS.forEach((srv) => {
      const card = document.createElement('div');
      card.className = 'server-card';
      card.innerHTML = `
        <div class="server-card-head">
          <span class="server-name">${srv.name}</span>
          <span class="server-badge-online">Онлайн</span>
        </div>
        <div class="server-desc">${srv.desc}</div>
        <div class="server-ip-line">${srv.address}</div>
        <div class="server-card-actions">
          <button class="btn-srv-act copy" data-copy-addr="${srv.address}">Скопировать IP</button>
          <button class="btn-srv-act join" data-join-addr="${srv.address}">Играть</button>
        </div>
      `;
      popularServersGrid.appendChild(card);
    });

    popularServersGrid.querySelectorAll('button[data-join-addr]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const addr = btn.getAttribute('data-join-addr');
        if (inputPlayServer) inputPlayServer.value = addr;
        switchTab('play');
        triggerPlayAction(addr);
      });
    });

    popularServersGrid.querySelectorAll('button[data-copy-addr]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const addr = btn.getAttribute('data-copy-addr');
        await navigator.clipboard.writeText(addr);
        const originalText = btn.textContent;
        btn.textContent = 'Скопировано!';
        btn.style.color = '#38bdf8';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.color = '';
        }, 1500);
      });
    });
  }

  if (realServersList) {
    realServersList.innerHTML = '';
    if (savedServers.length === 0) {
      realServersList.innerHTML = `
        <div style="font-size: 11px; color: var(--text-muted); padding: 8px 0;">
          У вас пока нет добавленных серверов. Добавьте любимый сервер ниже.
        </div>
      `;
    } else {
      savedServers.forEach((srv, idx) => {
        const card = document.createElement('div');
        card.className = 'server-card';
        card.innerHTML = `
          <div class="server-card-head">
            <span class="server-name">${srv.name}</span>
            <span class="server-badge-online">Сохранен</span>
          </div>
          <div class="server-ip-line">${srv.address}</div>
          <div class="server-card-actions">
            <button class="btn-srv-act copy" data-copy-srv="${srv.address}">IP</button>
            <button class="btn-srv-act join" data-custom-play="${srv.address}">Играть</button>
            <button class="btn-srv-act del" data-custom-del="${idx}" title="Удалить">✕</button>
          </div>
        `;
        realServersList.appendChild(card);
      });

      realServersList.querySelectorAll('button[data-custom-play]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const addr = btn.getAttribute('data-custom-play');
          if (inputPlayServer) inputPlayServer.value = addr;
          switchTab('play');
          triggerPlayAction(addr);
        });
      });

      realServersList.querySelectorAll('button[data-copy-srv]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const addr = btn.getAttribute('data-copy-srv');
          await navigator.clipboard.writeText(addr);
          const originalText = btn.textContent;
          btn.textContent = 'Скопировано!';
          btn.style.color = '#38bdf8';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.color = '';
          }, 1500);
        });
      });

      realServersList.querySelectorAll('button[data-custom-del]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const idx = parseInt(btn.getAttribute('data-custom-del'), 10);
          savedServers.splice(idx, 1);
          await window.api.saveServers(savedServers);
          renderServersUI();
        });
      });
    }
  }
}

btnDirectConnect?.addEventListener('click', () => {
  const addr = inputPlayServer?.value.trim();
  if (addr) {
    switchTab('play');
    triggerPlayAction(addr);
  }
});

btnAddServer?.addEventListener('click', async () => {
  const name = inputNewSrvName?.value.trim();
  const address = inputNewSrvAddr?.value.trim();

  if (!address) {
    alert('Пожалуйста, укажите адрес сервера (IP:порт)');
    return;
  }

  savedServers.push({
    name: name || address,
    address
  });

  await window.api.saveServers(savedServers);
  if (inputNewSrvName) inputNewSrvName.value = '';
  if (inputNewSrvAddr) inputNewSrvAddr.value = '';
  renderServersUI();
});

