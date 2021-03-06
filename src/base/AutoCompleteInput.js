import Input from "./Input.js";
import {
  defaultState,
  firstRender,
  ids,
  raiseChangeEvents,
  render,
  rendered,
  setState,
  shadowRoot,
  state,
} from "./internal.js";

/**
 * A text input box that completes text as the user types
 *
 * @inherits Input
 */
class AutoCompleteInput extends Input {
  get [defaultState]() {
    return Object.assign(super[defaultState], {
      autoCompleteSelect: false,
      originalText: "",
      texts: [],
    });
  }

  [render](/** @type {ChangedFlags} */ changed) {
    super[render](changed);
    if (this[firstRender]) {
      // In many ways it would be cleaner to do AutoComplete work in a keydown
      // listener. Unfortunately, Chrome for Android sets the keyCode on *all*
      // keydown events to a mysterious 229 value, making it impossible for us
      // to look at the keyCode and determine whether the user is typing a key
      // that should trigger AutoComplete.
      //
      // Instead, we listen to input events. That comes with its own set of
      // headaches, noted below.
      this[ids].inner.addEventListener("input", () => {
        // Gboard will generate multiple input events for a single keypress. In
        // particular, if we do AutoComplete and leave the text selected, then
        // when the user types the next key, we'll get *three* input events: one
        // for the actual change, and two other events (probably related to
        // Gboard's own AutoComplete behavior). We give the input value a chance
        // to stabilize by waiting a tick.
        setTimeout(() => {
          this[raiseChangeEvents] = true;
          /** @type {any} */
          const inner = this.inner;
          const text = this.value.toLowerCase();
          // We only AutoComplete if the user's typing at the end of the input.
          // Read the selection start and end directly off the inner element to
          // ensure they're up to date.
          const typingAtEnd =
            inner.selectionStart === text.length &&
            inner.selectionEnd === text.length;
          // Moreover, we only AutoComplete if we're sure the user's added a
          // single character to the value seen on the previous input event.
          // Among other things, we want to ensure the user can delete text from
          // the end without having AutoComplete kick in.
          const originalText = this[state].originalText;
          const userAddedText =
            text.startsWith(originalText) &&
            text.length === originalText.length + 1;
          if (typingAtEnd && userAddedText) {
            autoComplete(this);
          }
          // Remember what the user typed for next time.
          this[setState]({
            originalText: text,
          });
          this[raiseChangeEvents] = false;
        });
      });
    }
  }

  [rendered](/** @type {ChangedFlags} */ changed) {
    super[rendered](changed);
    const { autoCompleteSelect, originalText } = this[state];
    if (changed.originalText && autoCompleteSelect) {
      // We've finished rendering new auto-completed text.
      // Leave the auto-completed portion (after the part the user originally
      // typed) selected.
      this[setState]({
        autoCompleteSelect: false,
        selectionEnd: this[state].value.length,
        selectionStart: originalText.length,
      });

      // Dispatch an input event so that listeners can process the
      // auto-completed text.
      // @ts-ignore
      const InputEvent = window.InputEvent || Event;
      const event = new InputEvent("input", {
        // @ts-ignore
        detail: {
          originalText,
        },
      });
      this.dispatchEvent(event);
    }
  }

  /**
   * The set of texts the input will match against.
   *
   * @type {string[]}
   */
  get texts() {
    return this[state].texts;
  }
  set texts(texts) {
    this[setState]({ texts });
  }

  // Setting the value from the outside is treated as if the user had typed the
  // value. This way the component's value can be prepopulated, and the user can
  // start typing at the end of it to get AutoComplete.
  get value() {
    return super.value;
  }
  set value(value) {
    super.value = value;
    // If the input has focus, we assume the user is typing, and rely on
    // the `input` event to update the originalText state.
    if (this[shadowRoot] && !this.inner.matches(":focus")) {
      this[setState]({
        originalText: value,
      });
    }
  }
}

export function autoComplete(/** @type {AutoCompleteInput} */ element) {
  const value = element.value.toLowerCase();
  const texts = element.texts;
  if (value.length === 0 || !texts) {
    return null;
  }
  const match = texts.find((text) => text.toLowerCase().startsWith(value));
  if (!match) {
    return null;
  }

  // Update the input value to the match.
  // Leave the auto-completed portion selected.
  element[setState]({
    autoCompleteSelect: true,
    value: match,
  });

  return match;
}

export default AutoCompleteInput;
