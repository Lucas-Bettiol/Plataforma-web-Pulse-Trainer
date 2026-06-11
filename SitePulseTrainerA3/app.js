// ══════════ STATE ══════════
let currentRole = 'aluno';
let currentPage = 'dashboard';
let currentUser = null;
let timerRunning = false;
let timerInterval = null;
let timerSeconds = 0;

const COLOR_MAP = { green: 'var(--green)', blue: 'var(--blue)', gold: 'var(--gold)', diamond: 'var(--diamond)' };

const alunoMenu = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'treino', icon: '💪', label: 'Meu Treino' },
  { id: 'evolucao', icon: '📈', label: 'Evolução' },
  { id: 'fotos', icon: '📸', label: 'Fotos' },
  { id: 'metas', icon: '🎯', label: 'Metas' },
  { id: 'feedbacks', icon: '💬', label: 'Feedbacks' },
  { id: 'nutricao', icon: '🥗', label: 'Nutrição' },
  { id: 'desafios', icon: '⚔️', label: 'Desafios' },
  { id: 'ranking', icon: '🏆', label: 'Ranking' },
  { id: 'conquistas', icon: '🏅', label: 'Conquistas' },
  { id: 'perfil', icon: '👤', label: 'Perfil' },
];

const adminMenu = [
  { id: 'adm-dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'adm-alunos', icon: '👥', label: 'Alunos' },
  { id: 'adm-treinos', icon: '🏋️', label: 'Treinos' },
  { id: 'adm-evolucao', icon: '📈', label: 'Evolução' },
  { id: 'adm-feedbacks', icon: '💬', label: 'Feedbacks' },
  { id: 'adm-nutricao', icon: '🥗', label: 'Nutrição' },
  { id: 'adm-metas', icon: '🎯', label: 'Metas' },
  { id: 'adm-desafios', icon: '⚔️', label: 'Desafios' },
  { id: 'adm-ranking', icon: '🏆', label: 'Ranking' },
  { id: 'adm-gamificacao', icon: '🎮', label: 'Gamificação' },
  { id: 'adm-config', icon: '⚙️', label: 'Configurações' },
];

const BADGE_DEFS = [
  { id: 'primeiro-treino', icon: '🏋️', name: 'Primeiro Treino', desc: 'Bem-vindo!' },
  { id: '7-dias', icon: '🔥', name: '7 Dias', desc: 'Seguidos!' },
  { id: '50-treinos', icon: '🎯', name: '50 Treinos', desc: 'Metade do caminho' },
  { id: 'menos-10kg', icon: '⚖️', name: '-10kg', desc: 'Transformação real' },
  { id: 'top-3', icon: '🥉', name: 'Top 3', desc: 'No Ranking!' },
  { id: '100-treinos', icon: '💯', name: '100 Treinos', desc: 'Lendário' },
  { id: '30-dias', icon: '🔥', name: '30 Dias', desc: 'Seguidos' },
  { id: 'top-1', icon: '🥇', name: 'Top 1', desc: 'Campeão!' },
  { id: 'diamond-level', icon: '💎', name: 'Diamond', desc: 'Nível máximo' },
];

// ══════════ INIT ══════════
document.addEventListener('DOMContentLoaded', () => {
  UI.init();
  UI.applyTheme(Storage.getTheme());
  bindLoginEvents();
  bindMobileMenu();
  restoreSession();
});

function bindLoginEvents() {
  const cpfInput = document.getElementById('cpfInput');
  const passInput = document.getElementById('passInput');
  if (cpfInput) {
    cpfInput.addEventListener('input', () => UI.maskCpf(cpfInput));
    cpfInput.addEventListener('keydown', e => { if (e.key === 'Enter') passInput?.focus(); });
  }
  if (passInput) passInput.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

  const createLink = document.getElementById('createAccountLink');
  if (createLink) createLink.addEventListener('click', () => { window.location.href = 'cadastro.html'; });
}

function bindMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.getElementById('sidebar');
  const close = () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
    toggle?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Abrir menu');
  };
  toggle?.addEventListener('click', () => {
    const isOpen = sidebar?.classList.toggle('open');
    overlay?.classList.toggle('open');
    toggle?.classList.toggle('open', isOpen);
    toggle?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggle?.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });
  overlay?.addEventListener('click', close);
  document.getElementById('sidebarNav')?.addEventListener('click', e => {
    if (e.target.closest('.nav-item')) close();
  });
}

function restoreSession() {
  const session = Storage.getSession();
  if (!session?.userId) return;
  const user = Storage.getUserById(session.userId);
  if (!user) { Storage.clearSession(); return; }
  currentUser = user;
  currentRole = session.role;
  enterApp();
}

// ══════════ ROLE ══════════
function setRole(role, el) {
  currentRole = role;
  document.querySelectorAll('.role-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

// ══════════ LOGIN / LOGOUT ══════════
async function doLogin() {
  const cpfInput = document.getElementById('cpfInput');
  const passInput = document.getElementById('passInput');
  const btn = document.querySelector('#loginScreen .btn-primary');
  const cpf = cpfInput.value.trim();
  const pass = passInput.value.trim();

  UI.clearFieldError(cpfInput);
  UI.clearFieldError(passInput);

  if (!cpf) { UI.setFieldError(cpfInput, 'Informe seu CPF.'); return; }
  if (!UI.validateCpf(cpf)) { UI.setFieldError(cpfInput, 'CPF inválido.'); return; }
  if (!pass) { UI.setFieldError(passInput, 'Informe sua senha.'); return; }
  if (pass.length < 6) { UI.setFieldError(passInput, 'Senha deve ter no mínimo 6 caracteres.'); return; }

  UI.setLoading(btn, true);
  await delay(600);

  const result = Storage.authenticate(cpf, pass, currentRole);
  UI.setLoading(btn, false);

  if (!result.ok) {
    UI.error(result.error);
    return;
  }

  currentUser = result.user;
  Storage.setSession(currentUser.id, currentRole);
  UI.success('Bem-vindo, ' + currentUser.name.split(' ')[0] + '!');
  enterApp();
}

function enterApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appLayout').classList.remove('hidden');
  buildSidebar();
  updateSidebarUser();
  const page = currentRole === 'aluno' ? 'dashboard' : 'adm-dashboard';
  showPage(page);
}

async function doLogout() {
  const ok = await UI.confirm('Deseja realmente sair da sua conta?');
  if (!ok) return;
  Storage.clearSession();
  currentUser = null;
  stopTimer();
  document.getElementById('appLayout').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('cpfInput').value = '';
  document.getElementById('passInput').value = '';
  UI.info('Você saiu com segurança.');
}

function updateSidebarUser() {
  if (!currentUser) return;
  const initials = Storage.getInitials(currentUser.name);
  document.getElementById('userNameSidebar').textContent = currentUser.name;
  document.getElementById('userAvatarSidebar').textContent = initials;
  const level = Storage.getLevel(currentUser.xp || 0);
  if (currentRole === 'aluno') {
    document.getElementById('userRoleSidebar').textContent = 'Aluno · ' + level.name;
    const topbarAvatar = document.getElementById('topbarAvatarAluno');
    if (topbarAvatar) topbarAvatar.textContent = initials;
  } else {
    document.getElementById('userRoleSidebar').textContent = 'Personal Trainer';
    document.getElementById('userAvatarSidebar').style.background = 'linear-gradient(135deg,#F59E0B,#22C55E)';
    const topbarAvatarAdmin = document.getElementById('topbarAvatarAdmin');
    if (topbarAvatarAdmin) topbarAvatarAdmin.textContent = initials;
  }
  const mobileTitle = document.getElementById('mobilePageTitle');
  if (mobileTitle) mobileTitle.textContent = 'PULSETRAINER';
  updateNotifBadge();
}

// ══════════ SIDEBAR ══════════
function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  const menu = currentRole === 'aluno' ? alunoMenu : adminMenu;
  let badgeCount = 0;
  if (currentRole === 'aluno' && currentUser) {
    badgeCount = Storage.getUnreadNotifCount(currentUser.id);
  }
  nav.innerHTML = menu.map(item => {
    let badge = item.badge;
    if (item.id === 'feedbacks' && badgeCount) badge = badgeCount;
    return `<div class="nav-item" id="nav-${item.id}" onclick="showPage('${item.id}')" role="button" tabindex="0">
      <span class="nav-item-icon">${item.icon}</span>
      <span>${item.label}</span>
      ${badge ? `<span class="nav-badge">${badge}</span>` : ''}
    </div>`;
  }).join('');
}

