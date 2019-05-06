import { forwardFocus } from './utilities.js';
import { getSuperProperty } from './workarounds.js';
import { merge } from './updates.js';
import * as symbols from './symbols.js';
import * as template from './template.js';
import AriaListMixin from './AriaListMixin.js';
import ArrowDirectionMixin from './ArrowDirectionMixin.js';
import CenteredStripOpacity from './CenteredStripOpacity.js';
import DarkModeMixin from './DarkModeMixin.js';
import DirectionSelectionMixin from './DirectionSelectionMixin.js';
import Explorer from './Explorer.js';
import FocusVisibleMixin from './FocusVisibleMixin.js';
import KeyboardDirectionMixin from './KeyboardDirectionMixin.js';
import KeyboardMixin from './KeyboardMixin.js';
import PageDot from './PageDot.js';
import SlidingStage from './SlidingStage.js';
import SwipeDirectionMixin from './SwipeDirectionMixin.js';
import TouchSwipeMixin from './TouchSwipeMixin.js';
import TrackpadSwipeMixin from './TrackpadSwipeMixin.js';


const Base =
  AriaListMixin(
  ArrowDirectionMixin(
  DarkModeMixin(
  DirectionSelectionMixin(
  FocusVisibleMixin(
  KeyboardDirectionMixin(
  KeyboardMixin(
  SwipeDirectionMixin(
  TouchSwipeMixin(
  TrackpadSwipeMixin(
    Explorer
  ))))))))));


/**
 * Carousel with a sliding effect and navigation controls
 * 
 * Allows a user to navigate a horizontal set of items with touch, mouse,
 * keyboard, or trackpad. This component shows a small dot for each of its
 * items, and displays a sliding effect when moving between items.
 * 
 * @inherits Explorer
 * @mixes AriaListMixin
 * @mixes ArrowDirectionMixin
 * @mixes DarkModeMixin
 * @mixes DirectionSelectionMixin
 * @mixes FocusVisibleMixin
 * @mixes KeyboardDirectionMixin
 * @mixes KeyboardMixin
 * @mixes SwipeDirectionMixin
 * @mixes TouchSwipeMixin
 * @mixes TrackpadSwipeMixin
 * @elementrole {PageDot} proxy
 * @elementrole {CenteredStripOpacity} proxyList
 * @elementrole {SlidingStage} stage
 */
class Carousel extends Base {
  
  get defaultState() {
    // Show arrow buttons if device has a fine-grained pointer (e.g., mouse).
    // As of Mar 14 2018, Firefox does not yet support pointer queries, in which
    // case we assume use of a mouse.
    const pointerQuery = '(pointer: fine)';
    const mediaQueryList = window.matchMedia(pointerQuery);
    const showArrowButtons = mediaQueryList.media === pointerQuery ?
      mediaQueryList.matches :
      true;
    return Object.assign(super.defaultState, {
      orientation: 'horizontal',
      proxyListOverlap: true,
      proxyListPosition: 'bottom',
      proxyListRole: CenteredStripOpacity,
      proxyRole: PageDot,
      showArrowButtons,
      stageRole: SlidingStage
    });
  }

  [symbols.populate](state, changed) {
    if (changed.proxyListRole && this.$.proxyList) {
      // Turn off focus handling for old proxy list.
      /** @type {any} */
      const cast = this.$.proxyList;
      forwardFocus(cast, null);
    }
    if (super[symbols.populate]) { super[symbols.populate](state, changed); }
    if (changed.proxyListRole) {
      // Keep focus off of the proxies and onto the carousel itself.
      /** @type {any} */
      const cast = this.$.proxyList;
      forwardFocus(cast, this);
      cast.removeAttribute('tabindex');
    }
    if (changed.stageRole) {
      /** @type {any} */
      const cast = this.$.stage;
      cast.removeAttribute('tabindex');      
    }
  }

  proxyUpdates(proxy, calcs) {
    const base = super.proxyUpdates(proxy, calcs);
    const proxies = this.proxies;
    const proxiesSupportDarkMode = proxies && proxies[0] && 'darkMode' in proxies[0];
    const darkMode = this.state.darkMode;
    const setDarkMode = darkMode !== null && proxiesSupportDarkMode;
    return merge(
      base,
      {
        tabIndex: -1
      },
      setDarkMode && {
        darkMode
      }
    );
  }

  [symbols.render](state, changed) {
    super[symbols.render](state, changed);
    if (changed.darkMode) {
      const supportsDarkMode = 'darkMode' in this.$.arrowButtonLeft;
      // Wait for knowledge of dark mode
      if (state.darkMode !== null && supportsDarkMode) {
        const { darkMode } = state;
        this.$.arrowButtonLeft.darkMode = darkMode;
        this.$.arrowButtonRight.darkMode = darkMode;
      }
    }
  }

  get [symbols.swipeTarget]() {
    // Next line is same as: const base = super[symbols.swipeTarget]
    const base = getSuperProperty(this, Carousel, symbols.swipeTarget);
    return this.$.stage instanceof HTMLElement ?
      this.$.stage :
      base;
  }

  get [symbols.template]() {
    // Next line is same as: const base = super[symbols.template]
    const base = getSuperProperty(this, Carousel, symbols.template);
    const stage = base.content.querySelector('#stage');
    this[ArrowDirectionMixin.wrap](stage);
    const result = template.concat(base, template.html`
      <style>
        .arrowButton {
          font-size: 48px;
        }

        #proxyList {
          outline: none;
        }

        #stage {
          height: 100%;
          width: 100%;
        }
      </style>
    `);
    const proxyList = result.content.getElementById('proxyList');
    proxyList.setAttribute('tabindex', '');
    return result;
  }

}


customElements.define('elix-carousel', Carousel);
export default Carousel;
