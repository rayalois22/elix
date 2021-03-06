import { templateFrom } from "../core/htmlLiterals.js";
import ReactiveElement from "../core/ReactiveElement.js";
import AriaMenuMixin from "./AriaMenuMixin.js";
import CurrentItemInViewMixin from "./CurrentItemInViewMixin.js";
import CursorAPIMixin from "./CursorAPIMixin.js";
import DelegateFocusMixin from "./DelegateFocusMixin.js";
import DirectionCursorMixin from "./DirectionCursorMixin.js";
import {
  defaultState,
  firstRender,
  ids,
  itemMatchesState,
  render,
  rendered,
  scrollTarget,
  setState,
  state,
  stateEffects,
  tap,
  template,
} from "./internal.js";
import ItemsAPIMixin from "./ItemsAPIMixin.js";
import ItemsCursorMixin from "./ItemsCursorMixin.js";
import ItemsTextMixin from "./ItemsTextMixin.js";
import KeyboardDirectionMixin from "./KeyboardDirectionMixin.js";
import KeyboardMixin from "./KeyboardMixin.js";
import KeyboardPagedCursorMixin from "./KeyboardPagedCursorMixin.js";
import KeyboardPrefixCursorMixin from "./KeyboardPrefixCursorMixin.js";
import LanguageDirectionMixin from "./LanguageDirectionMixin.js";
import SelectedItemTextValueMixin from "./SelectedItemTextValueMixin.js";
import SingleSelectAPIMixin from "./SingleSelectAPIMixin.js";
import SlotItemsMixin from "./SlotItemsMixin.js";
import TapCursorMixin from "./TapCursorMixin.js";

