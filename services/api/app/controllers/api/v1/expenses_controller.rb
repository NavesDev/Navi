module Api
  module V1
    class ExpensesController < BaseController
      before_action :set_expense, only: [:show, :update, :destroy]

      # GET /api/v1/expenses
      def index
        expenses = current_user.expenses

        if params[:category_id].present?
          expenses = expenses.where(category_id: params[:category_id])
        end

        if params[:start_date].present?
          expenses = expenses.where("date >= ?", params[:start_date])
        end

        if params[:end_date].present?
          expenses = expenses.where("date <= ?", params[:end_date])
        end

        render json: expenses.map { |e| expense_as_json(e) }, status: :ok
      end

      # POST /api/v1/expenses
      def create
        expense = current_user.expenses.build(expense_params.except(:category_id))
        assign_owned_category(expense)

        if expense.save
          render json: expense_as_json(expense), status: :created
        else
          render json: { error: expense.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/expenses/:id
      def show
        render json: expense_as_json(@expense), status: :ok
      end

      # PUT/PATCH /api/v1/expenses/:id
      def update
        attrs = expense_params.except(:category_id)
        assign_owned_category(@expense)

        if @expense.errors.empty? && @expense.update(attrs)
          render json: expense_as_json(@expense), status: :ok
        else
          render json: { error: @expense.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/expenses/:id
      def destroy
        @expense.destroy
        head :no_content
      end

      private

      def set_expense
        @expense = current_user.expenses.find_by(id: params[:id])
        unless @expense
          render json: { error: 'Not Found' }, status: :not_found
        end
      end

      def expense_params
        params.permit(:date, :category_id, :description, :amount)
      end

      def assign_owned_category(expense)
        return unless expense_params.key?(:category_id)

        category = current_user.categories.find_by(id: expense_params[:category_id])
        if category
          expense.category = category
        else
          expense.errors.add(:category, 'not found')
        end
      end

      def expense_as_json(expense)
        {
          id: expense.id,
          date: expense.date,
          category_id: expense.category_id,
          description: expense.description,
          amount: expense.amount.to_s,
          created_at: expense.created_at,
          updated_at: expense.updated_at
        }
      end
    end
  end
end
