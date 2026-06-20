class Rack::Attack
  # Use the application cache in production so limits are shared across processes.
  Rack::Attack.cache.store = Rails.env.production? ? Rails.cache : ActiveSupport::Cache::MemoryStore.new

  ### Throttle Login & Register requests per IP ###
  # Allow 5 login/register requests per minute per IP
  throttle('auth/ip', limit: 5, period: 1.minute) do |req|
    if (req.path == '/api/v1/auth/login' || req.path == '/api/v1/auth/register') && req.post?
      req.ip
    end
  end

  ### Throttle Login attempts per Username ###
  # Allow 5 login attempts per minute per username
  throttle('auth/username', limit: 5, period: 1.minute) do |req|
    if req.path == '/api/v1/auth/login' && req.post?
      begin
        # Read the raw request body and parse JSON to extract the username
        body_content = req.body.read
        req.body.rewind # Crucial: rewind body so Rails controller can read it
        params = JSON.parse(body_content)
        params['username']&.to_s&.downcase&.strip
      rescue => e
        nil
      end
    end
  end

  ### Throttle refresh attempts per IP ###
  throttle('auth/refresh/ip', limit: 20, period: 1.minute) do |req|
    req.ip if req.path == '/api/v1/auth/refresh' && req.post?
  end

  ### Throttle chat requests per authenticated user or IP ###
  throttle('chat/user_or_ip', limit: 20, period: 1.minute) do |req|
    next unless req.path == '/api/v1/chat' && req.post?

    auth_header = req.get_header('HTTP_AUTHORIZATION').to_s
    token = auth_header.split(' ').last
    decoded = JwtService.decode(token) if token.present?
    decoded&.fetch(:user_id, nil) || req.ip
  end

  # Custom JSON response for throttled requests
  self.throttled_responder = lambda do |request|
    match_data = request.env['rack.attack.match_data'] || {}
    retry_after = match_data[:period] || 60

    headers = {
      'Content-Type' => 'application/json',
      'Retry-After' => retry_after.to_s
    }

    body = {
      error: "Rate limit exceeded. Try again in #{retry_after} seconds.",
      retry_after: retry_after
    }.to_json

    [429, headers, [body]]
  end
end
