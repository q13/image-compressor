/**
 * Compress use tinypng.com
 */
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');
const fsExtra = require('fs-extra');
const klawSync = require('klaw-sync');
const PngQuant = require('./pngquant');
const PNG = require('pngjs').PNG;
// const tinify = require('tinify');
// tinify.key = 'vs9608YYWBsZ8QqhK2X1PKnbxVGLYTVn';

// tinify.proxy = "http://127.0.0.1:7890";

class EventBus extends EventEmitter {}

const eventBus = new EventBus();

function compress(options = {}) {
  const {
    sourcePath,
    targetPath
  } = options;
  // Ensure target exists
  fsExtra.ensureDirSync(targetPath);

  const files = klawSync(sourcePath, {
    nodir: true,
    filter: (opts) => {
      if (opts.path.slice(0, targetPath.length) === targetPath) {
        return false;
      }
      if (fs.statSync(opts.path).isFile()) {
        if (path.extname(opts.path) === '.png') {
          return true;
        } else {
          return false;
        }
      }
      return true;
    }
  });
  if (files.length) {
    (function sioRun(i) {
      if (i < files.length) {
        const file = files[i];
        const sourceFile = file.path;
        const relativePath = path.relative(sourcePath, sourceFile);
        const targetFile = path.normalize(targetPath + '/' + relativePath);
        fsExtra.ensureDirSync(path.dirname(targetFile));
        const sourceStream = fs.createReadStream(sourceFile);
        const targetStream = fs.createWriteStream(targetFile);
        targetStream.on('finish', () => {
          console.info('Transform finished');
        });
        targetStream.on('error', () => {
          console.error('Transform error');
          eventBus.emit('end', {
            relativePath,
            success: false
          });
        });
        targetStream.on('close', () => {
          console.info('Transform close');
          eventBus.emit('end', {
            relativePath,
            success: true
          });
          sioRun(i + 1);
          if (i === (files.length - 1)) {
            eventBus.emit('complete', {
              success: true,
              counts: i + 1
            });
          }
        });
        const pngQuanter = new PngQuant(['--quality', '60-85', '-']);
        // const pngQuanter = new PngQuant(['-']);
        eventBus.emit('start', {
          relativePath
        });
        sourceStream.pipe(new PNG({
          // filterType: 4
        })).on('parsed', function () {

          for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
              var idx = (this.width * y + x) << 2;
              const alpha = this.data[idx + 3];
              if (alpha === 0) {
                // 更改alpha值，否则skeleton png asset透明背景会出现白块
                // https://github.com/kornelski/pngquant/issues/208
                // console.log('alpha', alpha);
                this.data[idx + 3] = 1;
              }
            }
          }
          this.pack().pipe(pngQuanter).pipe(targetStream);
        });
      }
    }(0));
  }
}
exports.compress = compress;
exports.pathNormalize = path.normalize;
exports.fsExists = fs.existsSync;
exports.statSync = fs.statSync;
exports.eventBus = eventBus;
