// utility copy from sevice.js
const randNum = max => Math.round(Math.random() * (max - Math.floor(max / 10)) + Math.floor(max / 10));
export const generateId = (currentList, max = 999999999) => {
  let R = randNum(max);
  while (currentList.includes(R)) {
    R = randNum(max);
  }
  return R.toString();
};
// copy text content to clipborad
export const copy = (str) => {
  navigator.clipboard.writeText(str);
}

const TOAST_HEIGHT = 30;
/**
 * show a toast
 * @param {string} title
 */
export const showToast = (title) => {
  const toast = document.createElement('div');
  toast.innerText = title;
  toast.className = 'toast';
  toast.style.top = `-${TOAST_HEIGHT + 10}px`;
  toast.style.height = `${TOAST_HEIGHT}px`;
  toast.style.transition = 'all .5s';
  document.body.appendChild(toast);
  // wait dom attached
  setTimeout(() => {
    // horizontal center
    toast.style.left = `calc(50% - ${toast.clientWidth / 2}px)`;
    toast.style.transform = 'translateY(70px)';
    setTimeout(() => {
      toast.style.transform = '';
      toast.ontransitionend = function () {
        document.body.removeChild(toast);
      }
    }, 3000);
  }, 0)
}

export const linkParseToEmbedUrl = (val, autoplay = false) => {
  if (!val.includes('embed')) {
    if (val.includes('watch')) {
      // brower link
      val = val.replace(/watch?(.+?)?v=(\w+)/, 'embed/$2');
    } else {
      // share link
      val = val.replace(/youtu\.be\/(\w+)/, 'www.youtube.com/embed/$1');
    }
  }
  if (autoplay) {
    val += '?autoplay=1';
  }
  console.log('link:', val)
  return val;
}
