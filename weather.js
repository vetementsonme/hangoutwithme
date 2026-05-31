// weather.js – имитация API погоды (можно заменить на OpenWeatherMap)
const WeatherService = {
  API_KEY: 'ВАШ_КЛЮЧ_OPENWEATHERMAP', // замените на реальный для живых данных
  async getWeather(dateStr) {
    // Попытка реального запроса (раскомментируйте при необходимости)
    // const city = 'Moscow';
    // const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.API_KEY}&units=metric&lang=ru`;
    // const response = await fetch(url);
    // const data = await response.json();
    // ... обработка

    // Имитация для демо
    return this._mockWeather(dateStr);
  },
  _mockWeather(dateStr) {
    const seed = [...dateStr].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const rand = (n) => {
      let x = Math.sin(seed + n * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    const month = new Date(dateStr).getMonth();
    let temp, icon, desc;
    if (month >= 5 && month <= 7) { // лето
      temp = 22 + Math.round(rand(1) * 12);
      icon = rand(2) > 0.3 ? '☀️' : '⛅';
      desc = 'Солнечно, жарко';
    } else if (month >= 8 && month <= 10) { // осень
      temp = 5 + Math.round(rand(3) * 10);
      icon = rand(4) > 0.5 ? '🌧️' : '☁️';
      desc = 'Дождливо, прохладно';
    } else if (month >= 2 && month <= 4) { // весна
      temp = 5 + Math.round(rand(5) * 13);
      icon = '⛅';
      desc = 'Переменная облачность';
    } else { // зима
      temp = -15 + Math.round(rand(6) * 15);
      icon = rand(7) > 0.4 ? '❄️' : '☁️';
      desc = 'Снег, холодно';
    }
    const humidity = 40 + Math.round(rand(8) * 40);
    const wind = Math.round(rand(9) * 15);
    return { temp, icon, description: `${desc}, влажность ${humidity}%`, humidity, wind };
  }
};