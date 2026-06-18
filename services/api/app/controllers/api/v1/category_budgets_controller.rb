module Api
  module V1
    class CategoryBudgetsController < BaseController
      before_action :set_category_budget, only: [:update, :destroy]

      # GET /api/v1/category_budgets
      def index
        category_budgets = current_user.category_budgets.includes(:category)

        if params[:date].present?
          target_date = Date.parse(params[:date]).beginning_of_month
          category_budgets = category_budgets.where(date: target_date)
        end

        render json: category_budgets.map { |cb| category_budget_as_json(cb) }, status: :ok
      rescue ArgumentError
        render json: { error: "Formato de data inválido. Use YYYY-MM-DD" }, status: :bad_request
      end

      # POST /api/v1/category_budgets
      def create
        category_budget = current_user.category_budgets.build(category_budget_params)

        if category_budget.save
          render json: category_budget_as_json(category_budget), status: :created
        else
          render json: { error: category_budget.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/category_budgets/:id
      def update
        if @category_budget.update(category_budget_params)
          render json: category_budget_as_json(@category_budget), status: :ok
        else
          render json: { error: @category_budget.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/category_budgets/:id
      def destroy
        @category_budget.destroy
        head :no_content
      end

      private

      def set_category_budget
        @category_budget = current_user.category_budgets.find_by(id: params[:id])
        unless @category_budget
          render json: { error: 'Not Found' }, status: :not_found
        end
      end

      def category_budget_params
        params.require(:category_budget).permit(:category_id, :amount, :date)
      rescue ActionController::ParameterMissing
        params.permit(:category_id, :amount, :date)
      end

      def category_budget_as_json(cb)
        {
          id: cb.id,
          user_id: cb.user_id,
          category_id: cb.category_id,
          amount: cb.amount.to_s,
          date: cb.date,
          created_at: cb.created_at,
          updated_at: cb.updated_at,
          category: cb.category ? {
            id: cb.category.id,
            name: cb.category.name,
            icon: cb.category.icon,
            slug: cb.category.slug
          } : nil
        }
      end
    end
  end
end
