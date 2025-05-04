# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TypeScript, Webpack

## Структура проекта
- `src/` — исходные файлы проекта
- `src/components/` — JavaScript и TypeScript компоненты
- `src/components/base/` — базовые классы и утилиты

### Важные файлы
- `src/pages/index.html` — HTML-шаблон главной страницы
- `src/index.ts` — основной файл приложения
- `src/types/index.ts` — глобальные типы и интерфейсы
- `src/scss/styles.scss` — основной файл стилей
- `src/utils/constants.ts` — константы приложения
- `src/utils/utils.ts` — утилитарные функции

---

## Установка и запуск

```bash
npm install
npm run start
```

или

```bash
yarn
yarn start
```

## Сборка

```bash
npm run build
```

или

```bash
yarn build
```

---

## Архитектура

Проект построен по паттерну **MVP (Model-View-Presenter)**. Связь между компонентами осуществляется через событийную шину (`EventEmitter`). Это обеспечивает слабую связанность и масштабируемость приложения.

---

## Основные компоненты

### EventEmitter

Позволяет компонентам приложения взаимодействовать через события.

Методы:
- `on()` — подписка на событие
- `off()` — отписка
- `emit()` — вызов события с передачей данных
- `onAll()` — глобальный слушатель всех событий

Используется всеми слоями для обмена сообщениями.

---

## Модели

### ProductModel
- Хранит и управляет списком товаров
- `setProducts()`, `getProducts()`, `getProductById()`

### BasketModel
- Управляет списком товаров в корзине
- `addItem()`, `removeItem()`, `clear()`, `getItems()`, `getTotal()`

### OrderModel
- Хранит данные заказа: адрес, контакты, оплата
- `setAddress()`, `setContacts()`, `setPayment()`
- Валидация email, телефона, адреса

### AppStateModel
- Управляет текущим состоянием модального окна и карточки
- `setState()`, `clearModal()`, `getModal()`, `getCurrentId()`
- Любая смена модальных окон управляется моделью состояния

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

## События

Приложение построено на событийной архитектуре. Вот основные события:

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

---

## Типы и интерфейсы

### Интерфейсы данных

```ts
export interface IApiService {
  getProducts(): Promise<ProductListResponse>;
  getProductById(id: string): Promise<Product>;
  submitOrder(data: OrderRequest): Promise<OrderResponse>;
}
```

```ts
export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  price: number | null;
}
```

```ts
export interface OrderRequest {
  payment: PaymentMethod;
  email: string;
  phone: string;
  address: string;
  items: string[];
  total: number;
}
```

```ts
export interface OrderResponse {
  id: string;
  total: number;
}
```

### Типы

```ts
export type ModalType = 'product' | 'basket' | 'order' | 'contacts' | 'success' | null;
export type PaymentMethod = 'card' | 'cash';
export type ProductListResponse = ApiListResponse<Product>;
```

### Интерфейсы View-компонентов

```ts
export interface IBasket {
  products: Product[];
  total: number;
}

export interface ICard {
  product: Product;
  variant: 'gallery' | 'preview' | 'basket';
  index?: number;
  inBasket?: boolean;
}

export interface IPage {
  products: Product[];
  basketCount: number;
  isLocked?: boolean;
}

export interface UserContact {
  email: string;
  phone: string;
  isValid?: boolean;
}

export interface OrderData {
  address: string;
  payment: PaymentMethod;
  isValid?: boolean;
}

export interface FormData {
  isValid?: boolean;
}

export interface IView<T> {
  render(data?: Partial<T>): HTMLElement;
}

export interface IFormView<T> extends IView<T> {
  updateFormState(isValid: boolean, message?: string): void;
}
```

---

## Схема

Схема архитектуры доступна в `docs/uml.png` или по [ссылке на Miro](https://miro.com/app/board/uXjVIJ0J3Bc=/?share_link_id=312250903907)