// ══════════ PAGE NAV ══════════
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) {
    pg.classList.add('active');
    UI.showPageSpinner(pg);
    setTimeout(() => {
      renderPage(id);
      UI.hidePageSpinner(pg);
    }, 200);
  }
  const ni = document.getElementById('nav-' + id);
  if (ni) ni.classList.add('active');
  currentPage = id;
  document.getElementById('mainContent').scrollTop = 0;
}

function renderPage(id) {
  const renderers = {
    dashboard: renderAlunoDashboard,
    treino: renderTreino,
    evolucao: renderEvolucao,
    fotos: renderFotos,
    metas: renderMetas,
    feedbacks: renderFeedbacks,
    nutricao: renderNutricao,
    desafios: renderDesafios,
    ranking: renderRanking,
    conquistas: renderConquistas,
    perfil: renderPerfil,
    'adm-dashboard': renderAdminDashboard,
    'adm-alunos': renderAdminAlunos,
    'adm-treinos': renderAdminTreinos,
    'adm-feedbacks': renderAdminFeedbacks,
    'adm-nutricao': renderAdminNutricao,
    'adm-metas': renderAdminMetas,
    'adm-desafios': renderAdminDesafios,
    'adm-ranking': renderAdminRanking,
    'adm-gamificacao': renderAdminGamificacao,
    'adm-evolucao': renderAdminEvolucao,
    'adm-config': renderAdminConfig,
  };
  renderers[id]?.();
}

// ══════════ ALUNO RENDERS ══════════
function renderAlunoDashboard() {
  const u = currentUser;
  if (!u) return;
  const level = Storage.getLevel(u.xp || 0);
  const next = Storage.getNextLevel(u.xp || 0);
  const xpPct = next ? ((u.xp - level.min) / (next.min - level.min)) * 100 : 100;
  const ranking = Storage.getRanking();
  const rankPos = ranking.findIndex(r => r.id === u.id) + 1;
  const weekPct = u.weeklyGoal ? (u.weeklyWorkouts / u.weeklyGoal) * 100 : 0;

  const pg = document.getElementById('page-dashboard');
  pg.querySelector('.topbar h1').textContent = u.name.toUpperCase() + ' 👋';
  pg.querySelector('.topbar h2').textContent = getGreeting() + ',';

  const cards = pg.querySelectorAll('.stat-card');
  cards[0].querySelector('.stat-value').textContent = (u.xp || 0).toLocaleString('pt-BR');
  cards[1].querySelector('.stat-value').textContent = level.name;
  cards[1].querySelector('.stat-change').textContent = next ? (next.min - u.xp) + 'xp para ' + next.name : 'Nível máximo!';
  cards[2].querySelector('.stat-value').textContent = u.streak || 0;
  cards[3].querySelector('.stat-value').textContent = rankPos ? '#' + rankPos : '—';

  const levelBadge = pg.querySelector('.level-badge');
  levelBadge.textContent = level.name.toUpperCase();
  levelBadge.className = 'level-badge ' + level.id;
  pg.querySelector('.level-name').textContent = 'Nível ' + level.name;
  pg.querySelector('.level-xp').textContent = (u.xp || 0).toLocaleString('pt-BR') + ' / ' + (next?.min || u.xp).toLocaleString('pt-BR') + ' XP';
  pg.querySelector('.level-info .progress-fill').style.width = Math.min(xpPct, 100) + '%';

  const weekMeta = pg.querySelector('.section-card .progress-bar + .progress-bar, .section-card [style*="Meta da semana"]');
  const weekRow = pg.querySelector('.section-card');
  const spans = weekRow?.querySelectorAll('span');
  if (spans?.length >= 2) {
    const metaSpan = [...weekRow.querySelectorAll('span')].find(s => s.textContent.includes('/'));
    if (metaSpan) metaSpan.textContent = (u.weeklyWorkouts || 0) + '/' + (u.weeklyGoal || 20) + ' treinos';
    const bars = weekRow.querySelectorAll('.progress-bar .progress-fill');
    if (bars[1]) bars[1].style.width = Math.min(weekPct, 100) + '%';
  }

  const streakNum = pg.querySelector('.section-card h3 + div[style*="font-size:52px"]');
  if (streakNum) streakNum.textContent = (u.streak || 0) + '🔥';

  renderFrequencyChart(pg, u.frequencyWeeks || []);
}

