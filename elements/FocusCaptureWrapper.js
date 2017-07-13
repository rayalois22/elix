import Symbol from '../mixins/Symbol.js';
import symbols from '../mixins/symbols.js';


// Symbols for private data members on an element.
const wrappingFocusKey = Symbol('wrappingFocus');


/**
 * This mixin wraps a component’s template such that, once the component gains
 * the keyboard focus, Tab and Shift+Tab operations will cycle the focus within
 * the component.
 * 
 * This wrapper expects the component to provide:
 * 
 * * A template-stamping mechanism compatible with `ShadowTemplateMixin`.
 * 
 * The wrapper provides these features to the component:
 * 
 * * Template elements and event handlers that will cause the keyboard focus to wrap.
 *
 * @module FocusCaptureWrapper
 */
export default function FocusCaptureWrapper(base) {

  class FocusCapture extends base {

    [symbols.keydown](event) {
      let handled;

      /** @type {any} */
      const element = this;
      if (document.activeElement === element &&
          this.shadowRoot.activeElement === null &&
          event.keyCode === 9 && event.shiftKey) {
        // Set focus to focus catcher.
        // The Shift+Tab keydown event should continue bubbling, and the default
        // behavior should cause it to end up on the last focusable element.
        this[wrappingFocusKey] = true;
        const focusCatcher = this.shadowRoot.querySelector('#focusCatcher');
        focusCatcher.focus();
        this[wrappingFocusKey] = false;
        handled = true;
      }

      // Prefer mixin result if it's defined, otherwise use base result.
      return handled || (super[symbols.keydown] && super[symbols.keydown](event)) || false;
    }

    [symbols.shadowCreated]() {
      if (super[symbols.shadowCreated]) { super[symbols.shadowCreated](); }

      const focusCatcher = this.shadowRoot.querySelector('#focusCatcher');
      focusCatcher.addEventListener('focus', event => {
        if (!this[wrappingFocusKey]) {
          // Wrap focus back to the dialog.
          this.focus();
        }
      });
    }

    [symbols.template](filler) {
      const template = `
        ${filler || `<slot></slot>`}
        <div id="focusCatcher" tabindex="0"></div>
      `;
      return super[symbols.template] ?
        super[symbols.template](template) :
        template;
    }

  }

  return FocusCapture;
}
