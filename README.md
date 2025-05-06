# Проектная работа "Веб-ларек" 

Стек: HTML, SCSS, TS, Webpack 

Структура проекта: 
- src/ — исходные файлы проекта 
- src/components/ — папка с JS компонентами 
- src/components/base/ — папка с базовым кодом 
- src/components/model/ - папка с моделями
- src/components/view/ - папка с элементами отображения

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



## Архитектура

### Используемый паттерн 
Проект построен по архитектуре **MVP (Model–View–Presenter)**, которая позволяет чётко разделить работу с данными, отображением и логикой взаимодействия. Все части приложения обмениваются сообщениями через EventEmitter — это делает поведение компонентов предсказуемым и облегчает масштабирование. **EventEmitter**. 

---

## Основные компоненты

### EventEmitter 
**Класс EventEmitter** обеспечивает работу событийной системы.  

**Функции:** 
- `on()` — подписка на событие
- `off()` — отписка
- `emit()` — вызов события с передачей данных
- `onAll()` — глобальный слушатель всех событий

EventEmitter используется для связи между всеми слоями приложения: пользовательские действия, изменения данных, ошибки и т.д. 

---

## Обработка ошибок и крайних случаев 

### Обработка ошибок API 

При возникновении ошибок при работе с API (например, при загрузке каталога или отправке заказа), они обрабатываются через вывод сообщения в консоль с помощью `console.error()`. 

### Обработка `price: null` 

Поле `price` в объекте `Product` может быть `null`, если цена товара не указана. В этом случае в интерфейсе отображается: 

- Если цена указана — например: `1000 синапсов` 
- Если `price === null` — отображается как **«Бесценно»** 


### Поведение кнопок и работа с бесценными товарами 

#### Поведение кнопки "В корзину" 

- Бесценные товары `(price === null)` могут быть добавлены в корзину.
- Бесценные товары не могут быть куплены. Кнопка "оформить заказ" будет неактивна, пока в корзине есть бесценные товары. 

#### Поведение кнопки "Корзина"

- Кнопка корзины недоступна, пока в заказе нет товаров 
- Это предотвращает какие-либо действия с пустым массивом товаров. 

--- 

## Слой коммуникации

### ApiService

***Назначение:*** `ApiService` инкапсулирует логику HTTP-запросов и использует базовый URL из .env. Предоставляет методы для получения товаров и оформления заказа. Реализует интерфейс `IApiService`.

***Конструктор:*** 
- `baseUrl: string` — адрес сервера 

***Поля класса:*** 
- `baseUrl: string` — базовый URL API, берётся из переменной окружения или передаётся в конструктор. Используется при формировании всех запросов 

***Методы:*** 
- `getProducts(): Promise<Product[]>` — загружает список товаров с сервера 

- `getProductById(id: string): Promise<Product>` — получает информацию о товаре по ID 

- `submitOrder(data: OrderRequest): Promise<OrderResponse>` — отправляет заказ на сервер

---


## Модели

### ProductModel

***Назначение***
Хранит и управляет списком товаров

***Конструктор:***
- `events: IEvents` — менеджер событий 

***Поля класса:*** 
- `products: Product[]` — массив объектов товаров, загруженных с сервера

