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
	toggleClass(element: HTMLElement, className: string, force?: boolean): void {
		element.classList.toggle(className, force);
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
     * Абстрактный метод отрисовки — обязателен в каждом потомке.
     */
    abstract render(data?: Partial<T>): HTMLElement;
  }
