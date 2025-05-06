import { View } from './View';
import { Product } from '../../types';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../../types';

export type CardVariant = 'gallery' | 'preview' | 'basket';

export interface ICard {
    product: Product;
    variant: CardVariant;
    index?: number;         // для корзины
    inBasket?: boolean;     // только для preview
  }

export class Card extends View<ICard> {
	private title: HTMLElement;
	private price: HTMLElement;
	private image?: HTMLImageElement;
	private category?: HTMLElement;
	private description?: HTMLElement;
	private index?: HTMLElement;
	private button?: HTMLButtonElement;
	private remove?: HTMLButtonElement;
    
	private inBasket = false;

	constructor(
		container: HTMLElement,
		private variant: CardVariant,
		private events?: IEvents // опционально
	) {
		super(container);

		this.title = ensureElement('.card__title', container);
		this.price = ensureElement('.card__price', container);

		if (variant === 'gallery' || variant === 'preview') {
			this.image = ensureElement<HTMLImageElement>('.card__image', container);
			this.category = ensureElement('.card__category', container);
		}

		if (variant === 'preview') {
			this.description = ensureElement('.card__text', container);
			this.button = ensureElement<HTMLButtonElement>('.card__button', container);
		}

		if (variant === 'basket') {
			this.index = ensureElement('.basket__item-index', container);
			this.remove = ensureElement<HTMLButtonElement>('.basket__item-delete', container);
		}

		// Клик на карточку в галерее — открыть модалку
		if (variant === 'gallery' && events) {
			this.bindEvent(container, 'click', () => {
				const id = container.dataset.productId;
				if (id) events.emit('product:open', { productId: id });
		});
	}
	}

	render(data: ICard, order?: number): HTMLElement {
		const { product, inBasket } = data;
        this.container.dataset.productId = product.id;
		this.inBasket = !!inBasket;

		this.setText(this.title, product.title);
		this.setText(this.price, this.formatPrice(product.price));

		if (this.image) {
			this.setImage(this.image, product.image, product.title);
		}

		if (this.category) {
			this.setText(this.category, product.category);
	
			// Удаляем все старые классы-модификаторы
			this.removeClassByPrefix(this.category, 'card__category_');
	
			// Сопоставление названия категории и класса
			const categoryMap: Record<string, string> = {
					'софт-скил': 'card__category_soft',
					'хард-скил': 'card__category_hard',
					'другое': 'card__category_other',
					'дополнительное': 'card__category_additional',
					'кнопка': 'card__category_button'
			};
	
			const className = categoryMap[product.category.toLowerCase()];
			if (className) {
				this.toggleClass(this.category, className, true);
			}
    }

		if (this.description) {
			this.setText(this.description, product.description);
		}

		if (this.index && typeof order === 'number') {
			this.setText(this.index, String(order));
		}

		// preview: кнопка "в корзину" или "удалить"
		if (this.button && this.events && this.variant === 'preview') {
			this.setText(this.button, this.inBasket ? 'Удалить из корзины' : 'В корзину');

			this.bindEvent(this.button, 'click', () => {
				this.events!.emit(
					this.inBasket ? 'product:remove' : 'product:add',
					this.inBasket ? { productId: product.id } : { product }
			);
			});
		}

		// basket: кнопка удаления
		if (this.remove && this.events && this.variant === 'basket') {
			this.bindEvent(this.remove, 'click', () => {
				this.events!.emit('product:remove', { productId: product.id });
			});
		}

		return this.container;
	}

	private formatPrice(price: number | null): string {
		return price ? `${price} синапсов` : 'Бесценно';
	}
}

  