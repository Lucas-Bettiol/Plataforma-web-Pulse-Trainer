/**
 * PulseTrainer — camada de persistência LocalStorage
 */
const PT_STORAGE_KEY = 'pulsetrainer_data_v1';

const LEVELS = [
  { id: 'bronze', name: 'Bronze', min: 0, max: 999 },
  { id: 'silver', name: 'Prata', min: 1000, max: 2499 },
  { id: 'gold', name: 'Ouro', min: 2500, max: 4999 },
  { id: 'platinum', name: 'Platina', min: 5000, max: 9999 },
  { id: 'diamond', name: 'Diamond', min: 10000, max: Infinity },
];

const DEFAULT_XP_CONFIG = {
  workout: 100,
  goal: 500,
  streak7: 300,
  challengeJoin: 200,
  challengeWin: 1000,
  photo: 50,
  workouts100: 1000,
};

function getDefaultData() {
  const now = new Date().toISOString();
  return {
    version: 1,
    theme: 'dark',
    academy: {
      name: 'PulseTrainer Academy',
      address: 'Rua das Palmeiras, 123 — Florianópolis',
      phone: '(48) 3333-0000',
      email: 'contato@pulsetrainer.com',
    },
    xpConfig: { ...DEFAULT_XP_CONFIG },
    users: [
      {
        id: 'u1',
        cpf: '12345678909',
        password: '123456',
        role: 'aluno',
        name: 'Marco Alves',
        email: 'marco@email.com',
        phone: '(48) 99999-0000',
        birthDate: '1990-05-15',
        goal: 'Emagrecimento',
        height: 178,
        weight: 78.5,
        initialWeight: 92,
        bodyFat: 18,
        muscleMass: 64.4,
        xp: 4250,
        streak: 12,
        workoutsCompleted: 61,
        weeklyWorkouts: 16,
        weeklyGoal: 20,
        status: 'ativo',
        notifications: true,
        measurements: { waist: 88, chest: 105, biceps: 38, hip: 98 },
        evolutionHistory: [
          { month: 'Jan', weight: 92 },
          { month: 'Fev', weight: 88 },
          { month: 'Mar', weight: 85 },
          { month: 'Abr', weight: 83 },
          { month: 'Mai', weight: 80 },
          { month: 'Jun', weight: 78.5 },
        ],
        frequencyWeeks: [3, 4, 2, 5, 3, 5, 4, 5],
        badges: ['primeiro-treino', '7-dias', '50-treinos', 'menos-10kg', 'top-3'],
        goals: [
          { id: 'g1', name: 'Perder 15kg', current: 13.5, target: 15, unit: 'kg', deadline: '2026-08-31', type: 'weight' },
          { id: 'g2', name: 'Treinar 20x no mês', current: 16, target: 20, unit: 'treinos', deadline: null, type: 'workouts' },
          { id: 'g3', name: 'Ganhar 3kg de massa', current: 1.2, target: 3, unit: 'kg', deadline: '2026-12-31', type: 'muscle' },
          { id: 'g4', name: 'Streak de 30 dias', current: 12, target: 30, unit: 'dias', deadline: null, type: 'streak' },
        ],
        photos: [
          { id: 'p1', label: 'Frente', date: 'Jun/26', emoji: '🟢' },
          { id: 'p2', label: 'Frente', date: 'Mai/26', emoji: '🔵' },
        ],
        workoutProgress: {},
        challengeIds: ['c1', 'c2'],
        createdAt: now,
      },
      {
        id: 'u2',
        cpf: '98765432100',
        password: 'admin123',
        role: 'admin',
        name: 'Carlos Silva',
        email: 'carlos@pulsetrainer.com',
        phone: '(48) 98888-0000',
        cref: '123456-G/SC',
        notifications: true,
        createdAt: now,
      },
      {
        id: 'u3',
        cpf: '11122233396',
        password: '123456',
        role: 'aluno',
        name: 'Lucas Costa',
        email: 'lucas@email.com',
        phone: '(48) 97777-0000',
        birthDate: '1995-03-20',
        goal: 'Hipertrofia',
        height: 175,
        weight: 80.2,
        initialWeight: 72,
        bodyFat: 14,
        muscleMass: 68,
        xp: 5100,
        streak: 8,
        workoutsCompleted: 48,
        weeklyWorkouts: 12,
        weeklyGoal: 20,
        status: 'ativo',
        notifications: true,
        measurements: { waist: 82, chest: 110, biceps: 40, hip: 95 },
        evolutionHistory: [],
        frequencyWeeks: [4, 5, 4, 5, 4, 5, 5, 5],
        badges: ['primeiro-treino', '7-dias', '50-treinos'],
        goals: [],
        photos: [],
        workoutProgress: {},
        challengeIds: ['c1'],
        createdAt: now,
      },
      {
        id: 'u4',
        cpf: '55566677720',
        password: '123456',
        role: 'aluno',
        name: 'Pedro Gomes',
        email: 'pedro@email.com',
        goal: 'Performance',
        xp: 3800,
        streak: 5,
        workoutsCompleted: 39,
        status: 'ativo',
        weight: 75,
        initialWeight: 78,
        badges: [],
        goals: [],
        photos: [],
        workoutProgress: {},
        challengeIds: ['c2'],
        createdAt: now,
      },
      {
        id: 'u5',
        cpf: '99988877714',
        password: '123456',
        role: 'aluno',
        name: 'Ana Santos',
        email: 'ana@email.com',
        goal: 'Emagrecimento',
        xp: 2900,
        streak: 0,
        workoutsCompleted: 27,
        status: 'inativo',
        weight: 61.5,
        initialWeight: 68,
        badges: [],
        goals: [],
        photos: [],
        workoutProgress: {},
        challengeIds: [],
        createdAt: now,
      },
    ],
    workouts: [
      {
        id: 'w1',
        name: 'Treino A — Peito & Tríceps',
        color: 'green',
        day: 'Hoje',
        objective: 'Hipertrofia',
        studentCount: 28,
        exercises: [
          { id: 'e1', name: 'Supino Reto', sets: '4x10', rest: 90, note: '' },
          { id: 'e2', name: 'Supino Inclinado', sets: '3x12', rest: 90, note: '' },
          { id: 'e3', name: 'Crucifixo', sets: '3x15', rest: 60, note: '' },
          { id: 'e4', name: 'Tríceps Corda', sets: '4x12', rest: 60, note: 'Mantenha cotovelo fixo' },
        ],
      },
      {
        id: 'w2',
        name: 'Treino B — Costas & Bíceps',
        color: 'blue',
        day: 'Amanhã',
        objective: 'Hipertrofia',
        studentCount: 28,
        exercises: [
          { id: 'e5', name: 'Puxada Frontal', sets: '4x10', rest: 90, note: '' },
          { id: 'e6', name: 'Remada Curvada', sets: '4x10', rest: 90, note: '' },
          { id: 'e7', name: 'Rosca Direta', sets: '3x12', rest: 60, note: '' },
        ],
      },
      {
        id: 'w3',
        name: 'Treino C — Pernas & Ombros',
        color: 'gold',
        day: 'Quinta',
        objective: 'Hipertrofia',
        studentCount: 28,
        exercises: [
          { id: 'e8', name: 'Agachamento Livre', sets: '5x8', rest: 120, note: '' },
          { id: 'e9', name: 'Leg Press', sets: '4x12', rest: 90, note: '' },
          { id: 'e10', name: 'Desenvolvimento', sets: '4x10', rest: 90, note: '' },
        ],
      },
      {
        id: 'w4',
        name: 'Treino Emagrecimento',
        color: 'diamond',
        day: '',
        objective: 'Emagrecimento',
        studentCount: 12,
        exercises: [],
      },
    ],
    feedbacks: [
      { id: 'f1', fromId: 'u2', toId: 'u1', text: 'Excelente evolução nesta semana, Marco! Seus números estão mostrando uma redução consistente e o ganho de massa está no caminho certo. Continue assim! 💪', date: new Date().toISOString() },
      { id: 'f2', fromId: 'u2', toId: 'u1', text: 'Vamos aumentar a carga no próximo treino A. Supino: 70kg → 75kg. Você está pronto para esse avanço. Lembre de manter a postura escápula retraída.', date: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: 'f3', fromId: 'u2', toId: 'u1', text: 'Parabéns pelo streak de 7 dias! Isso é disciplina real. Sua dedicação está gerando resultados. Continue com a hidratação em dia — pelo menos 3L de água por dia durante os treinos pesados.', date: new Date(Date.now() - 7 * 86400000).toISOString() },
      { id: 'f4', fromId: 'u2', toId: 'u3', text: 'Vamos aumentar a carga no supino: 70kg → 75kg na próxima sessão.', date: new Date(Date.now() - 86400000).toISOString() },
      { id: 'f5', fromId: 'u2', toId: 'u5', text: 'Vi que você faltou 3 dias esta semana. Tudo bem? Precisamos conversar sobre sua rotina.', date: new Date(Date.now() - 2 * 86400000).toISOString() },
    ],
    challenges: [
      { id: 'c1', name: '30 Dias Sem Faltar', icon: '🔥', desc: 'Treine por 30 dias consecutivos sem nenhuma falta. Consistência é o segredo dos campeões.', type: 'frequencia', progress: 40, current: 12, target: 30, prize: '500 XP + Badge Lenda', status: 'ativo', startDate: '2026-06-01', endDate: '2026-07-01', participants: 24 },
      { id: 'c2', name: 'Desafio Emagrecimento', icon: '📉', desc: 'Quem perder mais % de gordura em 60 dias vence. Pesagem quinzenal.', type: 'emagrecimento', progress: 65, current: 3, target: 10, prize: '1º lugar: 1000 XP', status: 'ativo', startDate: '2026-05-01', endDate: '2026-07-01', participants: 18 },
      { id: 'c3', name: 'Desafio Hipertrofia', icon: '💪', desc: 'Ganhe o máximo de massa muscular em 90 dias. Pesagem e bioimpedância mensais.', type: 'hipertrofia', progress: 0, status: 'disponivel', startDate: '2026-07-01', endDate: '2026-10-01', prize: '1000 XP', participants: 0 },
    ],
    adminGoals: [
      { id: 'ag1', studentId: 'u1', name: 'Perder 15kg', progress: 90 },
      { id: 'ag2', studentId: 'u3', name: '100 treinos', progress: 48 },
      { id: 'ag3', studentId: null, name: 'Academia — 500 treinos/mês', progress: 72, current: 360, target: 500 },
    ],
    session: null,
  };
}

