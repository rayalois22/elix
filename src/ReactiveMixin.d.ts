// Elix is a JavaScript project, but we use TypeScript as an internal tool to
// confirm our code is type safe.

/// <reference path="shared.d.ts"/>

declare const ReactiveMixin: Mixin<{
  connectedCallback?(): void;
  defaultState?: PlainObject;
}, {
  componentDidMount(): void;
  componentDidUpdate(previousState: PlainObject): void;
  connectedCallback(): void;
  defaultState: PlainObject;
  render(): Promise<void>;
  setState(changes: PlainObject): Promise<void>;
  shouldComponentUpdate(nextState: PlainObject): boolean;
  state: PlainObject;
  validateState(state: PlainObject): boolean;
}>;

export default ReactiveMixin;
