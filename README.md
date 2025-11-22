# CondoManager Pro

Sistema web de gestão de condomínios, voltado para administradoras e sándicos que desejam modernizar e automatizar processos do dia a dia.

## Funcionalidades Principais

- Gerenciamento de usuários (moradores, sándicos, administradores)
- Cadastro e controle de unidades, blocos, áreas comuns
- Painel administrativo para controle financeiro
- Sistema seguro de autenticação com criptografia de senhas (bcrypt)
- Telas de login separadas para administradores e moradores
- Migração automática de senhas antigas para padrões mais seguros
- Cadastro, edição e exclusão de usuários via interface web
- Validação completa de dados cadastrais
- Integração com backend para persistência dos dados via Supabase

## Segurança

- Senhas protegidas por hash usando bcryptjs
- Confirmação obrigatória de senha na troca e cadastro
- Política preventiva contra duplicidade de hash
- Remoção de credenciais padrão em produção
- Suporte a upgrades automatizados para autenticação multifator e rate limiting (recomendado para produção)

## Instalação Local

**Pré-requisitos:**  
- Node.js  
- Conta Supabase configurada

**Instruções:**

1. Clone este repositório:
   ```bash
   git clone https://github.com/cmsinformatica/condomanager-pro.git
   cd condomanager-pro
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env.local` com as variáveis (exemplo de conexão Supabase):
   ```
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```

4. Execute o sistema em modo desenvolvimento:
   ```bash
   npm run dev
   ```

## Deploy

O sistema pode ser publicado facilmente em plataformas como Vercel, Netlify ou servidores Node convencionais. Garanta sempre HTTPS e variáveis seguras no ambiente!

## Contribua

1. Faça um fork do projeto
2. Crie sua branch: `git checkout -b minha-feature`
3. Submeta suas mudanças: `git commit -am 'minha feature'`
4. Envie sua branch: `git push origin minha-feature`
5. Abra um Pull Request

## Licença

Projeto sob licença MIT.
