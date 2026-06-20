require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Api
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    config.middleware.use Rack::Attack

    # Allow user registration (signups)
    config.allow_signup = ENV.fetch("ALLOW_SIGNUP", "false").to_s.downcase == "true"

    default_cors_origins = if Rails.env.production?
      []
    else
      ["http://localhost:5173", "http://localhost:8081", "http://localhost:19006"]
    end
    config.x.allowed_cors_origins = ENV.fetch("CORS_ORIGINS", default_cors_origins.join(","))
                                        .split(",")
                                        .map(&:strip)
                                        .reject(&:blank?)
  end
end
