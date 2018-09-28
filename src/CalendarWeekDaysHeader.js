import { merge } from './updates.js';
import { symbols } from './elix.js';
import * as calendar from './calendar.js';
import * as template from './template.js';
import ReactiveElement from './ReactiveElement.js';


class CalendarWeekDaysHeader extends ReactiveElement {

  get defaultState() {
    return Object.assign({}, super.defaultState, {
      format: 'short',
      locale: navigator.language
    });
  }

  /**
   * The format used to render the day names.
   * 
   * @type {('long'|'narrow'|'short')}
   * @default 'short'
   */
  get format() {
    return this.state.format;
  }
  set format(format) {
    this.setState({ format });
  }

  /**
   * A string that identifies a language and a region using a BCP 47 language
   * tag. This works the same as the `CalendarElementMixin`
   * [locale](CalendarElementMixin#locale) property.
   * 
   * @type {string}
   */
  get locale() {
    return this.state.locale;
  }
  set locale(locale) {
    this.setState({ locale });
  }

  get [symbols.template]() {
    return template.html`
      <style>
        :host {
          display: table-row;
        }

        .dayOfWeek {
          display: table-cell;
          width: 14.285%; /* One seventh */
        }

        /* TODO: Move to separate component? */
        .dayOfWeek {
          padding: 0.3em;
          text-align: center;
        }

        .dayOfWeek.weekend {
          color: gray;
        }
      </style>

      <div id="day0" class="dayOfWeek"></div>
      <div id="day1" class="dayOfWeek"></div>
      <div id="day2" class="dayOfWeek"></div>
      <div id="day3" class="dayOfWeek"></div>
      <div id="day4" class="dayOfWeek"></div>
      <div id="day5" class="dayOfWeek"></div>
      <div id="day6" class="dayOfWeek"></div>
    `;
  }

  get updates() {
    const locale = this.state.locale;

    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: this.state.format
    });
    const date = new Date(2017, 0, 1); // A Sunday

    const firstDayOfWeek = calendar.firstDayOfWeek(locale);
    const weekendStart = calendar.weekendStart(locale);
    const weekendEnd = calendar.weekendEnd(locale);

    const dayUpdates = {};
    for (let i = 0; i <= 6; i++) {
      const dayOfWeek = (firstDayOfWeek + i) % 7;
      date.setDate(dayOfWeek + 1);
      const weekend = dayOfWeek === weekendStart || dayOfWeek === weekendEnd;
      dayUpdates[`day${i}`] = {
        classes: {
          weekend
        },
        textContent: formatter.format(date)
      };
    }

    return merge(super.updates, {
      $: dayUpdates
    });
  }

}


export default CalendarWeekDaysHeader;
customElements.define('elix-calendar-week-days-header', CalendarWeekDaysHeader);
