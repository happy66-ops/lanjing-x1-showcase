/* 公网镜像：阻止所有原控制按钮改变状态，保留完整布局供参考。 */
document.addEventListener('click', event => {
  const button = event.target.closest('button, select, input');
  if (!button || button.classList.contains('tab')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const note = document.getElementById('actionNote');
  if (note) note.textContent = '公开只读参考：此页面不连接硬件，也不执行演练操作。';
}, true);
