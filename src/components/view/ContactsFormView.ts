import { FormView, FormData } from './Form';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../../types';

export interface UserContact extends FormData {
	email: string;
	phone: string;
}

export class ContactsFormView extends FormView<UserContact> {
	private email: HTMLInputElement;
	private phone: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this.email = ensureElement<HTMLInputElement>('input[name="email"]', container);
		this.phone = ensureElement<HTMLInputElement>('input[name="phone"]', container);

		// Обновления по мере ввода
		this.bindEvent(this.email, 'input', () => this.emitUpdate());
		this.bindEvent(this.phone, 'input', () => this.emitUpdate());
	}

    private emitUpdate(): void {
//      console.log('[Form] emitting contacts:update');
		this.events.emit('contacts:update', {
			email: this.email.value.trim(),
			phone: this.phone.value.trim()
		});
	}

	protected onSubmit(): void {
		this.events.emit('contacts:submit', {
			email: this.email.value.trim(),
			phone: this.phone.value.trim()
		});
	}

	override render(data?: Partial<UserContact>): HTMLElement {
		if (data?.email !== undefined) {
			this.email.value = data.email;
		}
		if (data?.phone !== undefined) {
			this.phone.value = data.phone;
		}
		return super.render(data);
	}
}
