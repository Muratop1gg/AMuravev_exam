# 📚 BookStore API Documentation

## Базовый URL

http://185.5.249.114:8085


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
```html
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
```html
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
  "year": 2024,
  "price": 599,
  "stock": 10,
  "pages": 250
}
```

### Обязательные поля
- isbn (string) - уникальный идентификатор

- title (string) - название книги

- author (string) - автор

- price (integer) - цена

### Опциональные поля
- genre (string) - жанр (default: "Uncategorized")

- year (integer) - год издания (default: текущий год)

- stock (integer) - количество на складе (default: 0)

- pages (integer) - количество страниц (default: 0)