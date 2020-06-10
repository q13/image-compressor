/**
 * Entry
 */
const metadata = {
  name: 'image-compression'
};
// Initialize
if (typeof nw === 'object') {
  nw.Window.open('index.html', {
    width: 600,
    height: 500
  }, () => {
    console.log('Initialize success');
  });
}

if (typeof exports === 'object') {
  module.exports = metadata;
}

