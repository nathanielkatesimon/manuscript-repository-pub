## Run backend
```bash
cd backend
bundle install
rails db:create
rails db:migrate
rails s -p 5000
```

## Run frontend
```bash
cd frontend
npm install
npm run dev
```