module Api
  module V1
    class CategoriesController < BaseController
      before_action :set_category, only: [:show, :update, :destroy]

      # GET /api/v1/categories
      def index
        categories = current_user.categories
        render json: categories.map { |c| category_as_json(c) }, status: :ok
      end

      # POST /api/v1/categories
      def create
        category = current_user.categories.build(category_params)

        if category.save
          render json: category_as_json(category), status: :created
        else
          render json: { error: category.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/categories/:id
      def show
        render json: category_as_json(@category), status: :ok
      end

      # PUT/PATCH /api/v1/categories/:id
      def update
        if @category.update(category_params)
          render json: category_as_json(@category), status: :ok
        else
          render json: { error: @category.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/categories/:id
      def destroy
        if @category.destroy
          head :no_content
        else
          render json: { error: @category.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      private

      def set_category
        @category = current_user.categories.find_by(id: params[:id])
        unless @category
          render json: { error: 'Not Found' }, status: :not_found
        end
      end

      def category_params
        params.permit(:name, :slug, :icon)
      end

      def category_as_json(category)
        {
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          created_at: category.created_at,
          updated_at: category.updated_at
        }
      end
    end
  end
end