function renderTreino() {
  const workouts = Storage.get().workouts;
  const container = document.getElementById('workoutList');
  container.innerHTML = workouts.map(w => {
    const color = COLOR_MAP[w.color] || 'var(--green)';
    const exercises = (w.exercises || []).map(ex => {
      const checked = Storage.isExerciseChecked(currentUser.id, w.id, ex.id);
      return `<div class="exercise-item">
        <div class="ex-checkbox ${checked ? 'checked' : ''}" onclick="toggleExercise(this,'${w.id}','${ex.id}')" role="checkbox" aria-checked="${checked}">${checked ? '✓' : ''}</div>
        <div class="ex-info">
          <div class="ex-name">${ex.name}</div>
          <div class="ex-detail">Descanso: ${ex.rest}s${ex.note ? ' · Obs: ' + ex.note : ''}</div>
        </div>
        <div class="ex-sets">${ex.sets}</div>
      </div>`;
    }).join('');
    const completed = currentUser.workoutProgress?.[w.id]?.completed;
    return `<div class="workout-block">
      <div class="workout-header" onclick="toggleWorkout(this)" role="button" tabindex="0">
        <div class="workout-color-dot" style="background:${color}"></div>
        <div class="workout-title">${w.name}</div>
        <div class="workout-meta">${(w.exercises||[]).length} exercícios · ${w.day || '—'}</div>
        <div class="workout-expand">▼</div>
      </div>
      <div class="exercise-list" style="display:none">
        ${exercises}
        <div style="margin-top:14px;">
          <button class="btn btn-primary" style="width:100%;" onclick="finishWorkout('${w.id}','${w.name}')" ${completed ? 'disabled' : ''}>
            ${completed ? '✅ Treino Concluído' : '✅ Concluir ' + w.name.split('—')[0].trim() + ' — +100 XP'}
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderEvolucao() {
  const u = currentUser;
  const bmi = u.height && u.weight ? (u.weight / ((u.height / 100) ** 2)).toFixed(1) : '—';
  const lost = u.initialWeight && u.weight ? (u.initialWeight - u.weight).toFixed(1) : 0;
  const pg = document.getElementById('page-evolucao');
  const stats = pg.querySelectorAll('.evo-stat-value');
  if (stats[0]) stats[0].innerHTML = (u.weight || 0) + '<span style="font-size:16px">kg</span>';
  if (stats[1]) stats[1].innerHTML = (u.initialWeight || 0) + '<span style="font-size:16px">kg</span>';
  if (stats[2]) stats[2].textContent = bmi;
  if (stats[3]) stats[3].innerHTML = (u.bodyFat || 0) + '<span style="font-size:16px">%</span>';
  if (stats[4]) stats[4].innerHTML = (u.muscleMass || 0) + '<span style="font-size:16px">kg</span>';
  if (stats[5]) stats[5].innerHTML = (lost > 0 ? '-' : '+') + Math.abs(lost) + '<span style="font-size:16px">kg</span>';

  const hist = u.evolutionHistory || [];
  const chart = pg.querySelector('.mini-chart');
  if (chart && hist.length) {
    const maxW = Math.max(...hist.map(h => h.weight));
    chart.innerHTML = hist.map(h => {
      const pct = (h.weight / maxW) * 100;
      return `<div class="chart-bar" style="height:${pct}%" data-val="${h.weight}kg"></div>`;
    }).join('');
    const labels = pg.querySelector('.chart-labels');
    if (labels) labels.innerHTML = hist.map(h => `<div class="chart-label">${h.month}</div>`).join('');
  }

  const btn = pg.querySelector('.btn-primary');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.onclick = () => openEvolutionModal();
  }
}

function renderFotos() {
  const u = currentUser;
  const pg = document.getElementById('page-fotos');
  const grid = pg.querySelector('.photo-grid');
  if (!grid) return;
  const photos = u.photos || [];
  grid.innerHTML = photos.map(p => `
    <div class="photo-item">
      <div class="photo-placeholder">${p.emoji || '📷'}</div>
      <div class="photo-date">${p.date}</div>
      <div class="photo-label">${p.label}</div>
    </div>`).join('') + `
    <div class="photo-item photo-upload-btn" onclick="addPhoto()" role="button" tabindex="0">
      <div class="photo-placeholder">+</div>
      <div class="photo-date">Adicionar</div>
    </div>`;

  const addBtn = pg.querySelector('.page-header .btn-primary');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = '1';
    addBtn.onclick = addPhoto;
  }
}

function renderMetas() {
  const goals = currentUser.goals || [];
  const pg = document.getElementById('page-metas');
  const container = pg.querySelector('.section-card');
  const h3 = container.querySelector('h3');
  container.innerHTML = '';
  container.appendChild(h3);
  goals.forEach(g => {
    const pct = g.target ? Math.min(Math.round((g.current / g.target) * 100), 100) : 0;
    const div = document.createElement('div');
    div.className = 'goal-item';
    div.innerHTML = `
      <div class="goal-header">
        <div class="goal-name">${g.name}</div>
        <div class="goal-pct">${pct}%</div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="goal-sub">${g.current} de ${g.target} ${g.unit || ''}${g.deadline ? ' · Prazo: ' + new Date(g.deadline).toLocaleDateString('pt-BR') : ''}</div>`;
    container.appendChild(div);
  });

  const addBtn = pg.querySelector('.page-header .btn-primary');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = '1';
    addBtn.onclick = openGoalModal;
  }
}

function renderFeedbacks() {
  const msgs = Storage.getFeedbacksForUser(currentUser.id);
  // Mark notifications as read when feedbacks page is opened
  Storage.markNotifsRead(currentUser.id);
  updateNotifBadge();
  // Also update sidebar badge
  const feedbackBadge = document.querySelector('#nav-feedbacks .nav-badge');
  if (feedbackBadge) feedbackBadge.textContent = '';
  const pg = document.getElementById('page-feedbacks');
  const container = pg.querySelector('.section-card');
  const h3 = container.querySelector('h3');
  container.innerHTML = '';
  container.appendChild(h3);
  if (!msgs.length) {
    container.innerHTML += '<p style="color:var(--gray);padding:12px 0;">Nenhum feedback recebido ainda.</p>';
    return;
  }
  msgs.forEach(f => {
    const from = Storage.getUserById(f.fromId);
    const div = document.createElement('div');
    div.className = 'feedback-msg';
    div.innerHTML = `
      <div class="feedback-header">
        <div class="feedback-from">👑 ${from?.name || 'Personal'}</div>
        <div class="feedback-date">${Storage.formatDate(f.date)}</div>
      </div>
      <div class="feedback-text">${f.text}</div>`;
    container.appendChild(div);
  });
}

function renderNutricao() {
  const items = Storage.get().nutrition;
  const pg = document.getElementById('page-nutricao');
  const grid = pg.querySelector('.three-col');
  if (!grid) return;
  grid.innerHTML = items.map(n => `
    <div class="nutrition-card">
      <div class="nutrition-img">${n.emoji}</div>
      <div class="nutrition-body">
        <span class="nutrition-tag ${n.tag}">${n.tag === 'emagrecer' ? 'Emagrecimento' : n.tag.charAt(0).toUpperCase() + n.tag.slice(1)}</span>
        <div class="nutrition-title">${n.title}</div>
        <div class="nutrition-desc">${n.desc}</div>
      </div>
    </div>`).join('');
}

function renderDesafios() {
  const data = Storage.get();
  const joined = currentUser.challengeIds || [];
  const pg = document.getElementById('page-desafios');
  const activeSection = pg.querySelector('.section-card');
  const activeH3 = activeSection.querySelector('h3');
  const activeChallenges = data.challenges.filter(c => joined.includes(c.id) && c.status === 'ativo');
  activeSection.innerHTML = '';
  activeSection.appendChild(activeH3);
  if (activeChallenges.length === 0) {
    activeSection.innerHTML += '<p style="color:var(--gray);padding:12px 0;">Você ainda não está participando de nenhum desafio.</p>';
  }
  activeChallenges.forEach(c => {
    const startFmt = c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '—';
    const endFmt = c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : '—';
    const div = document.createElement('div');
    div.className = 'challenge-card';
    div.innerHTML = `
      <div class="challenge-icon" style="background:rgba(34,197,94,0.15)">${c.icon}</div>
      <div class="challenge-info">
        <div class="challenge-name">${c.name}</div>
        <div class="challenge-desc">${c.desc}</div>
        <div style="font-size:12px;color:var(--gray);margin-bottom:8px;">
          📅 Início: <strong>${startFmt}</strong> &nbsp; ⛔ Término: <strong>${endFmt}</strong>
        </div>
        <div style="margin-bottom:10px;"><div class="progress-bar"><div class="progress-fill" style="width:${c.progress || 0}%"></div></div>
        <div style="font-size:11px;color:var(--gray);margin-top:4px">${c.current || 0}/${c.target || 0}</div></div>
        <div class="challenge-footer">
          <div class="challenge-days">⏰ ${c.daysLeft || 0} dias restantes</div>
          <div class="challenge-prize">🏆 ${c.prize}</div>
        </div>
      </div>`;
    activeSection.appendChild(div);
  });

  const availSection = pg.querySelectorAll('.section-card')[1];
  if (availSection) {
    const availH3 = availSection.querySelector('h3');
    const available = data.challenges.filter(c => (c.status === 'disponivel' || c.status === 'ativo') && !joined.includes(c.id));
    availSection.innerHTML = '';
    if (availH3) availSection.appendChild(availH3);
    if (available.length === 0) {
      availSection.innerHTML += '<p style="color:var(--gray);padding:12px 0;">Nenhum desafio disponível no momento.</p>';
    }
    available.forEach(c => {
      const startFmt = c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '—';
      const endFmt = c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : '—';
      const div = document.createElement('div');
      div.className = 'challenge-card';
      div.style.opacity = '0.9';
      div.innerHTML = `
        <div class="challenge-icon" style="background:rgba(245,158,11,0.15)">${c.icon}</div>
        <div class="challenge-info">
          <div class="challenge-name">${c.name}</div>
          <div class="challenge-desc">${c.desc}</div>
          <div style="font-size:12px;color:var(--gray);margin-bottom:8px;">
            📅 Início: <strong>${startFmt}</strong> &nbsp; ⛔ Término: <strong>${endFmt}</strong>
          </div>
          <div class="challenge-footer">
            <div class="challenge-days">📅 Início: ${startFmt}</div>
            <button class="btn btn-primary btn-sm" onclick="joinChallenge('${c.id}')">Participar</button>
          </div>
        </div>`;
      availSection.appendChild(div);
    });
  }
}

function renderRanking() {
  const ranking = Storage.getRanking();
  const pg = document.getElementById('page-ranking');
  const list = pg.querySelector('.ranking-list');
  if (!list) return;
  const medals = ['🥇', '🥈', '🥉'];
  list.innerHTML = ranking.slice(0, 10).map((u, i) => {
    const level = Storage.getLevel(u.xp || 0);
    const isMe = u.id === currentUser.id;
    const cls = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
    return `<div class="ranking-item ${cls}" ${isMe ? 'style="border-color:rgba(245,158,11,0.4);background:rgba(245,158,11,0.08)"' : ''}>
      <div class="rank-pos ${i < 3 ? 'p' + (i+1) : 'pn'}">${i < 3 ? medals[i] : i + 1}</div>
      <div class="rank-avatar">${Storage.getInitials(u.name)}</div>
      <div class="rank-info">
        <div class="rank-name">${u.name}${isMe ? ' (Você)' : ''}</div>
        <div class="rank-level"><span class="level-badge ${level.id}" style="width:auto;height:auto;padding:2px 8px;font-size:10px;border-radius:4px;">${level.name.toUpperCase()}</span></div>
      </div>
      <div style="text-align:right"><div class="rank-xp">${(u.xp||0).toLocaleString('pt-BR')}</div><div class="rank-xp-label">XP</div></div>
    </div>`;
  }).join('');
}

function renderConquistas() {
  const earned = currentUser.badges || [];
  const pg = document.getElementById('page-conquistas');
  const grid = pg.querySelector('.badges-grid');
  if (!grid) return;
  grid.innerHTML = BADGE_DEFS.map(b => {
    const has = earned.includes(b.id);
    return `<div class="badge-item ${has ? 'earned' : 'badge-locked'}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
    </div>`;
  }).join('');
}

function renderPerfil() {
  const u = currentUser;
  const level = Storage.getLevel(u.xp || 0);
  const pg = document.getElementById('page-perfil');
  const inputs = pg.querySelectorAll('.page-form-input, .page-form-select');
  const fields = ['name', 'cpf', 'phone', 'email', 'birthDate', 'goal', 'height', 'weight'];
  const mapping = {
    name: 0, cpf: 1, phone: 2, email: 3, birthDate: 4,
    height: pg.querySelector('[label], .section-card:last-child .page-form-input'),
  };

  const nameInput = pg.querySelector('.two-col .section-card:first-child .page-form-group:nth-child(3) input');
  const allInputs = pg.querySelectorAll('.page-form-input');
  if (allInputs[0]) allInputs[0].value = u.name || '';
  if (allInputs[1]) allInputs[1].value = Storage.formatCpf(u.cpf);
  if (allInputs[2]) allInputs[2].value = u.phone || '';
  if (allInputs[3]) allInputs[3].value = u.email || '';
  if (allInputs[4]) allInputs[4].value = u.birthDate || '';
  const selects = pg.querySelectorAll('.page-form-select');
  if (selects[0]) selects[0].value = u.goal || 'Saúde Geral';
  const physInputs = pg.querySelectorAll('.section-card:last-child .page-form-input');
  if (physInputs[0]) physInputs[0].value = u.height || '';
  if (physInputs[1]) physInputs[1].value = u.weight || '';

  const avatar = pg.querySelector('.user-avatar');
  if (avatar) avatar.textContent = Storage.getInitials(u.name);
  const nameDisplay = pg.querySelector('.two-col .section-card:first-child [style*="font-family"]');
  if (nameDisplay) nameDisplay.textContent = u.name;

  const levelBadge = pg.querySelector('.level-badge.gold, .level-badge');
  if (levelBadge) { levelBadge.textContent = 'NÍVEL ' + level.name.toUpperCase(); levelBadge.className = 'level-badge ' + level.id; }

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const isDark = Storage.getTheme() === 'dark';
    themeToggle.classList.toggle('active', isDark);
    themeToggle.setAttribute('aria-checked', isDark);
    if (!themeToggle.dataset.bound) {
      themeToggle.dataset.bound = '1';
      themeToggle.onclick = () => UI.toggleTheme();
    }
  }

  const notifToggle = document.getElementById('notifToggle');
  if (notifToggle) {
    notifToggle.classList.toggle('active', u.notifications !== false);
    if (!notifToggle.dataset.bound) {
      notifToggle.dataset.bound = '1';
      notifToggle.onclick = () => {
        const on = notifToggle.classList.toggle('active');
        Storage.updateUser(u.id, { notifications: on });
        UI.info(on ? 'Notificações ativadas' : 'Notificações desativadas');
      };
    }
  }

  const saveBtn = pg.querySelector('.page-header .btn-primary');
  if (saveBtn && !saveBtn.dataset.bound) {
    saveBtn.dataset.bound = '1';
    saveBtn.onclick = saveProfile;
  }
}

// ══════════ ADMIN RENDERS ══════════
function renderAdminDashboard() {
  const students = Storage.getStudents();
  const active = students.filter(s => s.status !== 'inativo');
  const ranking = Storage.getRanking();
  const pg = document.getElementById('page-adm-dashboard');
  pg.querySelector('h1').textContent = (currentUser.name.startsWith('Prof') ? '' : 'Prof. ') + currentUser.name + ' 👑';

  const cards = pg.querySelectorAll('.stat-card .stat-value');
  if (cards[0]) cards[0].textContent = students.length;
  if (cards[1]) cards[1].textContent = Math.round(active.length * 0.53);
  if (cards[2]) cards[2].textContent = active.length;
  if (cards[3]) cards[3].textContent = Storage.get().challenges.filter(c => c.status === 'ativo').length;

  const rankItems = pg.querySelectorAll('.ranking-item');
  ranking.slice(0, 3).forEach((u, i) => {
    if (!rankItems[i]) return;
    rankItems[i].querySelector('.rank-name').textContent = u.name;
    rankItems[i].querySelector('.rank-xp').textContent = ((u.xp || 0) / 1000).toFixed(1).replace('.0', '') + 'k XP';
    rankItems[i].querySelector('.rank-avatar').textContent = Storage.getInitials(u.name);
  });
}

function renderAdminAlunos(filterName = '', filterStatus = '') {
  const students = Storage.getStudents();
  const pg = document.getElementById('page-adm-alunos');
  pg.querySelector('.page-title p').textContent = students.length + ' alunos cadastrados';

  // Wire up search input
  const searchInput = pg.querySelector('.topbar-search input');
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = '1';
    searchInput.addEventListener('input', () => {
      const statusSel = pg.querySelector('select.page-form-select');
      renderAdminAlunos(searchInput.value, statusSel?.value || '');
    });
  }
  // Wire up status filter
  const statusSelect = pg.querySelector('select.page-form-select');
  if (statusSelect && !statusSelect.dataset.bound) {
    statusSelect.dataset.bound = '1';
    statusSelect.addEventListener('change', () => {
      renderAdminAlunos(searchInput?.value || '', statusSelect.value);
    });
  }

  // Apply filters
  const nameFilter = filterName || searchInput?.value || '';
  const statusFilter = filterStatus || statusSelect?.value || '';
  let filtered = students;
  if (nameFilter) filtered = filtered.filter(u => u.name.toLowerCase().includes(nameFilter.toLowerCase()) || (u.email || '').toLowerCase().includes(nameFilter.toLowerCase()));
  if (statusFilter === 'Ativos') filtered = filtered.filter(u => u.status !== 'inativo');
  else if (statusFilter === 'Inativos') filtered = filtered.filter(u => u.status === 'inativo');

  const tbody = pg.querySelector('tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--gray);padding:20px;">Nenhum aluno encontrado.</td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(u => `
      <tr>
        <td><div style="display:flex;align-items:center;gap:10px;">
          <div class="student-row-avatar">${Storage.getInitials(u.name)}</div>
          <div><div style="font-weight:600;">${u.name}</div><div style="font-size:11px;color:var(--gray)">${u.email || ''}</div></div>
        </div></td>
        <td style="color:var(--gray)">${u.goal || '—'}</td>
        <td>${u.workoutsCompleted || 0}</td>
        <td style="color:var(--green);font-weight:700;font-family:var(--font-display)">${(u.xp||0).toLocaleString('pt-BR')}</td>
        <td><span class="status-pill ${u.status === 'inativo' ? 'status-inactive' : 'status-active'}">${u.status === 'inativo' ? 'Inativo' : 'Ativo'}</span></td>
        <td><div class="action-btns">
          <button class="btn btn-ghost btn-sm" onclick="viewStudent('${u.id}')">👁️ Ver</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent('${u.id}','${u.name.replace(/'/g, "\\'")}')">🗑️</button>
        </div></td>
      </tr>`).join('');
  }

  const addBtn = pg.querySelector('.page-header .btn-primary');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = '1';
    addBtn.onclick = () => { window.location.href = 'cadastro.html'; };
  }
}

function renderAdminTreinos() {
  const workouts = Storage.get().workouts;
  const pg = document.getElementById('page-adm-treinos');
  let listHost = document.getElementById('admWorkoutList');
  if (!listHost) {
    const section = pg.querySelector('.two-col .section-card:first-child');
    listHost = document.createElement('div');
    listHost.id = 'admWorkoutList';
    listHost.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
    const old = section?.querySelector('[style*="flex-direction"]');
    if (old) old.replaceWith(listHost);
    else section?.appendChild(listHost);
  }
  listHost.innerHTML = workouts.map(w => `
    <div class="workout-block" style="margin:0">
      <div class="workout-header" style="justify-content:space-between;cursor:default">
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="workout-color-dot" style="background:${COLOR_MAP[w.color]||'var(--green)'}"></div>
          <div><div class="workout-title" style="font-size:14px;">${w.name}</div>
          <div style="font-size:11px;color:var(--gray)">${w.studentCount||0} alunos · Objetivo: ${w.objective||'—'}</div></div>
        </div>
        <div class="action-btns">
          <button class="btn btn-danger btn-sm" onclick="deleteWorkoutAdmin('${w.id}','${w.name.replace(/'/g,"\\'")}')">🗑️</button>
        </div>
      </div>
    </div>`).join('');

  const saveBtn = pg.querySelector('.two-col .section-card:last-child .btn-primary');
  if (saveBtn && !saveBtn.dataset.bound) {
    saveBtn.dataset.bound = '1';
    saveBtn.onclick = saveNewWorkout;
  }
}

function renderAdminFeedbacks() {
  const students = Storage.getStudents();
  const pg = document.getElementById('page-adm-feedbacks');
  const select = pg.querySelector('.page-form-select');
  if (select) {
    select.innerHTML = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  }
  const sent = Storage.get().feedbacks.filter(f => f.fromId === currentUser.id);
  const sentContainer = pg.querySelectorAll('.section-card')[1];
  if (sentContainer) {
    const h3 = sentContainer.querySelector('h3');
    sentContainer.innerHTML = '';
    sentContainer.appendChild(h3);
    sent.slice(0, 5).forEach(f => {
      const to = Storage.getUserById(f.toId);
      const div = document.createElement('div');
      div.className = 'feedback-msg';
      div.innerHTML = `<div class="feedback-header"><div class="feedback-from" style="color:var(--blue)">→ ${to?.name||'Aluno'}</div><div class="feedback-date">${Storage.formatDate(f.date)}</div></div><div class="feedback-text">${f.text}</div>`;
      sentContainer.appendChild(div);
    });
  }
  const sendBtn = pg.querySelector('.section-card .btn-primary');
  if (sendBtn && !sendBtn.dataset.bound) {
    sendBtn.dataset.bound = '1';
    sendBtn.onclick = sendFeedback;
  }
}

function renderAdminNutricao() {
  const items = Storage.get().nutrition;
  const pg = document.getElementById('page-adm-nutricao');
  let listHost = document.getElementById('admNutritionList');
  const listSection = pg.querySelectorAll('.section-card')[1];
  if (!listHost && listSection) {
    listHost = document.createElement('div');
    listHost.id = 'admNutritionList';
    listHost.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
    const old = listSection.querySelector('[style*="flex-direction"]');
    if (old) old.replaceWith(listHost);
    else listSection.appendChild(listHost);
  }
  if (listHost) {
    listHost.innerHTML = items.map(n => `
      <div class="nutrition-card" style="flex-direction:row;padding:0;overflow:hidden">
        <div class="nutrition-img" style="height:auto;width:60px;min-width:60px;font-size:24px;">${n.emoji}</div>
        <div class="nutrition-body" style="padding:12px;flex:1">
          <span class="nutrition-tag ${n.tag}">${n.tag}</span>
          <div class="nutrition-title" style="font-size:13px;">${n.title}</div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <button class="btn btn-danger btn-sm" onclick="deleteNutritionItem('${n.id}')">🗑️</button>
          </div>
        </div>
      </div>`).join('');
  }
  const pubBtn = pg.querySelector('.section-card .btn-primary');
  if (pubBtn && !pubBtn.dataset.bound) {
    pubBtn.dataset.bound = '1';
    pubBtn.onclick = publishNutrition;
  }
}

function renderAdminMetas() {
  const goals = Storage.get().adminGoals;
  const pg = document.getElementById('page-adm-metas');
  // Populate student select with ALL students dynamically
  const studentSelect = pg.querySelector('.page-form-select');
  if (studentSelect) {
    const students = Storage.getStudents();
    studentSelect.innerHTML = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('') +
      '<option value="all">Todos os alunos</option>';
  }
  const container = pg.querySelectorAll('.section-card')[1];
  if (container) {
    const h3 = container.querySelector('h3');
    container.innerHTML = '';
    container.appendChild(h3);
    goals.forEach(g => {
      const div = document.createElement('div');
      div.className = 'goal-item';
      div.innerHTML = `<div class="goal-header"><div class="goal-name">${g.name}</div><div class="goal-pct">${g.progress}%</div></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${g.progress}%"></div></div>
        ${g.current ? `<div class="goal-sub">${g.current}/${g.target}</div>` : ''}`;
      container.appendChild(div);
    });
  }
  const createBtn = pg.querySelector('.section-card .btn-primary');
  if (createBtn && !createBtn.dataset.bound) {
    createBtn.dataset.bound = '1';
    createBtn.onclick = createAdminGoal;
  }
}

function renderAdminDesafios() {
  const challenges = Storage.get().challenges.filter(c => c.status === 'ativo');
  const pg = document.getElementById('page-adm-desafios');
  const container = pg.querySelectorAll('.section-card')[1];
  if (container) {
    const h3 = container.querySelector('h3');
    container.innerHTML = '';
    container.appendChild(h3);
    if (challenges.length === 0) {
      container.innerHTML += '<p style="color:var(--gray);padding:12px 0;">Nenhum desafio ativo no momento.</p>';
    }
    challenges.forEach(c => {
      const startFmt = c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '—';
      const endFmt = c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : '—';
      const div = document.createElement('div');
      div.className = 'challenge-card';
      div.style.flexDirection = 'column';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div class="challenge-name">${c.icon || '⚔️'} ${c.name}</div>
          <span class="status-pill status-active">Ativo</span>
        </div>
        <div style="font-size:12px;color:var(--gray);margin-top:6px;">
          📅 Início: <strong>${startFmt}</strong> &nbsp; ⛔ Término: <strong>${endFmt}</strong>
        </div>
        ${c.participants !== undefined ? `<div style="font-size:12px;color:var(--gray);margin-top:2px;">👥 ${c.participants} participantes</div>` : ''}
        <div style="display:flex;gap:8px;margin-top:8px;">
          <button class="btn btn-danger btn-sm" onclick="endChallenge('${c.id}')">⛔ Encerrar</button>
        </div>`;
      container.appendChild(div);
    });
  }
  // Also show 'disponivel' challenges
  let availContainer = pg.querySelectorAll('.section-card')[2];
  if (!availContainer) {
    availContainer = document.createElement('div');
    availContainer.className = 'section-card';
    availContainer.innerHTML = '<h3>📋 Desafios Disponíveis</h3>';
    pg.querySelector('.two-col')?.appendChild(availContainer) || pg.appendChild(availContainer);
  } else {
    const h3 = availContainer.querySelector('h3');
    availContainer.innerHTML = '';
    if (h3) availContainer.appendChild(h3);
    else availContainer.innerHTML = '<h3>📋 Desafios Disponíveis</h3>';
  }
  const available = Storage.get().challenges.filter(c => c.status === 'disponivel');
  if (available.length === 0 && !availContainer.querySelector('p')) {
    availContainer.innerHTML += '<p style="color:var(--gray);padding:12px 0;">Nenhum desafio pendente.</p>';
  }
  available.forEach(c => {
    const startFmt = c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '—';
    const endFmt = c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : '—';
    const div = document.createElement('div');
    div.className = 'challenge-card';
    div.style.flexDirection = 'column';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="challenge-name">${c.icon || '⚔️'} ${c.name}</div>
        <span class="status-pill" style="background:rgba(245,158,11,0.1);color:var(--gold);">Disponível</span>
      </div>
      <div style="font-size:12px;color:var(--gray);margin-top:6px;">
        📅 Início: <strong>${startFmt}</strong> &nbsp; ⛔ Término: <strong>${endFmt}</strong>
      </div>`;
    availContainer.appendChild(div);
  });

  const createBtn = pg.querySelector('.section-card .btn-primary');
  if (createBtn && !createBtn.dataset.bound) {
    createBtn.dataset.bound = '1';
    createBtn.onclick = createAdminChallenge;
  }
}

function renderAdminRanking() {
  const config = Storage.get().xpConfig;
  const pg = document.getElementById('page-adm-ranking');
  const inputs = pg.querySelectorAll('.xp-input');
  const keys = ['workout', 'goal', 'streak7', 'challengeJoin', 'photo'];
  inputs.forEach((inp, i) => { if (keys[i]) inp.value = config[keys[i]]; });
  const saveBtn = pg.querySelector('.btn-primary');
  if (saveBtn && !saveBtn.dataset.bound) {
    saveBtn.dataset.bound = '1';
    saveBtn.onclick = saveXpConfigAdmin;
  }
  renderRankingAdminList(pg);
}

function renderRankingAdminList(pg) {
  const ranking = Storage.getRanking();
  const list = pg.querySelector('.ranking-list');
  if (!list) return;
  const medals = ['🥇', '🥈', '🥉'];
  list.innerHTML = ranking.slice(0, 3).map((u, i) => `
    <div class="ranking-item ${i === 0 ? 'top1' : i === 1 ? 'top2' : 'top3'}">
      <div class="rank-pos p${i+1}">${medals[i]}</div>
      <div class="rank-avatar">${Storage.getInitials(u.name)}</div>
      <div class="rank-info"><div class="rank-name">${u.name}</div><div class="rank-level">${Storage.getLevel(u.xp).name} · ${u.workoutsCompleted||0} treinos</div></div>
      <div style="text-align:right"><div class="rank-xp">${(u.xp||0).toLocaleString('pt-BR')}</div><div class="rank-xp-label">XP</div></div>
    </div>`).join('');
}

function renderAdminGamificacao() {
  const config = Storage.get().xpConfig;
  const pg = document.getElementById('page-adm-gamificacao');
  const inputs = pg.querySelectorAll('.xp-input');
  const keys = ['workout', 'goal', 'streak7', 'challengeJoin', 'challengeWin', 'photo', 'workouts100'];
  inputs.forEach((inp, i) => { if (keys[i]) inp.value = config[keys[i]]; });
  const saveBtn = pg.querySelector('.btn-primary');
  if (saveBtn && !saveBtn.dataset.bound) {
    saveBtn.dataset.bound = '1';
    saveBtn.onclick = saveXpConfigAdmin;
  }
}

function renderAdminEvolucao() {
  const students = Storage.getStudents();
  const pg = document.getElementById('page-adm-evolucao');
  // Populate the student filter dropdown
  const filterSelect = document.getElementById('evolucaoStudentFilter');
  if (filterSelect) {
    const currentVal = filterSelect.value;
    filterSelect.innerHTML = '<option value="">Todos os alunos</option>' +
      students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    if (currentVal) filterSelect.value = currentVal;
  }
  const tbody = pg.querySelector('tbody');
  if (!tbody) return;
  const selectedId = filterSelect ? filterSelect.value : '';
  const filtered = selectedId ? students.filter(s => s.id === selectedId && s.weight) : students.filter(s => s.weight);
  tbody.innerHTML = filtered.map(u => {
    const diff = (u.initialWeight || u.weight) - u.weight;
    const sign = diff > 0 ? '-' : '+';
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:8px;"><div class="student-row-avatar">${Storage.getInitials(u.name)}</div>${u.name}</div></td>
      <td style="color:var(--gray)">${u.initialWeight||'—'}kg</td><td>${u.weight}kg</td>
      <td><span style="color:${diff>=0?'var(--green)':'var(--blue)'};font-weight:700;">${sign}${Math.abs(diff).toFixed(1)}kg ${diff>=0?'▼':'▲'}</span></td>
      <td><span style="color:var(--green)">${u.bodyFat||'—'}%</span></td>
      <td>${u.workoutsCompleted||0}</td>
    </tr>`;
  }).join('');
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--gray);padding:20px;">Nenhum registro encontrado.</td></tr>`;
  }
}

