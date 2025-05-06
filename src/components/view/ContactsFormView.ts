import { FormView } from './Form';
import { ensureElement } from '../../utils/utils';
import { IEvents, FormData, UserContact } from '../../types';


export class ContactsFormView extends FormView<UserContact> {
	private email: HTMLInputElement;
	private phone: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this.email = ensureElement<HTMLInputElement>('input[name="email"]', container);
		this.phone = ensureElement<HTMLInputElement>('input[name="phone"]', container);

	}

	protected onSubmit(): void {
		this.events.emit('contacts:submit', {
			email: this.email.value.trim(),
			phone: this.phone.value.trim()
		});
	}

	protected emitUpdate(): void {
		//  console.log('[Form] emitting contacts:update');
				this.events.emit('contacts:update', {
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
