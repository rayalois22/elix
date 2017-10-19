// Elix is a JavaScript project, but we use TypeScript as an internal tool to
// confirm our code is type safe.

/// <reference path="../utilities/shared.d.ts"/>

declare const ReactiveMixin: Mixin<{
  componentDidUpdate?(): void;
  connectedCallback?(): void;
}, {
  componentDidUpdate(): void;
  connectedCallback(): void;
  defaultState: object;
  render: Promise<void>;
  setState(object): Promise<void>;
  state: object;
}>;

export default ReactiveMixin;
