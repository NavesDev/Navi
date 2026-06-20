---
trigger: always_on
---

# Regra de Segurança e Ocultação de Chaves de Banco (security.md)

Ao projetar, implementar ou documentar endpoints de API no backend (Rails) ou consumi-los no frontend/mobile:

## Diretrizes Obrigatórias para o Agente:

1. **Não Exposição de Chaves de Usuário (`user_id`)**:
   - Nunca retorne campos de chaves estrangeiras que apontam diretamente para chaves primárias de usuários (como `user_id`) em respostas de endpoints públicos ou protegidos, a menos que haja uma justificativa de negócio explícita exigida pelo usuário.
   - Ocultar essas informações previne vazamentos estruturais de banco de dados e mitiga vetores de ataque como IDOR (Insecure Direct Object Reference).

2. **Isolamento Implícito**:
   - Toda associação e busca de registros dependentes (como gastos, orçamentos, etc.) deve ser filtrada implicitamente no controller a partir da sessão/token JWT do usuário autenticado (ex: `current_user.expenses`).
   - Evite expor no payload de requisições campos de relacionamento como `user_id` para criação/atualização.

3. **Exemplos em Documentação**:
   - Ao criar arquivos de documentação markdown (`docs/`) ou payloads de exemplo, omita o campo `user_id` e IDs internos do usuário dos exemplos de retorno e de requisição JSON das rotas.
