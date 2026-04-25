# 📚 BookStore API Documentation

## Базовый URL

http://10.82.196.214:8085

## 📝 Примеры тестовых сценариев

### Сценарий 1: Полная проверка книги

1. Создать новую книгу (`POST /books`)
2. Получить книгу по ID (`GET /books/{id}`)

3. Обновить цену (`PATCH /books/{id}`)

4. Проверить наличие (`GET /books/{id}/stock`)

5. Удалить книгу (`DELETE /books/{id}`)

### Сценарий 2: Покупка (ну почти) и отзыв
1. Проверить наличие книги (`GET /books/{id}/stock`)
2. Добавить отзыв на книгу (`POST /books/{id}/reviews`)

### Сценарий 3. Фильтрация и пагинация
1. Получить книги с фильтром по жанру
2. Получить книги с пагинацией
3. Получить книги с фильтром по цене

## Аутентификация
Для защищенных эндпоинтов (POST, PUT, PATCH, DELETE) требуется API Key в заголовке:

X-API-Key: bookstore-2026-secret


## Коды ответов
| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Успешное создание ресурса |
| 204 | Успешное удаление (нет содержимого) |
| 400 | Ошибка валидации данных |
| 401 | Отсутствует или неверный API Key |
| 404 | Ресурс не найден |
| 409 | Конфликт (например, дубликат ISBN) |

---

# 📚 Эндпоинты книг

## 1. Получить все книги с фильтрацией

```http
GET /books
```

### Query Параметры

| Параметр | Типа                            | Описание |
|----------|---------------------------------|----------|
| genre      | string                          |    Фильтр по жанру      |
| author      | string                          |  Фильтр по автору (частичное совпадение)        |
| minPrice      | author                          |  Минимальная цена        |
| maxPrice      | author         |   Максимальная цена       |
| page      | author |      Номер страницы (default: 0)    |
| size      | author                |    Размер страницы (default: 10)      |

---

### Пример запроса
```http
GET /books?genre=Classic&minPrice=400&maxPrice=600&page=0&size=5
```

### Ответ 200 OK
```json
{
  "total": 2,
  "page": 0,
  "size": 5,
  "books": [
    {
      "id": 2,
      "isbn": "978-0061120084",
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "genre": "Classic",
      "year": 1960,
      "price": 520,
      "stock": 8,
      "rating": 4.9,
      "pages": 336
    }
  ]
}
```

## 2. Получить книгу по ID
```http
GET /books/{id}
```

### Ответ 200 OK
```json
{
  "id": 1,
  "isbn": "978-0141182803",
  "title": "1984",
  "author": "George Orwell",
  "genre": "Dystopian",
  "year": 1949,
  "price": 450,
  "stock": 15,
  "rating": 4.8,
  "pages": 328
}
```

### Ошибка 404 
```json
{
  "error": "Book not found"
}
```

## 3. Получить книгу по ISBN
```http
GET /books/isbn/{isbn}
```

### Ответ 200 ОК
```json
{
  "id": 1,
  "isbn": "978-0141182803",
  "title": "1984",
  "author": "George Orwell",
  "genre": "Dystopian",
  "year": 1949,
  "price": 450,
  "stock": 15,
  "rating": 4.8,
  "pages": 328
}
```

### Ошибка 404
```json
{
  "error": "Book not found with this ISBN"
}
```

## 4. Создать новую книгу
```http
POST /books
Headers: X-API-Key: bookstore-2026-secret
Content-Type: application/json
```

### Тело запроса

```json
{
  "isbn": "978-1234567890",
  "title": "New Book",
  "author": "John Doe",
  "genre": "Fiction",
  "year": 2026,
  "price": 599,
  "stock": 10,
  "pages": 250
}
```

### Обязательные поля
- `isbn` (string) - уникальный идентификатор

- `title` (string) - название книги

- `author` (string) - автор

- `price` (integer) - цена

### Опциональные поля
- `genre` (string) - жанр (default: "Uncategorized")

- `year` (integer) - год издания (default: текущий год)

