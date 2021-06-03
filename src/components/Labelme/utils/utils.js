export const getCanvasRectClientXandY = () => {
  const canvas = document.getElementById('canvas');
  return canvas === null ? { x: 0, y: 0 } : canvas.getClientRects()[0];
};

export const saveJSON = (data, filename) => {
  const blob = new Blob([data], { type: 'text/json' });
  const e = document.createEvent('MouseEvents');
  const a = document.createElement('a')
  a.download = `${filename}.tag.json`
  a.href = window.URL.createObjectURL(blob)
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  a.dispatchEvent(e)
}
