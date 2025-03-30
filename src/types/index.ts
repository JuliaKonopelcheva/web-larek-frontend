// ========================
//       ДАННЫЕ С API
// ========================

// Товар из каталога (приходит с сервера)
export interface Product {
	id: string;
	title: string;
	description: string;
	image: string;
	category: string;
	price: number | null; // В интерфейсе отображается: либо `${price} синапсов`, либо 'Цена не указана'
}

// Ответ от сервера при запросе всех товаров
export interface ProductListResponse {
	total: number;
	items: Product[];
}

// Один товар в корзине
export interface BasketItem {
	productId: string;
	quantity: number;
}

// Данные, которые мы отправляем на сервер при оформлении заказа
export interface OrderRequest {
	payment: PaymentMethod;
	email: string;
	phone: string;
	address: string;
	items: string[];
	total: number; // итоговая сумма (рассчитывается автоматически)
}

// Ответ от сервера после оформления заказа
export interface OrderResponse {
	id: string;
	total: number;
}

// Данные контактов пользователя (используем внутри приложения)
export interface UserContact {
	email: string;
	phone: string;
}

// Адрес доставки (внутренний тип)
export interface ShippingAddress {
	address: string;
}

// ========================
//         ТИПЫ
// ========================

// Возможные модальные окна в приложении
export type ModalType = 'product' | 'basket' | 'order' | 'contacts' | 'success' | null;

// Доступные способы оплаты
export type PaymentMethod = 'online' | 'cash';

// Этапы оформления заказа (для переходов между шагами)
export enum FormStep {
	Order = 'order',
	Contacts = 'contacts',
	Success = 'success'
}

// Ошибка валидации (например, если поле не заполнено)
export interface ValidationError {
	field: string;
	message: string;
}

// Тип для обработки кликов — может быть элемент или null
export type ClickEventTarget = HTMLElement | null;


// ========================
//    ИНТЕРФЕЙС API-КЛИЕНТА
// ========================

// Методы для работы с сервером (используются в ApiService)
export interface IApiService {
	getProducts(): Promise<ProductListResponse>;
	getProductById(id: string): Promise<Product>;
	submitOrder(data: OrderRequest): Promise<OrderResponse>;
}


// ========================
//     ИНТЕРФЕЙСЫ МОДЕЛЕЙ
// ========================

// Интерфейс модели товаров
export interface IProductModel {
	loadProducts(): void;
	getProductById(id: string): Product;
}

// Интерфейс модели корзины
export interface IBasketModel {
	addToBasket(productId: string): void;
	removeFromBasket(productId: string): void;
	getBasketItems(): BasketItem[];
}

// Интерфейс модели заказа
export interface IOrderModel {
	setAddress(address: string): void;
	setContacts(data: UserContact): void;
	setPayment(method: PaymentMethod): void;
	buildOrderRequest(): OrderRequest;
}

// Интерфейс состояния приложения
export interface IAppStateModel {
	setModal(modal: ModalType): void;
	clearModal(): void;
	setError(message: string): void;
}


// ========================
//     ИНТЕРФЕЙСЫ VIEW
// ========================

// Базовый интерфейс представления (карточки, формы и т.п.)
export interface IView {
	render(): HTMLElement;
	bindEvents(): void;
}

// Расширенный интерфейс для модального окна
export interface IModalView extends IView {
	open(): void;
	close(): void;
	setContent(content: HTMLElement): void;
	bindClose(): void;
}


// ========================
//   ИНТЕРФЕЙСЫ ПРЕЗЕНТЕРОВ
// ========================

// Главный презентер (управляет главной страницей и корзиной)
export interface IMainPresenter {
	init(): void;
}

// Презентер для оформления заказа
export interface ICheckoutPresenter {
	submitOrder(): void;
	validateForm(): boolean;
}


// ========================
//   ИНТЕРФЕЙС BROKER / EVENTS
// ========================

// Интерфейс для работы с EventEmitter (подписка и вызов событий)
export interface IEventEmitter {
	on(event: string, callback: (...args: any[]) => void): void;
	off(event: string, callback: (...args: any[]) => void): void;
	emit(event: string, data?: any): void;
}
