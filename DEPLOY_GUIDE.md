# 🚀 Guia de Deploy - CondoManager Pro

## Passo a Passo para Deploy no Vercel com Supabase

### 📋 Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Node.js instalado localmente
- Git instalado

---

## PARTE 1: Configuração do Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em **"New Project"**
4. Preencha:
   - **Name**: `condomanager-pro` (ou o nome que preferir)
   - **Database Password**: Anote esta senha! Você precisará dela depois
   - **Region**: Escolha a região mais próxima (ex: `South America (São Paulo)`)
5. Clique em **"Create new project"** e aguarde a criação (pode levar alguns minutos)

### 1.2 Obter Credenciais do Supabase

1. No dashboard do Supabase, vá em **Settings** → **API**
2. Anote as seguintes informações:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (chave pública)
   - **service_role** key (chave privada - mantenha segura!)

### 1.3 Criar Tabelas no Supabase

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **"New query"**
3. Cole o seguinte SQL e execute:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Administrador', 'Morador')),
  apartment_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de moradores
CREATE TABLE residents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_name TEXT NOT NULL,
  tenant_name TEXT,
  apartment_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de pagamentos
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_number INTEGER NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de despesas
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir leitura/escrita pública (ajuste conforme necessário)
CREATE POLICY "Allow all operations for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for residents" ON residents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- Inserir dados iniciais
INSERT INTO users (name, email, role) VALUES 
  ('Usuário Administrador', 'admin@condo.com', 'Administrador'),
  ('Alice Silva', 'alice@email.com', 'Morador', 1);

INSERT INTO residents (owner_name, apartment_number, tenant_name) VALUES 
  ('Alice Silva', 1, 'João da Silva'),
  ('Roberto Souza', 2, NULL);

INSERT INTO payments (apartment_number, amount, date, month, year) VALUES 
  (1, 500.00, NOW() - INTERVAL '1 month', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
  (2, 500.00, NOW() - INTERVAL '1 month', EXTRACT(MONTH FROM NOW()), EXTRACT(YEAR FROM NOW())),
  (1, 500.00, NOW(), EXTRACT(MONTH FROM NOW()) + 1, EXTRACT(YEAR FROM NOW()));

INSERT INTO expenses (description, amount, category, date) VALUES 
  ('Manutenção do Jardim', 350.00, 'Jardinagem', NOW()),
  ('Eletricidade do Hall', 600.00, 'Eletricidade', NOW());
```

4. Clique em **"Run"** para executar o SQL

---

## PARTE 2: Configuração do Projeto Local

### 2.1 Instalar Dependências do Supabase

No terminal, na raiz do projeto, execute:

```bash
npm install @supabase/supabase-js
```

### 2.2 Criar Arquivo de Configuração do Supabase

Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=sua_project_url_aqui
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

**⚠️ IMPORTANTE**: Substitua pelos valores reais obtidos no passo 1.2

### 2.3 Criar Cliente Supabase

Crie o arquivo `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2.4 Atualizar o Hook useCondoData

O hook `hooks/useCondoData.ts` precisa ser atualizado para usar Supabase ao invés de localStorage. (Veja arquivo de exemplo no projeto)

---

## PARTE 3: Deploy no Vercel

### 3.1 Preparar o Projeto

1. Certifique-se de que o projeto está funcionando localmente:
   ```bash
   npm install
   npm run build
   ```

2. Verifique se o arquivo `vercel.json` existe (se não existir, será criado automaticamente)

### 3.2 Criar Arquivo vercel.json (Opcional)

Crie `vercel.json` na raiz do projeto:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3.3 Fazer Commit e Push para Git

1. Inicialize o Git (se ainda não tiver):
   ```bash
   git init
   git add .
   git commit -m "Preparar para deploy no Vercel"
   ```

2. Crie um repositório no GitHub/GitLab/Bitbucket

3. Faça push:
   ```bash
   git remote add origin URL_DO_SEU_REPOSITORIO
   git push -u origin main
   ```

### 3.4 Deploy no Vercel

1. Acesse [https://vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub/GitLab/Bitbucket
3. Clique em **"Add New Project"**
4. Importe o repositório do seu projeto
5. Configure o projeto:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **IMPORTANTE**: Adicione as variáveis de ambiente:
   - Clique em **"Environment Variables"**
   - Adicione:
     - `VITE_SUPABASE_URL` = sua URL do Supabase
     - `VITE_SUPABASE_ANON_KEY` = sua chave anon do Supabase
7. Clique em **"Deploy"**

### 3.5 Verificar Deploy

1. Aguarde o deploy finalizar (geralmente 2-3 minutos)
2. Acesse a URL fornecida pelo Vercel
3. Teste a aplicação

---

## PARTE 4: Configurações Adicionais

### 4.1 Domínio Customizado (Opcional)

1. No dashboard do Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio customizado
3. Siga as instruções para configurar DNS

### 4.2 Atualizar Políticas de Segurança do Supabase

Para produção, é recomendado ajustar as políticas RLS do Supabase:

1. No Supabase, vá em **Authentication** → **Policies**
2. Revise e ajuste as políticas conforme sua necessidade de segurança
3. Considere implementar autenticação real ao invés de login hardcoded

---

## 🔧 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se as variáveis de ambiente estão configuradas no Vercel
- Certifique-se de que os nomes das variáveis começam com `VITE_`

### Erro: "Failed to fetch"
- Verifique se as políticas RLS estão configuradas corretamente
- Verifique se a URL e a chave do Supabase estão corretas

### Build falha no Vercel
- Verifique os logs de build no dashboard do Vercel
- Certifique-se de que todas as dependências estão no `package.json`

---

## 📝 Checklist Final

- [ ] Projeto criado no Supabase
- [ ] Tabelas criadas no Supabase
- [ ] Dependência `@supabase/supabase-js` instalada
- [ ] Arquivo `.env.local` criado com credenciais
- [ ] Cliente Supabase configurado
- [ ] Hook `useCondoData` atualizado para usar Supabase
- [ ] Projeto testado localmente
- [ ] Código commitado e enviado para Git
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy realizado com sucesso
- [ ] Aplicação testada em produção

---

## 🎉 Pronto!

Sua aplicação está no ar! Qualquer atualização no repositório Git irá gerar um novo deploy automaticamente no Vercel.

