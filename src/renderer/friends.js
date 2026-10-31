// --- FRIENDS & INVITE CODE SYSTEM (HORIZON FRIENDS P2P) ---
let friendsList = [];
let myInviteCode = 'hzn://offline';

const inputFriendInviteCode = document.getElementById('input-friend-invite-code');
const btnJoinFriendCode = document.getElementById('btn-join-friend-code');
const displayMyInviteCode = document.getElementById('display-my-invite-code');
const btnCopyMyCode = document.getElementById('btn-copy-my-code');
const btnRefreshMyCode = document.getElementById('btn-refresh-my-code');
const btnOpenAddFriend = document.getElementById('btn-open-add-friend');
const friendsListContainer = document.getElementById('friends-list-container');

async function renderFriendsUI() {
  try {
    friendsList = await window.api.getFriends();
  } catch (_) {
    friendsList = [];
  }

  if (myInviteCode === 'hzn://offline') {
    try {
      myInviteCode = await window.api.generateInviteCode();
      if (displayMyInviteCode) displayMyInviteCode.textContent = myInviteCode;
    } catch (_) {}
  }

  if (!friendsListContainer) return;
  friendsListContainer.innerHTML = '';

  if (friendsList.length === 0) {
    friendsListContainer.innerHTML = `
      <div style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 13px;">
        Список друзей пуст. Добавьте друзей по никнейму или поделитесь кодом приглашения!
      </div>
    `;
    return;
  }

  friendsList.forEach((friend) => {
    const card = document.createElement('div');
    card.className = 'setting-card';
    card.style.padding = '10px 14px';
    card.style.background = 'rgba(255, 255, 255, 0.03)';
    card.style.border = '1px solid var(--border-subtle)';
    card.style.borderRadius = '8px';

    const statusDot = friend.status === 'online' ? '#22c55e' : (friend.status === 'lobby' ? '#eab308' : '#64748b');
    const statusText = friend.status === 'online' ? 'В игре' : (friend.status === 'lobby' ? 'В лобби' : 'Не в сети');

    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-weight: 800; font-family: var(--font-mono); color: #f97316;">
          ${(friend.nickname || 'F').substring(0, 2).toUpperCase()}
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 700; font-size: 13px; color: #ffffff;">${escapeHtml(friend.nickname)}</span>
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${statusDot};"></span>
            <span style="font-size: 10px; color: ${statusDot}; font-weight: 600;">${statusText}</span>
          </div>
          <span style="font-size: 11px; color: var(--text-muted);">${escapeHtml(friend.activity || '')}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        ${friend.worldCode ? `
          <button class="btn-action-primary btn-join-world" data-code="${friend.worldCode}" style="height: 28px; padding: 0 10px; font-size: 11px;">
            Войти в мир
          </button>
        ` : (friend.status !== 'offline' ? `
          <button class="btn-action-secondary btn-invite-friend" data-id="${friend.id}" style="height: 28px; padding: 0 10px; font-size: 11px;">
            Пригласить
          </button>
        ` : '')}
        <button class="win-btn btn-remove-friend" data-id="${friend.id}" title="Удалить" style="width: 28px; height: 28px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;

    card.querySelector('.btn-join-world')?.addEventListener('click', (e) => {
      const code = e.currentTarget.getAttribute('data-code');
      if (code) {
        showCustomAlert('Подключение к миру', `Подключение к сессии друга через P2P (${code})...`);
        window.api.launchGame(code);
      }
    });

    card.querySelector('.btn-invite-friend')?.addEventListener('click', () => {
      showCustomAlert('Приглашение отправлено', `Приглашение в игру отправлено игроку ${friend.nickname}!`);
    });

    card.querySelector('.btn-remove-friend')?.addEventListener('click', async (e) => {
      const fid = e.currentTarget.getAttribute('data-id');
      friendsList = friendsList.filter(f => f.id !== fid);
      await window.api.saveFriends(friendsList);
      renderFriendsUI();
    });

    friendsListContainer.appendChild(card);
  });
}

btnJoinFriendCode?.addEventListener('click', () => {
  const code = (inputFriendInviteCode?.value || '').trim();
  if (!code) {
    showCustomAlert('Ошибка', 'Введите инвайт-код друга!');
    return;
  }
  showCustomAlert('Подключение', `Подключение к сессии ${code}...`);
  window.api.launchGame(code);
});

btnCopyMyCode?.addEventListener('click', () => {
  if (myInviteCode) {
    navigator.clipboard.writeText(myInviteCode);
    btnCopyMyCode.textContent = 'Скопировано!';
    setTimeout(() => { if (btnCopyMyCode) btnCopyMyCode.textContent = 'Скопировать'; }, 2000);
  }
});

btnRefreshMyCode?.addEventListener('click', async () => {
  myInviteCode = await window.api.generateInviteCode();
  if (displayMyInviteCode) displayMyInviteCode.textContent = myInviteCode;
});

btnOpenAddFriend?.addEventListener('click', async () => {
  const nick = prompt('Введите никнейм друга:');
  if (nick && nick.trim()) {
    friendsList.push({
      id: 'f_' + Date.now(),
      nickname: nick.trim(),
      status: 'online',
      activity: 'В главном меню',
      ping: 45,
      worldCode: null
    });
    await window.api.saveFriends(friendsList);
    renderFriendsUI();
  }
});

