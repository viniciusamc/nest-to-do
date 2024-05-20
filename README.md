## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ docker compose -f ./docker-compose.yml up -d
$ pnpm run start

# watch mode
$ pnpm run start:dev
```

## Endpoints

### User 
    - POST /user - Create a user 

    - Post /auth - Create a JWT for auth
    - Get /auth/profile - See the JWT

### Tasks 
    - POST /task - Create a task
    - Get /task/:id - Get a single task
    - Get /task - Get all Tasks
    - Patch /task/:id - Edit a task
    - Delete /task/:id - Delete a task
