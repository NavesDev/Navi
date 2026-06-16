# Autenticação e Perfil do Usuário (`POST /login` & `GET /me`) 🌌

Estes endpoints gerenciam o fluxo de login e validação de sessão ativa no sistema **Navi**.

---

## 🔑 Visão Geral da Autenticação

A autenticação é baseada em **JSON Web Tokens (JWT)**.
* Ao fazer o login com sucesso, o cliente recebe um `token` JWT.
* O cliente deve enviar o token recebido em todas as requisições autenticadas subsequentes dentro do header HTTP:
  ```http
  Authorization: Bearer <seu_token_jwt>
  ```
* O token possui validade padrão de **24 horas**.

---

## 🛣️ Detalhes dos Endpoints

### 1. Login de Usuário (`POST /api/v1/auth/login`)

Autentica as credenciais do usuário.

* **URL**: `/api/v1/auth/login`
* **Método**: `POST`
* **Headers obrigatórios**: 
  - `Content-Type: application/json`
* **Payload (Body)**:
  ```json
  {
    "username": "usuario_exemplo",
    "password": "senha_segura_123"
  }
  ```

#### Resposta de Sucesso (200 OK):
```json
{
  "user": {
    "id": 1,
    "username": "usuario_exemplo"
  },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

#### Resposta de Credenciais Inválidas (401 Unauthorized):
```json
{
  "error": "Invalid username or password"
}
```

---

### 2. Dados do Usuário Autenticado (`GET /api/v1/auth/me`)

Retorna os dados do usuário atualmente autenticado a partir do token enviado.

* **URL**: `/api/v1/auth/me`
* **Método**: `GET`
* **Headers obrigatórios**:
  - `Authorization: Bearer <token_jwt>`

#### Resposta de Sucesso (200 OK):
```json
{
  "id": 1,
  "username": "usuario_exemplo"
}
```

#### Resposta Não Autorizada (401 Unauthorized):
```json
{
  "error": "Unauthorized"
}
```

---

## 🚦 Controle de Vazão (Rate Limiting)

Para mitigar tentativas de força bruta e abusos:
1. **Limite por IP**: Máximo de **5 requisições de login por minuto** vindas do mesmo IP.
2. **Limite por Usuário**: Máximo de **5 tentativas de login por minuto** no mesmo `username` (previne ataques distribuídos a contas específicas).

### Resposta de Excesso (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded. Try again in 60 seconds.",
  "retry_after": 60
}
```

---

## 📱 Guia de Integração no App Mobile (Login)

### 1. Fluxo de Sessão
Após receber o token de login:
* Salve-o de maneira segura (por exemplo, com **`expo-secure-store`**):
  ```typescript
  import * as SecureStore from 'expo-secure-store';

  async function saveSession(token: string, username: string) {
    await SecureStore.setItemAsync('user_session_token', token);
    await SecureStore.setItemAsync('user_username', username);
  }
  ```

### 2. Requisições Autenticadas
Toda chamada que exige login deve anexar o token JWT no cabeçalho:
```typescript
const token = await SecureStore.getItemAsync('user_session_token');
const response = await fetch('http://localhost:3000/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. Tratamento do Erro 429
Ao receber um erro `429 Too Many Requests`, o app deve alertar o usuário de forma amigável e, preferencialmente, desabilitar o botão de login pelo tempo especificado em `retry_after`.
