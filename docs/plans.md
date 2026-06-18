# Subscription Plans & Limits - Navi

This document details the different subscription plans for **Navi**, the resource limits associated with each plan, and recommendations for implementing limit validations in the API and mobile application.

---

## 1. Plan Comparison Table

| Resource / Limit | Trial Plan | Essential Plan | Advance Plan |
| :--- | :--- | :--- | :--- |
| **Chat Calls (per day)** | 7 calls | 20 calls | 100 calls |
| **Maximum Categories** | Up to 3 categories | Up to 16 categories | Up to 60 categories |
| **Logged Expenses (per day)** | Up to 2 expenses | Unlimited | Unlimited |
| **Base Price suggestion** | Free | $2.99/month | $5.99/month |

---

## 2. Plan Details

### 🧪 Trial Plan (Exploration)
Designed for new users who want to try the basic experience and AI interactions of Navi.
* **Artificial Intelligence**: Strict limit of **7 daily calls** to the chat/cognitive processing endpoint.
* **Financial Organization**: Supports a maximum of **3 active categories**.
* **Easy Logging**: Allows manual or chat-based logging of up to **2 expenses (transactions) per day**.

### 💼 Essential Plan (Personal Use)
Ideal for users who actively use Navi for their daily and personal financial control.
* **Artificial Intelligence**: Up to **20 daily calls** in chat, sufficient for most daily interactions.
* **Financial Organization**: Supports up to **16 custom categories**.
* **Easy Logging**: **Completely unlimited** expense logging.

### 🚀 Advance Plan (Advanced / Family Use)
Ideal for advanced financial power users, complex goal planning, or users who perform dozens of transactions daily.
* **Artificial Intelligence**: Up to **100 daily calls** in chat, ideal for intensive use and in-depth AI analysis.
* **Financial Organization**: Supports up to **60 custom categories**.
* **Easy Logging**: **Completely unlimited** expense logging.

---

## 3. Backend Implementation Guidelines (Rails)

To guarantee plan security and prevent limit bypasses, limits validation must be enforced on the server (API).

### Recommended Attributes for the `users` Table
Add fields to identify the user's plan and subscription status:

```ruby
# Recommended Migration
add_column :users, :plan, :string, default: 'trial', null: false
add_column :users, :plan_expires_at, :datetime
```

### Rate Limiting & Validation Logic
1. **Chat Calls**:
   - Keep a daily count of chat requests per user (e.g., using Redis keys or a simple database count).
   - Validate before calling the Gemini API. Return `429 Too Many Requests` if the daily limit is exceeded.
2. **Category Limit**:
   - Before saving a new category (`categories#create`), verify:
     ```ruby
     if current_user.categories.count >= LIMIT_FOR_PLAN
       render json: { error: "Category limit reached for your plan." }, status: :unprocessable_entity
     end
     ```
3. **Daily Expense Limit**:
   - Before logging a new expense (`expenses#create`), verify the count of expenses logged today:
     ```ruby
     daily_count = current_user.expenses.where("created_at >= ?", Time.zone.now.beginning_of_day).count
     if daily_count >= LIMIT_FOR_PLAN
       render json: { error: "Daily expense limit reached for your plan." }, status: :unprocessable_entity
     end
     ```

---

## 4. Mobile User Experience (UX)

* **Proactive Feedback**: Clearly display the remaining daily AI chat calls to the user.
* **Contextual Upgrade**: When a user hits a category or expense limit, show a premium modal explaining the limit with a call to action (CTA) to upgrade to the Essential or Advance plan.
