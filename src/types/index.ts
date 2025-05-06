import { ApiListResponse } from "../components/base/api";

// ДАННЫЕ С API

// Методы для работы с сервером (используются в ApiService)
export interface IApiService {
	getProducts: () => Promise<ProductListResponse>;
	getProductById: (id: string) => Promise<Product>;
	submitOrder: (data: OrderRequest) => Promise<OrderResponse>;
}

// Интерфейс карточки товара (приходит с сервера)
export interface Product {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null; // В интерфейсе отображается: либо `${price} синапсов`, либо 'Бесценно'
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


// ТИПЫ


// Ответ от сервера при запросе всех товаров
export type ProductListResponse = ApiListResponse<Product>;

// Возможные модальные окна в приложении
export type ModalType = 'product' | 'basket' | 'order' | 'contacts' | 'success' | null;

// Доступные способы оплаты
export type PaymentMethod = 'card' | 'cash';

// Типы модели заказа
// Данные
export type OrderModelData = OrderData & UserContact;
// Сообщения об ошибках
export type Errors<T> = {[K in keyof T]: string };
export type OrderErrors = Errors<OrderModelData>;
// Способы валидации
export type Validator<T> = { [K in keyof T]: (value: T[K]) => boolean };
export type OrderValidator = Validator<OrderModelData>;

// Типы данных форм
// Базовый тип данных формы
export interface FormData {
	isValid?: boolean;
	message?: string;
}

// Тип формы заказа
export interface OrderData extends FormData {
	address: string;
	payment: PaymentMethod; // 'card' | 'cash'
}

// Тип формы контактов
export interface UserContact extends FormData {
	email: string;
	phone: string;
}





// ИНТЕРФЕЙСЫ МОДЕЛЕЙ


// Интерфейс модели товаров
export interface IProductModel {
	setProducts(products: Product[]): void;
	getProducts(): Product[];
	getProductById(id: string): Product | undefined;
}

// Интерфейс модели корзины
export interface IBasketModel {
	addItem(product: Product): void;
	removeItem(productId: string): void;
	getItems(): Product[];
	clear(): void;
	getTotal(): number;
}

// Интерфейс модели заказа
export interface IOrderModel {
	setField<K extends keyof OrderModelData>(field: K, value: OrderModelData[K]) : void;
	clear() : void;
	getField<K extends keyof OrderModelData>(field: K) : OrderModelData[K];
	getData() : OrderModelData;
	validate(): Partial<OrderErrors>;
}

// Интерфейс состояния приложения
export interface IAppStateModel {
	getModal(): ModalType;
	getCurrentId(): string;
	getProductsLoaded(): boolean;
	setState(modal: ModalType, productsLoaded?: boolean, productId?: string): void;
	clearModal(): void;
}

// ИНТЕРФЕЙСЫ VIEW


// Базовый интерфейс представления (карточки, формы и т.п.)
export interface IView<T> {
	render(data?: Partial<T>): HTMLElement;
}

// Базовый интерфейс форм
export interface IFormView<T> extends IView<T> {
	updateFormState(data: FormData): void;
	render(data?: Partial<T>): HTMLElement
}

// Интерфейс корзины
export interface IBasket {
	products: Product[];
	total: number;
	items: HTMLElement[];
}


// ИНТЕРФЕЙС BROKER / EVENTS


// Интерфейс для работы с EventEmitter (подписка и вызов событий)
export interface EventMap {
	// AppState / модальные окна
	'modal:null': { productsLoaded: boolean };
	'modal:product': { productId: string };
	'modal:basket': void;
	'modal:order': void;
	'modal:contacts': void;
	'modal:success': void;
	'modal:closed': void;

	// продукты
	'products:changed': { products: Product[] };
	'product:open': { productId: string };
	'product:add': { product: Product };
	'product:remove': { productId: string };

	// корзина
	'basket:open': void;
	'basket:changed': { items: Product[]; total: number };

	// заказ
  // модель
	'order:changed': {address: string; payment: PaymentMethod; email: string; phone: string };

	// шаг 1
  'order:open': void;
	'order:update': { address?: string; payment?: PaymentMethod };
	'order:submit': { address: string; payment: PaymentMethod };
  'order:validation' : { isValid: boolean };

	// шаг 2
  'contacts:open' : void;
	'contacts:update': { email?: string; phone?: string };
	'contacts:submit': { email: string; phone: string };
  'contacts:validation' : { isValid: boolean, isEmailValid: boolean, isPhoneValid: boolean};

	// success
	'success:close': void;

}

export type EmitterEvent = {
    eventName: string,
    data: unknown
};

//иинтерфейс самого EventEmitter
export interface IEvents {
	on<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): void;
	off<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): void;
	emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void;
	trigger<K extends keyof EventMap>(event: K, context?: Partial<EventMap[K]>): (data: EventMap[K]) => void;
	onAll(callback: (event: EmitterEvent) => void): void;
	offAll(): void;
}