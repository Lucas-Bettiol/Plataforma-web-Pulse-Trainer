-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS pulse_trainer;
USE pulse_trainer;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. TABELA: USUARIOS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cpf VARCHAR(14) UNIQUE NOT NULL COMMENT 'CPF formatado: 000.000.000-00',
  senha VARCHAR(255) NOT NULL COMMENT 'Senha criptografada (bcrypt)',
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefone VARCHAR(15) NULL,
  role ENUM('aluno', 'admin') NOT NULL DEFAULT 'aluno' COMMENT 'Papel do usuário',
  nivel ENUM('bronze','silver','gold','platinum','diamond') NOT NULL DEFAULT 'bronze',
  xp_total INT NOT NULL DEFAULT 0,
  avatar VARCHAR(2) NULL COMMENT 'Iniciais do nome (ex: MA)',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT TRUE,
  
  INDEX idx_role (role),
  INDEX idx_email (email),
  INDEX idx_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabela de usuários - Alunos e Personal Trainers';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. TABELA: EXERCICIOS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS exercicios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT NULL,
  grupo_muscular VARCHAR(50) NOT NULL COMMENT 'peito, costas, perna, ombro, braço, etc',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_grupo_muscular (grupo_muscular)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Banco de exercícios disponíveis';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. TABELA: TREINOS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS treinos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  personal_id INT NOT NULL,
  aluno_id INT NOT NULL,
  nome VARCHAR(50) NOT NULL COMMENT 'Nome do treino (A, B, C, etc)',
  descricao TEXT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (personal_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_personal_id (personal_id),
  INDEX idx_aluno_id (aluno_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Treinos criados pelo personal para alunos';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. TABELA: TREINO_EXERCICIOS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS treino_exercicios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  treino_id INT NOT NULL,
  exercicio_id INT NOT NULL,
  series INT NOT NULL DEFAULT 3 COMMENT 'Número de séries',
  repeticoes INT NOT NULL DEFAULT 10 COMMENT 'Número de repetições',
  peso_kg DECIMAL(5,2) NULL COMMENT 'Peso em kg',
  tempo_repouso INT NULL COMMENT 'Tempo de repouso em segundos',
  observacoes TEXT NULL,
  ordem INT NULL COMMENT 'Ordem do exercício no treino',
  
  FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,
  FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE RESTRICT,
  INDEX idx_treino_id (treino_id),
  INDEX idx_exercicio_id (exercicio_id),
  UNIQUE KEY uq_treino_exercicio (treino_id, exercicio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relacionamento entre treinos e exercícios';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. TABELA: HISTORICO_TREINO
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS historico_treino (
  id INT PRIMARY KEY AUTO_INCREMENT,
  aluno_id INT NOT NULL,
  treino_id INT NOT NULL,
  data_execucao DATE NOT NULL,
  tempo_total_minutos INT NULL,
  concluido BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE RESTRICT,
  INDEX idx_aluno_id (aluno_id),
  INDEX idx_data_execucao (data_execucao),
  INDEX idx_treino_id (treino_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Histórico de execução de treinos';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. TABELA: XP_HISTORICO
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS xp_historico (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  tipo_acao VARCHAR(50) NOT NULL COMMENT 'treino_completo, meta_atingida, etc',
  xp_ganho INT NOT NULL,
  descricao VARCHAR(255) NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_data_criacao (data_criacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rastreamento de XP ganho por ações';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. TABELA: STREAK
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS streak (
  id INT PRIMARY KEY AUTO_INCREMENT,
  aluno_id INT NOT NULL UNIQUE,
  dias_seguidos INT DEFAULT 0,
  recorde_pessoal INT DEFAULT 0,
  ultima_atualizacao DATE NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rastreamento de sequência de dias de treino';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. TABELA: METAS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS metas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  aluno_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NULL,
  tipo VARCHAR(50) NOT NULL COMMENT 'peso, repeticoes, gordura, etc',
  valor_inicial DECIMAL(8,2) NOT NULL,
  valor_alvo DECIMAL(8,2) NOT NULL,
  valor_atual DECIMAL(8,2) NULL,
  percentual_progresso INT DEFAULT 0 COMMENT 'Percentual 0-100',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_alvo DATE NULL,
  concluida BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_aluno_id (aluno_id),
  INDEX idx_concluida (concluida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Metas pessoais dos alunos';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. TABELA: FOTOS_PROGRESSO
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS fotos_progresso (
  id INT PRIMARY KEY AUTO_INCREMENT,
  aluno_id INT NOT NULL,
  tipo_foto ENUM('frente','costas','lateral') NULL,
  caminho_arquivo VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  peso_kg DECIMAL(5,2) NULL,
  data_foto DATE NOT NULL,
  data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_aluno_id (aluno_id),
  INDEX idx_data_foto (data_foto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Fotos de progresso - antes/depois';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. TABELA: EVOLUCAO_FISICA
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS evolucao_fisica (
  id INT PRIMARY KEY AUTO_INCREMENT,
  aluno_id INT NOT NULL,
  data_medicao DATE NOT NULL,
  peso_kg DECIMAL(5,2) NULL,
  altura_cm DECIMAL(5,2) NULL,
  imc DECIMAL(4,2) NULL COMMENT 'Índice de Massa Corporal',
  percentual_gordura DECIMAL(5,2) NULL,
  massa_magra_kg DECIMAL(5,2) NULL,
  peito_cm DECIMAL(5,2) NULL,
  cintura_cm DECIMAL(5,2) NULL,
  quadril_cm DECIMAL(5,2) NULL,
  braco_direito_cm DECIMAL(5,2) NULL,
  braco_esquerdo_cm DECIMAL(5,2) NULL,
  coxa_direita_cm DECIMAL(5,2) NULL,
  coxa_esquerda_cm DECIMAL(5,2) NULL,
  
  FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_aluno_id (aluno_id),
  INDEX idx_data_medicao (data_medicao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Dados de evolução física - medidas corporais';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. TABELA: FEEDBACKS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS feedbacks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  personal_id INT NOT NULL,
  aluno_id INT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo VARCHAR(50) NULL COMMENT 'elogio, correcao, motivacao, etc',
  lido BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (personal_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_aluno_id (aluno_id),
  INDEX idx_lido (lido),
  INDEX idx_personal_id (personal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Feedback do personal para alunos';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. TABELA: NUTRICAO_CONTEUDO
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS nutricao_conteudo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  personal_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  categoria ENUM('emagrecer','hipertrofia','performance') NOT NULL,
  imagem_url VARCHAR(255) NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (personal_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Dicas e orientações nutricionais';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 13. TABELA: DESAFIOS
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS desafios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  personal_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  icon VARCHAR(5) NULL COMMENT 'Emoji do desafio',
  xp_premio INT NOT NULL,
  dias_duracao INT NOT NULL,
  status ENUM('ativo','encerrado','planejado') DEFAULT 'ativo',
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  
  FOREIGN KEY (personal_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_status (status),
  INDEX idx_data_inicio (data_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Desafios da plataforma';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 14. TABELA: DESAFIO_PARTICIPACOES
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS desafio_participacoes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  desafio_id INT NOT NULL,
  aluno_id INT NOT NULL,
  concluido BOOLEAN DEFAULT FALSE,
  data_participacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_conclusao TIMESTAMP NULL,
  
  FOREIGN KEY (desafio_id) REFERENCES desafios(id) ON DELETE CASCADE,
  FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_desafio_aluno (desafio_id, aluno_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rastreamento de participação em desafios';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 15. TABELA: BADGES
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT NULL,
  icon VARCHAR(5) NULL COMMENT 'Emoji ou ícone',
  criterio VARCHAR(255) NOT NULL COMMENT 'Critério para ganhar',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Badges e conquistas disponíveis';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 16. TABELA: USUARIO_BADGES
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS usuario_badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  badge_id INT NOT NULL,
  data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
  UNIQUE KEY uq_usuario_badge (usuario_id, badge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Badges conquistados pelos usuários';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 17. TABELA: FREQUENCIA
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS frequencia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  aluno_id INT NOT NULL,
  semana_data DATE NOT NULL COMMENT 'Segunda-feira da semana',
  treinos_realizados INT DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (aluno_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_aluno_semana (aluno_id, semana_data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rastreamento de frequência por semana';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 18. TABELA: RANKING
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ranking (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  posicao INT NOT NULL,
  xp_semana INT DEFAULT 0,
  xp_total INT DEFAULT 0,
  periodo ENUM('semanal','mensal','geral') NOT NULL,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_usuario_periodo (usuario_id, periodo),
  INDEX idx_posicao_periodo (posicao, periodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rankings - Semanal, Mensal e Geral';