// script.js – Логика путеводителя с личным кабинетом и сменой аватара (с компьютера или эмодзи)

// ==================== ДАННЫЕ ====================
const locationsData = [
    { id: 1, category: 'cafe', name: 'Уютный дворик', desc: 'Атмосферное кафе с домашней выпечкой и террасой.', rating: 4.7, address: 'ул. Цветочная, 15', price: 'Средний', icon: '☕', moods: ['romantic', 'family'] },
    { id: 2, category: 'cafe', name: 'Кофе & Книги', desc: 'Книжный уголок с ароматным кофе.', rating: 4.5, address: 'пр. Литературный, 8', price: 'Средний', icon: '📚', moods: ['romantic'] },
    { id: 3, category: 'restaurant', name: 'Итальянский квартал', desc: 'Премиум итальянская кухня с живой музыкой.', rating: 4.9, address: 'ул. Гастрономическая, 22', price: 'Высокий', icon: '🍝', moods: ['romantic', 'family', 'party'] },
    { id: 4, category: 'bar', name: 'Подвал алхимика', desc: 'Коктейльный бар с авторскими напитками.', rating: 4.8, address: 'пер. Тёмный, 4', price: 'Средний', icon: '🍸', moods: ['party'] },
    { id: 5, category: 'pool', name: 'Аква-Лэнд', desc: 'Большой аквапарк с горками и волновым бассейном.', rating: 4.5, address: 'ул. Водная, 12', price: 'Средний', icon: '🏊', moods: ['family', 'active'] },
    { id: 6, category: 'mountain', name: 'Пик Орлиный', desc: 'Живописный горный маршрут с панорамным видом.', rating: 4.9, address: 'Горный массив, 25 км', price: 'Бесплатно', icon: '⛰️', moods: ['active'], isMountain: true },
    { id: 7, category: 'park', name: 'Центральный парк', desc: 'Главный парк с прудом, аттракционами и аллеями.', rating: 4.6, address: 'ул. Парковая, 1', price: 'Бесплатно', icon: '🌳', moods: ['family', 'romantic', 'active'] },
    { id: 8, category: 'museum', name: 'Музей искусств', desc: 'Классическое и современное искусство, временные выставки.', rating: 4.7, address: 'пл. Искусств, 3', price: '350 ₽', icon: '🎨', moods: ['romantic', 'family'] }
];

// Набор доступных эмодзи-аватаров
const avatarEmojis = ['👤', '😎', '🐱', '🦊', '🐼', '🎩', '🧑‍🚀', '👩‍🎤', '🦸', '🧙', '🐶', '🐸', '🦁', '🐯', '🐨', '🐰'];

// ==================== СОСТОЯНИЕ ====================
let activeCategory = 'all';
let activeMood = null;
let budgetFilter = 'all';
let currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
let authMode = 'login';
let selectedAvatarFile = null; // Для предпросмотра

const favs = () => JSON.parse(localStorage.getItem('travelFavorites') || '[]');
const users = () => JSON.parse(localStorage.getItem('travelUsers') || '{}');

// ==================== ПОГОДА ====================
function mockWeather(dateStr) {
    const seed = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = (n) => { let x = Math.sin(seed + n * 12.9898) * 43758.5453; return x - Math.floor(x); };
    const m = new Date(dateStr).getMonth();
    let temp, icon, desc;
    if (m >= 5 && m <= 7) { temp = 22 + Math.round(rand(1) * 12); icon = '☀️'; desc = 'Солнечно'; }
    else if (m >= 8 && m <= 10) { temp = 5 + Math.round(rand(2) * 10); icon = '🌧️'; desc = 'Дождливо'; }
    else if (m >= 2 && m <= 4) { temp = 5 + Math.round(rand(3) * 13); icon = '⛅'; desc = 'Облачно'; }
    else { temp = -15 + Math.round(rand(4) * 15); icon = '❄️'; desc = 'Снег'; }
    return { temp, icon, desc, humidity: 40 + Math.round(rand(5) * 40), wind: Math.round(5 + rand(6) * 20) };
}

