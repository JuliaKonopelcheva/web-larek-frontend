import { View } from './View';
import { ensureElement } from '../../utils/utils';
import { IEvents, IPage } from '../../types';


export class PageView extends View<IPage> {
	private counter: HTMLElement;
	private gallery: HTMLElement;
	private wrapper: HTMLElement;
	private basket: HTMLButtonElement;

	constructor(container: HTMLElement, private events: IEvents) {
		super(container);

		this.counter = ensureElement<HTMLElement>('.header__basket-counter', container);
		this.gallery = ensureElement<HTMLElement>('.gallery', container);
		this.wrapper = ensureElement<HTMLElement>('.page__wrapper', container);
		this.basket = ensureElement<HTMLButtonElement>('.header__basket', container);

		this.bindEvent(this.basket, 'click', () => {
			this.events.emit('basket:open', undefined);
		});
	}

	render(data?: Partial<IPage>): HTMLElement {
		if (data?.products) {
			this.setProducts(data.products);
		}
		if (data?.basketCount !== undefined) {
			this.updateBasketCounter(data.basketCount);
		}
		this.toggleClass(this.wrapper, 'page__wrapper_locked', !!data?.isLocked);
		return this.container;
	}

	private setProducts(cards: HTMLElement[]): void {
		this.clearChildren(this.gallery);
		cards.forEach(card => this.gallery.appendChild(card));
	}

	private updateBasketCounter(count: number): void {
		this.setText(this.counter, count);
	}
}
