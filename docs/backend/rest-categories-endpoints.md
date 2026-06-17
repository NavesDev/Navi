# API REST - Endpoints de Categorias de Gasto (Categories CRUD)

Todos os endpoints de categorias exigem autenticação do usuário. O token JWT retornado no login deve ser enviado no cabeçalho `Authorization`.

## Autenticação Obrigatória
```http
Authorization: Bearer <token_jwt>
```

---

## 1. Listar Categorias (Index)
Retorna todas as categorias de gasto pertencentes ao usuário autenticado.

* **Método:** `GET`
* **Rota:** `/api/v1/categories`

### Exemplo de Resposta (200 OK)
```json
[
  {
    "id": 1,
    "name": "Alimentação",
    "icon": "fastfood",
    "created_at": "2026-06-17T01:30:00.000Z",
    "updated_at": "2026-06-17T01:30:00.000Z"
  },
  {
    "id": 2,
    "name": "Transporte",
    "icon": "directions-car",
    "created_at": "2026-06-17T01:32:00.000Z",
    "updated_at": "2026-06-17T01:32:00.000Z"
  }
]
```

---

## 2. Criar Categoria (Create)
Registra uma nova categoria customizada para o usuário autenticado.

* **Método:** `POST`
* **Rota:** `/api/v1/categories`
* **Payload (JSON):**
```json
{
  "name": "Lazer",
  "icon": "movie"
}
```

### Regras de Validação:
* `name`: Obrigatório. String não vazia. Única por usuário.
* `icon`: Obrigatório. Slug identificando o ícone do Material Icons (ex: "local-bar", "flight", "shopping-cart").

### Exemplo de Resposta de Sucesso (201 Created)
```json
{
  "id": 3,
  "name": "Lazer",
  "icon": "movie",
  "created_at": "2026-06-17T01:45:00.000Z",
  "updated_at": "2026-06-17T01:45:00.000Z"
}
```

---

## 3. Mostrar Categoria (Show)
Busca detalhes de uma categoria específica.

* **Método:** `GET`
* **Rota:** `/api/v1/categories/:id`

### Exemplo de Resposta (200 OK)
```json
{
  "id": 1,
  "name": "Alimentação",
  "icon": "fastfood"
}
```

### Erros Possíveis:
* **404 Not Found**: Caso o ID não exista ou pertença a outro usuário.

---

## 4. Atualizar Categoria (Update)
Modifica o nome ou o ícone da categoria do usuário.

* **Método:** `PUT` ou `PATCH`
* **Rota:** `/api/v1/categories/:id`
* **Payload (JSON):**
```json
{
  "name": "Supermercado & Restaurantes",
  "icon": "restaurant"
}
```

### Exemplo de Resposta (200 OK)
```json
{
  "id": 1,
  "name": "Supermercado & Restaurantes",
  "icon": "restaurant",
  "created_at": "2026-06-17T01:30:00.000Z",
  "updated_at": "2026-06-17T01:50:00.000Z"
}
```

---

## 5. Deletar Categoria (Destroy)
Remove a categoria do usuário.

* **Método:** `DELETE`
* **Rota:** `/api/v1/categories/:id`

### Exemplo de Resposta (204 No Content)
* Sem corpo de resposta.
