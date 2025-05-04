import { View } from './View'
import { ensureElement } from '../../utils/utils'
import { IEvents } from '../../types';

export class ModalView extends View<HTMLElement | null> {
    private content: HTMLElement;
    private closeButton: HTMLElement;
  
    constructor(container: HTMLElement, private events?: IEvents) {
        super(container);
        this.content = ensureElement<HTMLElement>('.modal__content');
        this.closeButton = ensureElement<HTMLElement>('.modal__close');
  
        this.bindEvent(this.closeButton, 'click', () => this.render(null));
    }
  
    render(content: HTMLElement | null): HTMLElement {
        const isOpen = !!content;
  
        this.container.classList.toggle('modal_active', isOpen);
        this.content.innerHTML = '';
  
        if (content) {
            this.content.appendChild(content);
        }
        if (!isOpen && this.events) {
            this.events.emit('modal:closed', undefined);
        }
        return this.container;
    }
  }