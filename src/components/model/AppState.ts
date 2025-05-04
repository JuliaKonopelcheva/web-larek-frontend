import { IEvents } from '../../types';
import { ModalType, IAppStateModel } from '../../types';

export class AppStateModel implements IAppStateModel {
	private modal: ModalType = null; // состояние отображения
	private productId?: string; // отображаемая карточка (для modal = 'product')
	private productsLoaded = false; // надо ли перерендерить главную

	constructor(private events: IEvents) {}

	// Получить текущее открытое окно
	getModal(): ModalType {
		return this.modal;
	}

    // Получить Id последней открытой карточки
	getCurrentId(): string {
		return this.productId;
	}

	// Загружался ли каталог перед последним изменением состояния 
	getProductsLoaded(): boolean {
		return this.productsLoaded;
	}

	// Установить новое состояние приложения
	setState(modal: ModalType, productsLoaded = false, productId?: string): void {
		this.modal = modal;
		this.productId = productId;
		this.productsLoaded = productsLoaded;

		this.events.emit(`modal:${modal ?? 'null'}`, {
			productId,
			productsLoaded
		});
	}

	// Очистить состояние
	clearModal(): void {
		this.setState(null, false);
	}
	}
