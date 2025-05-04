import { View } from './View';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../../types';

export class SuccessView extends View<number> {
private description: HTMLElement;
private closeButton: HTMLButtonElement;

constructor(container: HTMLElement, private events: IEvents) {
	super(container);

	this.description = ensureElement('.order-success__description', container);
	this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);

	this.bindEvent(this.closeButton, 'click', () => {
		this.events.emit('success:close', undefined);
	});
}

render(total?: number): HTMLElement {
	if (total !== undefined) {
		this.setText(this.description, `Списано ${total} синапсов`);
	}
	return this.container;
}

}

