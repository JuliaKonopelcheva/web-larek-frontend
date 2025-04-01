// ========================
//       ДАННЫЕ С API
// ========================

// Методы для работы с сервером (используются в ApiService)
export interface IApiService {
	getProducts(): Promise<ProductListResponse>;
	getProductById(id: string): Promise<Product>;
	submitOrder(data: OrderRequest): Promise<OrderResponse>;
}

// Интерфейс карточки товара (приходит с сервера)
export interface Product {
	id: string;
	title: string;
	description: string;
	image: string;
	category: string;
	price: number | null; // В интерфейсе отображается: либо `${price} синапсов`, либо 'Бесценно'
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

// Интерфейс пользователя
export interface OrderRequest {
	payment: PaymentMethod;
	email: string;
	phone: string;
	address: string;
	items: string[];
	total: number; // итоговая сумма (рассчитывается автоматически)
}

// Ответ от сервера после успешного заказа
export interface OrderResponse {
	id: string;
	total: number;
}

// Адрес доставки (первый шаг формы)
export interface ShippingAddress {
	address: string;
}

// Контактные данные пользователя (второй шаг формы)
export interface UserContact {
	email: string;
	phone: string;
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

// Тип для обработки кликов — может быть элемент или null
export type ClickEventTarget = HTMLElement | null;


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
  getModal(): ModalType;
  setModal(modal: ModalType): void;
  clearModal(): void;
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

// export interface IBasketItemView extends IView {}
// export interface IBasketView extends IView {}
// export interface IOrderFormView extends IView {}
// export interface IContactsFormView extends IView {}
// export interface ISuccessView extends IView {}
// export interface IGalleryCardView extends IView {}
// export interface IModalCardView extends IView {}


// ========================
//   ИНТЕРФЕЙС ПРЕЗЕНТЕРА
// ========================

export interface IMainPresenter {
  init(): void;
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
