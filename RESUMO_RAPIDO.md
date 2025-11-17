# 📋 Resumo Rápido - Deploy Vercel + Supabase

## ⚡ Passos Essenciais

### 1️⃣ Supabase (5 minutos)
1. Criar projeto em [supabase.com](https://supabase.com)
2. Copiar **Project URL** e **anon key** (Settings → API)
3. Executar o SQL do arquivo `SUPABASE_SETUP.sql` no SQL Editor

### 2️⃣ Projeto Local (2 minutos)
```bash
npm install
```
Criar arquivo `.env.local`:
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_key_aqui
```

### 3️⃣ Atualizar Código
- O arquivo `lib/supabase.ts` já está criado ✅
- Atualize `hooks/useCondoData.ts` usando o exemplo em `hooks/useCondoData.supabase.example.ts`

### 4️⃣ Vercel (3 minutos)
1. Fazer push do código para GitHub
2. Importar projeto no [vercel.com](https://vercel.com)
3. Adicionar variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

---

## 📁 Arquivos Criados

- ✅ `DEPLOY_GUIDE.md` - Guia completo detalhado
- ✅ `SUPABASE_SETUP.sql` - Script SQL para criar tabelas
- ✅ `lib/supabase.ts` - Cliente Supabase
- ✅ `vercel.json` - Configuração do Vercel
- ✅ `hooks/useCondoData.supabase.example.ts` - Exemplo de integração

## ⚠️ Próximos Passos

1. **Instalar dependência**: `npm install`
2. **Configurar Supabase**: Seguir PARTE 1 do `DEPLOY_GUIDE.md`
3. **Atualizar hook**: Substituir `useCondoData.ts` pelo exemplo fornecido
4. **Testar localmente**: `npm run dev`
5. **Fazer deploy**: Seguir PARTE 3 do `DEPLOY_GUIDE.md`

---

**Dúvidas?** Consulte o `DEPLOY_GUIDE.md` para instruções detalhadas!

