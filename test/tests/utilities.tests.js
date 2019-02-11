import { firstFocusableElement } from '../../src/utilities.js';
import * as template from '../../src/template.js';


describe("utilities", () => {

  it("firstFocusableElement finds first focusable element in light DOM", () => {
    const fixture = template.html`
      <div></div>
      <input tabindex="-1">
      <button disabled>Disabled</button>
      <div>
        <button id="enabled"></button>
      </div>
      <a href="about:blank"></a>
    `;
    const element = firstFocusableElement(fixture.content);
    const button = fixture.content.querySelector('#enabled');
    assert.equal(element, button);
  });

  it("firstFocusableElement finds first focusable element in composed tree", () => {
    const fixture = document.createElement('div');
    const fixtureTemplate = template.html`
      <div></div>
      <slot></slot>
      <button id="enabled"></button>
    `;
    fixture.attachShadow({ mode: 'open' });
    const shadowContent = document.importNode(fixtureTemplate.content, true);
    fixture.shadowRoot.appendChild(shadowContent);
    const childrenTemplate = template.html`
      <div>
        <input>
      </div>
    `;
    const childrenContent = document.importNode(childrenTemplate.content, true);
    fixture.appendChild(childrenContent);
    const element = firstFocusableElement(fixture.shadowRoot);
    const input = fixture.querySelector('input');
    assert.equal(element, input);
  });

});