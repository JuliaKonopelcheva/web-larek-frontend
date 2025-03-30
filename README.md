# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
---

## Архитектура проекта Web-Ларёк

### Используемый паттерн
Проект построен по архитектуре **MVP (Model–View–Presenter)** с применением событийно-ориентированного подхода. Связь между слоями реализована через **EventEmitter**.

---

## Основные компоненты архитектуры

### EventEmitter
**Класс EventEmitter** обеспечивает работу событийной системы. 

**Функции:**
- `on()` — подписка на событие
- `off()` — удаление подписки
- `emit()` — вызов события с передачей данных

EventEmitter используется для связи между всеми слоями приложения: пользовательские действия, изменения данных, ошибки и т.д.

---

## Модели данных (Model)

### ProductModel
**Хранит и управляет каталогом товаров.**
- `products: Product[]`
- `loadProducts()` — загружает список товаров с сервера
- `getProductById(id)` — возвращает товар по id

ProductModel взаимодействует с `MainPresenter`, предоставляя данные для отображения карточек товаров.

### BasketModel
**Отвечает за состояние корзины.**
- `items: BasketItem[]`
- `addToCart(productId)` — добавляет товар
- `removeFromCart(productId)` — удаляет товар
- `getCartItems()` — возвращает текущие товары в корзине

BasketModel передаёт данные в `BasketView` и генерирует события для обновления интерфейса.

### OrderModel
**Содержит данные о заказе.**
- `address`, `email`, `phone`, `payment`
- Методы `setAddress()`, `setContacts()`, `setPayment()` — устанавливают соответствующие поля

OrderModel используется `CheckoutPresenter` для формирования запроса на оформление заказа.

### AppStateModel
**Техническая модель для хранения состояния интерфейса.**
- `currentModal` — ID текущего открытого модального окна
- `isLoading`, `error`
- Методы `setModal()`, `clearModal()`, `setError()`

Используется презентерами для отображения состояния загрузки, ошибок и переключения окон.

---

## Представления (View)

### ProductCardView
**Отображает карточку товара.**
- `render()` — рендер карточки по шаблону
- `bindEvents()` — обработка кликов (на добавление в корзину и т.д.)
- `emit('card:add')`

Пример: компонент `ProductCardView` отображается на главной странице и реагирует на клик по кнопке «В корзину», отправляя событие, которое обрабатывает `MainPresenter`.

### BasketView
**Отображает содержимое корзины.**
- `render()` — рендер списка товаров
- `bindEvents()` — удаление товаров
- `emit('basket:update')`

BasketView работает в связке с `BasketModel` и реагирует на события изменения корзины.

### ModalView
**Универсальный компонент для модальных окон.**
- `open(content)` — открывает с переданным содержимым
- `close()` — закрывает
- `emit('modal:open')`, `emit('modal:close')`

ModalView используется другими view-компонентами: например, `ProductCardView` или `OrderFormView` открываются внутри модального окна.

### OrderFormView
**Первая форма оформления заказа.**
- `render()` — отрисовка полей
- `bindEvents()` — отправка формы
- `emit('order:submit')`

OrderFormView показывает поля доставки и оплаты. После валидации запускает процесс оформления заказа.

### ContactsFormView
**Вторая форма оформления заказа.**
- `render()` — email и телефон
- `bindEvents()` — отправка данных
- `emit('contacts:submit')`

Работает после первой формы. В `CheckoutPresenter` происходит сбор данных и отправка на сервер.

### SuccessView
**Окно успешного заказа.**
- `render()` — отрисовка текста успеха и кнопки возврата
- `emit('order:done')`

После успешного оформления заказа заменяет содержимое модального окна.

---

## Презентеры (Presenter)

### MainPresenter
**Управляет главной страницей и корзиной.**
- `init()` — связывает `ProductModel`, `ProductCardView`, `BasketModel`, `BasketView`, `ModalView`
- Обрабатывает события: открытие карточки, изменение корзины, открытие модалки

Пример: при клике на карточку, `MainPresenter` получает данные товара и открывает `ModalView`, передавая туда `ProductCardView` с нужными данными.

### CheckoutPresenter
**Управляет оформлением заказа.**
- `submitOrder()` — формирует и отправляет заказ
- `validateForm()` — проверка валидности
- Связывает `OrderModel`, `AppStateModel`, `OrderFormView`, `ContactsFormView`, `SuccessView`, `ModalView`

Пример: после заполнения всех полей и нажатия кнопки «Оплатить», `CheckoutPresenter` вызывает `submitOrder()`, отправляет заказ на сервер и отображает `SuccessView` в `ModalView`.

---

## Связи между компонентами

- `MainPresenter` получает данные из `ProductModel`, обновляет `BasketModel`, открывает `ModalView`, рендерит `ProductCardView` и `BasketView`
- `CheckoutPresenter` взаимодействует с `OrderModel`, `AppStateModel`, управляет формами и отображает `SuccessView`
- Все компоненты используют `EventEmitter` для связи между действиями пользователя и обработкой данных

---

Схема архитектуры оформлена в draw.io и представлена в файле `uml.png`. Она иллюстрирует зависимости между моделями, представлениями и презентерами с подписями взаимодействий (например: `renders`, `opens modal`, `sets data`, `emits`).


![UML-архитектура проекта](./docs/uml.png)


