/* 接入前演练逻辑：不访问串口，不产生伪造硬件回读。 */
(() => {
  const get = id => document.getElementById(id);
  const log = get('eventLog');
  const events = [];
  const now = () => new Date().toLocaleTimeString('zh-CN', { hour12: false });

  function addEvent(title, detail) {
    if (!log) return;
    events.unshift({ time: new Date().toISOString(), title, detail, source: 'browser-dry-run' });
    const empty = log.querySelector('p');
    if (empty) empty.remove();
    const row = document.createElement('div');
    row.className = 'log-row';
    row.innerHTML = `<time>${now()}</time><b>${title}</b><span>${detail}</span>`;
    log.prepend(row);
  }

  // 供原有任务演示面板复用：仅追加浏览器演练日志，不改变既有控制逻辑。
  window.lanjingRecordEvent = addEvent;

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.step !== undefined) {
      addEvent('作业阶段演练', button.textContent.trim());
    } else if (button.dataset.scenario !== undefined) {
      addEvent('切换控制场景', button.textContent.trim());
    } else if (button.dataset.mode !== undefined) {
      addEvent('动作组演练', button.dataset.mode);
    } else if (button.dataset.single !== undefined) {
      addEvent('单机维护演练', `${button.dataset.single}：${button.textContent.trim()}（未发送硬件命令）`);
    }
  });

  get('dryRunCommand')?.addEventListener('click', () => {
    get('gatewayState').textContent = '网关：已记录 STOP（未发送）';
    get('safetyState').textContent = 'STOP · 演练状态';
    get('controlSource').textContent = '现场人工演练';
    addEvent('DRY-RUN STOP', '只写入浏览器演练记录；未打开串口，未发送 STM32 帧。');
  });

  get('runSelfCheck')?.addEventListener('click', () => {
    document.querySelectorAll('[data-selfcheck]').forEach(item => {
      if (item.dataset.selfcheck === 'config' || item.dataset.selfcheck === 'service') item.checked = true;
    });
    get('selfCheckResult').textContent = '模拟自检：配置与网关入口已就绪；UART 与摄像头必须在树莓派实体上识别，当前不作通过判断。';
    addEvent('模拟自检', '未探测任何真实 UART、摄像头或 STM32 状态。');
  });

  get('clearEventLog')?.addEventListener('click', () => {
    events.length = 0;
    log.innerHTML = '<p>暂无记录。现场接入后可扩展 TX/RX、回读状态和视频时间戳。</p>';
  });

  function resetVideo() {
    get('videoFrame').innerHTML = '<div><strong>等待真实视频源</strong><span>支持现场填入 HTTP/HTTPS MJPEG 图像流地址</span></div>';
    get('videoState').textContent = '未接入';
    get('metricVideo').textContent = '待接入';
    get('metricVideo').className = 'pending';
  }

  get('applyStream')?.addEventListener('click', () => {
    const url = get('streamUrl').value.trim();
    if (!/^https?:\/\//i.test(url)) {
      get('videoState').textContent = '地址待确认';
      addEvent('视频源未接入', '未填写有效 HTTP/HTTPS 地址，未加载任何视频。');
      return;
    }
    get('videoFrame').innerHTML = '';
    const image = document.createElement('img');
    image.alt = '现场视频流';
    image.src = url;
    image.onload = () => {
      get('videoState').textContent = '已加载地址';
      get('metricVideo').textContent = '已加载地址，待现场确认';
      get('metricVideo').className = 'pending';
      addEvent('视频源地址已加载', '浏览器已加载配置地址；不代表已确认 X1 摄像头。');
    };
    image.onerror = () => {
      get('videoState').textContent = '连接失败';
      get('metricVideo').textContent = '地址不可用';
      get('metricVideo').className = 'pending';
      addEvent('视频源连接失败', '浏览器无法加载该地址，未影响控制演练。');
    };
    get('videoFrame').append(image);
  });

  get('disconnectStream')?.addEventListener('click', () => {
    get('streamUrl').value = '';
    resetVideo();
    addEvent('视频源已断开', '已回到未接入状态。');
  });

  const configFields = ['cfgUart', 'cfgSerial', 'cfgCamera', 'cfgFrames'];
  const saved = JSON.parse(localStorage.getItem('lanjing-x1-integration-config') || '{}');
  configFields.forEach(id => { if (saved[id]) get(id).value = saved[id]; });
  get('saveConfig')?.addEventListener('click', () => {
    const data = Object.fromEntries(configFields.map(id => [id, get(id).value.trim()]));
    localStorage.setItem('lanjing-x1-integration-config', JSON.stringify(data));
    get('configResult').textContent = '已保存到当前浏览器。待实体到手后请以真实识别结果覆盖；未向树莓派、STM32 或串口写入任何内容。';
    addEvent('保存演练配置', '本地浏览器保存待确认字段；未写入硬件。');
  });

  function download(name, type, content) {
    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  get('exportJson')?.addEventListener('click', () => {
    download('lanjing-x1-hmi-dry-run.json', 'application/json;charset=utf-8', JSON.stringify(events, null, 2));
  });
  get('exportCsv')?.addEventListener('click', () => {
    const quote = value => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [['time', 'title', 'detail', 'source'], ...events.map(item => [item.time, item.title, item.detail, item.source])];
    download('lanjing-x1-hmi-dry-run.csv', 'text/csv;charset=utf-8', '\ufeff' + rows.map(row => row.map(quote).join(',')).join('\n'));
  });
})();