function updateWeather() {
    const today = new Date();
    const dates = [];
    for (let i = -1; i <= 3; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }
    const current = mockWeather(dates[1]);
    document.getElementById('weatherIcon').textContent = current.icon;
    document.getElementById('weatherTemp').textContent = current.temp + '°';
    document.getElementById('weatherDesc').textContent = current.desc;
    document.getElementById('humidity').textContent = current.humidity + '%';
    document.getElementById('wind').textContent = current.wind + ' км/ч';

    const forecastRow = document.getElementById('forecastRow');
    forecastRow.innerHTML = dates.map((date, idx) => {
        const d = new Date(date);
        const w = mockWeather(date);
        const dayName = idx === 0 ? 'Вчера' : idx === 1 ? 'Сегодня' : idx === 2 ? 'Завтра' : d.toLocaleDateString('ru', { weekday: 'short' });
        return `<div class="forecast-card"><div class="forecast-day">${dayName}</div><div class="forecast-icon">${w.icon}</div><div class="forecast-temp">${w.temp}°</div><div style="font-size:0.7rem;">${w.desc}</div></div>`;
    }).join('');
}

// ==================== КАРТОЧКИ ====================
function getFiltered() {
    return locationsData.filter(loc => {
        if (activeCategory !== 'all' && loc.category !== activeCategory) return false;
        if (activeMood && (!loc.moods || !loc.moods.includes(activeMood))) return false;
        if (budgetFilter !== 'all') {
            const priceMap = { 'Бесплатно': 'low', 'Низкий': 'low', 'Средний': 'medium', 'Высокий': 'high' };
            if (priceMap[loc.price] !== budgetFilter) return false;
        }
        return true;
    });
}

function renderCards() {
    const grid = document.getElementById('locationsGrid');
    const filtered = getFiltered();
    grid.innerHTML = filtered.map(loc => {
        const isFav = currentUser ? (users()[currentUser.username]?.favorites || []).includes(loc.id) : favs().includes(loc.id);
        return `<div class="location-card" onclick="openDetail(${loc.id})">
            <div class="card-img-placeholder">
                ${loc.icon}
                <span class="card-category-tag">${loc.category}</span>
            </div>
            <div class="card-body">
                <div class="card-title">${loc.name}</div>
                <div class="card-rating">⭐ ${loc.rating}</div>
                <div class="card-desc">${loc.desc}</div>
                <div class="card-meta"><span>📍 ${loc.address}</span><span>💰 ${loc.price}</span></div>
                <div class="card-actions">
                    <button class="btn btn-ghost" onclick="event.stopPropagation(); sharePlace('${loc.name}', '${loc.address}')">📤 Поделиться</button>
                    <button class="btn btn-ghost" onclick="event.stopPropagation(); toggleFav(${loc.id})">${isFav ? '❤️' : '🤍'}</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function toggleFav(id) {
    if (!currentUser) {
        showToast('Войдите в аккаунт, чтобы добавлять в избранное');
        return;
    }
    const allUsers = users();
    const user = allUsers[currentUser.username];
    if (!user.favorites) user.favorites = [];
    const idx = user.favorites.indexOf(id);
    if (idx > -1) user.favorites.splice(idx, 1);
    else user.favorites.push(id);
    localStorage.setItem('travelUsers', JSON.stringify(allUsers));
    currentUser.favorites = user.favorites;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    renderCards();
    if (document.getElementById('profileModal').style.display === 'flex') renderProfileContent();
}

function sharePlace(name, address) {
    if (navigator.share) {
        navigator.share({ title: name, text: `${name} — ${address}` });
    } else {
        navigator.clipboard.writeText(`${name} — ${address}`);
        showToast('Адрес скопирован!');
    }
}

// ==================== ДЕТАЛИ ====================
function openDetail(id) {
    const loc = locationsData.find(l => l.id === id);
    if (!loc) return;
    if (currentUser) {
        const allUsers = users();
        const user = allUsers[currentUser.username];
        if (!user.history) user.history = [];
        user.history = user.history.filter(h => h !== id);
        user.history.unshift(id);
        localStorage.setItem('travelUsers', JSON.stringify(allUsers));
        currentUser.history = user.history;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    const existing = document.getElementById('detailModal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'detailModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
            <div style="font-size:4rem;text-align:center;">${loc.icon}</div>
            <h2>${loc.name}</h2>
            <div>⭐ ${loc.rating} | ${loc.price}</div>
            <p>${loc.desc}</p>
            <p><strong>Адрес:</strong> ${loc.address}</p>
            <div><h4>💰 Ориентировочный бюджет</h4><p>${loc.price === 'Бесплатно' ? '0' : loc.price === 'Низкий' ? '200' : loc.price === 'Средний' ? '700' : '1500'} ₽</p></div>
            <div style="margin-top:16px;">
                <h4>⭐ Оставить отзыв</h4>
                <div class="star-rating" id="starRating">
                    ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">★</span>`).join('')}
                </div>
                <textarea id="reviewText" rows="2" placeholder="Ваш отзыв..." style="width:100%;padding:8px;border-radius:12px;border:1px solid var(--glass-border);margin-top:8px;"></textarea>
                <button class="btn btn-primary" style="margin-top:8px;" onclick="submitReview(${loc.id})">Отправить</button>
                <div id="reviewsList" style="margin-top:12px;"></div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    renderReviews(loc.id);
    const stars = modal.querySelectorAll('.star');
    stars.forEach(s => s.addEventListener('click', () => {
        stars.forEach(st => { st.classList.remove('active'); });
        s.classList.add('active');
    }));
}

