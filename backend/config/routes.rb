Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      namespace :students do
        resource :registration, only: :create
        resource :session, only: :create
        resource :profile, only: %i[show update]
        resources :download_requests, only: %i[create index show]
      end

      namespace :advisers do
        resource :registration, only: :create
        resource :session, only: :create
        resource :profile, only: %i[show update]
      end

      namespace :admins do
        resource :session, only: :create
        resource :profile, only: %i[show update]
        resource :dashboard, only: :show
        resources :download_requests, only: %i[index show update]
        resources :advisers, only: %i[create update destroy]
        resources :students, only: %i[index show create update destroy]
        resources :manuscripts, only: %i[index show]
      end

      namespace :passwords do
        resource :forgot, only: :create
        resource :reset, only: :create
      end

      resources :advisers, only: %i[index show]
      resources :students, only: :show
      resources :manuscripts do
        resources :feedbacks, only: %i[index create]
        member do
          get :my_download_request
        end
      end
    end
  end
end
