module Api
  module V1
    class AuthController < BaseController
      skip_before_action :authenticate_request!, only: [:register, :login]

      # POST /api/v1/auth/register
      def register
        unless Rails.configuration.allow_signup
          render json: { error: 'Registration is disabled' }, status: :forbidden
          return
        end

        user = User.new(register_params)
        if user.save
          token = JwtService.encode(user_id: user.id)
          render json: {
            user: { username: user.username },
            token: token
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
          render json: {
            user: { username: user.username },
            token: token
          }, status: :ok
        else
          render json: { error: 'Invalid username or password' }, status: :unauthorized
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
