import { Product, IBasketModel } from "../../types";
import { IEvents } from '../../types';

export class BasketModel implements IBasketModel {
	private items: Product[] = [];

	constructor(private events: IEvents) {}

	// Добавить товар, если его ещё нет
	addItem(product: Product): void {
		if (!this.items.find((item) => item.id === product.id)) {
			this.items.push(product);
			this.emitBasketChanged();
		}
	}

	// Удалить товар по id
	removeItem(productId: string): void {
		const index = this.items.findIndex((item) => item.id === productId);
		if (index !== -1) {
			this.items.splice(index, 1);
			this.emitBasketChanged();
		}
	}

	// Получить все товары в корзине
	getItems(): Product[] {
		return this.items;
	}

	// Очистить корзину
	clear(): void {
		if (this.items.length > 0) {
			this.items = [];
			this.emitBasketChanged();
		}
	}

	// Генерация события basket:changed
	private emitBasketChanged(): void {
		this.events.emit('basket:changed', {
			items: this.items,
			total: this.getTotal()
		});
	}

	// Опциональный хелпер: сумма корзины
	getTotal(): number {
		return this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
	}
}
