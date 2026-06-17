# API REST - Endpoints de Orçamentos Mensais (Budgets CRUD)

Todos os endpoints de orçamentos exigem autenticação do usuário. O token JWT retornado no login deve ser enviado no cabeçalho `Authorization`.

## Autenticação Obrigatória
```http
Authorization: Bearer <token_jwt>
```

---

## Estrutura do Recurso e Restrições:
* **date**: O orçamento é mensal. No banco de dados, para compatibilidade com o tipo `date` do Rails, a data deve ser salva sempre correspondendo ao **dia 1 do mês** correspondente (por exemplo, o orçamento de Junho de 2026 é salvo como `2026-06-01`).
* **Regra de Unicidade**: Cada usuário pode ter **no máximo um orçamento registrado por mês**. Tentativas de criar um orçamento para um mês que já possui registro devem retornar erro de validação (recomenda-se atualizar o existente via `PUT/PATCH` ou usar um fluxo de UPSERT).

---

## 1. Listar Orçamentos (Index)
Retorna o histórico de orçamentos mensais do usuário autenticado.

* **Método:** `GET`
* **Rota:** `/api/v1/budgets`

### Exemplo de Resposta (200 OK)
```json
[
  {
    "id": 1,
    "date": "2026-05-01",
    "amount": "4500.00",
    "created_at": "2026-05-01T08:00:00.000Z",
    "updated_at": "2026-05-01T08:00:00.000Z"
  },
  {
    "id": 2,
    "date": "2026-06-01",
    "amount": "5000.00",
    "created_at": "2026-06-01T09:15:00.000Z",
    "updated_at": "2026-06-01T09:15:00.000Z"
  }
]
```

---

## 2. Criar Orçamento (Create)
Registra o orçamento planejado para um determinado mês.

* **Método:** `POST`
* **Rota:** `/api/v1/budgets`
* **Payload (JSON):**
```json
{
  "date": "2026-07-01",
  "amount": 5500.00
}
```

### Regras de Validação:
* `date`: Obrigatório. Deve ser formatado como a data de início do mês (`YYYY-MM-01`).
* `amount`: Obrigatório. Deve ser maior que 0.
* **Unicidade**: O par `[usuário, date]` deve ser único na tabela de orçamentos.

### Exemplo de Resposta de Sucesso (201 Created)
```json
{
  "id": 3,
  "date": "2026-07-01",
  "amount": "5500.00",
  "created_at": "2026-06-17T01:12:00.000Z",
  "updated_at": "2026-06-17T01:12:00.000Z"
}
```

### Exemplo de Resposta de Erro por Duplicidade (422 Unprocessable Entity)
```json
{
  "error": "Date has already been taken for this user"
}
```

---

## 3. Mostrar Orçamento (Show)
Busca detalhes de um orçamento mensal específico.

* **Método:** `GET`
* **Rota:** `/api/v1/budgets/:id`

### Exemplo de Resposta (200 OK)
```json
{
  "id": 2,
  "date": "2026-06-01",
  "amount": "5000.00"
}
```

---

## 4. Atualizar Orçamento (Update)
Modifica o valor do limite do orçamento para um mês correspondente.

* **Método:** `PUT` ou `PATCH`
* **Rota:** `/api/v1/budgets/:id`
* **Payload (JSON):**
```json
{
  "amount": 5200.00
}
```

### Exemplo de Resposta (200 OK)
```json
{
  "id": 2,
  "date": "2026-06-01",
  "amount": "5200.00",
  "updated_at": "2026-06-17T01:14:00.000Z"
}
```

---

## 5. Deletar Orçamento (Destroy)
Remove o planejamento do orçamento de um mês.

* **Método:** `DELETE`
* **Rota:** `/api/v1/budgets/:id`

### Exemplo de Resposta (204 No Content)
* Sem corpo de resposta.