function renderReviews(locId) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    const reviews = JSON.parse(localStorage.getItem(`reviews_${locId}`) || '[]');
    container.innerHTML = reviews.length ? reviews.map(r => `<div><strong>${'★'.repeat(r.rating)}</strong> ${r.text} <small>(${r.date})</small></div>`).join('') : '<p>Нет отзывов</p>';
}

function submitReview(locId) {
    const activeStar = document.querySelector('#starRating .star.active');
    if (!activeStar) return showToast('Выберите рейтинг');
    const rating = parseInt(activeStar.dataset.value);
    const text = document.getElementById('reviewText').value.trim();
    if (!text) return showToast('Напишите отзыв');
    const reviews = JSON.parse(localStorage.getItem(`reviews_${locId}`) || '[]');
    reviews.push({ rating, text, date: new Date().toLocaleDateString() });
    localStorage.setItem(`reviews_${locId}`, JSON.stringify(reviews));
    renderReviews(locId);
    document.getElementById('reviewText').value = '';
    showToast('Отзыв добавлен!');
}

// ==================== АВТОРИЗАЦИЯ ====================
function handleAuthSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    if (!username || !password) return showToast('Заполните все поля');

    const allUsers = users();

    if (authMode === 'register') {
        const confirmPassword = document.getElementById('authConfirmPassword').value;
        if (password !== confirmPassword) return showToast('Пароли не совпадают');
        if (allUsers[username]) return showToast('Пользователь уже существует');
        allUsers[username] = { password, favorites: [], history: [], avatar: '👤' };
        localStorage.setItem('travelUsers', JSON.stringify(allUsers));
        loginUser(username);
        closeAuthModal();
        showToast('Регистрация успешна!');
    } else {
        if (!allUsers[username]) return showToast('Пользователь не найден');
        if (allUsers[username].password !== password) return showToast('Неверный пароль');
        loginUser(username);
        closeAuthModal();
        showToast('С возвращением, ' + username + '!');
    }
}

function loginUser(username) {
    const allUsers = users();
    currentUser = { username, ...allUsers[username] };
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    renderCards();
}

function logoutUser() {
    currentUser = null;
    sessionStorage.removeItem('currentUser');
    updateAuthUI();
    closeProfileModal();
    renderCards();
    showToast('Вы вышли из аккаунта');
}

function updateAuthUI() {
    const profileBtn = document.getElementById('profileBtn');
    if (currentUser) {
        const avatar = currentUser.avatar;
        if (avatar && avatar.startsWith('data:')) {
            profileBtn.innerHTML = `<img src="${avatar}" style="width:24px; height:24px; border-radius:50%; object-fit:cover; margin-right:6px;"> ${currentUser.username}`;
        } else {
            profileBtn.innerHTML = `${avatar || '👤'} ${currentUser.username}`;
        }
        profileBtn.onclick = openProfileModal;
    } else {
        profileBtn.textContent = '👤 Войти';
        profileBtn.onclick = openAuthModal;
    }
}

