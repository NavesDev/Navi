module Api
  module V1
    class ChatController < BaseController
      include ActionController::Live

      def create
        response.headers['Content-Type'] = 'text/event-stream'
        response.headers['Last-Modified'] = '0'
        response.headers['X-Accel-Buffering'] = 'no'
        response.headers['Cache-Control'] = 'no-cache'

        user_message = params[:message]
        if user_message.blank?
          write_event({ error: "Message is required" }, event: "error")
          return
        end

        current_date = params[:current_date]
        
        categories = current_user.categories.pluck(:name)
        categories_str = categories.empty? ? "Nenhuma categoria cadastrada ainda." : categories.join(", ")

        context_str = "Contexto do Usuário:\n"
        context_str += "- Data e hora atual: #{current_date}\n" if current_date.present?
        context_str += "- Categorias existentes: #{categories_str}\n\n"

        user_content = "#{context_str}Mensagem do usuário: #{user_message}"

        openai = OpenaiService.new
        session_id = "chat_sess_#{SecureRandom.hex(6)}"

        system_instruction = File.read(Rails.root.join("config", "prompts", "chat_system_instruction.md"))

        messages = [
          { role: "system", content: system_instruction }
        ]

        if params[:history].present? && params[:history].is_a?(Array)
          params[:history].last(10).each do |msg|
            messages << { role: msg["role"], content: msg["content"] } if msg["role"].present? && msg["content"].present?
          end
        end

        messages << { role: "user", content: user_content }

        response = openai.chat(messages)
        loop_count = 0

        while response["actions"].present? && response["actions"].any? && loop_count < 3
          write_event({
            session_id: session_id,
            status: "searching",
            message: response["message"],
            placeholder: response["placeholder"]
          })

          query_results = response["actions"].map do |act|
            {
              action: act["action"],
              result: execute_action(act["action"], act["params"])
            }
          end

          messages << { role: "assistant", content: response.to_json }
          messages << { role: "user", content: "Resultados das actions: #{query_results.to_json}" }

          response = openai.chat(messages)
          loop_count += 1
        end

        write_event({
          session_id: session_id,
          status: "completed",
          message: response["message"]
        })

      rescue => e
        Rails.logger.error("Chat streaming error: #{e.message}\n#{e.backtrace.join("\n")}")
        write_event({ error: "Erro interno no chat" }, event: "error")
      ensure
        response.stream.close
      end

      private

      def write_event(data, event: "message")
        response.stream.write("event: #{event}\n")
        response.stream.write("data: #{data.to_json}\n\n")
      end

      def execute_action(action, params)
        case action
        when "search_expenses"
          expenses = current_user.expenses
          if params["category"].present?
            category_id = current_user.categories.find_by("slug = ? OR name = ?", params["category"]&.downcase&.parameterize, params["category"])&.id
            expenses = expenses.where(category_id: category_id) if category_id
          end
          if params["start_date"].present?
            expenses = expenses.where("date >= ?", params["start_date"])
          end
          if params["end_date"].present?
            expenses = expenses.where("date <= ?", params["end_date"])
          end
          expenses.map { |e| { id: e.id, date: e.date, category: e.category&.name, description: e.description, amount: e.amount.to_f } }
        when "search_budgets"
          budgets = current_user.budgets
          if params["start_date"].present?
            date = Date.parse(params["start_date"]).beginning_of_month
            budgets = budgets.where("date >= ?", date)
          end
          if params["end_date"].present?
            date = Date.parse(params["end_date"]).end_of_month
            budgets = budgets.where("date <= ?", date)
          end
          budgets.map { |b| { date: b.date, amount: b.amount.to_f } }
        when "create_expense"
          category_name = params["category"].presence || "Outros"
          slug = category_name.to_s.downcase.parameterize
          slug = "outros" if slug.blank?
          category = current_user.categories.find_or_create_by!(slug: slug) do |c|
            c.name = category_name
            c.icon = "category"
          end

          expense = current_user.expenses.build(
            date: params["date"],
            category_id: category.id,
            description: params["description"],
            amount: params["amount"].to_f
          )
          if expense.save
            { status: "success", expense: { id: expense.id, date: expense.date, category: expense.category&.name, description: expense.description, amount: expense.amount.to_f } }
          else
            { status: "error", errors: expense.errors.full_messages }
          end
        when "update_expense"
          expense = current_user.expenses.find_by(id: params["id"])
          if expense
            update_params = {}
            update_params[:date] = params["date"] if params["date"].present?
            
            if params["category"].present?
              category_name = params["category"]
              slug = category_name.to_s.downcase.parameterize
              slug = "outros" if slug.blank?
              category = current_user.categories.find_or_create_by!(slug: slug) do |c|
                c.name = category_name
                c.icon = "category"
              end
              update_params[:category_id] = category.id
            end

            update_params[:description] = params["description"] if params["description"].present?
            update_params[:amount] = params["amount"].to_f if params["amount"].present?
            
            if expense.update(update_params)
              { status: "success", expense: { id: expense.id, date: expense.date, category: expense.category&.name, description: expense.description, amount: expense.amount.to_f } }
            else
              { status: "error", errors: expense.errors.full_messages }
            end
          else
            { status: "error", errors: ["Gasto não encontrado"] }
          end
        when "delete_expense"
          expense = current_user.expenses.find_by(id: params["id"])
          if expense
            expense.destroy
            { status: "success", message: "Gasto deletado com sucesso" }
          else
            { status: "error", errors: ["Gasto não encontrado"] }
          end
        else
          []
        end
      rescue => e
        Rails.logger.error("Failed to execute query action: #{e.message}")
        []
      end
    end
  end
end
