---
trigger: always_on
---

# Test Standards Rule

Ao criar ou alterar testes, siga padrões de mercado.

## Estrutura obrigatória

Use o padrão **AAA** com comentários explícitos:

```ts
// Arrange
// Act
// Assert
````

Cada teste deve deixar claro:

* o estado inicial;
* a ação executada;
* o resultado esperado.

## Nome dos testes

Use o formato:

```ts
should [expected behavior] when [condition]
```

Exemplos:

```ts
it('should create a spreadsheet when valid data is provided', () => {
  // Arrange

  // Act

  // Assert
});

it('should return unauthorized when user is not authenticated', () => {
  // Arrange

  // Act

  // Assert
});
```

## Princípios FIRST

Todo teste unitário deve seguir FIRST:

* **Fast**: rápido, sem dependências desnecessárias.
* **Independent**: não depender da ordem de execução nem de outro teste.
* **Repeatable**: produzir o mesmo resultado em qualquer ambiente.
* **Self-validating**: ter asserts claros, sem verificação manual.
* **Timely**: ser escrito junto da funcionalidade ou correção.

## Boas práticas

* Testar comportamento, não implementação interna.
* Evitar mocks excessivos.
* Não testar métodos privados diretamente.
* Usar nomes descritivos para cenários.
* Um teste deve validar um comportamento principal.
* Cobrir casos de sucesso, erro, autorização e validação.
* Evitar sleeps, chamadas reais externas e dependência de horário atual sem controle.
