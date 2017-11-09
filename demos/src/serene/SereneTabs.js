import * as props from '../../../mixins/props.js';
import SereneModes from './SereneModes.js';
import Tabs from '../../../elements/Tabs.js';


class SereneTabs extends Tabs {

  get defaultState() {
    return Object.assign({}, super.defaultState, {
      tabPanelsTag: 'serene-modes'
    });
  }

  get props() {
    return props.merge(super.props, {
      style: {
        display: 'flex'
      },
      $: {
        tabStrip: {
          style: {
            'background': '#222',
            'color': 'white',
            'font-family': 'Gentium Basic',
            'padding': '0 33px'
          }
        }
      }
    });
  }

}


customElements.define('serene-tabs', SereneTabs);
export default SereneTabs;