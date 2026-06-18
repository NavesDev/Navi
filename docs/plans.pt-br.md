# Planos de Assinatura e Limites - Navi

Este documento detalha os diferentes planos de assinatura do **Navi**, os limites associados a cada um deles e as diretrizes recomendadas para a implementação das validações de limites na API e no aplicativo móvel.

---

## 1. Tabela Comparativa de Planos

| Recurso / Limite | Plano Trial | Plano Essential | Plano Advance |
| :--- | :--- | :--- | :--- |
| **Chamadas ao Chat (p/ dia)** | 7 chamadas | 20 chamadas | 100 chamadas |
| **Categorias Máximas** | Até 3 categorias | Até 16 categorias | Até 60 categorias |
| **Gastos Cadastrados (p/ dia)** | Até 2 gastos | Ilimitado | Ilimitado |
| **Preço Base sugerido** | Gratuito | R$ 14,90/mês | R$ 29,90/mês |

---

## 2. Detalhamento dos Planos

### 🧪 Plano Trial (Experimentação)
Focado em novos usuários que desejam testar a experiência básica e interações de inteligência artificial do Navi.
* **Inteligência Artificial**: Limite estrito de **7 chamadas diárias** ao endpoint de chat/processamento cognitivo.
* **Organização Financeira**: Suporta no máximo **3 categorias** ativas.
* **Registros Fáceis**: Permite o cadastro manual ou via chat de no máximo **2 gastos (transações) por dia**.

### 💼 Plano Essential (Uso Pessoal)
Ideal para usuários que utilizam o Navi ativamente para seu controle financeiro diário e pessoal.
* **Inteligência Artificial**: Até **20 chamadas diárias** no chat, suficiente para a maioria das interações cotidianas.
* **Organização Financeira**: Suporta até **16 categorias** personalizadas.
* **Registros Fáceis**: Cadastro de gastos **totalmente ilimitado**.

### 🚀 Plano Advance (Uso Avançado / Familiar)
Ideal para usuários avançados de controle financeiro, planejamento de metas complexo ou que realizam dezenas de transações diárias.
* **Inteligência Artificial**: Até **100 chamadas diárias** no chat, ideal para uso intensivo e análises aprofundadas de IA.
* **Organização Financeira**: Suporta até **60 categorias** personalizadas.
* **Registros Fáceis**: Cadastro de gastos **totalmente ilimitado**.

---

## 3. Diretrizes de Implementação no Backend (Rails)

Para garantir a segurança dos limites dos planos, a validação deve ocorrer no servidor (API).

### Modelo Recomendado para a Tabela `users`
Adicionar atributos para identificar o plano do usuário e a data de renovação:

```ruby
# Migration sugerida
add_column :users, :plan, :string, default: 'trial', null: false
add_column :users, :plan_expires_at, :datetime
```

### Lógica de Rate Limiting e Validação
1. **Chamadas ao Chat**:
   - Manter um registro de requisições de chat diárias por usuário (ex: via Redis ou contagem simples no banco).
   - Validar antes de chamar a API do Gemini. Retornar `429 Too Many Requests` se o limite diário for excedido.
2. **Limite de Categorias**:
   - Antes de salvar uma nova categoria (`categories#create`), verificar:
     ```ruby
     if current_user.categories.count >= LIMIT_FOR_PLAN
       render json: { error: "Limite de categorias atingido para o seu plano." }, status: :unprocessable_entity
     end
     ```
3. **Limite de Gastos Diários**:
   - Antes de registrar uma nova despesa (`expenses#create`), verificar a contagem de despesas criadas no dia corrente:
     ```ruby
     daily_count = current_user.expenses.where("created_at >= ?", Time.zone.now.beginning_of_day).count
     if daily_count >= LIMIT_FOR_PLAN
       render json: { error: "Limite de gastos diários atingido para o seu plano." }, status: :unprocessable_entity
     end
     ```

---

## 4. Experiência do Usuário (Mobile UX)

* **Feedback Proativo**: Exibir de forma clara o contador de chamadas de IA restantes no dia.
* **Upgrade Contextual**: Quando um usuário atingir o limite de uma categoria ou gasto, exibir um modal premium amigável explicando o limite e fornecendo uma chamada para ação (CTA) de Upgrade para os planos Essential ou Advance.
