/**
 * Compress pane
 */
import {
  LitElement,
  html,
  css
} from 'lit-element';
import {
  toast
} from '../../lib/utils.js';
const {
  compress,
  pathNormalize,
  fsExists,
  statSync,
  eventBus
} = require('./src/driver/compress');
const {
  TEMP_TARGET_DIR_NAME
} = require('./src/config.js');

const DIR_SELECT_DIALOG_TITLE = '请选择目录位置';
const INPUT_FILE_TEXT = '点击选择目录';

eventBus.on('end', ({
  relativePath
}) => {
  toast.notice({
    text: `${relativePath} transform complete`,
  });
});
eventBus.on('complete', ({
  counts
}) => {
  toast.notice({
    text: `${counts} images complete`,
  });
});

class Compress extends LitElement {
  static get styles() {
    return css`
      :host {
        width: 90%;
        max-width: 800px;
      }
      .main-pane .pane-field {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .main-pane .pane-field label {
        width: 150px;
        text-align: right;
      }
      .main-pane .pane-field .field-value {
        flex-grow: 1;
        position: relative;
        box-sizing: border-box;
        border: 1px dashed #000000;
        padding: 2px 8px;
        cursor: pointer;
      }
      .main-pane .pane-field .field-value span,
      .main-pane .pane-field .field-value input {
        display: block;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }
      .main-pane .pane-field .field-value input[type=file] {
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
        cursor: pointer;
      }
      .main-pane .pane-field-center {
        margin-left: 150px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 4px 0;
        position: relative;
      }
      .main-pane .pane-field-center .icon-down {
        width: 24px;
      }
      .main-pane .pane-field-center .icon-handler {
        position: absolute;
        top: 0;
        left: 50%;
        margin-left: 12px;
        transform: translateY(50%);
        line-height: 1em;
      }
      .wc-foot {
        text-align: center;
        margin-top: 32px;
      }
      .wc-foot button {
        border: 1px dashed #000000;
        background: transparent;
        color: #000000;
        padding: 4px 16px;
        font-size: 1.1em;
        cursor: pointer;
      }
    `;
  }
  static get properties() {
    return {
      sourcePath: {
        type: String,
        attribute: false
      },
      targetPath: {
        type: String,
        attribute: false
      }
    }
  }
  constructor() {
    super();
    this.sourcePath = '';
    this.targetPath = '';
  }
  handleDirectoryChange(evt) {
    const target = evt.target;
    const value = target.value;
    const pathType = target.dataset.type;
    this[`${pathType}Path`] = value;
    console.log('evt', evt.target.value);
  }
  handleCompress() {
    if (this.sourcePath && this.targetPath) {
      compress({
        sourcePath: this.sourcePath,
        targetPath: this.targetPath
      });
    } else {
      toast.notice({
        text: `请先选择图片目录位置`,
      });
    }
  }
  handleSyncTarget() {
    const sourcePath = this.sourcePath;
    if (sourcePath) {
      const targetPath = pathNormalize(sourcePath + `/${TEMP_TARGET_DIR_NAME}`);
      if (!fsExists(targetPath)) {
        this.targetPath = targetPath;
      } else {
        if (!statSync(targetPath).isDirectory()) {
          toast.error({
            text: `原始图片目录下已存在${TEMP_TARGET_DIR_NAME}实体`,
          });
        } else {
          this.targetPath = targetPath;
        }

        // const notice = PNotify.alert({
        //   title: 'Confirm',
        //   text: `原始图片目录已经有${TEMP_TARGET_DIR_NAME}存在，确定要`,
        //   hide: false,
        //   modules: {
        //     Confirm: {
        //       confirm: true
        //     }
        //   }
        // });
        // notice.on('pnotify.confirm', () => {
        //   // User confirmed, continue here...
        // });
        // notice.on('pnotify.cancel', () => {
        //   // User canceled, continue here...
        // });
      }
      // const targetElement = this.shadowRoot.querySelector('.input-target');
    } else {
      toast.notice({
        text: '请先设置原始图片目录位置',
      });
    }
  }
  render() {
    return html `<div class="wc">
      <div class="wc-body">
        <div class="main-pane">
          <div class="pane-field">
            <label>原始图片目录：</label>
            <div class="field-value">
              <span>${this.sourcePath ? this.sourcePath : DIR_SELECT_DIALOG_TITLE}</span>
              <input
                data-type="source"
                type="file"
                nwdirectory
                nwdirectorydesc="${DIR_SELECT_DIALOG_TITLE}"
                @change="${this.handleDirectoryChange}"
              />
            </div>
          </div>
          <div class="pane-field-center">
            <img class="icon-down" src="./src/view/pages/compress/assets/down.svg" title="${`同级创建 ${TEMP_TARGET_DIR_NAME} 输出目录`}" @click="${this.handleSyncTarget}" />
          </div>
          <div class="pane-field">
            <label>压缩图片输出目录：</label>
            <div class="field-value">
              <span>${this.targetPath ? this.targetPath : DIR_SELECT_DIALOG_TITLE}</span>
              <input
                class="input-target"
                data-type="target"
                type="file"
                nwdirectory
                nwdirectorydesc="${DIR_SELECT_DIALOG_TITLE}"
                @change="${this.handleDirectoryChange}"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="wc-foot">
        <button type="button" @click="${this.handleCompress}">压缩</button>
      </div>
    </div>`
  }
}
customElements.define('x-compress', Compress);