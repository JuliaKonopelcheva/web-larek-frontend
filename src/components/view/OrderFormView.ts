import { ensureAllElements, ensureElement } from '../../utils/utils';
import { FormView, FormData } from './Form';
import { PaymentMethod } from '../../types';
import { IEvents } from '../../types';

export interface OrderData extends FormData {
	address: string;
	payment: PaymentMethod; // 'card' | 'cash'
}

export class OrderFormView extends FormView<OrderData> {
	private address: HTMLInputElement;
	private paymentButtons: HTMLButtonElement[];
	private selectedPayment: PaymentMethod = 'card';

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this.address = ensureElement<HTMLInputElement>('input[name="address"]', container);
		this.paymentButtons = ensureAllElements<HTMLButtonElement>('.order__buttons button', container);


		// Обработка отправки формы
		this.bindEvent(this.form, 'submit', (e) => {
			e.preventDefault();
			this.events.emit('order:submit', {
				address: this.address.value.trim(),
				payment: this.selectedPayment
			});
		});


        // Обработка изменения формы
		this.bindEvent(this.address, 'input', () => {
			this.events.emit('order:update', {
				address: this.address.value.trim(),
				payment: this.selectedPayment
			});
		});


		// Обработка выбора способа оплаты
		this.paymentButtons.forEach((button) => {
			this.bindEvent(button, 'click', () => {
				this.setPayment(button.name as PaymentMethod);
				this.events.emit('order:update', {
					address: this.address.value.trim(),
					payment: this.selectedPayment
				});
			});
		});
	}

	// Отметить выбранную кнопку и сохранить выбор
	private setPayment(method: PaymentMethod): void {
		this.selectedPayment = method;
		this.paymentButtons.forEach((button) => {
			button.classList.toggle('button_alt-active', button.name === method);
		});
	}

	protected onSubmit(): void {
		this.events.emit('order:submit', {
			address: this.address.value.trim(),
			payment: this.selectedPayment
		});
	}

	// Отрисовка данных в форме
	override render(data?: Partial<OrderData>): HTMLElement {
		if (data?.address !== undefined) {
			this.address.value = data.address;
		}
		if (data?.payment !== undefined) {
			this.setPayment(data.payment);
		}
		return super.render(data);
	}
}