function openAuthModal() {
    document.getElementById('authModal').style.display = 'flex';
    document.getElementById('authForm').reset();
    authMode = 'login';
    document.getElementById('authTitle').textContent = 'Вход';
    document.getElementById('authConfirmPassword').style.display = 'none';
    document.getElementById('authSwitchText').textContent = 'Нет аккаунта?';
    document.getElementById('authSwitchText').nextElementSibling.textContent = 'Зарегистрироваться';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function switchAuthMode() {
    if (authMode === 'login') {
        authMode = 'register';
        document.getElementById('authTitle').textContent = 'Регистрация';
        document.getElementById('authConfirmPassword').style.display = 'block';
        document.getElementById('authSwitchText').textContent = 'Уже есть аккаунт?';
        document.getElementById('authSwitchText').nextElementSibling.textContent = 'Войти';
    } else {
        authMode = 'login';
        document.getElementById('authTitle').textContent = 'Вход';
        document.getElementById('authConfirmPassword').style.display = 'none';
        document.getElementById('authSwitchText').textContent = 'Нет аккаунта?';
        document.getElementById('authSwitchText').nextElementSibling.textContent = 'Зарегистрироваться';
    }
}

function openProfileModal() {
    if (!currentUser) return;
    document.getElementById('profileModal').style.display = 'flex';
    renderProfileContent();
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

function renderProfileContent() {
    if (!currentUser) return;
    const allUsers = users();
    const user = allUsers[currentUser.username] || {};
    const favIds = user.favorites || [];
    const historyIds = user.history || [];
    const favLocs = locationsData.filter(l => favIds.includes(l.id));
    const historyLocs = historyIds.map(id => locationsData.find(l => l.id === id)).filter(Boolean);

    const avatarUrl = user.avatar;
    const avatarDisplay = avatarUrl && avatarUrl.startsWith('data:') 
        ? `<img src="${avatarUrl}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin:0 auto;">`
        : `<div class="profile-avatar" style="font-size:2rem;">${avatarUrl || '👤'}</div>`;

    document.getElementById('profileContent').innerHTML = `
        <div style="text-align:center;">
            ${avatarDisplay}
            <h2>${currentUser.username}</h2>
            <button class="btn btn-ghost" style="margin: 10px auto; display: block;" onclick="openAvatarModal()">✏️ Сменить аватар</button>
        </div>
        <div class="profile-section">
            <h4>❤️ Избранное (${favLocs.length})</h4>
            <ul class="fav-list">
                ${favLocs.length ? favLocs.map(loc => `
                    <li>
                        <span>${loc.icon} ${loc.name}</span>
                        <button class="btn btn-ghost" onclick="toggleFav(${loc.id})">🗑️</button>
                    </li>`).join('') : '<p>Нет избранных мест</p>'}
            </ul>
        </div>
        <div class="profile-section">
            <h4>🕒 История просмотров</h4>
            <ul class="history-list">
                ${historyLocs.length ? historyLocs.slice(0, 10).map(loc => `
                    <li>${loc.icon} ${loc.name} (${loc.category})</li>`).join('') : '<p>Пусто</p>'}
            </ul>
        </div>
        <button class="btn btn-logout" onclick="logoutUser()">🚪 Выйти из аккаунта</button>
    `;
}

// ==================== СМЕНА АВАТАРА ====================
let avatarTab = 'emoji'; // текущая вкладка

function openAvatarModal() {
    document.getElementById('avatarModal').style.display = 'flex';
    selectedAvatarFile = null;
    avatarTab = 'emoji';
    updateAvatarTabs();
    renderEmojiGrid();
    document.getElementById('avatarFileInput').value = '';
    document.getElementById('avatarPreview').innerHTML = '';
}

function closeAvatarModal() {
    document.getElementById('avatarModal').style.display = 'none';
}

function switchAvatarTab(tab) {
    avatarTab = tab;
    updateAvatarTabs();
    document.getElementById('avatarEmojiGrid').style.display = tab === 'emoji' ? 'grid' : 'none';
    document.getElementById('avatarUploadSection').style.display = tab === 'upload' ? 'block' : 'none';
    if (tab === 'emoji') renderEmojiGrid();
}

function updateAvatarTabs() {
    document.querySelectorAll('.avatar-tab').forEach(tab => {
        tab.classList.remove('active');
        if ((tab.textContent.includes('Эмодзи') && avatarTab === 'emoji') || (tab.textContent.includes('компьютера') && avatarTab === 'upload')) {
            tab.classList.add('active');
        }
    });
}

function renderEmojiGrid() {
    const grid = document.getElementById('avatarEmojiGrid');
    if (!grid) return;
    grid.innerHTML = avatarEmojis.map(av => {
        const selectedClass = (currentUser && currentUser.avatar === av) ? 'selected' : '';
        return `<div class="avatar-option ${selectedClass}" onclick="selectAvatar('${av}')">${av}</div>`;
    }).join('');
}

function selectAvatar(avatar) {
    if (!currentUser) return;
    // Сохраняем как эмодзи
    saveAvatarToUser(avatar);
    // Закрываем модальное окно аватаров
    closeAvatarModal();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    // Предпросмотр
    const reader = new FileReader();
    reader.onload = function(e) {
        selectedAvatarFile = e.target.result;
        document.getElementById('avatarPreview').innerHTML = `<img src="${selectedAvatarFile}" style="width:100px; height:100px; border-radius:50%; object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
}

function uploadAvatar() {
    if (!selectedAvatarFile) {
        showToast('Сначала выберите файл');
        return;
    }
    // Сжимаем изображение до 200x200
    const img = new Image();
    img.src = selectedAvatarFile;
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        ctx.drawImage(img, 0, 0, 200, 200);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        saveAvatarToUser(compressedDataUrl);
        closeAvatarModal();
    };
}

function saveAvatarToUser(avatarData) {
    if (!currentUser) return;
    const allUsers = users();
    allUsers[currentUser.username].avatar = avatarData;
    localStorage.setItem('travelUsers', JSON.stringify(allUsers));
    currentUser.avatar = avatarData;
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    if (document.getElementById('profileModal').style.display === 'flex') {
        renderProfileContent();
    }
    showToast('Аватар обновлён!');
}

// Привяжем событие изменения файла
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('avatarFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
});

// ==================== ЧАТ-БОТ ====================
document.getElementById('chatToggle').addEventListener('click', () => {
    document.getElementById('chatBox').classList.toggle('open');
});

function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    const messages = document.getElementById('chatMessages');
    messages.innerHTML += `<div class="chat-user-msg">${msg}</div>`;
    input.value = '';
    let reply = '';
    const lower = msg.toLowerCase();
    if (lower.includes('погода')) reply = 'Сейчас: ' + document.getElementById('weatherDesc').textContent + '. Подробнее в блоке погоды.';
    else if (lower.includes('горы') || lower.includes('снаряжение')) reply = 'Для гор: вода, палатка, тёплая одежда, навигатор.';
    else if (lower.includes('семья')) reply = 'Парк или аквапарк подойдут!';
    else if (lower.includes('романтика')) reply = 'Рекомендую кафе "Уютный дворик" или ресторан "Итальянский квартал".';
    else reply = 'Я пока учусь. Спросите про погоду, места или что взять с собой.';
    messages.innerHTML += `<div class="chat-bot-msg">🤖 ${reply}</div>`;
    messages.scrollTop = messages.scrollHeight;
}
document.getElementById('chatInput').addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

// ==================== ТЕМА ====================
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('travelTheme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
}
themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('travelTheme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
});

// ==================== ФИЛЬТРЫ ====================
document.querySelectorAll('#categoryFilters .filter-chip').forEach(chip => {
    chip.addEventListener('click', function() {
        document.querySelectorAll('#categoryFilters .filter-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        activeCategory = this.dataset.category;
        renderCards();
    });
});

document.querySelectorAll('#moodFilters .filter-chip').forEach(chip => {
    chip.addEventListener('click', function() {
        this.classList.toggle('active');
        activeMood = this.classList.contains('active') ? this.dataset.mood : null;
        document.querySelectorAll('#moodFilters .filter-chip').forEach(c => { if (c !== this) c.classList.remove('active'); });
        renderCards();
    });
});

document.getElementById('budgetFilter').addEventListener('change', function() {
    budgetFilter = this.value;
    renderCards();
});

// ==================== УТИЛИТЫ ====================
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.getElementById('toastContainer').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function resetAll() {
    activeCategory = 'all';
    activeMood = null;
    budgetFilter = 'all';
    document.querySelectorAll('#categoryFilters .filter-chip').forEach(c => c.classList.remove('active'));
    document.querySelector('#categoryFilters [data-category="all"]').classList.add('active');
    document.querySelectorAll('#moodFilters .filter-chip').forEach(c => c.classList.remove('active'));
    document.getElementById('budgetFilter').value = 'all';
    renderCards();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
updateAuthUI();
updateWeather();
renderCards();