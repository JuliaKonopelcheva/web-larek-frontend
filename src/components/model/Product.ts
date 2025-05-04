import { Product, IProductModel } from "../../types";
import { IEvents } from '../../types';

export class ProductModel implements IProductModel {
	private products: Product[] = [];

	constructor(private events: IEvents) {}

	// Установить список товаров и уведомить об изменении
	setProducts(products: Product[]): void {
		this.products = products;
		this.emitProductsChanged();
	}

	// Получить все товары
	getProducts(): Product[] {
		return this.products;
	}

	// Найти товар по ID
	getProductById(id: string): Product | undefined {
		return this.products.find((product) => product.id === id);
	}

	// Уведомление об изменении списка товаров
	private emitProductsChanged(): void {
		this.events.emit('products:changed', { products: this.products });
	}
}
