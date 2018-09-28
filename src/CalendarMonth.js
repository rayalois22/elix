import './CalendarMonthDays.js';
import './CalendarMonthYearHeader.js';
import './CalendarWeekDaysHeader.js';
import { merge } from './updates.js';
import { symbols } from './elix.js';
import * as template from './template.js';
import CalendarElementMixin from './CalendarElementMixin.js';
import ReactiveElement from './ReactiveElement.js';


const Base =
  CalendarElementMixin(
    ReactiveElement
  );


class CalendarMonth extends Base {

  /**
   * Returns the day element corresponding to the given date, or null if the
   * date falls outside the range currently covered by this calendar.
   *
   * @param {Date} date - the date to search for
   * @returns {Element|null}
   */
  dayElementForDate(date) {
    /** @type {any} */
    const monthDays = this.$.monthDays;
    return monthDays && 'dayElementForDate' in monthDays &&
      monthDays.dayElementForDate(date);
  }

  /**
   * Returns the day elements contained by this calendar. Note that this may
   * include days from the previous/next month that fall in the same week as
   * the first/last day of the present month.
   * 
   * @type {Element[]}
   */
  get days() {
    if (!this.shadowRoot) {
      return null;
    }
    /** @type {any} */
    const cast = this.$.monthDays;
    return cast.days;
  }

  /**
   * The format used to render the day names in the week days header.
   * 
   * @type {('long'|'narrow'|'short')}
   * @default 'short'
   */
  get daysOfWeekFormat() {
    return this.state.daysOfWeekFormat;
  }
  set daysOfWeekFormat(daysOfWeekFormat) {
    this.setState({ daysOfWeekFormat });
  }

  get defaultState() {
    return Object.assign({}, super.defaultState, {
      daysOfWeekFormat: 'short'
    });
  }

  get [symbols.template]() {
    return template.html`
      <style>
        :host {
          display: inline-block;
        }

        #monthYearHeader {
          display: block;
          font-size: larger;
          font-weight: bold;
          padding: 0.3em;
        }

        #monthTable {
          border-collapse: collapse;
          display: table;
          width: 100%;
        }

        #weekDaysHeader {
          display: table-header-group;
          font-size: smaller;
        }
      </style>

      <elix-calendar-month-year-header id="monthYearHeader"></elix-calendar-month-year-header>
      <div id="monthTable">
        <elix-calendar-week-days-header id="weekDaysHeader" format="short"></elix-calendar-week-days-header>
        <elix-calendar-month-days id="monthDays"></elix-calendar-month-days>
      </div>
    `;
  }

  get updates() {
    const { date, daysOfWeekFormat, locale } = this.state;
    return merge(super.updates, {
      $: {
        monthDays: {
          date,
          locale
        },
        monthYearHeader: {
          date,
          locale
        },
        weekDaysHeader: {
          format: daysOfWeekFormat,
          locale
        }
      }
    });
  }

  /**
   * Returns the week element for the week containing the given date, or null if
   * the date falls outside the calendar's range.
   *
   * @param {Date} date - the date to search for
   * @returns {Element|null}
   */
  weekElementForDate(date) {
    /** @type {any} */
    const monthDays = this.$.monthDays;
    return monthDays && 'weekElementForDate' in monthDays &&
      monthDays.weekElementForDate(date);
  }

  /**
   * Returns the set of week elements used by the calendar.
   * 
   * @type {Element[]}
   */
  get weeks() {
    if (!this.shadowRoot) {
      return null;
    }
    /** @type {any} */
    const cast = this.$.monthDays;
    return cast.weeks;
  }

}


export default CalendarMonth;
customElements.define('elix-calendar-month', CalendarMonth);
