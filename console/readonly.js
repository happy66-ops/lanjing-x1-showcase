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

window.addEventListener('message', event => {
  if (event.origin !== window.location.origin || !event.data) return;
  if (event.data.type === 'lanjing-readonly-top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  if (event.data.type === 'lanjing-readonly-view') {
    const tab = document.querySelector(`.tab[data-view="${event.data.view}"]`);
    tab?.click();
    document.getElementById(event.data.view)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

const requestedView = new URLSearchParams(window.location.search).get('view');
if (requestedView && ['mission', 'boundary', 'integration'].includes(requestedView)) {
  document.querySelectorAll('.tab,.view').forEach(element => element.classList.remove('active'));
  document.querySelector(`.tab[data-view="${requestedView}"]`)?.classList.add('active');
  document.getElementById(requestedView)?.classList.add('active');
}
