module Api
  module V1
    class BudgetsController < BaseController
      before_action :set_budget, only: [:show, :update, :destroy]

      # GET /api/v1/budgets
      def index
        budgets = current_user.budgets
        render json: budgets.map { |b| budget_as_json(b) }, status: :ok
      end

      # POST /api/v1/budgets
      def create
        budget = current_user.budgets.build(budget_params)

        if budget.save
          render json: budget_as_json(budget), status: :created
        else
          render json: { error: budget.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/budgets/:id
      def show
        render json: budget_as_json(@budget), status: :ok
      end

      # PUT/PATCH /api/v1/budgets/:id
      def update
        if @budget.update(budget_params)
          render json: budget_as_json(@budget), status: :ok
        else
          render json: { error: @budget.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/budgets/:id
      def destroy
        @budget.destroy
        head :no_content
      end

      private

      def set_budget
        @budget = current_user.budgets.find_by(id: params[:id])
        unless @budget
          render json: { error: 'Not Found' }, status: :not_found
        end
      end

      def budget_params
        params.permit(:date, :amount)
      end

      def budget_as_json(budget)
        {
          id: budget.id,
          date: budget.date,
          amount: budget.amount.to_s,
          created_at: budget.created_at,
          updated_at: budget.updated_at
        }
      end
    end
  end
end
