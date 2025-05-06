import { View } from './View';
import { ensureElement } from '../../utils/utils';
import { IEvents, IFormView, FormData} from '../../types'; 


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

		this.bindEvent(this.form, 'input', (e) => {
			e.preventDefault();
			this.emitUpdate();
		});

	}

	/**
	 * Реализуется в наследниках — вызывает событие submit c данными типа T
	 */
	protected abstract onSubmit(): void /*{
		this.events.emit(`${container.name}:submit`, data: T);
	}*/

	/**
	 * Реализуется в наследниках — вызывает событие update c данными типа Partial<T>
	 */
	protected abstract emitUpdate(): void /*{
		this.events.emit(`${container.name}:update`, data: Partial<T>);
	}*/

	/**
	 * Управление состоянием формы (кнопка и сообщение)
	 */
	public updateFormState(data: FormData): void {
		this.setDisabled(this.submit, !data.isValid);
		this.setText(this.errors, data.message ?? '');
	}

	/**
	 * Отрисовка формы
	 */
	public render(data?: Partial<T>): HTMLElement {
		this.setDisabled(this.submit, data?.isValid === false);
		return this.container;
	}
}