/**
 * Main portal
 */
import {
  LitElement,
  html,
  css
} from 'lit-element';
import './pages/compress/index.mjs';

class App extends LitElement {
  static get styles() {
    return css `
      :host {
        width: 100%;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `;
  }
  render() {
    return html `<x-compress></x-compress>`;
  }
}
customElements.define('x-app', App);
