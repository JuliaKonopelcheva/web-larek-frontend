import { View } from './View';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../../types';

export class ModalView extends View<HTMLElement | null> {
	private content: HTMLElement;
	private closeButton: HTMLElement;

	constructor(container: HTMLElement, private events?: IEvents) {
		super(container);

		this.content = ensureElement<HTMLElement>('.modal__content', container);
		this.closeButton = ensureElement<HTMLElement>('.modal__close', container);

		// Кнопка закрытия
		this.bindEvent(this.closeButton, 'click', () => {
			this.events?.emit('modal:closed', undefined);
		});

		// Клик по фону
		this.bindEvent(this.container, 'click', (event: MouseEvent) => {
			if (event.target === this.container) {
				this.events?.emit('modal:closed', undefined);
			}
		});
	}

	render(content: HTMLElement | null): HTMLElement {
		const isOpen = !!content;

		this.toggleClass(this.container, 'modal_active', isOpen);
		this.clearChildren(this.content);

		if (content) {
			this.content.appendChild(content);
		}

		return this.container;
	}
}
