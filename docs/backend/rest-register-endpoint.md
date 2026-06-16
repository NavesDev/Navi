# Cadastro de Usuário (`POST /api/v1/auth/register`) 🌌

Este endpoint permite a criação de novas contas no sistema **Navi**.

---

## 🛣️ Detalhes do Endpoint

* **URL**: `/api/v1/auth/register`
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

---

## 🔒 Regras de Validação do Usuário

* **Username**:
  * É de preenchimento obrigatório e deve ser exclusivo no sistema.
  * Comprimento: Mínimo de **3** e máximo de **30** caracteres.
  * Caracteres permitidos: Apenas letras, números e *underschores* (`_`) (regex: `/\A[a-zA-Z0-9_]+\z/`).
* **Password**:
  * É de preenchimento obrigatório e é criptografada e armazenada utilizando **BCrypt**.

---

## 📤 Respostas da API

### Sucesso (201 Created)
Retorna os dados básicos do usuário criado e o token JWT correspondente para autenticar a sessão imediatamente.
```json
{
  "user": {
    "id": 1,
    "username": "usuario_exemplo"
  },
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### Erro de Validação (422 Unprocessable Entity)
Retorna os erros de validação encontrados no modelo.
```json
{
  "error": "Username has already been taken, Username is too short (minimum is 3 characters)"
}
```

---

## 🚦 Controle de Vazão (Rate Limiting)

Para evitar spams e criação em massa de contas a partir do mesmo dispositivo:
* **Regra por IP**: Máximo de **5 requisições de cadastro por minuto** por endereço IP.
* **Status de Excesso (429 Too Many Requests)**:
  ```json
  {
    "error": "Rate limit exceeded. Try again in 60 seconds.",
    "retry_after": 60
  }
  ```

---

## 📱 Guia de Integração no App Mobile (Cadastro)

Ao registrar um novo usuário:
1. O aplicativo deve coletar o `username` e `password`.
2. Enviar a requisição para `/api/v1/auth/register`.
3. No sucesso, salvar o `token` e `username` retornados utilizando um armazenamento seguro (como **`expo-secure-store`**):
   ```typescript
   import * as SecureStore from 'expo-secure-store';

   async function saveSession(token: string, username: string) {
     await SecureStore.setItemAsync('user_session_token', token);
     await SecureStore.setItemAsync('user_username', username);
   }
   ```