- `stock` (integer) - количество на складе (default: 0)

- `pages` (integer) - количество страниц (default: 0)

### Ответ (201 Created)

```json
{
  "id": 8,
  "isbn": "978-1234567890",
  "title": "New Book",
  "author": "John Doe",
  "genre": "Fiction",
  "year": 2026,
  "price": 599,
  "stock": 10,
  "rating": 0,
  "pages": 250
}
```

### Ошибка (400 Bad Request)

```json
{
  "error": "Missing required fields: isbn, title, author, price are mandatory"
}
```

### Ошибка (409 Conflict)

```json
{
  "error": "Book with this ISBN already exists"
}
```

## 5. Полностью обновить книгу

```http
PUT /books/{id}
Headers: X-API-Key: bookstore-2026-secret
Content-Type: application/json
```

### Тело запроса (все поля обязательны)

```json
{
  "isbn": "978-0141182803",
  "title": "1984 - Updated",
  "author": "George Orwell",
  "genre": "Dystopian",
  "year": 1949,
  "price": 499,
  "stock": 20,
  "rating": 4.9,
  "pages": 328
}
```

### Ответ (200 ОК)

```json
{
  "id": 1,
  "isbn": "978-0141182803",
  "title": "1984 - Updated",
  "author": "George Orwell",
  "genre": "Dystopian",
  "year": 1949,
  "price": 499,
  "stock": 20,
  "rating": 4.9,
  "pages": 328
}
```

### Ошибка 404 (Not Found)

```json
{
  "error": "Book not found"
}
```

## 6. Частично обновить книгу

```http
PATCH /books/{id}
Headers: X-API-Key: bookstore-2026-secret
Content-Type: application/json
```

### Тело запроса (только изменяемые поля)

```json
{
  "price": 499,
  "stock": 25
}
```

### Ответ (200 ОК)

```json
{
  "id": 1,
  "isbn": "978-0141182803",
  "title": "1984",
  "author": "George Orwell",
  "genre": "Dystopian",
  "year": 1949,
  "price": 499,
  "stock": 25,
  "rating": 4.8,
  "pages": 328
}
```

## 7. Удалить книгу

```http
DELETE /books/{id}
Headers: X-API-Key: bookstore-2026-secret
```

### Ответ (204 No Content)

Тела ответа нет

### Ошибка 404 (Not Found)

```json
{
  "error": "Book not found"
}
```

## 8. Проверить наличие книги на складе
```http
GET /books/{id}/stock
```

### Пример запроса
```http
GET /books/1/stock
```

### Ответ (200 ОК)
```json
{
"bookId": 1,
"title": "1984",
"stock": 15,
"available": true,
"inStock": true
}
```

### Ошибка 404 (Not Found)

```json
{
  "error": "Book not found"
}
```

# 📝 Отзывы

## 9. Добавить отзыв на книгу

```http
POST /books/{id}/reviews
Content-Type: application/json
```

### Тело запроса

```json
{
  "rating": 5,
  "comment": "Excellent book! Must read!",
  "reviewerName": "John Doe"
}
```

### Поля

comment и reviewerName - не обязательные

### Ответ (201 Created)

```json
{
  "reviewId": 1,
  "bookId": 1,
  "rating": 5,
  "comment": "Excellent book! Must read!",
  "reviewerName": "John Doe",
  "date": "2024-01-15T10:30:00.000Z"
}
```

### Ответ (400 Bad Request)

```json
{
  "error": "Rating must be between 1 and 5"
}
```

### Ошибка (404 Not Found)

```json
{
  "error": "Book not found"
}
```

## 10. Получить отзывы на книгу

```http
GET /books/{id}/reviews
```

### Пример запроса
```http
GET /books/1/reviews
```

### Ответ (200 ОК)

```json
{
  "bookId": 1,
  "totalReviews": 3,
  "averageRating": 4.7,
  "reviews": [
    {
      "reviewId": 1,
      "bookId": 1,
      "rating": 5,
      "comment": "Excellent book!",
      "reviewerName": "John",
      "date": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```