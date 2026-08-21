const $=s=>document.querySelector(s);const steps=[['投放','从检修口投入，作业时隔离阀保持关闭。'],['视觉检测','视觉画面提供沉积物分布建议；操作员可确认。'],['贴合','三爪支撑贴合管壁，履带保持行进姿态。'],['清洁','前后滚刷按预设动作组扰动并破坏沉积层附着状态。'],['回收','停止清洁并将机器人回收到检修口外。'],['冲排','确认机器人回收后，再恢复通水并完成冲排。']];const scenarios={online:['在线辅助识别','云端分析提供动作组建议，操作员确认后调用预设组。','辅助建议可用','树莓派 → UART → STM32'],offline:['断网人工接管','云端不可用，操作员根据视频画面直接选择预设动作组。','云端不可用','操作员 → UART → STM32'],stop:['安全停机','停止一切动作组演练，等待现场排查与安全复位。','建议被忽略','仅 STOP → STM32']};
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.view).classList.add('active')});
const requestedView=new URLSearchParams(window.location.search).get('view');
if(['mission','boundary','integration'].includes(requestedView)){document.querySelector(`.tab[data-view="${requestedView}"]`)?.click()}
document.querySelectorAll('[data-scenario]').forEach(b=>b.onclick=()=>{let s=scenarios[b.dataset.scenario];$('#scenarioTitle').textContent=s[0];$('#scenarioDesc').textContent=s[1];$('#cloudState').textContent=s[2];$('#pathState').textContent=s[3];document.querySelectorAll('[data-scenario]').forEach(x=>x.classList.toggle('selected',x===b));document.querySelectorAll('[data-mode]').forEach(x=>x.disabled=b.dataset.scenario==='stop'&&x.dataset.mode!=='STOP');if(b.dataset.scenario==='stop')setMode('STOP')});
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{let s=steps[Number(b.dataset.step)];$('#stepName').textContent=s[0];$('#stepDesc').textContent=s[1];$('#cameraStatus').textContent='当前阶段：'+s[0];document.querySelectorAll('[data-step]').forEach(x=>x.classList.toggle('selected',x===b))});
function setMode(m){const labels={M0:'M0 巡检通行：滚刷关闭',M1:'M1 轻污：低速清洁',M2:'M2 中污：标准清洁',M3:'M3 重污：强化清洁',STOP:'STOP：安全停止'};$('#actionNote').textContent='演示状态：'+labels[m]+'。未向硬件发送命令。';document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('selected',x.dataset.mode===m))}document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
document.querySelectorAll('.checks input').forEach(x=>x.onchange=()=>{$('#gateState').textContent=[...document.querySelectorAll('.checks input')].every(c=>c.checked)?'可提交现场单位评估':'封闭模拟验证准备'});
const actuators=[
  {id:'000',type:'舵机',name:'整体摆动数字舵机',detail:'整体摆动/复位',options:['保持位','摆动作业位']},
  {id:'001',type:'电机',name:'前置滚刷电机',detail:'前滚刷自转',options:['低档','中档','高档']},
  {id:'002',type:'电机',name:'后置滚刷左电机',detail:'后左滚刷自转',options:['低档','中档','高档'],pending:true},
  {id:'003',type:'电机',name:'后置滚刷右电机',detail:'后右滚刷自转',options:['低档','中档','高档'],pending:true},
  {id:'004',type:'舵机',name:'左摆动舵机',detail:'左侧摆动',options:['中心位','外摆位'],pending:true},
  {id:'005',type:'舵机',name:'右摆动舵机',detail:'右侧摆动',options:['中心位','外摆位'],pending:true},
  {id:'006',type:'电机',name:'左履带电机',detail:'左侧履带驱动',options:['慢速','标准','快速'],pending:true},
  {id:'007',type:'电机',name:'右履带电机',detail:'右侧履带驱动',options:['慢速','标准','快速'],pending:true}
];
const grid=$('#actuatorGrid');grid.innerHTML=actuators.map(a=>`<article class="actuator"><div class="actuator-head"><b>${a.id}</b><span class="tag ${a.type==='舵机'?'servo':'motor'}">${a.type}</span>${a.pending?'<i>左右待确认</i>':''}</div><h3>${a.name}</h3><p>${a.detail}</p><label>预设参数<select data-select="${a.id}">${a.options.map(x=>`<option>${x}</option>`).join('')}</select></label><div class="single-actions"><button data-single="${a.id}" data-action="run">${a.type==='舵机'?'执行位置':'启动'}</button><button data-single="${a.id}" data-action="stop" class="minor">单机停止</button><button data-single="${a.id}" data-action="reset" class="minor">复位</button></div><small id="single-${a.id}">待操作</small></article>`).join('');
$('#openMaintenance').onclick=()=>{const panel=$('#maintenancePanel');panel.hidden=!panel.hidden;$('#openMaintenance').textContent=panel.hidden?'打开维护面板 ↓':'收起维护面板 ↑'};
document.querySelectorAll('[data-single]').forEach(b=>b.onclick=()=>{const id=b.dataset.single;const choice=$(`[data-select="${id}"]`).value;const message=b.dataset.action==='run'?`演练执行：${choice}`:b.dataset.action==='stop'?'演练单机停止':'演练复位/停止';$(`#single-${id}`).textContent=message+'。未发送硬件命令。'});
