export function scrollToWorldTop() {
  // 'instant'：不跟随 html 上的 scroll-behavior: smooth，换季时直接停在新页面顶部，
  // 不会出现从上一页底部一路滚上来、像重新加载一样的过程。
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}
