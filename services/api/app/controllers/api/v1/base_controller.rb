module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_request!

      attr_reader :current_user

      private

      def authenticate_request!
        header = request.headers['Authorization']
        token = header.split(' ').last if header.present?
        
        if token.present?
          decoded = JwtService.decode(token)
          if decoded.present?
            @current_user = User.find_by(id: decoded[:user_id])
          end
        end

        unless @current_user
          render json: { error: 'Unauthorized' }, status: :unauthorized
        end
      end
    end
  end
end
