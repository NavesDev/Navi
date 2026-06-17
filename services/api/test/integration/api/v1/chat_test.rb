require "test_helper"

class Api::V1::ChatTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @token = JwtService.encode(user_id: @user.id)
    @headers = { "Authorization" => "Bearer #{@token}", "Content-Type" => "application/json" }
    
    class << OpenaiService
      unless method_defined?(:original_new)
        alias_method :original_new, :new
        def new(*args)
          @mocked_instance || original_new(*args)
        end
        attr_accessor :mocked_instance
      end
    end
  end

  teardown do
    OpenaiService.mocked_instance = nil
  end

  test "should return final completed answer directly when no search action is needed" do
    # Arrange
    openai_instance = OpenaiService.new
    def openai_instance.chat(messages)
      {
        "action" => "",
        "params" => { "category" => "", "start_date" => "", "end_date" => "" },
        "placeholder" => { "type" => "", "icon" => "", "text" => "" },
        "message" => "Olá! Como posso ajudar você hoje?"
      }
    end
    OpenaiService.mocked_instance = openai_instance

    # Act
    post "/api/v1/chat", params: { message: "Oi" }.to_json, headers: @headers

    # Assert
    assert_response :success
    assert_equal "text/event-stream", response.headers["Content-Type"]
    
    assert_includes response.body, "event: message"
    assert_includes response.body, '"status":"completed"'
    assert_includes response.body, '"message":"Olá! Como posso ajudar você hoje?"'
  end

  test "should stream two events when search action is requested and executed" do
    # Arrange
    @user.expenses.create!(date: "2026-06-15", category: categories(:one), amount: 50.0)

    openai_instance = OpenaiService.new
    
    responses = [
      {
        "action" => "search_expenses",
        "params" => { "category" => "Alimentação", "start_date" => "2026-06-01", "end_date" => "2026-06-30" },
        "placeholder" => { "type" => "searching_expenses", "icon" => "fastfood", "text" => "Buscando gastos de Alimentação" },
        "message" => "Buscando seus gastos com alimentação este mês..."
      },
      {
        "action" => "",
        "params" => { "category" => "", "start_date" => "", "end_date" => "" },
        "placeholder" => { "type" => "", "icon" => "", "text" => "" },
        "message" => "Você gastou R$ 50,00 com alimentação este mês."
      }
    ]
    
    openai_instance.define_singleton_method(:chat) do |messages|
      responses.shift
    end
    OpenaiService.mocked_instance = openai_instance

    # Act
    post "/api/v1/chat", params: { message: "Quanto gastei com comida?" }.to_json, headers: @headers

    # Assert
    assert_response :success
    assert_equal "text/event-stream", response.headers["Content-Type"]
    
    assert_includes response.body, '"status":"searching"'
    assert_includes response.body, '"icon":"fastfood"'
    assert_includes response.body, '"text":"Buscando gastos de Alimentação"'
    
    assert_includes response.body, '"status":"completed"'
    assert_includes response.body, '"message":"Você gastou R$ 50,00 com alimentação este mês."'
  end

  test "should create expense when create_expense action is requested and executed" do
    # Arrange
    openai_instance = OpenaiService.new
    
    first_response = {
      "action" => "create_expense",
      "params" => {
        "category" => "Alimentação",
        "start_date" => "",
        "end_date" => "",
        "date" => "2026-06-16",
        "description" => "Jantar",
        "amount" => "45.00",
        "id" => ""
      },
      "placeholder" => { "type" => "creating_expense", "icon" => "add", "text" => "Criando gasto..." },
      "message" => "Adicionando o gasto de R$ 45,00..."
    }
    
    second_response = {
      "action" => "",
      "params" => { "category" => "", "start_date" => "", "end_date" => "", "date" => "", "description" => "", "amount" => "", "id" => "" },
      "placeholder" => { "type" => "", "icon" => "", "text" => "" },
      "message" => "Gasto de R$ 45,00 em Alimentação criado com sucesso!"
    }

    responses = [first_response, second_response]
    openai_instance.define_singleton_method(:chat) do |messages|
      responses.shift
    end
    OpenaiService.mocked_instance = openai_instance

    # Act & Assert
    assert_difference -> { @user.expenses.count }, 1 do
      post "/api/v1/chat", params: { message: "Adicione um gasto de R$ 45 hoje com janta" }.to_json, headers: @headers
    end

    # Assert
    assert_response :success
    assert_equal "text/event-stream", response.headers["Content-Type"]
    
    assert_includes response.body, '"status":"searching"'
    assert_includes response.body, '"status":"completed"'
    assert_includes response.body, '"message":"Gasto de R$ 45,00 em Alimentação criado com sucesso!"'
    
    created_expense = @user.expenses.last
    assert_equal "Alimentação", created_expense.category.name
    assert_equal 45.0, created_expense.amount.to_f
    assert_equal "Jantar", created_expense.description
  end
end
