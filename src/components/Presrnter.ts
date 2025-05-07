// импортируем типы, константы и классы
import { ApiService } from './apiService'
import { ensureElement } from '../utils/utils';
import { ProductModel } from './model/Product';
import { BasketModel } from './model/BasketModel';
import { OrderModel } from './model/OrderModel';
import { AppStateModel } from './model/AppState';
import { IEvents, OrderData, OrderModelData,OrderErrors, FormData, UserContact } from '../types'; 
import { PageView } from './view/Page';
import { ModalView } from './view/Modal';
import { Card } from './view/Card';
import { OrderFormView } from './view/OrderFormView';
import { ContactsFormView } from './view/ContactsFormView';
import { OrderRequest, PaymentMethod } from '../types';
import { SuccessView } from './view/SuccessView';
import { BasketView } from './view/BasketView';


// класс презентера
export class MainPresenter {
//private orderView: OrderFormView;
//private contactsView: ContactsFormView;


constructor(
	private products: ProductModel,
	private basket: BasketModel,
	private order: OrderModel,
	private app: AppStateModel,
	private events: IEvents,
	private page: PageView,
	private modal: ModalView,
  private basketView: BasketView,
  private orderView: OrderFormView,
  private contactsView: ContactsFormView,
  private successView: SuccessView,
	private api: ApiService
) {
	this.registerEvents();
}

private registerEvents(): void {
	// Каталог загружен → показать главную
	this.events.on('products:changed', () => {
		this.app.setState(null, true);
	});

		// Состояние модального окна изменилось
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
		const items = this.basket.getItems().map((product, index) => {
			const template = ensureElement<HTMLTemplateElement>('#card-basket');
			const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
			const card = new Card(container, 'basket', this.events);
			return card.render({ product, variant: 'basket' }, index + 1);
		});
		
		this.modal.render(
			this.basketView.render({
				products: this.basket.getItems(),
				total: this.basket.getTotal(),
				items,
			})
		);
		
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
		this.basket.removeItemsWithNullPrice();
		this.app.setState('order');
	});

	this.events.on('modal:order', () => {
		const orderKeys = ['address', 'payment'] as const;
		const order = this.order.getData();
		const errors = this.order.validate();
		const formData = this.getFormData(errors, orderKeys);
	
		this.modal.render(this.orderView.render({
			...formData,
			...pickFields(order, orderKeys),
		}));
	
		this.page.render({ isLocked: true });
	});
	
	// изменение введенного текста
	this.events.on('order:update', (data) => {
		Object.entries(data).forEach(([k, v]) => {
			const key = k as keyof OrderModelData;
			this.order.setField(key, v);
		});
	});

    // переход к формек контактов 
	this.events.on('order:submit', ({ address, payment }) => {
		this.app.setState('contacts');
	});

	// Шаг 2: контакты

	//Открыть форму
	this.events.on('modal:contacts', () => {
		const contactsKeys = ['email', 'phone'] as const;
		const order = this.order.getData();
		const errors = this.order.validate();
		const formData = this.getFormData(errors, contactsKeys);
	
		this.modal.render(this.contactsView.render({
			...formData,
			...pickFields(order, contactsKeys),
		}));
	
		this.page.render({ isLocked: true });
	});
	
	// изменение введенного текста
	this.events.on('contacts:update', (data) => {
		Object.entries(data).forEach(([k, v]) => {
			const key = k as keyof OrderModelData;
			this.order.setField(key, v);
		});
	});

	
	// изменение данных модели заказа
  this.events.on('order:changed', (order) => {
	/*
	модель заказа не знает, как данные распределены по формам
	метод validate не знает, из-за чего его вызвали, и
	проверяет сразу все данные модели и возвращает полный отчет
	слушатель order:changed раздает части этого отчета формам
	*/

		const errors = this.order.validate();

  	// ключи объектов типа OrderData или UserContacts
		const orderKeys = ['address', 'payment'] as const;
    const contactsKeys = ['email', 'phone'] as const;
  	
		//данные для формы заказа	
		const orderFormState = {
			...this.getFormData(errors, orderKeys),
			...pickFields(order, orderKeys),
		};
	
		//данные для формы контактов	
		const contactsFormState = {
			...this.getFormData(errors, contactsKeys),
			...pickFields(order, contactsKeys),
		};
	
		// отдаем результаты формам
		this.orderView.updateFormState(orderFormState)
		this.contactsView.updateFormState(contactsFormState)	
	});

	
	// отправка 
	this.events.on('contacts:submit', (data) => {
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
		this.modal.render(this.successView.render(this.basket.getTotal()));
		this.basket.clear();
		this.order.clear();								 // 
		this.page.render({ isLocked: true }); //сброс галереи и счетчика
});


	this.events.on('success:close', () => {
			this.app.setState(null, false);
	});

    // Закрытие любого модального окна
		this.events.on('modal:closed', () => {
			this.app.setState(null, false); // закрытие окна, без перерисовки главной
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
	const productCards = this.products.getProducts().map(product => {
		const template = ensureElement<HTMLTemplateElement>('#card-catalog');
		const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
		const card = new Card(container, 'gallery', this.events);
		return card.render({ product, variant: 'gallery' });
	});

	this.page.render({
		products: productCards,
		basketCount: this.basket.getItems().length
	});
}


private getFormData(errors: OrderErrors, keys: readonly (keyof OrderErrors)[]) : FormData {
	const formErrors = Object.values(pickFields(errors, keys));
	const isValid = !formErrors.length;
	const message = isValid ? '' : `Введите ${formErrors.join(' и ')}`
	return {isValid: isValid, message: message}
}


// Хелперы доступа к данным заказа
private getAddress(): string {
	return this.order.getData().address;
}

private getPayment(): PaymentMethod {
	return this.order.getData().payment;
}

private getEmail(): string {
	return this.order.getData().email;
}

private getPhone(): string {
	return this.order.getData().phone;
}

private isInBasket(id: string): boolean {
	return this.basket.getItems().some((item) => item.id === id);
}



}

// утилита для выделения из объекта его части по заданным ключам
function pickFields<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
	const result = {} as Pick<T, K>;

	for (const key of keys) {
		if (key in obj) {
			result[key] = obj[key];
		}
	}
	return result;
}
