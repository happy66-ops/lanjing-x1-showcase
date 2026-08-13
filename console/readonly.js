/* 公网镜像：允许浏览、页签切换和维护面板展开；阻止任何改变状态、保存或导出的动作。 */
const blockedSelectors = [
  '[data-mode]',
  '[data-scenario]',
  '[data-step]',
  '[data-single]',
  '#dryRunCommand',
  '#runSelfCheck',
  '#applyStream',
  '#disconnectStream',
  '#saveConfig',
  '#exportCsv',
  '#exportJson',
  '#clearEventLog'
];

function readonlyNotice() {
  const note = document.getElementById('actionNote');
  if (note) {
    note.textContent = '公开只读参考：可切换页签、展开面板和查看参数；不连接硬件，也不执行、保存或导出演练操作。';
  }
}

document.addEventListener('click', event => {
  const target = event.target.closest(blockedSelectors.join(','));
  if (!target) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  readonlyNotice();
}, true);

document.addEventListener('change', event => {
  const target = event.target.closest('select, input');
  if (!target) return;
  event.preventDefault();
  readonlyNotice();
}, true);

document.addEventListener('submit', event => {
  event.preventDefault();
  readonlyNotice();
}, true);
