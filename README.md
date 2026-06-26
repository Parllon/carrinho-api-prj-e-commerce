# Carrinho de Compras API — ShirtStore

Microsserviço de carrinho de compras do projeto universitário **ShirtStore** (SENAC).

- **Responsável:** Parllon Mendonça
- **Porta:** `3030`
- **Stack:** NestJS 11 · TypeScript · Prisma 7 · MySQL · Docker

---

## Microsserviços do Grupo

| Porta | Serviço | Responsável |
|-------|---------|-------------|
| 3000 | API Gateway | Felipe |
| 3010 | Catálogo de Produtos | Fábio |
| 3020 | Pedidos e Pagamentos | Darley |
| **3030** | **Carrinho de Compras** | **Parllon** |
| 3040 | Usuários e Autenticação | Thales |
| 3050 | Avaliações e Comentários | Nikolas |

---

## Pré-requisitos

| Software | Versão mínima |
|----------|--------------|
| Node.js | 20+ |
| Git | qualquer |
| Docker Desktop | qualquer (opcional) |

```bash
# Verificar instalações
node -v
git --version
docker -v
```

---

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/Parllon/carrinho-api-prj-e-commerce.git
cd carrinho-api-prj-e-commerce
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz com o seguinte conteúdo (obtenha os valores com o Parllon):

```env
PORT=3030
NODE_ENV=development
DATABASE_URL="mysql://<usuario>:<senha>@edumysql.acesso.rj.senac.br:3306/<schema_parllon>"
JWT_SECRET=<jwt_secret_compartilhado_com_thales>
ALLOWED_ORIGINS=http://localhost:5173
```

> O arquivo `.env` nunca é commitado. Use `.env.example` como referência.

---

## Rodando o projeto

### Opção A — Sem Docker (desenvolvimento)

```bash
npm run start:dev
```

Aguarde: `Carrinho API rodando em http://localhost:3030`

### Opção B — Com Docker

Abra o **Docker Desktop** e aguarde a baleia aparecer na barra de tarefas.

**Build da imagem:**
```bash
docker build -t carrinho-api .
```

**Rodar o container (Linux/Mac):**
```bash
docker run -d --name carrinho-api -p 3030:3030 \
  -e PORT=3030 \
  -e NODE_ENV=production \
  -e DATABASE_URL=mysql://<usuario>:<senha>@edumysql.acesso.rj.senac.br:3306/<schema> \
  -e JWT_SECRET=<jwt_secret> \
  -e ALLOWED_ORIGINS=http://localhost:5173 \
  carrinho-api
```

**Rodar o container (Windows PowerShell):**
```powershell
docker run -d --name carrinho-api -p 3030:3030 `
  -e PORT=3030 `
  -e NODE_ENV=production `
  -e DATABASE_URL=mysql://<usuario>:<senha>@edumysql.acesso.rj.senac.br:3306/<schema> `
  -e JWT_SECRET=<jwt_secret> `
  -e ALLOWED_ORIGINS=http://localhost:5173 `
  carrinho-api
```

**Verificar logs:**
```bash
docker logs carrinho-api
```

**Parar e remover o container:**
```bash
docker stop carrinho-api
docker rm carrinho-api
```

> **Atenção:** não use `--env-file .env` diretamente com esse arquivo — o Docker não remove as aspas dos valores e a conexão falha. Passe as variáveis com `-e KEY=VALUE` conforme os comandos acima.

---

## Endpoints

Swagger disponível em: **`http://localhost:3030/api`**

| Método | Path | Autenticação | Descrição |
|--------|------|:---:|-----------|
| GET | `/carrinho` | ✅ | Retorna o carrinho do usuário (cria se não existir) |
| POST | `/carrinho/itens` | ✅ | Adiciona item ao carrinho |
| PATCH | `/carrinho/itens/:id` | ✅ | Atualiza quantidade do item |
| DELETE | `/carrinho/itens/:id` | ✅ | Remove item específico |
| DELETE | `/carrinho` | ✅ | Esvazia o carrinho |

Todos os endpoints requerem header:
```
Authorization: Bearer <token_jwt>
```

### Exemplo — Adicionar item

**POST** `/carrinho/itens`

```json
{
  "produto_id": "1",
  "nome": "Flamengo Home 2025",
  "preco": 349.90,
  "quantidade": 1
}
```

---

## Testando com Swagger

1. Acesse **`http://localhost:3030/api`**
2. Gere um token JWT de teste em **jwt.io** → aba **JWT Encoder**:
   - Payload: `{ "sub": "qualquer-uuid", "email": "teste@email.com", "role": "user" }`
   - Secret: `<jwt_secret>` com toggle **BASE64URL ENCODED desligado**
3. Clique em **Authorize** → cole `Bearer <token>` → **Authorize**
4. Teste os endpoints na ordem: `GET /carrinho` → `POST /carrinho/itens` → `GET /carrinho`

---

## Banco de Dados

O schema é gerenciado pelo professor da faculdade no servidor MySQL do SENAC (`edumysql.acesso.rj.senac.br`).

**Principais tabelas usadas:**

| Tabela | Descrição |
|--------|-----------|
| `carrinho` | Um carrinho por usuário (status ATIVO) |
| `item_carrinho` | Itens do carrinho com produto e quantidade |
| `produto` | Cache local de produtos do catálogo |
| `usuario` | Cache local de usuários do auth |
| `status_carrinho` | Lookup de status (ATIVO, etc.) |

Após alterar o `schema.prisma`, regenere o client:
```bash
npx prisma generate
```

---

## Registro no Gateway (Felipe)

Após subir o backend, pedir ao Felipe para registrar as rotas no banco do gateway:

| Método | Path | Target URL | Auth |
|--------|------|-----------|------|
| GET | `/carrinho` | `http://localhost:3030/carrinho` | true |
| POST | `/carrinho/itens` | `http://localhost:3030/carrinho/itens` | true |
| PATCH | `/carrinho/itens/:id` | `http://localhost:3030/carrinho/itens` | true |
| DELETE | `/carrinho/itens/:id` | `http://localhost:3030/carrinho/itens` | true |
| DELETE | `/carrinho` | `http://localhost:3030/carrinho` | true |

---

## Solução de Problemas

**Porta 3030 já em uso:**
```bash
# Windows
netstat -ano | findstr :3030
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3030
kill -9 <PID>
```

**Erro de conexão com o banco:**
- Confirme que está conectado à rede da faculdade ou VPN do SENAC
- Verifique se o `DATABASE_URL` está correto (sem aspas extras nas variáveis de ambiente)

**Container reiniciando em loop:**
```bash
docker logs carrinho-api   # ver o erro
docker rm -f carrinho-api  # remover e tentar novamente
```

**Prisma: tabelas não encontradas:**
```bash
npx prisma db pull    # lê o schema atual do banco
npx prisma generate   # regenera o client
```
