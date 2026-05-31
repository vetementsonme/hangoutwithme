// app.js – главная логика
document.addEventListener('DOMContentLoaded', () => {
  // Элементы
  const datePicker = document.getElementById('datePicker');
  const grid = document.getElementById('locationsGrid');
  const weatherIcon = document.getElementById('weatherIcon');
  const weatherTemp = document.getElementById('weatherTemp');
  const weatherDesc = document.getElementById('weatherDesc');
  const weatherExtra = document.getElementById('weatherExtra');
  const recommendationBadge = document.getElementById('recommendationBadge');

  // Состояние
  let activeCategory = 'all';
  let activeMood = null;
  let currentWeather = null;

  // Инициализация
  datePicker.value = new Date().toISOString().split('T')[0];
  updateWeather();
  renderCards();

  // События
  datePicker.addEventListener('change', updateWeather);

  // Фильтры категорий
  document.querySelectorAll('#categoryFilters .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#categoryFilters .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.category;
      renderCards();
    });
  });

  // Фильтры настроения
  document.querySelectorAll('.mood-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.classList.contains('active')) {
        chip.classList.remove('active');
        activeMood = null;
      } else {
        document.querySelectorAll('.mood-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeMood = chip.dataset.mood;
      }
      renderCards();
    });
  });

  // Тема
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

  // Функции
  async function updateWeather() {
    const date = datePicker.value;
    const data = await WeatherService.getWeather(date);
    currentWeather = data;
    weatherIcon.textContent = data.icon;
    weatherTemp.textContent = `${data.temp}°C`;
    weatherDesc.textContent = data.description;
    weatherExtra.innerHTML = `<span>💧 ${data.humidity}%</span><span>💨 ${data.wind} км/ч</span>`;

    let badgeText = '', badgeClass = '';
    if (data.temp >= 28) { badgeText = '🔥 Очень жарко – легкая одежда'; badgeClass = 'hot'; }
    else if (data.temp >= 18) { badgeText = '🌤️ Тепло – одевайтесь комфортно'; badgeClass = ''; }
    else if (data.temp >= 5) { badgeText = '🍂 Прохладно – куртка не помешает'; badgeClass = ''; }
    else { badgeText = '❄️ Холодно – одевайтесь теплее'; badgeClass = 'cold'; }
    recommendationBadge.textContent = badgeText;
    recommendationBadge.className = `recommendation-badge ${badgeClass}`;
  }

  function renderCards() {
    const favs = JSON.parse(localStorage.getItem('travelFavorites') || '[]');
    let filtered = window.locationsData;

    // Фильтр по категории
    if (activeCategory !== 'all') {
      filtered = filtered.filter(loc => loc.category === activeCategory);
    }
    // Фильтр по настроению
    if (activeMood) {
      filtered = filtered.filter(loc => loc.moods && loc.moods.includes(activeMood));
    }

    grid.innerHTML = filtered.map(loc => {
      const isFav = favs.includes(loc.id);
      return `
        <a href="location.html?id=${loc.id}" class="location-card">
          <div class="card-img-placeholder ${loc.bgClass}">
            <span>${loc.icon}</span>
            <span class="card-category-tag">${getCategoryName(loc.category)}</span>
            <button class="btn-favorite ${isFav ? 'active' : ''}" onclick="event.preventDefault(); toggleFav(${loc.id}, this)">${isFav ? '❤️' : '🤍'}</button>
          </div>
          <div class="card-body">
            <div class="card-title">${loc.name}</div>
            <div class="card-rating">⭐ ${loc.rating}</div>
            <div class="card-desc">${loc.desc}</div>
            <div class="card-meta">
              <span>📍 ${loc.address}</span>
              <span>💰 ${loc.price}</span>
            </div>
          </div>
        </a>
      `;
    }).join('');
  }

  function getCategoryName(cat) {
    const map = { cafe: 'Кафе', restaurant: 'Ресторан', bar: 'Бар', pool: 'Бассейн', mountain: 'Горы', park: 'Парк', museum: 'Музей' };
    return map[cat] || cat;
  }

  window.toggleFav = function(id, btn) {
    let favs = JSON.parse(localStorage.getItem('travelFavorites') || '[]');
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
      btn.innerHTML = '🤍';
      btn.classList.remove('active');
    } else {
      favs.push(id);
      btn.innerHTML = '❤️';
      btn.classList.add('active');
    }
    localStorage.setItem('travelFavorites', JSON.stringify(favs));
  };

  // Toast helper (используется при необходимости)
  window.showToast = function(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };
});