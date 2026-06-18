# API REST - Endpoints de Orçamentos por Categoria (Category Budgets CRUD)

Todos os endpoints de orçamentos por categoria exigem autenticação do usuário. O token JWT retornado no login deve ser enviado no cabeçalho `Authorization`.

## Autenticação Obrigatória
```http
Authorization: Bearer <token_jwt>
```

---

## Estrutura do Recurso e Restrições:
* **date**: O orçamento por categoria é mensal. No banco de dados, para compatibilidade com o tipo `date` do Rails, a data deve ser salva sempre correspondendo ao **dia 1 do mês** correspondente (por exemplo, o orçamento de Junho de 2026 é salvo como `2026-06-01`).
* **Regra de Unicidade**: Cada usuário pode ter **no máximo uma meta registrada para cada categoria por mês**. Tentativas de criar duplicatas devem retornar erro de validação (recomenda-se atualizar o existente via `PUT/PATCH`).
* **Restrição de Exclusão**: Para evitar dados órfãos e inconsistência na UI, uma categoria que possua metas de orçamento vinculadas **não pode ser excluída**. O Rails adicionará erros ao modelo de categoria impedindo a exclusão física (`dependent: :restrict_with_error`).
* **Limite do Orçamento Total**: A soma de todas as metas de categorias (`category_budgets`) de um usuário para um determinado mês **não pode ultrapassar o orçamento total mensal** (`budget`) definido para o mesmo mês. Se não houver orçamento mensal total configurado para o mês desejado, o cadastro de metas de categoria é bloqueado até que o orçamento total seja definido.

---

## 1. Listar Metas por Categoria (Index)
Retorna o histórico de metas de gasto por categoria do usuário autenticado. Pode ser filtrado por uma data específica para buscar apenas o planejamento de um mês correspondente.

* **Método:** `GET`
* **Rota:** `/api/v1/category_budgets`
* **Parâmetros Opcionais:** `date=YYYY-MM-DD` (ex: `date=2026-06-18` - o backend normalizará para buscar o mês de Junho/2026)

### Exemplo de Resposta (200 OK)
```json
[
  {
    "id": 1,
    "user_id": 10,
    "category_id": 3,
    "amount": "800.00",
    "date": "2026-06-01",
    "created_at": "2026-06-18T02:00:00.000Z",
    "updated_at": "2026-06-18T02:00:00.000Z",
    "category": {
      "id": 3,
      "name": "Alimentação",
      "icon": "fastfood",
      "slug": "alimentacao"
    }
  },
  {
    "id": 2,
    "user_id": 10,
    "category_id": 5,
    "amount": "300.00",
    "date": "2026-06-01",
    "created_at": "2026-06-18T02:05:00.000Z",
    "updated_at": "2026-06-18T02:05:00.000Z",
    "category": {
      "id": 5,
      "name": "Transporte",
      "icon": "directions-car",
      "slug": "transporte"
    }
  }
]
```

---

## 2. Criar Meta por Categoria (Create)
Registra o limite de orçamento de uma categoria específica para o mês da data enviada.

* **Método:** `POST`
* **Rota:** `/api/v1/category_budgets`
* **Payload (JSON):**
```json
{
  "category_budget": {
    "category_id": 3,
    "amount": 950.00,
    "date": "2026-06-18"
  }
}
```

### Regras de Validação:
* `category_id`: Obrigatório. Deve ser uma categoria pertencente ao usuário.
* `date`: Obrigatório. O backend converterá para o dia 1 do mês informado (`YYYY-MM-01`).
* `amount`: Obrigatório. Deve ser maior que 0.
* **Unicidade**: O conjunto `[user_id, category_id, date]` deve ser único.
* **Consistência de Orçamento**:
  - Deve existir um Orçamento Total Mensal (`Budget`) registrado para o mês correspondente.
  - A soma do `amount` desta meta com as demais metas de categoria do mesmo mês **não pode ser maior** que o valor do Orçamento Total Mensal daquele mês. Caso contrário, o registro é bloqueado com erro 422.

### Exemplo de Resposta de Sucesso (201 Created)
```json
{
  "id": 3,
  "user_id": 10,
  "category_id": 3,
  "amount": "950.00",
  "date": "2026-06-01",
  "created_at": "2026-06-18T02:10:00.000Z",
  "updated_at": "2026-06-18T02:10:00.000Z",
  "category": {
    "id": 3,
    "name": "Alimentação",
    "icon": "fastfood",
    "slug": "alimentacao"
  }
}
```

### Exemplo de Resposta de Erro por Duplicidade (422 Unprocessable Entity)
```json
{
  "errors": [
    "Category já possui uma meta definida para este mês"
  ]
}
```

---

## 3. Atualizar Meta por Categoria (Update)
Modifica o valor do limite estipulado para a categoria no mês associado.

* **Método:** `PUT` ou `PATCH`
* **Rota:** `/api/v1/category_budgets/:id`
* **Payload (JSON):**
```json
{
  "category_budget": {
    "amount": 1100.00
  }
}
```

### Exemplo de Resposta (200 OK)
```json
{
  "id": 3,
  "user_id": 10,
  "category_id": 3,
  "amount": "1100.00",
  "date": "2026-06-01",
  "created_at": "2026-06-18T02:10:00.000Z",
  "updated_at": "2026-06-18T02:11:00.000Z",
  "category": {
    "id": 3,
    "name": "Alimentação",
    "icon": "fastfood",
    "slug": "alimentacao"
  }
}
```

---

## 4. Deletar Meta por Categoria (Destroy)
Remove a meta de orçamento da categoria correspondente.

* **Método:** `DELETE`
* **Rota:** `/api/v1/category_budgets/:id`

### Exemplo de Resposta (204 No Content)
* Sem corpo de resposta.

---

## 5. Alertas Visuais no Frontend (Dashboard)

Com os dados de metas mensais por categoria retornados no endpoint `GET /api/v1/category_budgets?date=YYYY-MM-DD`, o frontend calculará a saúde financeira da categoria da seguinte forma:

1. **Cálculo de Consumo:**
   * Soma-se o valor de todas as despesas (`expenses`) da categoria `X` no mês ativo.
   * Divide-se pelo `amount` da meta correspondente para obter o percentual: `(Total Gasto / Meta) * 100`.

2. **Indicadores de Status Visual na UI:**
   * **Até 79%**: Barra de progresso segura (Verde/Ciano com cor do tema `theme.colors.primary`).
   * **80% a 99%**: Barra de progresso em alerta (Laranja/Amarelo com a cor `#FFA726`).
   * **100% ou mais**: Barra de progresso estourada (Vermelho com a cor `#FF6B6B`), exibindo um badge de limite excedido.