function filterAdminEvolucao() {
  renderAdminEvolucao();
}

function renderAdminConfig() {
  const academy = Storage.get().academy;
  const pg = document.getElementById('page-adm-config');
  const inputs = pg.querySelectorAll('.page-form-input');
  if (inputs[0]) inputs[0].value = academy.name;
  if (inputs[1]) inputs[1].value = academy.address;
  if (inputs[2]) inputs[2].value = academy.phone;
  if (inputs[3]) inputs[3].value = academy.email;
  const adminInputs = pg.querySelectorAll('.section-card:last-child .page-form-input');
  if (adminInputs[0]) adminInputs[0].value = currentUser.name.replace('Prof. ', '');
  if (adminInputs[1]) adminInputs[1].value = currentUser.cref || '';
  const saveBtns = pg.querySelectorAll('.btn-primary');
  if (saveBtns[0] && !saveBtns[0].dataset.bound) {
    saveBtns[0].dataset.bound = '1';
    saveBtns[0].onclick = saveAcademyConfig;
  }
  if (saveBtns[1] && !saveBtns[1].dataset.bound) {
    saveBtns[1].dataset.bound = '1';
    saveBtns[1].onclick = saveAdminProfile;
  }
}

// ══════════ USER ACTIONS ══════════
function toggleWorkout(header) {
  const list = header.nextElementSibling;
  const arrow = header.querySelector('.workout-expand');
  const isOpen = list.style.display !== 'none';
  list.style.display = isOpen ? 'none' : 'block';
  arrow.classList.toggle('open', !isOpen);
}

