# Regra de Workflow do Git e Commits por Relevância (git-workflow.md)

Ao interagir com o repositório Navi e realizar commits:

## Diretrizes Obrigatórias para o Agente:

1. **Evitar Commits Gigantes/Monolíticos**:
   - Nunca agrupe alterações de múltiplos recursos, modelos inteiros, controllers, documentações e modificações do frontend em um único commit massivo.
   - Commits devem ser pequenos, incrementais e fáceis de revisar.

2. **Divisão por Lotes de Relevância**:
   - Divida o trabalho em lotes lógicos e commits específicos. Quando criar ou alterar uma funcionalidade ou recurso, siga preferencialmente a seguinte ordem de separação em commits:
     - **Migrações e Banco de Dados**: Alterações de `db/migrate` e atualização correspondente de `db/schema.rb`.
     - **Modelos e Testes Unitários**: Arquivos em `app/models`, `test/fixtures` e testes unitários em `test/models`.
     - **Controllers, Rotas e Testes de Integração**: Arquivos em `app/controllers`, rotas em `config/routes.rb` e testes em `test/integration`.
     - **Frontend/Mobile**: Alterações nas telas do aplicativo Expo/React Native em `apps/mobile/src`.
     - **Documentação**: Atualizações ou criação de arquivos markdown em `docs/`.

3. **Validação entre Commits**:
   - Certifique-se de que a aplicação compila (typechecks do mobile) e que todos os testes da suíte (`rails test`) continuam passando após cada lote commitado.
