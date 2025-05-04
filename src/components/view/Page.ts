import { View } from './View';
import { Card } from './Card'
import { Product } from '../../types';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../../types';

export type IPage = {
    products: Product[];
    basketCount: number;
    isLocked?: boolean;
  };

export class PageView extends View<IPage> {
	private counter: HTMLElement;
	private gallery: HTMLElement;
	private wrapper: HTMLElement;
	private basket: HTMLButtonElement;

    constructor(container: HTMLElement, private events: IEvents) {
        super(container);
        // элементы страницы
        this.counter = ensureElement<HTMLElement>('.header__basket-counter', container);
		this.gallery = ensureElement<HTMLElement>('.gallery', container);
		this.wrapper = ensureElement<HTMLElement>('.page__wrapper', container);
		this.basket = ensureElement<HTMLButtonElement>('.header__basket', container);

        // надо подписаться слушать клик на корзину
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
    
    private setProducts(products: Product[]): void {
        this.gallery.innerHTML = '';
    
        for (const product of products) {
            const template = ensureElement<HTMLTemplateElement>('#card-catalog');
            const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;  


            const card = new Card(container, 'gallery', this.events);
    
            card.render({ product, variant: 'gallery' });
    
            this.gallery.appendChild(card.render({ product, variant: 'gallery' }));
        }
    }
    
    private updateBasketCounter(count: number): void {
        this.setText(this.counter, count);
      }
}