const Storage = {
  init() {
    try {
      const raw = localStorage.getItem(PT_STORAGE_KEY);
      if (!raw) {
        const data = getDefaultData();
        localStorage.setItem(PT_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
      const parsed = JSON.parse(raw);
      // Migrate: ensure all aluno users have required fields
      let needsSave = false;
      if (parsed.users) {
        parsed.users.forEach(u => {
          if (u.role === 'aluno') {
            if (!u.badges) { u.badges = []; needsSave = true; }
            if (!u.goals) { u.goals = []; needsSave = true; }
            if (!u.photos) { u.photos = []; needsSave = true; }
            if (!u.workoutProgress) { u.workoutProgress = {}; needsSave = true; }
            if (!u.challengeIds) { u.challengeIds = []; needsSave = true; }
            if (!u.evolutionHistory) { u.evolutionHistory = []; needsSave = true; }
            if (!u.frequencyWeeks) { u.frequencyWeeks = [0,0,0,0,0,0,0,0]; needsSave = true; }
            if (u.status === undefined) { u.status = 'ativo'; needsSave = true; }
          }
        });
      }
      if (needsSave) localStorage.setItem(PT_STORAGE_KEY, JSON.stringify(parsed));
      return parsed;
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
      const data = getDefaultData();
      localStorage.setItem(PT_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  },

  get() {
    try {
      const raw = localStorage.getItem(PT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : this.init();
    } catch {
      return this.init();
    }
  },

  save(data) {
    try {
      localStorage.setItem(PT_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Erro ao salvar:', e);
      return false;
    }
  },

  update(mutator) {
    const data = this.get();
    mutator(data);
    return this.save(data);
  },

  getSession() {
    return this.get().session;
  },

  setSession(userId, role) {
    return this.update(d => { d.session = { userId, role, loginAt: new Date().toISOString() }; });
  },

  clearSession() {
    return this.update(d => { d.session = null; });
  },

  getTheme() {
    return this.get().theme || 'dark';
  },

  setTheme(theme) {
    return this.update(d => { d.theme = theme; });
  },

  normalizeCpf(cpf) {
    return (cpf || '').replace(/\D/g, '');
  },

  formatCpf(cpf) {
    const n = this.normalizeCpf(cpf);
    if (n.length !== 11) return cpf;
    return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  getUserByCpf(cpf) {
    const n = this.normalizeCpf(cpf);
    return this.get().users.find(u => u.cpf === n);
  },

  getUserById(id) {
    return this.get().users.find(u => u.id === id);
  },

  getStudents() {
    return this.get().users.filter(u => u.role === 'aluno');
  },

  createUser(userData) {
    const data = this.get();
    const cpf = this.normalizeCpf(userData.cpf);
    if (data.users.some(u => u.cpf === cpf)) {
      return { ok: false, error: 'CPF já cadastrado.' };
    }
    if (!userData.name || !userData.password || cpf.length !== 11) {
      return { ok: false, error: 'Preencha todos os campos obrigatórios corretamente.' };
    }
    const user = {
      id: 'u' + Date.now(),
      cpf,
      password: userData.password,
      role: userData.role || 'aluno',
      name: userData.name.trim(),
      email: userData.email || '',
      phone: userData.phone || '',
      birthDate: userData.birthDate || '',
      goal: userData.goal || 'Saúde Geral',
      height: parseFloat(userData.height) || 170,
      weight: parseFloat(userData.weight) || 70,
      initialWeight: parseFloat(userData.weight) || 70,
      bodyFat: 0,
      muscleMass: 0,
      xp: 0,
      streak: 0,
      workoutsCompleted: 0,
      weeklyWorkouts: 0,
      weeklyGoal: 20,
      status: 'ativo',
      notifications: true,
      measurements: { waist: 0, chest: 0, biceps: 0, hip: 0 },
      evolutionHistory: [],
      frequencyWeeks: [0, 0, 0, 0, 0, 0, 0, 0],
      badges: [],
      goals: [],
      photos: [],
      workoutProgress: {},
      challengeIds: [],
      createdAt: new Date().toISOString(),
    };
    data.users.push(user);
    this.save(data);
    return { ok: true, user };
  },

  updateUser(id, updates) {
    return this.update(d => {
      const idx = d.users.findIndex(u => u.id === id);
      if (idx === -1) return;
      d.users[idx] = { ...d.users[idx], ...updates };
    });
  },

  deleteUser(id) {
    return this.update(d => {
      d.users = d.users.filter(u => u.id !== id);
      d.feedbacks = d.feedbacks.filter(f => f.toId !== id && f.fromId !== id);
    });
  },

  authenticate(cpf, password, role) {
    const user = this.getUserByCpf(cpf);
    if (!user) return { ok: false, error: 'CPF não encontrado. Crie uma conta primeiro.' };
    if (user.password !== password) return { ok: false, error: 'Senha incorreta.' };
    if (user.role !== role) return { ok: false, error: role === 'aluno' ? 'Esta conta não é de aluno.' : 'Esta conta não é de personal.' };
    return { ok: true, user };
  },

  getLevel(xp) {
    return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[0];
  },

  getNextLevel(xp) {
    const current = this.getLevel(xp);
    const idx = LEVELS.indexOf(current);
    return LEVELS[idx + 1] || null;
  },

  getInitials(name) {
    return (name || '').split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  },

  addXp(userId, amount) {
    const data = this.get();
    const user = data.users.find(u => u.id === userId);
    if (!user) return;
    user.xp = (user.xp || 0) + amount;
    this.save(data);
    return user.xp;
  },

  completeWorkout(userId, workoutId) {
    const data = this.get();
    const user = data.users.find(u => u.id === userId);
    if (!user) return null;
    const xpGain = data.xpConfig.workout || 100;
    user.xp = (user.xp || 0) + xpGain;
    user.workoutsCompleted = (user.workoutsCompleted || 0) + 1;
    user.weeklyWorkouts = (user.weeklyWorkouts || 0) + 1;

    // Only increment streak if the user hasn't worked out today yet
    const today = new Date().toDateString();
    const lastDate = user.lastWorkoutDate ? new Date(user.lastWorkoutDate).toDateString() : null;
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // Reset streak if last workout was not yesterday (streak broken)
      if (lastDate && lastDate !== yesterday.toDateString()) {
        user.streak = 1;
      } else {
        user.streak = (user.streak || 0) + 1;
      }
      user.lastWorkoutDate = new Date().toISOString();
    }

    if (!user.badges.includes('primeiro-treino')) user.badges.push('primeiro-treino');
    if (user.streak >= 7 && !user.badges.includes('7-dias')) user.badges.push('7-dias');
    if (user.workoutsCompleted >= 50 && !user.badges.includes('50-treinos')) user.badges.push('50-treinos');
    if (user.workoutProgress) user.workoutProgress[workoutId] = { completed: true, date: new Date().toISOString() };
    this.save(data);
    return { xpGain, streak: user.streak };
  },

  toggleExerciseProgress(userId, workoutId, exerciseId, checked) {
    return this.update(d => {
      const user = d.users.find(u => u.id === userId);
      if (!user) return;
      if (!user.workoutProgress) user.workoutProgress = {};
      if (!user.workoutProgress[workoutId]) user.workoutProgress[workoutId] = { exercises: {} };
      if (!user.workoutProgress[workoutId].exercises) user.workoutProgress[workoutId].exercises = {};
      user.workoutProgress[workoutId].exercises[exerciseId] = checked;
    });
  },

  isExerciseChecked(userId, workoutId, exerciseId) {
    const user = this.getUserById(userId);
    return user?.workoutProgress?.[workoutId]?.exercises?.[exerciseId] || false;
  },

  addFeedback(fromId, toId, text) {
    return this.update(d => {
      d.feedbacks.unshift({
        id: 'f' + Date.now(),
        fromId, toId, text,
        date: new Date().toISOString(),
      });
    });
  },

  getFeedbacksForUser(userId) {
    return this.get().feedbacks.filter(f => f.toId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  addGoal(userId, goal) {
    return this.update(d => {
      const user = d.users.find(u => u.id === userId);
      if (!user) return;
      if (!user.goals) user.goals = [];
      user.goals.push({ id: 'g' + Date.now(), ...goal });
    });
  },

  addPhoto(userId, photo) {
    return this.update(d => {
      const user = d.users.find(u => u.id === userId);
      if (!user) return;
      if (!user.photos) user.photos = [];
      user.photos.unshift({ id: 'p' + Date.now(), ...photo });
      const xp = d.xpConfig.photo || 50;
      user.xp = (user.xp || 0) + xp;
    });
  },

  addEvolutionRecord(userId, record) {
    return this.update(d => {
      const user = d.users.find(u => u.id === userId);
      if (!user) return;
      if (!user.evolutionHistory) user.evolutionHistory = [];
      user.evolutionHistory.push(record);
      if (record.weight) user.weight = record.weight;
    });
  },

  joinChallenge(userId, challengeId) {
    return this.update(d => {
      const user = d.users.find(u => u.id === userId);
      const challenge = d.challenges.find(c => c.id === challengeId);
      if (!user || !challenge) return;
      if (!user.challengeIds) user.challengeIds = [];
      if (!user.challengeIds.includes(challengeId)) {
        user.challengeIds.push(challengeId);
        user.xp = (user.xp || 0) + (d.xpConfig.challengeJoin || 200);
        challenge.participants = (challenge.participants || 0) + 1;
        challenge.status = 'ativo';
      }
    });
  },

  saveWorkout(workout) {
    return this.update(d => {
      if (workout.id) {
        const idx = d.workouts.findIndex(w => w.id === workout.id);
        if (idx >= 0) d.workouts[idx] = workout;
        else d.workouts.push(workout);
      } else {
        workout.id = 'w' + Date.now();
        d.workouts.push(workout);
      }
    });
  },

  deleteWorkout(id) {
    return this.update(d => { d.workouts = d.workouts.filter(w => w.id !== id); });
  },

  saveChallenge(challenge) {
    return this.update(d => {
      if (challenge.id) {
        const idx = d.challenges.findIndex(c => c.id === challenge.id);
        if (idx >= 0) d.challenges[idx] = challenge;
        else d.challenges.push(challenge);
      } else {
        challenge.id = 'c' + Date.now();
        d.challenges.push(challenge);
      }
    });
  },

  saveXpConfig(config) {
    return this.update(d => { d.xpConfig = { ...d.xpConfig, ...config }; });
  },

  saveAcademy(info) {
    return this.update(d => { d.academy = { ...d.academy, ...info }; });
  },

  getRanking() {
    return this.getStudents()
      .filter(u => u.status !== 'inativo')
      .sort((a, b) => (b.xp || 0) - (a.xp || 0));
  },

  getUnreadNotifCount(userId) {
    const user = this.getUserById(userId);
    if (!user) return 0;
    const feedbacks = this.getFeedbacksForUser(userId);
    const lastRead = user.lastNotifRead ? new Date(user.lastNotifRead) : null;
    if (!lastRead) return feedbacks.length;
    return feedbacks.filter(f => new Date(f.date) > lastRead).length;
  },

  markNotifsRead(userId) {
    return this.update(d => {
      const user = d.users.find(u => u.id === userId);
      if (user) user.lastNotifRead = new Date().toISOString();
    });
  },

  formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return 'Hoje, ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (diff < 2 * 86400000) return 'Ontem';
    if (diff < 7 * 86400000) return Math.floor(diff / 86400000) + ' dias atrás';
    return d.toLocaleDateString('pt-BR');
  },
};

Storage.init();
