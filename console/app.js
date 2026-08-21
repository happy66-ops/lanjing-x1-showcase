const $ = selector => document.querySelector(selector);
function formatDuration(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const rest = value % 60;
  return hours ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
function feedbackLabel(items) {
  if (!Array.isArray(items) || !items.length) return '本次未收到';
  const names = { controller_ack: '控制板 AAA', device_ack: '设备 #OK!', temperature_voltage: '温压回读', position: '位置回读', query_echo: '查询回显', command_echo: '串口回显', unclassified: '其他原始回读' };
  return [...new Set(items.map(item => names[item.type] || '原始回读'))].join('、');
}
function renderState(data, live) {
  const current = String(data?.current_mode || 'STOP');
  const reverse = current.endsWith('_REV');
  const mode = current.replace('_REV', '');
  const timing = data?.control?.timing || {};
  const serial = data?.serial || {};
  const safety = data?.safety || {};
  const camera = data?.camera || {};
  $('#publicRunState').textContent = mode === 'STOP' ? '已停止 / 待机' : `${reverse ? '后退' : '前进'} · ${mode}`;
  $('#publicMode').textContent = mode === 'STOP' ? 'STOP' : mode;
  $('#publicSafety').textContent = safety.source === 'simulation' ? '仿真状态，未读取真机安全' : '等待 STM32 安全回读';
  $('#publicConnection').textContent = live ? '已同步现场状态' : '未连接现场状态';
  $('#stateSource').textContent = live ? '同源只读状态' : '公开演示状态';
  $('#publicService').textContent = live ? '树莓派服务在线' : '公开页未连接树莓派';
  $('#publicLink').textContent = data?.mode === 'simulation' ? '仿真在线（非真机）' : (serial.link_online ? 'STM32 已确认回读' : (serial.opened ? '串口已打开 · 回读未确认' : '串口未打开'));
  $('#publicFeedback').textContent = feedbackLabel(data?.protocol?.last_feedback);
  $('#publicEvent').textContent = data?.last_event || (live ? '暂无最近记录' : '公开演示状态');
  $('#publicAccessTimer').textContent = formatDuration(timing.access_elapsed_seconds);
  $('#publicTotalTimer').textContent = formatDuration(timing.run_elapsed_seconds);
  $('#publicSegmentTimer').textContent = formatDuration(timing.segment_elapsed_seconds);
  $('#publicSegmentLabel').textContent = timing.segment_mode ? `${reverse ? '后退' : '前进'} · ${mode}` : '尚未启动';
  $('#publicTimerState').textContent = timing.timer_active ? '运行中' : '未启用';
  $('#publicCountdown').textContent = timing.timer_active ? formatDuration(timing.timer_remaining_seconds) : '--:--';
  $('#publicCamera').textContent = camera.available ? 'USB 摄像头服务可用' : '摄像头状态待现场同步';
  $('#publicCameraSource').textContent = camera.available ? `${camera.device || '树莓派摄像头'} · 只读状态` : '状态镜像 / 演示画面';
  $('#publicCameraBadge').textContent = camera.available ? '服务可用' : '只读画面';
  $('#publicCameraBadge').className = `badge ${camera.available ? '' : 'neutral'}`;
  document.querySelectorAll('[data-public-mode]').forEach(button => button.classList.toggle('selected', button.dataset.publicMode === mode));
  $('#publicForward').classList.toggle('selected', !reverse);
  $('#publicReverse').classList.toggle('selected', reverse);
  $('#publicPreparedCommand').textContent = `${reverse ? '后退' : '前进'} · ${mode === 'STOP' ? 'STOP' : mode}`;
}
async function refreshState() {
  const endpoint = document.querySelector('meta[name="state-endpoint"]')?.content.trim();
  if (!endpoint) return;
  try {
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) throw new Error('状态接口不可用');
    renderState(await response.json(), true);
  } catch {
    renderState({ current_mode: 'M0', mode: 'simulation', control: { timing: {} }, safety: { source: 'simulation' }, protocol: {}, camera: {} }, false);
  }
}
// 公开页只读：所有工作台按钮均为禁用展示，不注册任何控制请求。
document.querySelectorAll('button[disabled]').forEach(button => button.setAttribute('aria-disabled', 'true'));
renderState({ current_mode: 'M0', mode: 'simulation', control: { timing: {} }, safety: { source: 'simulation' }, protocol: {}, camera: {} }, false);
if (document.querySelector('meta[name="state-endpoint"]')?.content.trim()) {
  refreshState();
  setInterval(refreshState, 3000);
}