function toggleExercise(el, workoutId, exerciseId) {
  const checked = !el.classList.contains('checked');
  el.classList.toggle('checked', checked);
  el.textContent = checked ? '✓' : '';
  el.setAttribute('aria-checked', checked);
  Storage.toggleExerciseProgress(currentUser.id, workoutId, exerciseId, checked);
}

async function finishWorkout(workoutId, workoutName) {
  if (currentUser.workoutProgress?.[workoutId]?.completed) {
    UI.warning('Este treino já foi concluído.');
    return;
  }
  const ok = await UI.confirm('Confirmar conclusão do treino? Você ganhará XP e aumentará seu streak.');
  if (!ok) return;
  stopTimer();
  const result = Storage.completeWorkout(currentUser.id, workoutId);
  currentUser = Storage.getUserById(currentUser.id);
  UI.success('🎉 ' + workoutName + ' concluído! +' + result.xpGain + ' XP · Streak: ' + result.streak + ' dias!');
  renderTreino();
  updateSidebarUser();
}

function toggleTimer() {
  if (timerRunning) stopTimer();
  else startTimer();
}

function startTimer() {
  timerRunning = true;
  document.getElementById('timerBtn').textContent = '⏸ Pausar';
  timerInterval = setInterval(() => {
    timerSeconds++;
    const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const s = String(timerSeconds % 60).padStart(2, '0');
    document.getElementById('timerDisplay').textContent = m + ':' + s;
  }, 1000);
}

