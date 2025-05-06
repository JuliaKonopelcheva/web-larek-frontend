// импортируем стили
import './scss/styles.scss';
// импортируем типы, константы и классы
import { API_URL, CDN_URL } from './utils/constants';
import { ApiService } from './components/apiService';
import { MainPresenter } from './components/Presrnter';
import { ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { ProductModel } from './components/model/Product';
import { BasketModel } from './components/model/BasketModel';
import { OrderModel } from './components/model/OrderModel';
import { AppStateModel } from './components/model/AppState';
import { PageView } from './components/view/Page';
import { ModalView } from './components/view/Modal';
import { OrderFormView } from './components/view/OrderFormView';
import { ContactsFormView } from './components/view/ContactsFormView';
import { SuccessView } from './components/view/SuccessView';
import { BasketView } from './components/view/BasketView';


// функция инициализации
export async function initApp(api: ApiService) {
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
	const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
	const basketContainer = basketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
	const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
	const orderContainer = orderTemplate.content.firstElementChild!.cloneNode(true) as HTMLFormElement;
	const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
	const contactsContainer = contactsTemplate.content.firstElementChild!.cloneNode(true) as HTMLFormElement;
	const successTemplate = ensureElement<HTMLTemplateElement>('#success');
	const successContainer = successTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;


	// Представления
	const pageView = new PageView(pageContainer, events);
	const modalView = new ModalView(modalContainer, events);
	const basketView = new BasketView(basketContainer, events);
	const orderView = new OrderFormView(orderContainer, events);
	const contactsView = new ContactsFormView(contactsContainer, events);
	const successView = new SuccessView(successContainer, events);

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
		basketView,
		orderView,
		contactsView,
		successView,
		api
	);
	
	
			const response = await api.getProducts();
	
			productModel.setProducts(response.items);
	
	
	}



const api = new ApiService(CDN_URL, API_URL);

initApp(api);
