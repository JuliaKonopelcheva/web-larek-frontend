import { IView } from "../../types";

export abstract class View<T> implements IView<T> {
  protected constructor(protected readonly container: HTMLElement) {}

  /**
   * Навесить обработчик события.
   */
  protected bindEvent<K extends keyof HTMLElementEventMap>(
      element: HTMLElement | null,
      type: K,
      handler: (event: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions
  ): void {
      if (element) {
        element.addEventListener(type, handler as EventListener, options);
      }
  }

  /**
	 * Переключить класс
   */
	protected toggleClass(element: HTMLElement, className: string, force?: boolean): void {
		element.classList.toggle(className, force);
	}

  /**
   * Удалить классы
   */
  protected removeClasses(element: HTMLElement | null, ...classes: string[]): void {
    if (element) {
      element.classList.remove(...classes);
    }
  }
  
  /**
   * Удаляет все классы у элемента, начинающиеся с указанного префикса.
   */
  protected removeClassByPrefix(element: HTMLElement | null, prefix: string): void {
    if (!element) return;
  
    const matchingClasses = Array.from(element.classList).filter(className => 
      className.startsWith(prefix)
    );
  
    this.removeClasses(element, ...matchingClasses);
  }
  
    /**
     * Установить текстовое содержимое элемента.
     */
    protected setText(element: HTMLElement | null, value: unknown): void {
      if (element) element.textContent = String(value);
    }
  
    /**
     * Установить изображение и alt-текст.
     */
    protected setImage(element: HTMLImageElement | null, src: string, alt?: string): void {
      if (element) {
        element.src = src;
        if (alt) element.alt = alt;
      }
    }
  
    /**
     * Скрыть элемент через style.
     */
    protected hide(element: HTMLElement | null): void {
      if (element) element.style.display = 'none';
    }
  
    /**
     * Показать скрытый элемент.
     */
    protected show(element: HTMLElement | null): void {
      if (element) element.style.removeProperty('display');
    }
  
    /**
     * Установить или снять атрибут disabled.
     */
    protected setDisabled(element: HTMLElement | null, disabled: boolean): void {
      if (!element) return;
      if (disabled) element.setAttribute('disabled', 'disabled');
      else element.removeAttribute('disabled');
    }
  
    /**
     * Установить текст в поле ввода.
     */
    protected setInputValue(element: HTMLInputElement | null, value: string | undefined): void {
      if (element && typeof value === 'string') {
        element.value = value;
      }
    }    

    /**
     * Обновить значение поля ввода, установить фокус и курсор в конец нового фрагмента.
     */
    protected updateInputValue(
      element: HTMLInputElement | null,
      newValue: string
    ): void {
      if (!element) return;

      const oldValue = element.value;

      // Не обновляем, если значение не изменилось
      if (oldValue === newValue) return;

      const selectionStart = element.selectionStart ?? oldValue.length;
      const selectionEnd = element.selectionEnd ?? oldValue.length;

      const removedLength = selectionEnd - selectionStart;
      const insertedLength = newValue.length - (oldValue.length - removedLength);
      const newCursorPosition = selectionStart + insertedLength;

      // Устанавливаем новое значение через существующий метод
      this.setInputValue(element, newValue);

      // Ставим фокус и курсор
      element.focus();
      element.setSelectionRange(newCursorPosition, newCursorPosition);
    }

    /**
     * Очистить родительский элемент.
     */
    protected clearChildren(element: HTMLElement): void {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }

    /**
     * Абстрактный метод отрисовки — обязателен в каждом потомке.
     */
    abstract render(data?: Partial<T>): HTMLElement;
  }
