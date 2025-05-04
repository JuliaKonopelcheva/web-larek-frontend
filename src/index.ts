// импортируем стили
import './scss/styles.scss';

// импортируем типы, константы и классы
import { ApiService } from './components/apiService'
import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { ProductModel } from './components/model/Product';
import { BasketModel } from './components/model/BasketModel';
import { OrderModel } from './components/model/OrderModel';
import { AppStateModel } from './components/model/AppState';
import { IEvents } from './types'; 
import { PageView } from './components/view/Page';
import { ModalView } from './components/view/Modal';
import { Card } from './components/view/Card';
import { OrderFormView } from './components/view/OrderFormView';
import { ContactsFormView } from './components/view/ContactsFormView';
import { OrderRequest, PaymentMethod } from './types';
import { SuccessView } from './components/view/SuccessView';
import { BasketView } from './components/view/BasketView';

// класс презентера
class MainPresenter {
private orderView: OrderFormView;
private contactsView: ContactsFormView;


constructor(
	private products: ProductModel,
	private basket: BasketModel,
	private order: OrderModel,
	private app: AppStateModel,
	private events: IEvents,
	private page: PageView,
	private modal: ModalView,
	private api: ApiService
) {
	this.registerEvents();
}

private registerEvents(): void {
	// Каталог загружен → показать главную
	this.events.on('products:changed', () => {
		this.app.setState(null, true);
	});

		// 💡 Состояние модального окна изменилось
	this.events.on('modal:null', ({ productsLoaded }) => {
		this.modal.render(null);
		this.page.render({ isLocked: false });

		// Перерисовать главную только при загрузке каталога
		if (productsLoaded) {
			this.updatePage();
		}
	});
	
	// Товары
	// Открыть товар
	this.events.on('product:open', ({ productId }) => {
		this.app.setState('product', false, productId);
	});
	
	this.events.on('modal:product', ({ productId }) => {
		const product = this.products.getProductById(productId);
		if (product) {
			const template = ensureElement<HTMLTemplateElement>('#card-preview');
			const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
			const card = new Card(container, 'preview', this.events);
			this.modal.render(card.render({
				product,
				variant: 'preview',
				inBasket: this.isInBasket(product.id),
			}));
			this.page.render({ isLocked: true });
		}
	});

	// Добавить в корзину
	this.events.on('product:add', ({ product }) => {
		this.basket.addItem(product);

        // если открыта карточка товара — заменить кнопку добавить на удалить
    	if (this.app.getModal() === 'product') {
			this.app.setState('product', false, product.id);
	}
	});

	// Удалить из корзины
	this.events.on('product:remove', ({ productId }) => {
		this.basket.removeItem(productId);

		// если открыта карточка товара - заменить кнопку удалить на добавить
		if (this.app.getModal() === 'product') {
			this.app.setState('product', false, productId);
		}
	});

	// Корзина
	// Открыть корзину
	this.events.on('basket:open', () => {
		if (this.basket.getItems().length > 0) {
			this.app.setState('basket');
		}
	});
    
	this.events.on('modal:basket', () => {
		const template = ensureElement<HTMLTemplateElement>('#basket');
		const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		const view = new BasketView(container, this.events);
		this.modal.render(view.render({
			products: this.basket.getItems(),
			total: this.basket.getTotal()
		}));
		this.page.render({ isLocked: true });
	});

	// Корзина изменилась
	this.events.on('basket:changed', ({ items }) => {
		this.page.render({ basketCount: items.length });

        // если модалка с корзиной открыта — перерисовать
        if (this.app.getModal() === 'basket') {
			this.app.setState('basket');
        }
	});

	// Оформление заказа
	// Шаг 1: доставка и оплата
	// Открыть форму
	this.events.on('order:open', () => {
		this.app.setState('order');
	});

	this.events.on('modal:order', () => {
		const template = ensureElement<HTMLTemplateElement>('#order');
		const container = template.content.firstElementChild!.cloneNode(true) as HTMLFormElement;
		this.orderView = new OrderFormView(container, this.events);

		const address = this.getAddress();
		const payment = this.getPayment();

		this.modal.render(this.orderView.render({
			address, 
			payment, 
			isValid: false })); // при создании кнопка выключена

		this.page.render({ isLocked: true });


//			this.app.setStep('delivery');
this.order.validateOrder(address); // обновляем кнопку
});


	// изменение введенного текста
    this.events.on('order:update', ({ address }) => {
        this.order.validateOrder(address);
    });

	// возврат результатов валидации
    this.events.on('order:validation', ({ isValid }) => {
        this.orderView?.updateFormState(isValid);
    });

    // установка данных, 
	this.events.on('order:submit', ({ address, payment }) => {
		this.order.setAddress(address);
		this.order.setPayment(payment);
		this.app.setState('contacts');
	});

	// Шаг 2: контакты

	//Открыть форму
	this.events.on('modal:contacts', () => {
		const template = ensureElement<HTMLTemplateElement>('#contacts');
		const container = template.content.firstElementChild!.cloneNode(true) as HTMLFormElement;
		this.contactsView = new ContactsFormView(container, this.events);

		const email = this.getEmail();
		const phone = this.getPhone();

		this.modal.render(this.contactsView.render({ 
			email, 
			phone, 
			isValid: false })); // при создании кнопка выключена, сообщений нет

		this.page.render({ isLocked: true });


//			this.app.setStep('contacts');
this.order.validateContacts(email, phone); //обновляем кнопку и сообщения
});


	// изменение введенного текста
	this.events.on('contacts:update', ({ email, phone }) => {
		this.order.validateContacts(email, phone);
	});

	// возврат результатов валидации
    this.events.on('contacts:validation', ({ isValid, isEmailValid, isPhoneValid }) => {

		let message = '';
		if (isEmailValid && !isPhoneValid) message = 'Введите корректный телефон';
		else if (!isEmailValid && isPhoneValid) message = 'Введите корректный email';
		else if (!isValid) message = ''; // сообщаем пользователю, какое из полей заполнено неправильно


		this.contactsView?.updateFormState(isValid, message);


});


	// отправка
	this.events.on('contacts:submit', (data) => {
		this.order.setContacts(data.email, data.phone);

		const request: OrderRequest = {
			address: this.getAddress(),
			payment: this.getPayment(),
			email: this.getEmail(),
			phone: this.getPhone(),
			items: this.basket.getItems().map((p) => p.id),
			total: this.basket.getTotal()
		};

		this.sendOrder(request);
	});

	// Успешный заказ
	this.events.on('modal:success', () => {
		const template = ensureElement<HTMLTemplateElement>('#success');
		const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		const view = new SuccessView(container, this.events);
		this.modal.render(view.render(this.basket.getTotal()));
		this.basket.clear();
		this.order.setPayment('card');
		this.order.setAddress('');
		this.order.setContacts('','');										 // 
		this.page.render({ isLocked: true }); //сброс галереи и счетчика
});


	this.events.on('success:close', () => {
			this.app.setState(null, false);
	});

    // Закрытие любого модального окна
    this.events.on('modal:closed', () => {
    //    console.log('modal closed')
        this.page.render({ isLocked: false });
    });
}


private async sendOrder(request: OrderRequest): Promise<void> {
	try {
		await this.api.submitOrder(request);
		this.app.setState('success');


//			this.app.setStep('done');
} catch (error) {
console.error('Ошибка отправки заказа:', error);
alert('Не удалось оформить заказ. Попробуйте позже.');
}
}


private updatePage(): void {
	this.page.render({
		products: this.products.getProducts(),
		basketCount: this.basket.getItems().length
	});
}

// Хелперы доступа к данным заказа
private getAddress(): string {
	return (this.order as any).address;
}

private getPayment(): PaymentMethod {
	return (this.order as any).payment;
}

private getEmail(): string {
	return (this.order as any).email;
}

private getPhone(): string {
	return (this.order as any).phone;
}

private isInBasket(id: string): boolean {
	return this.basket.getItems().some((item) => item.id === id);
}


}

async function initApp(api: ApiService) {
// Инициализация EventEmitter
const events = new EventEmitter();


// Модели
const productModel = new ProductModel(events);
const basketModel = new BasketModel(events);
const orderModel = new OrderModel(events);
const appState = new AppStateModel(events);

// DOM-контейнеры
const pageContainer = ensureElement<HTMLElement>('.page');
const modalContainer = ensureElement<HTMLElement>('#modal-container');

// Представления
const pageView = new PageView(pageContainer, events);
const modalView = new ModalView(modalContainer, events);
modalView.render(null); // сброс при запуске

// Презентер
const presenter = new MainPresenter(
	productModel,
	basketModel,
	orderModel,
	appState,
	events,
	pageView,
	modalView,
	api
);


    const response = await api.getProducts();

    productModel.setProducts(response.items);


}

const api = new ApiService(CDN_URL, API_URL);

initApp(api);
