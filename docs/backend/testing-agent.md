# Estratégia de Testes E2E do Agente de Chat (LLM Real)

Este documento detalha o plano e os cenários de testes de integração ponta a ponta (E2E) para o agente cognitivo de finanças do Navi. 

---

## 1. Visão Geral da Abordagem

Diferente de testes unitários tradicionais que usam mocks e stubs para simular chamadas de rede, os testes E2E do agente de chat realizam requisições HTTP reais para o serviço de inteligência artificial (**OpenAI GPT-4o-mini**) utilizando a chave de API real (`OPENAI_API_KEY`) fornecida no ambiente.

Isso nos permite:
1. **Validar o Prompt e a Instrução de Sistema**: Garantir que as diretrizes definidas em `config/prompts/chat_system_instruction.md` estão sendo seguidas e interpretadas corretamente pelo modelo.
2. **Validar a Conformidade com o Esquema JSON**: Garantir que a estrutura de retorno do modelo atenda perfeitamente à definição do esquema JSON exigido pela API do Rails.
3. **Validar a Integração da Regra de Negócio**: Verificar se a API do Rails consegue executar com sucesso as ações de banco sugeridas pela IA (`create_expense`, `search_expenses`, etc.) e persistir as informações corretas.

---

## 2. Cenário de Teste: Cadastro de Gasto

### Caso de Teste 1: Registro de gasto com lazer e namorada
* **Entrada**: `"hoje gastei 50 reais para sair com a namorada"`
* **Caminho Feliz Esperado**:
  1. O usuário faz um POST no endpoint `/api/v1/chat`.
  2. O Rails submete a mensagem com o histórico e instruções de sistema para o OpenAI.
  3. O modelo interpreta a intenção do usuário como "registrar gasto".
  4. O modelo retorna uma resposta estruturada contendo a action `create_expense` e os parâmetros:
     - `amount`: `"50.00"`
     - `description`: `"Sair com a namorada"` (ou similar)
     - `category`: `"Lazer"` (ou similar)
     - `date`: Data atual (`YYYY-MM-DD`)
  5. O Rails intercepta a action `create_expense`, cria e salva o registro no banco de dados.
  6. O Rails envia o resultado da inserção de volta para a IA.
  7. A IA gera a mensagem final de sucesso.
  8. O Rails retorna a mensagem final no streaming de eventos SSE e encerra a conexão.

### Validações Assertivas no Banco de Dados
Para confirmar o sucesso do cenário sem dependência rígida de textos exatos gerados pela IA, validamos as seguintes propriedades no banco:
* **Incremento do Banco**: A contagem de despesas do usuário deve aumentar em exatamente `1`.
* **Valor**: O valor da despesa persistida deve ser exatamente `50.0`.
* **Descrição**: A descrição gerada deve conter o tema ou palavras-chave relevantes, como `"namorada"` ou `"sair"`.
* **Categoria**: A despesa deve estar associada a uma categoria adequada (como `"Lazer"`, `"Entretenimento"` ou `"Outros"`).

---

## 3. Considerações e Execução
* **Custos de API**: Por realizarem requisições de verdade ao OpenAI, estes testes consomem tokens de uso da API.
* **Execução**: Podem ser executados de forma isolada usando:
  ```bash
  bundle exec rails test test/integration/api/v1/chat_agent_test.rb
  ```
