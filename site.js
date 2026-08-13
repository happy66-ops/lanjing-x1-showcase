const root = document.getElementById('siteShell');
const views = document.querySelectorAll('.mode-view');
const buttons = document.querySelectorAll('.mode');
function changeMode(name) {
  views.forEach(view => view.classList.toggle('active', view.id === name));
  buttons.forEach(button => button.classList.toggle('active', button.dataset.mode === name));
  root.dataset.mode = name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
buttons.forEach(button => button.addEventListener('click', () => changeMode(button.dataset.mode)));
document.querySelector('[data-open-console]').addEventListener('click', () => changeMode('console'));
document.querySelector('[data-open-showcase]').addEventListener('click', () => changeMode('showcase'));
