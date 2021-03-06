import {
  defaultState,
  goFirst,
  goLast,
  goNext,
  goPrevious,
  setState,
  state,
} from "../../src/base/internal.js";
import ItemsCursorMixin from "../../src/base/ItemsCursorMixin.js";
import ReactiveMixin from "../../src/core/ReactiveMixin.js";
import { assert } from "../testHelpers.js";

class ItemsCursorTest extends ItemsCursorMixin(ReactiveMixin(HTMLElement)) {
  get [defaultState]() {
    return Object.assign(super[defaultState], {
      items: ["Zero", "One", "Two"],
    });
  }
}
customElements.define("items-cursor-test", ItemsCursorTest);

describe("ItemsCursorMixin", () => {
  it("has currentIndex initially -1", () => {
    const fixture = new ItemsCursorTest();
    assert.equal(fixture[state].currentIndex, -1);
  });

  it("can move to the next item", () => {
    const fixture = new ItemsCursorTest();
    assert.equal(fixture[state].currentIndex, -1);
    const changed0 = fixture[goNext]();
    assert.equal(fixture[state].currentIndex, 0);
    assert(changed0);
    fixture[goNext]();
    const change1 = fixture[goNext]();
    assert.equal(fixture[state].currentIndex, 2);
    assert(change1);
    // Moving past last item should have no effect.
    const changed2 = fixture[goNext]();
    assert.equal(fixture[state].currentIndex, 2);
    assert(!changed2);
  });

  it("can move to the previous item", () => {
    const fixture = new ItemsCursorTest();
    const changed0 = fixture[goPrevious]();
    assert.equal(fixture[state].currentIndex, 2); // last item
    assert(changed0);
    fixture[goPrevious]();
    const changed1 = fixture[goPrevious]();
    assert.equal(fixture[state].currentIndex, 0);
    assert(changed1);
    const changed2 = fixture[goPrevious]();
    assert.equal(fixture[state].currentIndex, 0);
    assert(!changed2);
  });

  it("can wrap from the last to the first item", () => {
    const fixture = new ItemsCursorTest();
    fixture[setState]({
      cursorOperationsWrap: true,
      currentIndex: 2,
    });
    fixture[goNext]();
    assert.equal(fixture[state].currentIndex, 0);
  });

  it("can wrap from the first to the last item", () => {
    const fixture = new ItemsCursorTest();
    fixture[setState]({
      cursorOperationsWrap: true,
      currentIndex: 0,
    });
    fixture[goPrevious]();
    assert.equal(fixture[state].currentIndex, 2);
  });

  it("makes first item when current item is required and no item is curren", () => {
    const fixture = new ItemsCursorTest();
    assert.equal(fixture[state].currentIndex, -1);
    fixture[setState]({ currentItemRequired: true });
    assert.equal(fixture[state].currentIndex, 0);
  });

  it("preserves the current item when items change and old item exists in new set", () => {
    const fixture = new ItemsCursorTest();
    fixture[setState]({ currentIndex: 1 });
    assert.equal(fixture[state].currentIndex, 1);
    fixture[setState]({
      items: fixture[state].items.slice(1), // Removes item 0
    });
    assert.equal(fixture[state].currentIndex, 0);
  });

  it("clamps current index to fall within item bounds", () => {
    const fixture = new ItemsCursorTest();
    fixture[setState]({ currentIndex: -2 });
    // -1 (no selection) is lowest possible value.
    assert.equal(fixture[state].currentIndex, -1);
    // We have 3 items, so 2 is highest possible value.
    fixture[setState]({ currentIndex: 3 });
    assert.equal(fixture[state].currentIndex, 2);
  });

  it("makes nearest item current when item in last place is removed", () => {
    const fixture = new ItemsCursorTest();
    fixture[setState]({
      items: ["Zero", "One"],
      currentIndex: 2,
    });
    assert.equal(fixture[state].currentIndex, 1);
  });

  it("tries to get close to a desired current index as new items are added", () => {
    const fixture = new ItemsCursorTest();
    assert.equal(fixture[state].currentIndexPending, null);
    fixture[setState]({
      currentIndex: 4,
    });
    assert.equal(fixture[state].currentIndex, 2);
    assert.equal(fixture[state].currentIndexPending, 4);
    fixture[setState]({
      items: [...fixture[state].items, "Three"],
    });
    assert.equal(fixture[state].currentIndex, 3);
    assert.equal(fixture[state].currentIndexPending, 4);
    fixture[setState]({
      items: [...fixture[state].items, "Four", "Five"],
    });
    assert.equal(fixture[state].currentIndex, 4);
    assert.equal(fixture[state].currentIndexPending, null);
  });

  it("drops cursor when the last item is removed", () => {
    const fixture = new ItemsCursorTest();
    fixture[setState]({
      items: [],
      currentIndex: 0,
    });
    assert.equal(fixture[state].currentIndex, -1);
  });

  it("sets canGoNext/canGoPrevious with no wrapping", () => {
    const fixture = new ItemsCursorTest();
    assert(!fixture[state].cursorOperationsWrap);

    // No current item yet
    assert.equal(fixture[state].currentIndex, -1);
    assert(fixture[state].canGoNext);
    assert(fixture[state].canGoPrevious);

    // Start of list
    fixture[goFirst]();
    assert(fixture[state].canGoNext);
    assert(!fixture[state].canGoPrevious);

    // Middle of list
    fixture[goNext]();
    assert(fixture[state].canGoNext);
    assert(fixture[state].canGoPrevious);

    // End of list
    fixture[goLast]();
    assert(!fixture[state].canGoNext);
    assert(fixture[state].canGoPrevious);
  });

  it("sets canGoNext/canGoPrevious with wrapping", () => {
    const fixture = new ItemsCursorTest();
    fixture[setState]({ cursorOperationsWrap: true });

    // Start of list
    fixture[goFirst]();
    assert(fixture[state].canGoNext);
    assert(fixture[state].canGoPrevious);

    // End of list
    fixture[goLast]();
    assert(fixture[state].canGoNext);
    assert(fixture[state].canGoPrevious);
  });

  it("sets nextItemIndex/previousItemIndex with no wrapping", () => {
    const fixture = new ItemsCursorTest();
    const items = fixture[state].items;
    assert.equal(fixture[state].previousItemIndex, items.length - 1);
    assert.equal(fixture[state].nextItemIndex, 0);

    // Start of list
    fixture[goFirst]();
    assert.equal(fixture[state].previousItemIndex, -1);
    assert.equal(fixture[state].nextItemIndex, 1);

    // Middle of list
    fixture[goNext]();
    assert.equal(fixture[state].previousItemIndex, 0);
    assert.equal(fixture[state].nextItemIndex, 2);

    // End of list
    fixture[goLast]();
    assert.equal(fixture[state].previousItemIndex, 1);
    assert.equal(fixture[state].nextItemIndex, -1);
  });

  it("sets nextItemIndex/previousItemIndex with wrapping", () => {
    const fixture = new ItemsCursorTest();
    fixture[setState]({ cursorOperationsWrap: true });
    const items = fixture[state].items;

    assert.equal(fixture[state].previousItemIndex, items.length - 1);
    assert.equal(fixture[state].nextItemIndex, 0);

    // Start of list
    fixture[goFirst]();
    assert.equal(fixture[state].previousItemIndex, 2);
    assert.equal(fixture[state].nextItemIndex, 1);

    // Middle of list
    fixture[goNext]();
    assert.equal(fixture[state].previousItemIndex, 0);
    assert.equal(fixture[state].nextItemIndex, 2);

    // End of list
    fixture[goLast]();
    assert.equal(fixture[state].previousItemIndex, 1);
    assert.equal(fixture[state].nextItemIndex, 0);
  });
});
