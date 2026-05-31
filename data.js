// База данных локаций с тегами настроения
window.locationsData = [
  {
    id: 1, category: 'cafe', name: 'Уютный дворик',
    desc: 'Кафе с домашней выпечкой и террасой.', rating: 4.7,
    address: 'ул. Цветочная, 15', hours: '08:00–22:00', price: 'Средний',
    icon: '☕', bgClass: 'cafe-bg', phone: '+7 999 123-45-67',
    moods: ['romantic', 'family']
  },
  {
    id: 2, category: 'cafe', name: 'Кофе & Книги',
    desc: 'Книжный уголок с ароматным кофе.', rating: 4.5,
    address: 'пр. Литературный, 8', hours: '09:00–23:00', price: 'Средний',
    icon: '📚', bgClass: 'cafe-bg', phone: '+7 999 234-56-78',
    moods: ['romantic']
  },
  {
    id: 3, category: 'restaurant', name: 'Итальянский квартал',
    desc: 'Премиум итальянская кухня.', rating: 4.9,
    address: 'ул. Гастрономическая, 22', hours: '12:00–00:00', price: 'Высокий',
    icon: '🍝', bgClass: 'restaurant-bg', phone: '+7 999 456-78-90',
    moods: ['romantic', 'family', 'party']
  },
  {
    id: 4, category: 'bar', name: 'Подвал алхимика',
    desc: 'Коктейльный бар с авторскими напитками.', rating: 4.8,
    address: 'пер. Тёмный, 4', hours: '18:00–04:00', price: 'Средний',
    icon: '🍸', bgClass: 'bar-bg', phone: '+7 999 789-01-23',
    moods: ['party']
  },
  {
    id: 5, category: 'pool', name: 'Аква-Лэнд',
    desc: 'Аквапарк с горками и волновым бассейном.', rating: 4.5,
    address: 'ул. Водная, 12', hours: '09:00–21:00', price: 'Средний',
    icon: '🏊', bgClass: 'pool-bg', phone: '+7 999 901-23-45',
    moods: ['family', 'active']
  },
  {
    id: 6, category: 'mountain', name: 'Пик Орлиный',
    desc: 'Живописный горный маршрут с панорамой.', rating: 4.9,
    address: 'Горный массив, 25 км', hours: 'Круглосуточно', price: 'Бесплатно',
    icon: '⛰️', bgClass: 'mountain-bg', phone: 'Связь нестабильна',
    isMountain: true, difficulty: 'Средняя', altitude: '1800 м',
    moods: ['active']
  },
  {
    id: 7, category: 'park', name: 'Центральный парк',
    desc: 'Главный парк с прудом и аттракционами.', rating: 4.6,
    address: 'ул. Парковая, 1', hours: '06:00–23:00', price: 'Бесплатно',
    icon: '🌳', bgClass: 'park-bg', phone: '+7 999 111-22-33',
    moods: ['family', 'romantic', 'active']
  },
  {
    id: 8, category: 'museum', name: 'Музей искусств',
    desc: 'Классическое и современное искусство.', rating: 4.7,
    address: 'пл. Искусств, 3', hours: '10:00–18:00', price: '350 ₽',
    icon: '🎨', bgClass: 'museum-bg', phone: '+7 999 333-44-55',
    moods: ['romantic', 'family']
  }
];