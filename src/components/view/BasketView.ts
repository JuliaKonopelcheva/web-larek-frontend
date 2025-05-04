import { View } from './View';
import { Product, PaymentMethod } from '../../types';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../../types';
import { Card } from './Card';

export interface IBasket {
	products: Product[];
	total: number;
}

export class BasketView extends View<IBasket> {
	private list: HTMLElement;
	private total: HTMLElement;
	private submit: HTMLButtonElement;

	constructor(container: HTMLElement, private events: IEvents) {
		super(container);

		this.list = ensureElement('.basket__list', container);
		this.total = ensureElement('.basket__price', container);
		this.submit = ensureElement<HTMLButtonElement>('.basket__button', container);

        this.bindEvent(this.submit, 'click', () => {
            this.events.emit('order:open', undefined);
        });
	}

	render(data: IBasket): HTMLElement {
		this.list.innerHTML = '';

		data.products.forEach((product, index) => {
			const template = ensureElement<HTMLTemplateElement>('#card-basket');
			const basketElement = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

			const card = new Card(basketElement, 'basket', this.events);
			this.list.appendChild(card.render({ product, variant: 'basket' }, index + 1));
		});

        this.submit.disabled = data.products.some((p) => p.price === null) || data.products.length === 0;
		this.setText(this.total, 
			data.products.some((p) => p.price === null)
			  ? '\u221E синапсов'
			  : `${data.total} синапсов`
		  );
		return this.container;
	}
}