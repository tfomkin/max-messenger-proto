# MAX Messenger (GREEN-API)

Прототип веб-чата для отправки и получения текстовых сообщений в мессенджере MAX через [GREEN-API](https://green-api.com/max).

## Стек

- Vite + React + TypeScript
- Zustand
- Vitest (unit-тесты)
- GREEN-API: `CheckAccount`, `SendMessage`, `ReceiveNotification`, `DeleteNotification`

## Подготовка инстанса GREEN-API

Отправка работает без этих настроек. Входящие сообщения попадают в очередь `receiveNotification` только если инстанс настроен так:

1. Создайте аккаунт и инстанс MAX в [кабинете GREEN-API](https://green-api.com/max).
2. Авторизуйте инстанс в MAX (`getStateInstance` должен вернуть `authorized`).
3. Скопируйте `idInstance`, `apiTokenInstance` и `apiUrl`.
4. В настройках инстанса:
   - оставьте **URL вебхука пустым** (`webhookUrl`). Приём идёт через HTTP API; если URL задан, уведомления уходят на этот адрес и не попадают в `receiveNotification`;
   - включите **Получать уведомления о входящих сообщениях и файлах** (`incomingWebhook: yes`).

Пока `incomingWebhook` выключен, `receiveNotification` завершается пустым телом (очередь пуста), и ответы в чате не появляются. После включения настройки тот же запрос возвращает JSON с `receiptId` и `body`, когда собеседник пишет на этот аккаунт.

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес из терминала (обычно `http://localhost:5173`).

Сборка:

```bash
npm run build
npm run preview
```

## Тесты

Unit-тесты на Vitest: нормализация телефона, схема логина, клиент GREEN-API, Zustand store и long-poll уведомлений.

```bash
npm test
```

Режим watch:

```bash
npm run test:watch
```

## Сценарий проверки

1. Войдите, указав `idInstance`, `apiTokenInstance` и `apiUrl`.
2. Нажмите **Новый чат**, введите номер телефона получателя (РФ `7…` или РБ `375…`).
3. Отправьте текстовое сообщение.
4. Ответьте из приложения MAX на том же аккаунте получателя — ответ появится в чате (long-poll).

## Замечания

- Поддерживаются только текстовые сообщения.
- Для создания чата используется `CheckAccount`, чтобы получить корректный `chatId` MAX (нужен для входящих ответов).
- Учётные данные сохраняются в `localStorage` браузера до выхода из аккаунта.
