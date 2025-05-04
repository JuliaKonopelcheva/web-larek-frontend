
import { View } from './View';
import { ensureElement } from '../../utils/utils';
import { IEvents, IFormView } from '../../types'; 

export interface FormData {
	isValid?: boolean;
}

export abstract class FormView<T extends FormData> extends View<T> implements IFormView<T> {
	protected form: HTMLFormElement;
	protected submit: HTMLButtonElement;
	protected errors: HTMLElement;

	constructor(container: HTMLFormElement, protected events: IEvents) {
		super(container);
		this.form = container;

		this.submit = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
		this.errors = ensureElement<HTMLElement>('.form__errors', container);

		this.bindEvent(this.form, 'submit', (e) => {
			e.preventDefault();
			this.onSubmit();
		});
	}

	/**
	 * Реализуется в наследниках — возвращает данные и вызывает событие
	 */
	protected abstract onSubmit(): void;

	/**
	 * Управление состоянием формы (кнопка и сообщение)
	 */
	public updateFormState(isValid: boolean, message?: string): void {
		this.submit.disabled = !isValid;
		this.errors.textContent = message ?? '';
	}

	/**
	 * Отрисовка формы
	 */
	public render(data?: Partial<T>): HTMLElement {
		this.submit.disabled = data?.isValid === false;
		return this.container;
	}
}