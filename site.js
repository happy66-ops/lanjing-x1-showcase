const root = document.getElementById('siteShell');
const views = document.querySelectorAll('.mode-view');
const buttons = document.querySelectorAll('.mode');
function changeMode(name) {
  views.forEach(view => view.classList.toggle('active', view.id === name));
  buttons.forEach(button => button.classList.toggle('active', button.dataset.mode === name));
  root.dataset.mode = name;
  // 模式切换后强制回到页面顶部，避免只读台的顶栏被外层滚动位置截掉。
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}
buttons.forEach(button => button.addEventListener('click', () => changeMode(button.dataset.mode)));
document.querySelector('[data-open-console]').addEventListener('click', () => changeMode('console'));
document.querySelector('[data-open-showcase]')?.addEventListener('click', () => changeMode('showcase'));

const consoleFrame = document.getElementById('consoleFrame');
document.querySelectorAll('[data-open-integration]').forEach(button => button.addEventListener('click', () => {
  changeMode('console');
  consoleFrame.src = 'console/?view=integration';
}));
document.querySelectorAll('[data-console-view]').forEach(button => {
  button.addEventListener('click', () => {
    consoleFrame.src = `console/?view=${encodeURIComponent(button.dataset.consoleView)}`;
  });
});
document.querySelector('[data-console-top]').addEventListener('click', () => {
  consoleFrame.src = 'console/?view=mission';
});
