import { keydown, renderChanges, state } from "../../src/base/internal.js";
import KeyboardMixin from "../../src/base/KeyboardMixin.js";
import ReactiveElement from "../../src/core/ReactiveElement.js";
import * as mockInteractions from "../mockInteractions.js";
import { assert } from "../testHelpers.js";

class KeyboardTest extends KeyboardMixin(ReactiveElement) {}
customElements.define("keyboard-test", KeyboardTest);

describe("KeyboardMixin", () => {
  let container;

  before(() => {
    container = document.getElementById("container");
  });

  afterEach(() => {
    container.innerHTML = "";
  });

  it("assigns a tabindex of 0 by default", () => {
    const fixture = new KeyboardTest();
    fixture[renderChanges]();
    assert.equal(fixture.getAttribute("tabindex"), "0");
  });

  it("doesn't overwrite an explicit tabindex in markup", async () => {
    container.innerHTML = `<keyboard-test tabindex="1"></keyboard-test>`;
    const fixture = container.querySelector("keyboard-test");
    await Promise.resolve();
    assert.equal(fixture.getAttribute("tabindex"), "1");
  });

  it("reflects tabindex attribute and tabIndex property assignments in state", async () => {
    const fixture = new KeyboardTest();
    fixture[renderChanges]();
    assert.equal(fixture[state].tabIndex, 0);
    fixture.setAttribute("tabindex", "1");
    fixture[renderChanges]();
    assert.equal(fixture[state].tabIndex, 1);
    assert.equal(fixture.tabIndex, 1);
    fixture.tabIndex = 2;
    assert.equal(fixture[state].tabIndex, 2);
    assert.equal(fixture.getAttribute("tabindex"), "2");
  });

  it("listens to keydown and fires the keydown() method", (done) => {
    const fixture = new KeyboardTest();
    fixture[keydown] = () => {
      done();
      return true;
    };
    container.appendChild(fixture);
    mockInteractions.dispatchSyntheticKeyboardEvent(fixture, "keydown");
  });
});
