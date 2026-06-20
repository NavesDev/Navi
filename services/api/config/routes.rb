Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      post "auth/register", to: "auth#register"
      post "auth/login", to: "auth#login"
      post "auth/refresh", to: "auth#refresh"
      post "auth/logout", to: "auth#logout"
      get "auth/me", to: "auth#me"

      resources :categories
      resources :expenses
      resources :budgets
      resources :category_budgets, only: [:index, :create, :update, :destroy]
      post "chat", to: "chat#create"
    end
  end
end
