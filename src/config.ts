export const config = {
  stats: {
    balance: 15400,
    strength: 42,
    agility: 35,
    addiction: 15,
    disease: 'Кибер-грипп'
  },
  backpack: [
    { id: 1, name: 'Ржавый нож', rarity: 'Обычное', type: 'weapon' },
    { id: 2, name: 'Неоновый кастет', rarity: 'Редкое', type: 'weapon' },
    { id: 3, name: 'Энергетик "Toxic"', rarity: 'Расходник', type: 'consumable' },
    { id: 4, name: 'Мутаген X', rarity: 'Запретное', type: 'drug' }
  ],
  users: ['@wlyrx', '@f1kusiw3'],
  shopCategories: [
    { id: 'god', name: '🔥 Рука Бога', desc: 'Карательные меры.' },
    { id: 'stationery', name: '✏️ Канцтовары', desc: 'Оружие' },
    { id: 'grocery', name: '🥩 Бакалея', desc: 'С чем качаться' },
    { id: 'business', name: '📈 Бизнес (Акции)', desc: 'Акции магазинов' },
    { id: 'pharmacy', name: '🏥 Аптека', desc: 'Снимет ЗППП, но добавит торч' },
    { id: 'rehab', name: '🏥 Рехаб', desc: 'Заморозит ломку' }
  ],
  shopItems: {
    god: [
      { id: 'mute_5', name: '🤐 Мут 5 мин', price: 1000, desc: 'Заткнуть лоха' },
      { id: 'kick_user', name: '🥾 КИК лоха', price: 999999, desc: 'Кикнуть навсегда' }
    ],
    stationery: [
      { id: 'pen', name: '🖊 Ручка', price: 200, desc: '+1 Модификатор' },
      { id: 'metal_pipe', name: '𫓓 Труба', price: 15000, desc: '+20 Модификатор' }
    ],
    grocery: [
      { id: 'shpak', name: '🍃 Шпак', price: 150, desc: 'Дешевое курево' },
      { id: 'energy', name: '🥤 Энергетик', price: 250, desc: 'Бодрящая жижа' },
      { id: 'chicken_breast', name: '🍗 Грудка', price: 400, desc: 'Мясо для качи' }
    ],
    business: [
      { id: 'god_share', name: 'Доля "Руки Бога"', price: 10000, desc: 'Кэшбэк с покупок лохов' },
      { id: 'grocery_share', name: 'Доля "Бакалеи"', price: 10000, desc: 'Кэшбэк 1% за акцию' }
    ],
    pharmacy: [
      { id: 'tram', name: '💊 Трамадол', price: 300, desc: 'Лечит ЗППП +10%, торч +15%' },
      { id: 'fent', name: '💀 Фентанил', price: 5000, desc: 'Лечит ЗППП +60%, торч +80%' }
    ],
    rehab: [
      { id: 'rehab_enter', name: '🛏 Лечь в рехаб', price: 50, desc: 'Спишет бабки за сутки' }
    ]
  },
  jobs: [
    { id: 'toilets', name: '🧼 Чистка толчков', desc: 'На тебя смотрит куча жидкого говна, а сзади чей-то член упирается тебе в зад.' },
    { id: 'condom', name: '🤡 Промоутер кожвена', desc: 'Ты стоишь у metro в гигантском латексном костюме.' },
    { id: 'cable', name: '🥷 Кража цветмета', desc: 'Перед тобой толстый медный кабель под напряжением.' }
  ],
  logs: [
    { id: 1, text: 'mock', time: '10:42' },
  ]
};
