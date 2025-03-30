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
Проект построен по архитектуре **MVP (Model–View–Presenter)**, которая позволяет чётко разделить работу с данными, отображением и логикой взаимодействия. Все части приложения обмениваются сообщениями через EventEmitter — это делает поведение компонентов предсказуемым и облегчает масштабирование. **EventEmitter**.

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

BasketModel управляет логикой корзины: хранит товары, добавляет и удаляет их. Она не напрямую влияет на интерфейс, а просто отправляет события — так, например, при изменении содержимого корзины, интерфейс сам обновляется через подписку.

### OrderModel
**Содержит данные о заказе.**
- `address`, `email`, `phone`, `payment`
- Методы `setAddress()`, `setContacts()`, `setPayment()` — устанавливают соответствующие поля

CheckoutPresenter использует OrderModel как хранилище всех данных, которые нужны для оформления заказа: адрес, способ оплаты, контакты и итоговая сумма.

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

ModalView работает как универсальный контейнер: я могу вставить туда любую часть интерфейса — от карточки товара до формы оформления. Это избавляет от дублирования кода и позволяет переиспользовать модалки в разных сценариях.

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

## Типы и интерфейсы

Для описания структуры данных, приходящих с сервера и используемых внутри приложения, заданы следующие интерфейсы и типы в файле `src/types/index.ts`.

### Интерфейсы данных

#### `Product`
**Описывает структуру одного товара из каталога.**
```ts
interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number | null;
}
```

#### `ProductListResponse`
**Ответ от API со списком товаров.**
```ts
interface ProductListResponse {
  total: number;
  items: Product[];
}
```

#### `BasketItem`
**Объект, представляющий товар в корзине.**
```ts
interface BasketItem {
  productId: string;
  quantity: number;
}
```

#### `OrderRequest` и `OrderResponse`
**Формат отправки и получения данных при оформлении заказа.**
```ts
interface OrderRequest {
  payment: string;
  email: string;
  phone: string;
  address: string;
  items: string[];
  total: number;
}

interface OrderResponse {
  id: string;
  total: number;
}
```

#### `UserContact`
**Данные покупателя.**
```ts
interface UserContact {
  email: string;
  phone: string;
}
```

#### `ShippingAddress`
**Адрес доставки.**
```ts
interface ShippingAddress {
  address: string;
}
```

#### `ValidationError`
**Структура ошибки валидации форм.**
```ts
interface ValidationError {
  field: string;
  message: string;
}
```

---

### Дополнительные типы

#### `PaymentMethod`
**Допустимые способы оплаты.**
```ts
type PaymentMethod = 'online' | 'cash';
```

#### `ModalType`
**Типы модальных окон.**
```ts
type ModalType = 'product' | 'basket' | 'order' | 'contacts' | 'success' | null;
```

#### `FormStep`
**Этапы формы оформления заказа.**
```ts
enum FormStep {
  Order,
  Contacts,
  Success
}
```

#### `ClickEventTarget`
**Тип для `event.target` при обработке событий клика.**
```ts
type ClickEventTarget = HTMLElement | null;
```

---


Схема архитектуры оформлена в draw.io и представлена в файле `uml.png`. Она иллюстрирует зависимости между моделями, представлениями и презентерами с подписями взаимодействий (например: `renders`, `opens modal`, `sets data`, `emits`).


![UML-архитектура проекта](./docs/uml.png)


