import { View } from './View';
import { IBasket } from '../../types';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../../types';


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
		this.clearChildren(this.list);

		data.items.forEach((item) => this.list.appendChild(item));

		this.setDisabled(this.submit, !data.total);
		this.setText(this.total, `${data.total} синапсов`);
		return this.container;
	}
}