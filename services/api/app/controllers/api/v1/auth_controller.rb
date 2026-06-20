module Api
  module V1
    class AuthController < BaseController
      skip_before_action :authenticate_request!, only: [:register, :login, :refresh, :logout]

      # POST /api/v1/auth/register
      def register
        unless Rails.configuration.allow_signup
          render json: { error: 'Registration is disabled' }, status: :forbidden
          return
        end

        user = User.new(register_params)
        if user.save
          token = JwtService.encode(user_id: user.id)
          refresh_token = user.refresh_tokens.create!(expires_at: 30.days.from_now)
          render json: {
            user: { username: user.username },
            token: token,
            refresh_token: refresh_token.plaintext_token
          }, status: :created
        else
          render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/auth/login
      def login
        user = User.find_by(username: params[:username]&.to_s&.strip)
        if user&.authenticate(params[:password])
          token = JwtService.encode(user_id: user.id)
          refresh_token = user.refresh_tokens.create!(expires_at: 30.days.from_now)
          render json: {
            user: { username: user.username },
            token: token,
            refresh_token: refresh_token.plaintext_token
          }, status: :ok
        else
          render json: { error: 'Invalid username or password' }, status: :unauthorized
        end
      end

      # POST /api/v1/auth/refresh
      def refresh
        refresh_token = RefreshToken.find_by_token(params[:refresh_token])

        if refresh_token.nil? || refresh_token.expired?
          render json: { error: 'Invalid or expired refresh token' }, status: :unauthorized
          return
        end

        access_token = JwtService.encode(user_id: refresh_token.user_id)
        new_refresh_token = refresh_token.user.refresh_tokens.create!(expires_at: 30.days.from_now)
        refresh_token.destroy

        render json: {
          token: access_token,
          refresh_token: new_refresh_token.plaintext_token
        }, status: :ok
      end

      # POST /api/v1/auth/logout
      def logout
        refresh_token = RefreshToken.find_by_token(params[:refresh_token])
        if refresh_token
          refresh_token.destroy
          render json: { message: 'Logged out successfully' }, status: :ok
        else
          render json: { error: 'Invalid refresh token' }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/auth/me
      def me
        render json: { username: current_user.username }, status: :ok
      end

      private

      def register_params
        params.permit(:username, :password)
      end
    end
  end
end