function stopTimer() {
  timerRunning = false;
  const btn = document.getElementById('timerBtn');
  if (btn) btn.textContent = '▶ Iniciar';
  clearInterval(timerInterval);
}

async function joinChallenge(challengeId) {
  Storage.joinChallenge(currentUser.id, challengeId);
  currentUser = Storage.getUserById(currentUser.id);
  UI.success('Você entrou no desafio! +200 XP');
  renderDesafios();
}

function saveProfile() {
  const pg = document.getElementById('page-perfil');
  const inputs = pg.querySelectorAll('.page-form-input');
  const select = pg.querySelector('.page-form-select');
  const updates = {
    name: inputs[0]?.value.trim(),
    phone: inputs[2]?.value.trim(),
    email: inputs[3]?.value.trim(),
    birthDate: inputs[4]?.value,
    goal: select?.value,
    height: parseFloat(pg.querySelectorAll('.section-card:last-child .page-form-input')[0]?.value) || currentUser.height,
    weight: parseFloat(pg.querySelectorAll('.section-card:last-child .page-form-input')[1]?.value) || currentUser.weight,
  };
  if (!updates.name) { UI.error('Nome é obrigatório.'); return; }
  Storage.updateUser(currentUser.id, updates);
  currentUser = Storage.getUserById(currentUser.id);
  updateSidebarUser();
  UI.success('Perfil salvo com sucesso!');
}

function openEvolutionModal() {
  const u = currentUser;
  const content = `
    <div style="padding:20px;display:flex;flex-direction:column;gap:14px;">
      <div class="page-form-group">
        <label class="page-form-label">Peso Atual (kg)</label>
        <input class="page-form-input" id="evoWeight" type="number" step="0.1" min="30" max="300" placeholder="Ex: 78.5" value="${u.weight || ''}">
      </div>
      <div class="page-form-group">
        <label class="page-form-label">% Gordura Corporal</label>
        <input class="page-form-input" id="evoBodyFat" type="number" step="0.1" min="1" max="60" placeholder="Ex: 18" value="${u.bodyFat || ''}">
      </div>
      <div class="page-form-group">
        <label class="page-form-label">Massa Muscular (kg)</label>
        <input class="page-form-input" id="evoMuscle" type="number" step="0.1" min="10" max="150" placeholder="Ex: 64.4" value="${u.muscleMass || ''}">
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:4px;" onclick="saveEvolutionRecord()">💾 Salvar Registro</button>
    </div>`;
  UI.modal('📈 Novo Registro de Evolução', content);
}

function saveEvolutionRecord() {
  const weightVal = parseFloat(document.getElementById('evoWeight')?.value);
  const bodyFatVal = parseFloat(document.getElementById('evoBodyFat')?.value);
  const muscleVal = parseFloat(document.getElementById('evoMuscle')?.value);
  if (!weightVal || isNaN(weightVal)) { UI.warning('Informe um peso válido.'); return; }
  const month = new Date().toLocaleString('pt-BR', { month: 'short' });
  Storage.addEvolutionRecord(currentUser.id, { month, weight: weightVal, date: new Date().toISOString() });
  Storage.updateUser(currentUser.id, {
    weight: weightVal,
    ...(bodyFatVal && !isNaN(bodyFatVal) ? { bodyFat: bodyFatVal } : {}),
    ...(muscleVal && !isNaN(muscleVal) ? { muscleMass: muscleVal } : {}),
  });
  currentUser = Storage.getUserById(currentUser.id);
  // Close modal
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.add('hidden');
  UI.success('Registro de evolução salvo!');
  renderEvolucao();
}

