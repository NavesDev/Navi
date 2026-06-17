# API REST - Endpoints de Gastos (Expenses CRUD)

Todos os endpoints de gastos exigem autenticação do usuário. O token JWT retornado no login deve ser enviado no cabeçalho `Authorization`.

## Autenticação Obrigatória
```http
Authorization: Bearer <token_jwt>
```

---

## 1. Listar Gastos (Index)
Retorna todos os gastos pertencentes ao usuário autenticado.

* **Método:** `GET`
* **Rota:** `/api/v1/expenses`
* **Parâmetros de Query (Opcionais para filtro):**
  * `category`: Filtra por categoria de gasto.
  * `start_date`: Filtra gastos a partir desta data (Formato: `YYYY-MM-DD`).
  * `end_date`: Filtra gastos até esta data (Formato: `YYYY-MM-DD`).

### Exemplo de Resposta (200 OK)
```json
[
  {
    "id": 1,
    "date": "2026-06-15",
    "category": "Alimentação",
    "description": "Jantar restaurante",
    "amount": "85.50",
    "created_at": "2026-06-15T20:30:00.000Z",
    "updated_at": "2026-06-15T20:30:00.000Z"
  },
  {
    "id": 2,
    "date": "2026-06-16",
    "category": "Transporte",
    "description": "Corrida de aplicativo",
    "amount": "22.90",
    "created_at": "2026-06-16T10:15:00.000Z",
    "updated_at": "2026-06-16T10:15:00.000Z"
  }
]
```

---

## 2. Criar Gasto (Create)
Registra um novo gasto para o usuário autenticado.

* **Método:** `POST`
* **Rota:** `/api/v1/expenses`
* **Payload (JSON):**
```json
{
  "date": "2026-06-16",
  "category": "Alimentação",
  "description": "Supermercado do mês",
  "amount": 350.75
}
```

### Regras de Validação:
* `date`: Obrigatório. Formato de data válido (`YYYY-MM-DD`).
* `category`: Obrigatório. String (não vazia).
* `amount`: Obrigatório. Deve ser maior que 0.

### Exemplo de Resposta de Sucesso (201 Created)
```json
{
  "id": 3,
  "date": "2026-06-16",
  "category": "Alimentação",
  "description": "Supermercado do mês",
  "amount": "350.75",
  "created_at": "2026-06-17T01:10:00.000Z",
  "updated_at": "2026-06-17T01:10:00.000Z"
}
```

---

## 3. Mostrar Gasto (Show)
Busca um gasto específico do usuário.

* **Método:** `GET`
* **Rota:** `/api/v1/expenses/:id`

### Exemplo de Resposta (200 OK)
```json
{
  "id": 1,
  "date": "2026-06-15",
  "category": "Alimentação",
  "description": "Jantar restaurante",
  "amount": "85.50"
}
```

### Erros Possíveis:
* **404 Not Found**: Caso o ID não exista ou não pertença ao usuário logado.

---

## 4. Atualizar Gasto (Update)
Modifica um ou mais campos de um gasto existente.

* **Método:** `PUT` ou `PATCH`
* **Rota:** `/api/v1/expenses/:id`
* **Payload (JSON - todos os campos são opcionais):**
```json
{
  "amount": 95.00,
  "description": "Jantar restaurante (com sobremesa)"
}
```

### Exemplo de Resposta (200 OK)
```json
{
  "id": 1,
  "date": "2026-06-15",
  "category": "Alimentação",
  "description": "Jantar restaurante (com sobremesa)",
  "amount": "95.00"
}
```

---

## 5. Deletar Gasto (Destroy)
Exclui permanentemente um gasto.

* **Método:** `DELETE`
* **Rota:** `/api/v1/expenses/:id`

### Exemplo de Resposta (204 No Content)
* Sem corpo de resposta.
