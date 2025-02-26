import { css, html, LitElement, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';

import { newOpenEvent } from '@openenergytools/open-scd-core';

import '@material/web/progress/circular-progress.js';

const fileTypes = ['cid', 'icd', 'iid', 'isd', 'sed', 'scd', 'ssd'];
export default class OscdOpen extends LitElement {
  @state()
  showProgress: boolean = false;

  @query('input')
  input!: HTMLInputElement;

  async run() {
    this.input.click();
  }

  async openDocs(event: Event): Promise<void> {
    const files = (<HTMLInputElement | null>event.target)?.files;
    if (!files || files.length === 0) return;

    this.showProgress = true;
    for (const file of Array.from(files)) {
      // eslint-disable-next-line no-await-in-loop
      const text = await file.text();
      const docName = file.name;
      const doc = new DOMParser().parseFromString(text, 'application/xml');

      this.dispatchEvent(newOpenEvent(doc, docName));
    }
    this.showProgress = false;

    this.input.onchange = null;
  }

  render() {
    return html`
      <input
        @click=${({ target }: MouseEvent) => {
          // eslint-disable-next-line no-param-reassign
          (<HTMLInputElement>target).value = '';
        }}
        @change=${this.openDocs}
        accept=${fileTypes.map(f => `.${f}`).join(',')}
        type="file"
        multiple
      />
      ${this.showProgress
        ? html`<md-circular-progress
            id="progress"
            aria-label="Open files progress"
            indeterminate
          ></md-circular-progress>`
        : nothing}
    `;
  }

  static styles = css`
    #progress {
      position: fixed;
      --md-circular-progress-size: 48px;
      --md-circular-progress-active-indicator-width: 20;
      --md-sys-color-primary: var(--oscd-theme-primary);

      left: calc(50vw - 16px);
      top: calc(50vh - 16px);
    }
  `;
}
