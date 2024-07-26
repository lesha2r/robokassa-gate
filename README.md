Интеграция API Робокасса/Robokassa

# Что умеет?
Всё, для быстрой интеграции платежной системы Робокасса
* Формирует ссылку для оплаты
* Позволяет работать с чеками
* Валидирует вебхук Робокассы при оплате заказа
* Поддерживает test-режим

# Начало работы
## Установка пакет NPM
```
npm i robokassa-gate
```

## Подключение в проекте
```
import RoboGate from 'robokassa-gate';

// Объект конфигурации
const config = {
    merchantLogin: 'myshopname',
    hashingAlgorithm: 'md5',
    password1: 'qwerty0123456789',
    password2: 'asdfgh0987654321',
    testMode: true,
    testPassword1: 'zxcvbn12345689',
    testPassword2: 'mnbvcx987654321',
    resultUrlRequestMethod: 'GET',
    // Чек 👇
    // Коды систем налогооблажения, объекта оплаты, НДС - 
    // см. в документации Робокассы (https://docs.robokassa.ru/)
    receipt: {
        sno: "usn_income",
        paymentMethod: "full_payment",
        paymentObject: "service",
        tax: "none" 
    }
};

// Создаём инстанс класса RoboGate
const robokassa = new RoboGate(config);
```

## Генерация ссылки для оплаты
```
// Ссылка для оплаты заказа
let newOrderURL = robokassa.generatePaymentURL({
    invId: 1,
    invSumm: 700,
    invDescr: 'test payment',
    email: 'example@email.com',
    items: [
        { name: 'Product 1', quantity: 2, price: 200 },
        { name: 'Product 2', price: 300 }
    ],
    customData: { // Любая кастомная информация; будет возвращена в вебхуке об оплате
        'any key': 'custom note' 
    }
});
```

## Валидация данных об оплате
```
// Express.js
// Адрес, указанный в личном кабинете Робокассы 
// (Магазин - Технические настройки - Result Url)
app.get('/payment-result/', (req, res) => {
    const isPaymentValidated = robokassa.validateResult(req);

    if (isPaymentValidated) {
        // ... ваша логика при успешной оплате
    } else {
        // ... ваша логика, если оплата не валидирована
    }
})
```

# TODOs
- [x] Добавить поддержку метода POST для вебхука об оплате

# Документация Робокассы
См. https://docs.robokassa.ru/

# Помощь
🫡 https://t.me/leshatour