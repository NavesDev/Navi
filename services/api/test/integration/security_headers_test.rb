require "test_helper"

class SecurityHeadersTest < ActionDispatch::IntegrationTest
  test "does not allow cors requests from untrusted origins" do
    original_origins = Rails.configuration.x.allowed_cors_origins
    Rails.configuration.x.allowed_cors_origins = ["https://app.example.com"]

    get "/up", headers: {
      "Origin" => "https://evil.example",
      "Access-Control-Request-Method" => "GET"
    }

    assert_nil response.headers["Access-Control-Allow-Origin"]
  ensure
    Rails.configuration.x.allowed_cors_origins = original_origins
  end
end
