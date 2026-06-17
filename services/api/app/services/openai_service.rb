require 'net/http'
require 'uri'
require 'json'

class OpenaiService
  def initialize
    @api_key = ENV['OPENAI_API_KEY']
    @model = ENV['OPENAI_MODEL'] || 'gpt-4o-mini'
  end

  def chat(messages)
    return mock_response_for_missing_key if @api_key.blank? || @api_key == "sua_chave_do_openai_aqui"

    uri = URI("https://api.openai.com/v1/chat/completions")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    headers = {
      "Content-Type" => "application/json",
      "Authorization" => "Bearer #{@api_key}"
    }

    body = {
      model: @model,
      messages: messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "chat_agent_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              action: {
                type: "string",
                description: "Qual ação executar no banco de dados. Valores suportados: 'search_expenses', 'search_budgets', 'create_expense', 'update_expense', 'delete_expense', ou string vazia '' caso não precise de busca ou já tenha executado."
              },
              params: {
                type: "object",
                properties: {
                  category: { type: "string", description: "Categoria de gastos (ou string vazia)" },
                  start_date: { type: "string", description: "Data inicial no formato YYYY-MM-DD (ou string vazia)" },
                  end_date: { type: "string", description: "Data final no formato YYYY-MM-DD (ou string vazia)" },
                  date: { type: "string", description: "Data do gasto no formato YYYY-MM-DD (ou string vazia)" },
                  description: { type: "string", description: "Descrição do gasto (ou string vazia)" },
                  amount: { type: "string", description: "Valor do gasto, ex: 150.50 (ou string vazia)" },
                  id: { type: "string", description: "ID do gasto para edição/deleção (ou string vazia)" }
                },
                required: ["category", "start_date", "end_date", "date", "description", "amount", "id"],
                additionalProperties: false,
                description: "Parâmetros para a ação."
              },
              placeholder: {
                type: "object",
                properties: {
                  type: { type: "string", description: "Tipo de busca/status (ou string vazia)" },
                  icon: { type: "string", description: "Slug de ícone Material Icons correspondente (ou string vazia)" },
                  text: { type: "string", description: "Texto curto para exibir no carregamento do front-end (ou string vazia)" }
                },
                required: ["type", "icon", "text"],
                additionalProperties: false,
                description: "Informações de carregamento para o front-end."
              },
              message: {
                type: "string",
                description: "A mensagem de resposta ou descrição da busca."
              }
            },
            required: ["action", "params", "placeholder", "message"],
            additionalProperties: false
          }
        }
      }
    }

    request = Net::HTTP::Post.new(uri.request_uri, headers)
    request.body = body.to_json

    response = http.request(request)

    if response.code.to_i == 200
      result = JSON.parse(response.body)
      content = result.dig("choices", 0, "message", "content")
      JSON.parse(content)
    else
      Rails.logger.error("OpenAI API Error: #{response.code} - #{response.body}")
      raise "OpenAI API request failed: #{response.body}"
    end
  end

  private

  def mock_response_for_missing_key
    {
      "action" => "",
      "params" => { "category" => "", "start_date" => "", "end_date" => "", "date" => "", "description" => "", "amount" => "", "id" => "" },
      "placeholder" => { "type" => "", "icon" => "", "text" => "" },
      "message" => "[Mock] Configurar a variável OPENAI_API_KEY no arquivo .env para respostas reais da IA."
    }
  end
end