***Методы:***
- `setProducts(): void` — загружает список товаров с API`,

- `getProducts(): Product[]` — возвращает текущий список товаров 

- `getProductById(id: string): Product | undefined` — ищет товар по ID в массиве products 

-	`emit('products:changed')` — событие после успешной загрузки каталога 

### BasketModel 

***Назначение:*** 
Управляет содержимым корзины. Отвечает за добавление, удаление, очистку и хранение списка выбранных товаров. 

***Конструктор:***
- `events: IEvents` — менеджер событий 

***Поля класса:*** 
- `items: Product[]` — массив товаров в корзине

***Методы:***
- `addItem(product: Product): void` — добавляет товар в корзину
- `removeItem(productId: string): void` — удаляет товар из корзины
- `getItems(): Product[]` — возвращает список товаров
- `clear(): void` — очищает корзину
- `getTotal(): number` - считает сумму
- `emit('basket:changed')` — событие при любом изменении корзины

### OrderModel

***Назначение:***
Хранит данные заказа — адрес, контакты и способ оплаты. Выполняет их валидацию

***Конструктор:***
- `events: IEvents`

***Поля класса:***
- `payment: PaymentMethod` — выбранный способ оплаты
- `address: string;` — адрес доставки
- `email: string` — контакты покупателя
- `phone: string` — контакты покупателя

***Методы:***
- `setPayment(method: PaymentMethod): void` — сохраняет способ оплаты
- `setAddress(value: string): void` — сохраняет адрес
- `setContacts(email: string, phone: string): void` — сохраняет контакты
- `validateContacts(email: string, phone: string): void` — проверяет корректность введенных почты и телефона
- `validateAddress(value: string): void` — проверяет заполнение поля адреса

Модель выполняет валидацию данных, введённых пользователем:

- адрес должен быть непустым
- email должен содержать символ `@`, точку и хотябы какой-то текст вокруг них
- телефон не должен быть короче четырех символов

Методы валидации создают события, на которые реагируют элементы отображения

### AppStateModel

***Назначение:***
`AppStateModel` используется презентером для управления модальным интерфейсом: открытия, закрытия и смены форм, перерисовки галереи

***Конструктор:***
- `constructor()`

***Поля класса:***
`modal: ModalType = null;` - состояние модального окна
`productId?: string;` - последняя отображаемая карточка для окна 'product' 
`productsLoaded: boolean` - необходимость перерисовать главную после загрузки товаров


***Методы:***
методы для доступа к полям
-	`getModal(): ModalType`
-	`getCurrentId(): string`  
-	`getProductsLoaded(): boolean`

-	`setState(modal: ModalType, productsLoaded?: boolean, productId?: string): void` - задать состояние приложения
-	`clearModal(): void` - очистить состояние

---


---

## Описание событий

В проекте используется событийная архитектура: компоненты взаимодействуют между собой через `EventEmitter`, не создавая жёстких зависимостей. Ниже приведён список ключевых событий и их назначения.

## Таблица событий

| Событие              | Генерируется                       | Назначение                                                                 |
|----------------------|------------------------------------|----------------------------------------------------------------------------|
| `modal:null`         | `AppStateModel.setState(null)`     | Закрытие модального окна, возможный ререндер главной страницы              |
| `modal:product`      | `AppStateModel.setState('product')`| Открытие карточки товара в модальном окне                                 |
| `modal:basket`       | `AppStateModel.setState('basket')` | Открытие корзины                                                           |
| `modal:order`        | `AppStateModel.setState('order')`  | Открытие формы заказа (доставка и оплата)                                 |
| `modal:contacts`     | `AppStateModel.setState('contacts')`| Открытие формы контактов                                                  |
| `modal:success`      | `AppStateModel.setState('success')`| Отображение экрана успешного оформления                                   |
| `modal:closed`       | `ModalView.render(null)`           | Закрытие модального окна                                                  |
| `products:changed`   | `ProductModel.setProducts()`       | Каталог обновлён (после загрузки с сервера)                               |
| `product:open`       | `Card` (в галерее)                 | Открытие карточки товара                                                  |
| `product:add`        | `Card` (в модалке)                 | Добавление товара в корзину                                               |
| `product:remove`     | `Card` (в модалке или корзине)     | Удаление товара из корзины                                               |
| `basket:open`        | `PageView`                         | Клик по иконке корзины в шапке                                            |
| `basket:changed`     | `BasketModel`                      | Обновление состава корзины                                                |
| `order:open`         | `BasketView`                       | Нажатие кнопки «Оформить» в корзине                                       |
| `order:update`       | `OrderFormView`                    | Изменение адреса доставки или способа оплаты                              |
| `order:submit`       | `OrderFormView`                    | Отправка формы заказа (переход к контактам)                               |
| `order:validation`   | `OrderModel.validateOrder()`       | Возврат результата валидации адреса доставки                              |
| `contacts:open`      | `MainPresenter`                    | Переход к форме контактов                                                 |
| `contacts:update`    | `ContactsFormView`                 | Изменение полей email/phone                                               |
| `contacts:submit`    | `ContactsFormView`                 | Отправка формы контактов                                                  |
| `contacts:validation`| `OrderModel.validateContacts()`    | Возврат результата валидации email и телефона                             |
| `success:close`      | `SuccessView`                      | Закрытие финального экрана                                                |


> Все слои приложения подписываются на нужные события и обрабатывают их соответствующими методами. Это позволяет масштабировать архитектуру и добавлять новый функционал.

---

## Типы и интерфейсы

Для описания структуры данных, приходящих с сервера и используемых внутри приложения, заданы следующие интерфейсы и типы в файле `src/types/index.ts`.

### Интерфейсы данных

#### `ApiService`
**Описывает методы получения товаров и оформления заказа**
```ts
interface IApiService {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product>;
  submitOrder(data: OrderRequest): Promise<OrderResponse>;
}
```

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

#### `OrderRequest` и `OrderResponse`
**Формат отправки и получения данных при оформлении заказа.**
```ts
interface OrderRequest {
  payment: PaymentMethod;
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

---
### Интерфейсы для View-компонентов, созданных на основе абстрактных классов

```ts
interface IBasket {
  products: Product[];
  total: number;
}

interface ICard {
  product: Product;
  variant: 'gallery' | 'preview' | 'basket';
  index?: number;
  inBasket?: boolean;
}

interface IPage {
  products: Product[];
  basketCount: number;
  isLocked?: boolean;
}

interface UserContact {
  email: string;
  phone: string;
  isValid?: boolean;
}

interface OrderData {
  address: string;
  payment: PaymentMethod;
  isValid?: boolean;
}

interface FormData {
  isValid?: boolean;
}

interface IView<T> {
  render(data?: Partial<T>): HTMLElement;
}

interface IFormView<T> extends IView<T> {
  updateFormState(isValid: boolean, message?: string): void;
}
```

---


## Представления (View)

### PageView
- Отображает главную страницу и шапку сайта
- Обновляет список карточек и счётчик корзины

### Card
- Универсальная карточка товара
- Поддерживает режимы: галерея, модалка, корзина

### BasketView
- Отображает список товаров в корзине
- Кнопка "Оформить заказ" активна только при наличии товаров

### OrderFormView
- Первая форма заказа: адрес и способ оплаты
- Отправляет адрес на валидацию

### ContactsFormView
- Вторая форма заказа: email и телефон
- Отправляет содержимое полей на валидацию, отображает ее результат

### SuccessView
- Показывает сообщение об успешной оплате

### ModalView
- Отвечает за отображение любого модального окна

### FormView (абстрактный класс)
- Общая логика форм, реализуется `OrderFormView` и `ContactsFormView`

### View (абстрактный класс)
- Базовая логика для работы с DOM: текст, изображения, классы, события

---

## Презентер

### MainPresenter
- Связывает модели, представления и бизнес-логику
- Управляет навигацией, открытием модалок, отправкой форм, валидацией и рендером


---

## Схема

![UML-архитектура проекта](./docs/uml.png)