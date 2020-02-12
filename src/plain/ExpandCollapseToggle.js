import * as internal from "../base/internal.js";
import * as template from "../core/template.js";
import UpDownToggle from "../base/UpDownToggle.js";

/**
 *
 * @part collapse-icon - the default icon shown when the panel is expanded
 * @part expand-icon - the default icon shown when the panel is collapsed
 * @part toggle-icon - both of the default icons used to expand/collapse the panel
 */
class ExpandCollapseToggle extends UpDownToggle {
  get [internal.template]() {
    const result = super[internal.template];

    // Replace the icons with our up/down glyphs.
    const downIcon = result.content.getElementById("downIcon");
    const downIconGlyph = template.html`
      <svg id="downIcon" part="toggle-icon expand-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
      </svg>
    `.content.children[0];
    if (downIcon && downIconGlyph) {
      template.replace(downIcon, downIconGlyph);
    }
    const upIcon = result.content.getElementById("upIcon");
    const upIconGlyph = template.html`
      <svg id="upIcon" part="toggle-icon collapse-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
      </svg>
    `.content.children[0];
    if (upIcon && upIconGlyph) {
      template.replace(upIcon, upIconGlyph);
    }

    result.content.append(
      template.html`
        <style>
          :host([disabled]) {
            opacity: 0.5;
          }

          :host(:not([disabled])):hover {
            background: #eee;
          }

          #inner {
            display: inline-flex;
            justify-content: center;
            margin: 0;
            position: relative;
            white-space: nowrap;
          }

          #downIcon,
          #upIcon {
            fill: currentColor;
          }
        </style>
      `.content
    );
    return result;
  }
}

export default ExpandCollapseToggle;