function openGoalModal() {
  const content = `
    <div style="padding:20px;display:flex;flex-direction:column;gap:14px;">
      <div class="page-form-group">
        <label class="page-form-label">Nome da Meta</label>
        <input class="page-form-input" id="goalName" placeholder="Ex: Perder 5kg, Correr 5km...">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="page-form-group">
          <label class="page-form-label">Valor Atual</label>
          <input class="page-form-input" id="goalCurrent" type="number" step="0.1" placeholder="0">
        </div>
        <div class="page-form-group">
          <label class="page-form-label">Valor Alvo</label>
          <input class="page-form-input" id="goalTarget" type="number" step="0.1" placeholder="Ex: 100">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div class="page-form-group">
          <label class="page-form-label">Unidade</label>
          <input class="page-form-input" id="goalUnit" placeholder="Ex: kg, km, treinos">
        </div>
        <div class="page-form-group">
          <label class="page-form-label">Prazo</label>
          <input class="page-form-input" id="goalDeadline" type="date">
        </div>
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:4px;" onclick="saveGoal()">🎯 Criar Meta</button>
    </div>`;
  UI.modal('🎯 Nova Meta', content);
}

function saveGoal() {
  const name = document.getElementById('goalName')?.value.trim();
  const current = parseFloat(document.getElementById('goalCurrent')?.value) || 0;
  const target = parseFloat(document.getElementById('goalTarget')?.value);
  const unit = document.getElementById('goalUnit')?.value.trim() || '';
  const deadline = document.getElementById('goalDeadline')?.value || null;
  if (!name) { UI.warning('Informe o nome da meta.'); return; }
  if (!target || isNaN(target)) { UI.warning('Informe um valor alvo válido.'); return; }
  Storage.addGoal(currentUser.id, { name, current, target, unit, type: 'custom', deadline });
  currentUser = Storage.getUserById(currentUser.id);
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.add('hidden');
  UI.success('Meta criada!');
  renderMetas();
}

function addPhoto() {
  const emojis = ['📷', '💪', '🔥', '⚡', '🏋️', '🎯'];
  const content = `
    <div style="padding:20px;display:flex;flex-direction:column;gap:14px;">
      <div class="page-form-group">
        <label class="page-form-label">Tipo / Ângulo</label>
        <select class="page-form-select" id="photoLabel">
          <option>Frente</option>
          <option>Lado</option>
          <option>Costas</option>
          <option>Comparação</option>
        </select>
      </div>
      <div class="page-form-group">
        <label class="page-form-label">Ícone / Representação</label>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:4px;" id="emojiPicker">
          ${emojis.map((e, i) => `<span onclick="selectPhotoEmoji(this,'${e}')" style="font-size:28px;cursor:pointer;padding:6px;border-radius:8px;border:2px solid ${i===0?'var(--green)':'transparent'};transition:border-color 0.2s;" data-emoji="${e}">${e}</span>`).join('')}
        </div>
        <input type="hidden" id="photoEmoji" value="📷">
      </div>
      <div class="page-form-group">
        <label class="page-form-label">Data de Referência</label>
        <input class="page-form-input" id="photoDate" placeholder="Ex: Jun/24" value="${new Date().toLocaleString('pt-BR',{month:'short',year:'2-digit'})}">
      </div>
      <button class="btn btn-primary" style="width:100%;margin-top:4px;" onclick="savePhoto()">📸 Adicionar Foto +50 XP</button>
    </div>`;
  UI.modal('📸 Adicionar Foto de Progresso', content);
}

function selectPhotoEmoji(el, emoji) {
  document.getElementById('photoEmoji').value = emoji;
  document.querySelectorAll('#emojiPicker span').forEach(s => s.style.borderColor = 'transparent');
  el.style.borderColor = 'var(--green)';
}

function savePhoto() {
  const label = document.getElementById('photoLabel')?.value || 'Frente';
  const emoji = document.getElementById('photoEmoji')?.value || '📷';
  const date = document.getElementById('photoDate')?.value.trim() || new Date().toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
  Storage.addPhoto(currentUser.id, { label, date, emoji });
  currentUser = Storage.getUserById(currentUser.id);
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.add('hidden');
  UI.success('Foto adicionada! +50 XP');
  renderFotos();
}

async function deleteStudent(id, name) {
  const ok = await UI.confirm('Excluir o aluno ' + name + '? Esta ação não pode ser desfeita.');
  if (!ok) return;
  Storage.deleteUser(id);
  UI.success('Aluno removido.');
  renderAdminAlunos();
}

function viewStudent(id) {
  const u = Storage.getUserById(id);
  if (u) UI.info(u.name + ' — ' + (u.xp || 0) + ' XP · ' + (u.workoutsCompleted || 0) + ' treinos');
}

function sendFeedback() {
  const pg = document.getElementById('page-adm-feedbacks');
  const toId = pg.querySelector('.page-form-select')?.value;
  const text = pg.querySelector('.page-form-textarea')?.value.trim();
  if (!text) { UI.error('Escreva uma mensagem.'); return; }
  Storage.addFeedback(currentUser.id, toId, text);
  UI.success('Feedback enviado!');
  pg.querySelector('.page-form-textarea').value = '';
  renderAdminFeedbacks();
}

function publishNutrition() {
  const pg = document.getElementById('page-adm-nutricao');
  const formCard = pg.querySelector('.section-card');
  const titleInput = formCard.querySelector('.page-form-input');
  const descTextarea = formCard.querySelector('.page-form-textarea');
  const tagSelect = formCard.querySelector('.page-form-select');
  const title = titleInput?.value.trim();
  const desc = descTextarea?.value.trim();
  const tagRaw = tagSelect?.value?.toLowerCase() || 'emagrecimento';
  if (!title) { UI.error('Preencha o título do conteúdo.'); return; }
  if (!desc) { UI.error('Preencha a descrição do conteúdo.'); return; }
  const emojiMap = { emagrecimento: '🥗', hipertrofia: '🍗', performance: '⚡' };
  const tagMap = { emagrecimento: 'emagrecer', hipertrofia: 'hipertrofia', performance: 'performance' };
  Storage.saveNutrition({ emoji: emojiMap[tagRaw] || '🥗', tag: tagMap[tagRaw] || 'emagrecer', title, desc });
  UI.success('Conteúdo publicado!');
  titleInput.value = '';
  descTextarea.value = '';
  renderAdminNutricao();
  renderNutricao();
}
  inputs[0].value = ''; inputs[2].value = '';
  renderAdminNutricao();
  renderNutricao();


async function deleteNutritionItem(id) {
  const ok = await UI.confirm('Remover este conteúdo?');
  if (!ok) return;
  Storage.deleteNutrition(id);
  UI.success('Conteúdo removido.');
  renderAdminNutricao();
}

function saveNewWorkout() {
  const pg = document.getElementById('page-adm-treinos');
  const inputs = pg.querySelectorAll('.two-col .section-card:last-child > .page-form-group > .page-form-input');
  const name = inputs[0]?.value.trim();
  if (!name) { UI.error('Informe o nome do treino.'); return; }
  const objective = pg.querySelector('.two-col .section-card:last-child .page-form-select')?.value || 'Hipertrofia';
  // Collect dynamically added exercises
  const exerciseItems = pg.querySelectorAll('.two-col .section-card:last-child .exercise-item');
  const exercises = [];
  exerciseItems.forEach(item => {
    const nameInput = item.querySelector('input:first-child');
    const setsInput = item.querySelector('.ex-sets-input');
    const restInput = item.querySelector('.ex-rest-input');
    if (nameInput && nameInput.value.trim()) {
      exercises.push({
        id: 'e' + Date.now() + Math.random(),
        name: nameInput.value.trim(),
        sets: setsInput?.value.trim() || '3x12',
        rest: parseInt(restInput?.value) || 60,
        note: '',
      });
    }
  });
  Storage.saveWorkout({ name, objective, color: 'green', exercises, studentCount: 0 });
  UI.success('Treino salvo!');
  inputs[0].value = '';
  // Clear exercise rows
  exerciseItems.forEach(item => item.remove());
  renderAdminTreinos();
}

async function deleteWorkoutAdmin(id, name) {
  const ok = await UI.confirm('Excluir treino "' + name + '"?');
  if (!ok) return;
  Storage.deleteWorkout(id);
  UI.success('Treino removido.');
  renderAdminTreinos();
}