const Base = AriaMenuMixin(
  CursorAPIMixin(
    DelegateFocusMixin(
      DirectionCursorMixin(
        ItemsAPIMixin(
          ItemsCursorMixin(
            ItemsTextMixin(
              KeyboardDirectionMixin(
                KeyboardMixin(
                  KeyboardPagedCursorMixin(
                    KeyboardPrefixCursorMixin(
                      LanguageDirectionMixin(
                        SelectedItemTextValueMixin(
                          CurrentItemInViewMixin(
                            SingleSelectAPIMixin(
                              SlotItemsMixin(TapCursorMixin(ReactiveElement))
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  )
);

/**
 * A menu of choices or commands
 *
 * This holds the contents of the menu, not the top-level UI element that invokes
 * a menu. For that, see [MenuButton](MenuButton) or [PopupSource](PopupSource).
 *
 * @inherits ReactiveElement
 * @mixes AriaMenuMixin
 * @mixes CursorAPIMixin
 * @mixes DelegateFocusMixin
 * @mixes DirectionCursorMixin
 * @mixes ItemsAPIMixin
 * @mixes ItemsCursorMixin
 * @mixes ItemsTextMixin
 * @mixes KeyboardDirectionMixin
 * @mixes KeyboardMixin
 * @mixes KeyboardPagedCursorMixin
 * @mixes KeyboardPrefixCursorMixin
 * @mixes LanguageDirectionMixin
 * @mixes SelectedItemTextValueMixin
 * @mixes CurrentItemInViewMixin
 * @mixes SingleSelectAPIMixin
 * @mixes SlotItemsMixin
 * @mixes TapCursorMixin
 */
class Menu extends Base {
  get [defaultState]() {
    return Object.assign(super[defaultState], {
      highlightSelection: true,
      orientation: "vertical",
      selectionFocused: false,
    });
  }

  /**
   * Highlight the selected item.
   *
   * By default, this uses a heuristic to guess whether the menu was closed by a
   * keyboard or mouse. If so, the menu flashes the selected item off then back
   * on, emulating the menu item selection effect in macOS. Otherwise, it does
   * nothing.
   */
  async highlightSelectedItem() {
    const keyboardActive = this[state].focusVisible;
    const probablyDesktop = matchMedia("(pointer: fine)").matches;
    if (keyboardActive || probablyDesktop) {
      const flashDuration = 75; // milliseconds
      this[setState]({ highlightSelection: false });
      await new Promise((resolve) => setTimeout(resolve, flashDuration));
      this[setState]({ highlightSelection: true });
      await new Promise((resolve) => setTimeout(resolve, flashDuration));
    }
  }

  /**
   * Returns true if the given item should be shown in the indicated state.
   *
   * @param {ListItemElement} item
   * @param {PlainObject} state
   */
  [itemMatchesState](item, state) {
    const base = super[itemMatchesState]
      ? super[itemMatchesState](item, state)
      : true;
    /** @type {any} */ const cast = item;
    return base && !cast.disabled;
  }

  [render](/** @type {ChangedFlags} */ changed) {
    super[render](changed);

    if (this[firstRender]) {
      // Treat a pointerdown event as a tap.
      if ("PointerEvent" in window) {
        // Prefer listening to standard pointer events.
        this.addEventListener("pointerdown", (event) => this[tap](event));
      } else {
        this.addEventListener("touchstart", (event) => this[tap](event));
      }

      this.removeAttribute("tabindex");
    }

    const { currentIndex, items } = this[state];
    if ((changed.items || changed.currentIndex) && items) {
      // Reflect the selection state to the item.
      items.forEach((item, index) => {
        item.toggleAttribute("selected", index === currentIndex);
      });
    }

    if (
      (changed.items ||
        changed.currentIndex ||
        changed.selectionFocused ||
        changed.focusVisible) &&
      items
    ) {
      // A menu has a complicated focus arrangement in which the selected item has
      // focus, which means it needs a tabindex. However, we don't want any other
      // item in the menu to have a tabindex, so that if the user presses Tab or
      // Shift+Tab, they move away from the menu entirely (rather than just moving
      // to the next or previous item).
      //
      // That's already complex, but to make things worse, if we remove the
      // tabindex from an item that has the focus, the focus gets moved to the
      // document. In popup menus, the popup will conclude it's lost the focus,
      // and implicitly close. So we want to move the focus in two phases: 1)
      // set tabindex on a newly-selected item so we can focus on it, 2) after
      // the new item has been focused, remove the tabindex from any
      // previously-selected item.
      items.forEach((item, index) => {
        const selected = index === currentIndex;
        const isDefaultFocusableItem = currentIndex < 0 && index === 0;
        if (!this[state].selectionFocused) {
          // Phase 1: Add tabindex to newly-selected item.
          if (selected || isDefaultFocusableItem) {
            item.tabIndex = 0;
          }
        } else {
          // Phase 2: Remove tabindex from any previously-selected item.
          if (!(selected || isDefaultFocusableItem)) {
            item.removeAttribute("tabindex");
          }
        }
      });
    }
  }

  [rendered](/** @type {ChangedFlags} */ changed) {
    super[rendered](changed);
    if (
      !this[firstRender] &&
      changed.currentIndex &&
      !this[state].selectionFocused
    ) {
      // The selected item needs the focus, but this is complicated. See notes
      // in render.
      const focusElement =
        this.selectedItem instanceof HTMLElement ? this.selectedItem : this;
      focusElement.focus();

      // Now that the selection has been focused, we can remove/reset the
      // tabindex on any item that had previously been selected.
      this[setState]({
        selectionFocused: true,
      });
    }
  }

  get [scrollTarget]() {
    return this[ids].content;
  }

  [stateEffects](state, changed) {
    const effects = super[stateEffects](state, changed);

    // When selection changes, we'll need to focus on it in rendered.
    if (changed.currentIndex) {
      Object.assign(effects, {
        selectionFocused: false,
      });
    }

    return effects;
  }

  get [template]() {
    return templateFrom.html`
      <style>
        :host {
          box-sizing: border-box;
          cursor: default;
          display: inline-flex;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        #content {
          display: flex;
          flex: 1;
          flex-direction: column;
          max-height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch; /* for momentum scrolling */
        }
        
        ::slotted(*) {
          flex-shrink: 0;
          outline: none;
          touch-action: manipulation;
        }

        ::slotted(option) {
          font: inherit;
          min-height: inherit;
        }
      </style>
      <div id="content" role="none">
        <slot></slot>
      </div>
    `;
  }
}

export default Menu;
