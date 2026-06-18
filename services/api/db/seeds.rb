# db/seeds.rb

# Find or create development user
user = User.find_or_initialize_by(username: 'Naves')
user.password = 'password'
user.save!

puts "User 'Naves' created/updated."

# Clean up existing dev data for this user
user.expenses.destroy_all
user.category_budgets.destroy_all
user.budgets.destroy_all
user.categories.destroy_all

# Default Categories
categories_data = [
  { name: 'Alimentação', icon: 'fastfood' },
  { name: 'Transporte', icon: 'directions-car' },
  { name: 'Saúde', icon: 'local-hospital' },
  { name: 'Contas/Serviços', icon: 'receipt' },
  { name: 'Lazer', icon: 'sports-esports' }
]

categories = {}
categories_data.each do |cat_attr|
  cat = user.categories.create!(cat_attr)
  categories[cat_attr[:name]] = cat
end
puts "Categories created."

# Monthly Budget
now = Date.today
start_of_month = now.beginning_of_month

budget = user.budgets.create!(
  amount: 3500.00,
  date: start_of_month
)
puts "Monthly Budget of R$ 3500.00 created for #{start_of_month}."

# Category Budgets (Metas)
user.category_budgets.create!([
  { category: categories['Alimentação'], amount: 1000.00, date: start_of_month },
  { category: categories['Transporte'], amount: 400.00, date: start_of_month },
  { category: categories['Contas/Serviços'], amount: 1200.00, date: start_of_month }
])
puts "Category budgets created."

# Mock Expenses
user.expenses.create!([
  { description: 'Supermercado Mensal', amount: 650.00, category: categories['Alimentação'], date: now },
  { description: 'Almoço Restaurante', amount: 45.50, category: categories['Alimentação'], date: now },
  { description: 'Combustível Posto', amount: 180.00, category: categories['Transporte'], date: now },
  { description: 'Corrida de Aplicativo', amount: 25.00, category: categories['Transporte'], date: now },
  { description: 'Conta de Energia', amount: 320.00, category: categories['Contas/Serviços'], date: now },
  { description: 'Assinatura Netflix', amount: 55.90, category: categories['Contas/Serviços'], date: now },
  { description: 'Consulta Médica', amount: 150.00, category: categories['Saúde'], date: now }
])
puts "Mock expenses created."