function createAdminGoal() {
  const pg = document.getElementById('page-adm-metas');
  const inputs = pg.querySelectorAll('.page-form-input');
  const name = inputs[0]?.value.trim();
  const deadline = inputs[1]?.value || null;
  const studentSelect = pg.querySelector('.page-form-select');
  const studentId = studentSelect?.value;
  if (!name) { UI.error('Informe a meta.'); return; }
  // Save to adminGoals list
  Storage.update(d => {
    d.adminGoals.push({ id: 'ag' + Date.now(), studentId: studentId || null, name, progress: 0 });
  });
  // Also add to the selected student's own goals so it shows in their view
  if (studentId && studentId !== 'all') {
    Storage.addGoal(studentId, { name, current: 0, target: 100, unit: '', type: 'admin', deadline });
  } else if (studentId === 'all') {
    // Add to all students
    Storage.getStudents().forEach(s => {
      Storage.addGoal(s.id, { name, current: 0, target: 100, unit: '', type: 'admin', deadline });
    });
  }
  UI.success('Meta criada' + (studentId && studentId !== 'all' ? ' e vinculada ao aluno!' : ' para todos os alunos!'));
  inputs[0].value = '';
  if (inputs[1]) inputs[1].value = '';
  renderAdminMetas();
}

function createAdminChallenge() {
  const pg = document.getElementById('page-adm-desafios');
  const inputs = pg.querySelectorAll('.section-card .page-form-input, .section-card .page-form-textarea');
  const name = inputs[0]?.value.trim();
  if (!name) { UI.error('Informe o nome do desafio.'); return; }
  const startDate = inputs[2]?.value || null;
  const endDate = inputs[3]?.value || null;
  const prize = (inputs[4]?.value || '500') + ' XP';
  Storage.saveChallenge({
    name,
    icon: '💪',
    desc: inputs[1]?.value || '',
    status: 'disponivel',
    progress: 0,
    participants: 0,
    prize,
    startDate,
    endDate,
  });
  UI.success('Desafio criado!');
  // Clear inputs
  pg.querySelectorAll('.section-card .page-form-input, .section-card .page-form-textarea').forEach(i => { if (i.type !== 'button') i.value = ''; });
  renderAdminDesafios();
}

async function endChallenge(id) {
  const ok = await UI.confirm('Encerrar este desafio?');
  if (!ok) return;
  Storage.update(d => {
    const c = d.challenges.find(x => x.id === id);
    if (c) c.status = 'encerrado';
  });
  UI.success('Desafio encerrado.');
  renderAdminDesafios();
}

function saveXpConfigAdmin() {
  const pg = document.getElementById('page-adm-gamificacao') || document.getElementById('page-adm-ranking');
  const inputs = pg.querySelectorAll('.xp-input');
  const keys = ['workout', 'goal', 'streak7', 'challengeJoin', 'challengeWin', 'photo', 'workouts100'];
  const config = {};
  inputs.forEach((inp, i) => { if (keys[i]) config[keys[i]] = parseInt(inp.value) || 0; });
  Storage.saveXpConfig(config);
  UI.success('Configurações de XP salvas!');
}

function saveAcademyConfig() {
  const pg = document.getElementById('page-adm-config');
  const inputs = pg.querySelectorAll('.page-form-input');
  Storage.saveAcademy({
    name: inputs[0]?.value, address: inputs[1]?.value,
    phone: inputs[2]?.value, email: inputs[3]?.value,
  });
  UI.success('Dados da academia salvos!');
}

function saveAdminProfile() {
  const pg = document.getElementById('page-adm-config');
  const inputs = pg.querySelectorAll('.section-card:last-child .page-form-input');
  Storage.updateUser(currentUser.id, {
    name: inputs[0]?.value.trim(),
    cref: inputs[1]?.value.trim(),
  });
  currentUser = Storage.getUserById(currentUser.id);
  updateSidebarUser();
  UI.success('Perfil atualizado!');
}

// ══════════ HELPERS ══════════
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'BOM DIA';
  if (h < 18) return 'BOA TARDE';
  return 'BOA NOITE';
}

// ══════════ NOTIFICATION SYSTEM ══════════
function updateNotifBadge() {
  if (!currentUser) return;
  const unread = Storage.getUnreadNotifCount(currentUser.id);
  // Aluno dot
  const dotAluno = document.getElementById('notifDotAluno');
  if (dotAluno) dotAluno.style.display = unread > 0 ? 'block' : 'none';
  // Admin dot
  const dotAdmin = document.getElementById('notifDotAdmin');
  if (dotAdmin) dotAdmin.style.display = unread > 0 ? 'block' : 'none';
  // Sidebar feedbacks badge
  if (currentRole === 'aluno') {
    const feedbackBadge = document.querySelector('#nav-feedbacks .nav-badge');
    if (feedbackBadge) feedbackBadge.textContent = unread > 0 ? unread : '';
  }
}

function openNotifPanel() {
  if (!currentUser) return;
  // Mark all as read
  Storage.markNotifsRead(currentUser.id);
  updateNotifBadge();
  const feedbacks = Storage.getFeedbacksForUser(currentUser.id);
  const items = feedbacks.slice(0, 5);
  const content = items.length
    ? items.map(f => {
        const from = Storage.getUserById(f.fromId);
        return `<div style="padding:12px;border-bottom:1px solid rgba(255,255,255,0.07);">
          <div style="font-size:12px;color:var(--green);font-weight:600;">👑 ${from?.name || 'Personal Trainer'}</div>
          <div style="font-size:13px;margin-top:4px;">${f.text.slice(0, 80)}${f.text.length > 80 ? '...' : ''}</div>
          <div style="font-size:11px;color:var(--gray);margin-top:4px;">${Storage.formatDate(f.date)}</div>
        </div>`;
      }).join('')
    : '<div style="padding:20px;text-align:center;color:var(--gray);">Nenhuma notificação.</div>';
  UI.modal('🔔 Notificações', content);
}

// ══════════ RANKING PERIOD ══════════
let currentRankPeriod = 'mensal';

function setRankingPeriod(period, btn) {
  currentRankPeriod = period;
  document.querySelectorAll('#page-adm-ranking .btn').forEach(b => {
    if (b.id === 'btnRankSemanal' || b.id === 'btnRankMensal') b.className = 'btn btn-ghost btn-sm';
  });
  if (btn) btn.className = 'btn btn-primary btn-sm';
  renderRankingAdminList(document.getElementById('page-adm-ranking'));
}

async function resetWeeklyRanking() {
  const ok = await UI.confirm('Isso vai zerar os treinos semanais de todos os alunos. Confirma?');
  if (!ok) return;
  Storage.update(d => {
    d.users.forEach(u => { if (u.role === 'aluno') { u.weeklyWorkouts = 0; } });
  });
  UI.success('Ranking semanal resetado com sucesso!');
  renderAdminRanking();
}

// ══════════ ADD EXERCISE ROW ══════════
function addExerciseRow() {
  const pg = document.getElementById('page-adm-treinos');
  const exerciseContainer = pg.querySelector('.section-card:last-child [style*="border:1px solid"]');
  if (!exerciseContainer) return;
  const addBtn = exerciseContainer.querySelector('.btn-ghost');
  const row = document.createElement('div');
  row.className = 'exercise-item';
  row.innerHTML = `
    <input class="page-form-input" placeholder="Nome do exercício" style="flex:1;margin-right:8px;padding:6px 10px;font-size:13px;">
    <input class="page-form-input ex-sets-input" placeholder="Séries (ex: 4x10)" style="width:100px;margin-right:8px;padding:6px 10px;font-size:13px;">
    <input class="page-form-input ex-rest-input" placeholder="Descanso(s)" type="number" style="width:90px;margin-right:8px;padding:6px 10px;font-size:13px;">
    <button class="btn btn-danger btn-sm" style="padding:4px 8px" onclick="this.closest('.exercise-item').remove()">✕</button>`;
  exerciseContainer.insertBefore(row, addBtn);
}



function renderFrequencyChart(pg, weeks) {
  const chart = pg.querySelector('.mini-chart');
  if (!chart || !weeks.length) return;
  const max = Math.max(...weeks, 1);
  chart.innerHTML = weeks.map((v, i) => {
    const pct = (v / max) * 100;
    const isLast = i === weeks.length - 1;
    const style = isLast ? 'height:' + pct + '%;background:linear-gradient(to top,var(--green),#86EFAC);' : 'height:' + pct + '%';
    return `<div class="chart-bar" style="${style}" data-val="${v} treinos"></div>`;
  }).join('');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
