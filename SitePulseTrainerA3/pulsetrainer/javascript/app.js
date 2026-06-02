// ══════════ STATE ══════════
let currentRole = 'aluno';
let currentPage = 'dashboard';
let timerRunning = false;
let timerInterval = null;
let timerSeconds = 0;

// ══════════ MENUS ══════════
const alunoMenu = [
  { id:'dashboard',   icon:'🏠', label:'Dashboard' },
  { id:'treino',      icon:'💪', label:'Meu Treino' },
  { id:'evolucao',    icon:'📈', label:'Evolução' },
  { id:'fotos',       icon:'📸', label:'Fotos' },
  { id:'metas',       icon:'🎯', label:'Metas' },
  { id:'feedbacks',   icon:'💬', label:'Feedbacks', badge:3 },
  { id:'nutricao',    icon:'🥗', label:'Nutrição' },
  { id:'desafios',    icon:'⚔️', label:'Desafios' },
  { id:'ranking',     icon:'🏆', label:'Ranking' },
  { id:'conquistas',  icon:'🏅', label:'Conquistas' },
  { id:'perfil',      icon:'👤', label:'Perfil' },
];

const adminMenu = [
  { id:'adm-dashboard',   icon:'📊', label:'Dashboard' },
  { id:'adm-alunos',      icon:'👥', label:'Alunos' },
  { id:'adm-treinos',     icon:'🏋️', label:'Treinos' },
  { id:'adm-evolucao',    icon:'📈', label:'Evolução' },
  { id:'adm-feedbacks',   icon:'💬', label:'Feedbacks' },
  { id:'adm-nutricao',    icon:'🥗', label:'Nutrição' },
  { id:'adm-metas',       icon:'🎯', label:'Metas' },
  { id:'adm-desafios',    icon:'⚔️', label:'Desafios' },
  { id:'adm-ranking',     icon:'🏆', label:'Ranking' },
  { id:'adm-gamificacao', icon:'🎮', label:'Gamificação' },
  { id:'adm-config',      icon:'⚙️', label:'Configurações' },
];

// ══════════ ROLE PILLS ══════════
function setRole(role, el) {
  currentRole = role;
  document.querySelectorAll('.role-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

// ══════════ LOGIN ══════════
function doLogin() {
  const cpf  = document.getElementById('cpfInput').value.trim();
  const pass = document.getElementById('passInput').value.trim();
  if (!cpf || !pass) {
    alert('Preencha CPF e senha para entrar.');
    return;
  }
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appLayout').classList.remove('hidden');
  buildSidebar();
  if (currentRole === 'aluno') {
    showPage('dashboard');
    document.getElementById('userNameSidebar').textContent = 'Marco Alves';
    document.getElementById('userRoleSidebar').textContent = 'Aluno · Ouro';
    document.getElementById('userAvatarSidebar').textContent = 'MA';
  } else {
    showPage('adm-dashboard');
    document.getElementById('userNameSidebar').textContent = 'Prof. Carlos Silva';
    document.getElementById('userRoleSidebar').textContent = 'Personal Trainer';
    document.getElementById('userAvatarSidebar').textContent = 'CS';
    document.getElementById('userAvatarSidebar').style.background = 'linear-gradient(135deg,#F59E0B,#22C55E)';
  }
}

function doLogout() {
  document.getElementById('appLayout').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('cpfInput').value = '';
  document.getElementById('passInput').value = '';
  stopTimer();
}

// ══════════ SIDEBAR ══════════
function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  const menu = currentRole === 'aluno' ? alunoMenu : adminMenu;
  nav.innerHTML = menu.map(item => `
    <div class="nav-item" id="nav-${item.id}" onclick="showPage('${item.id}')">
      <span class="nav-item-icon">${item.icon}</span>
      <span>${item.label}</span>
      ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
    </div>
  `).join('');
}

// ══════════ PAGE NAV ══════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) pg.classList.add('active');
  const ni = document.getElementById('nav-' + id);
  if (ni) ni.classList.add('active');
  currentPage = id;
  document.getElementById('mainContent').scrollTop = 0;
}

// ══════════ WORKOUT TOGGLE ══════════
function toggleWorkout(header) {
  const list = header.nextElementSibling;
  const arrow = header.querySelector('.workout-expand');
  const isOpen = list.style.display !== 'none';
  list.style.display = isOpen ? 'none' : 'block';
  arrow.classList.toggle('open', !isOpen);
}

function toggleExercise(el) {
  el.classList.toggle('checked');
  if (el.classList.contains('checked')) el.textContent = '✓';
  else el.textContent = '';
}

function finishWorkout() {
  stopTimer();
  const xpEl = document.querySelector('#page-dashboard .stat-value');
  alert('🎉 Treino A concluído!\n+100 XP ganhos!\n🔥 Streak: 13 dias!');
}

// ══════════ TIMER ══════════
function toggleTimer() {
  if (timerRunning) { stopTimer(); }
  else { startTimer(); }
}

function startTimer() {
  timerRunning = true;
  document.getElementById('timerBtn').textContent = '⏸ Pausar';
  timerInterval = setInterval(() => {
    timerSeconds++;
    const m = String(Math.floor(timerSeconds/60)).padStart(2,'0');
    const s = String(timerSeconds%60).padStart(2,'0');
    document.getElementById('timerDisplay').textContent = m+':'+s;
  }, 1000);
}

function stopTimer() {
  timerRunning = false;
  const btn = document.getElementById('timerBtn');
  if (btn) btn.textContent = '▶ Iniciar';
  clearInterval(timerInterval);
}

// Allow pressing Enter on login
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('passInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });
  document.getElementById('cpfInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('passInput').focus();
  });
});
