require "test_helper"

class Api::V1::ChatAgentTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @token = JwtService.encode(user_id: @user.id)
    @headers = { "Authorization" => "Bearer #{@token}", "Content-Type" => "application/json" }
  end

  test "should create expense in correct category when explicit expense creation command is sent" do
    # Arrange
    # We do not mock OpenaiService here to allow the real integration E2E request to execute.
    current_time_str = Time.zone.now.strftime("%Y-%m-%d %H:%M:%S")

    # Act
    assert_difference -> { @user.expenses.count }, 1 do
      post "/api/v1/chat", params: {
        message: "hoje gastei 50 reais para sair com a namorada",
        current_date: current_time_str
      }.to_json, headers: @headers
    end

    # Assert
    assert_response :success
    assert_equal "text/event-stream", response.headers["Content-Type"]

    # Validate that SSE events are broadcasted correctly
    assert_includes response.body, "event: message"
    assert_includes response.body, '"status":"searching"'
    assert_includes response.body, '"status":"completed"'

    # Validate that the database transaction was persisted correctly
    created_expense = @user.expenses.last
    assert_equal 50.0, created_expense.amount.to_f
    assert_match /namorada|sair/i, created_expense.description
    assert_includes ["Lazer", "Entretenimento", "Alimentação", "Outros"], created_expense.category.name
  end
end
