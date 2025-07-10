# === Этап 1: сборка фронтенда ===
FROM node:22-bullseye AS frontend-build

WORKDIR /app/frontend

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# === Этап 2: сборка бэкенда ===
FROM node:22-bullseye AS backend-build

# Устанавливаем инструменты для сборки нативных зависимостей (sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY backend/package*.json ./

# Переменная окружения для форсированной сборки sqlite3
ENV SQLITE3_FORCE_BUILD=1

RUN npm install --build-from-source

COPY backend/ ./
RUN npm run build


# === Финальный образ ===
FROM node:22-bullseye

WORKDIR /app

# Копируем бэкенд
COPY --from=backend-build /app/backend ./backend

# Копируем фронтенд
COPY --from=frontend-build /app/frontend ./frontend

# Создаём папку под SQLite БД (если ещё не существует)
RUN mkdir -p /app/backend/data

EXPOSE 3000 4000

# Запуск бэкенда и SSR фронтенда
CMD sh -c "node backend/dist/main.js & node frontend/dist/mol-response/server/server.mjs"
