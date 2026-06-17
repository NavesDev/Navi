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

        openai = OpenaiService.new
        session_id = "chat_sess_#{SecureRandom.hex(6)}"

        system_instruction = File.read(Rails.root.join("config", "prompts", "chat_system_instruction.md"))

        messages = [
          { role: "system", content: system_instruction },
          { role: "user", content: user_message }
        ]

        response_1 = openai.chat(messages)

        if response_1["action"].present?
          write_event({
            session_id: session_id,
            status: "searching",
            message: response_1["message"],
            placeholder: response_1["placeholder"]
          })

          query_results = execute_action(response_1["action"], response_1["params"])

          messages << { role: "assistant", content: response_1.to_json }
          messages << { role: "user", content: "Resultados da busca: #{query_results.to_json}" }

          response_2 = openai.chat(messages)

          write_event({
            session_id: session_id,
            status: "completed",
            message: response_2["message"]
          })
        else
          write_event({
            session_id: session_id,
            status: "completed",
            message: response_1["message"]
          })
        end

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
            expenses = expenses.where(category: params["category"])
          end
          if params["start_date"].present?
            expenses = expenses.where("date >= ?", params["start_date"])
          end
          if params["end_date"].present?
            expenses = expenses.where("date <= ?", params["end_date"])
          end
          expenses.map { |e| { date: e.date, category: e.category, description: e.description, amount: e.amount.to_f } }
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
