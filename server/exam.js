const express = require('express');
const app = express();
const port = 8085;

app.use(express.json());

// ========== БАЗА ДАННЫХ ==========
let books = [
    {
        id: 1,
        isbn: "978-0141182803",
        title: "1984",
        author: "George Orwell",
        genre: "Dystopian",
        year: 1949,
        price: 450,
        stock: 15,
        rating: 4.8,
        pages: 328
    },
    {
        id: 2,
        isbn: "978-0061120084",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        genre: "Classic",
        year: 1960,
        price: 520,
        stock: 8,
        rating: 4.9,
        pages: 336
    },
    {
        id: 3,
        isbn: "978-0451524935",
        title: "Animal Farm",
        author: "George Orwell",
        genre: "Satire",
        year: 1945,
        price: 380,
        stock: 22,
        rating: 4.6,
        pages: 112
    },
    {
        id: 4,
        isbn: "978-0743273565",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        genre: "Classic",
        year: 1925,
        price: 490,
        stock: 5,
        rating: 4.7,
        pages: 180
    },
    {
        id: 5,
        isbn: "978-0544003415",
        title: "The Hobbit",
        author: "J.R.R. Tolkien",
        genre: "Fantasy",
        year: 1937,
        price: 650,
        stock: 12,
        rating: 4.9,
        pages: 310
    },
    {
        id: 6,
        isbn: "978-0439023481",
        title: "The Hunger Games",
        author: "Suzanne Collins",
        genre: "Science Fiction",
        year: 2008,
        price: 420,
        stock: 30,
        rating: 4.5,
        pages: 374
    },
    {
        id: 7,
        isbn: "978-0307474278",
        title: "The Da Vinci Code",
        author: "Dan Brown",
        genre: "Thriller",
        year: 2003,
        price: 550,
        stock: 3,
        rating: 4.4,
        pages: 454
    }
];

let orders = [];
let nextOrderId = 1;
let reviews = [];

// ========== МИДЛВЭРЫ ==========
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// API Key middleware для защищенных эндпоинтов
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== 'bookstore-2026-secret') {
        return res.status(401).json({ error: 'Invalid or missing API Key' });
    }
    next();
};

// ========== ЭНДПОИНТЫ ==========

// 1. GET /books - получить все книги с фильтрацией
app.get('/books', (req, res) => {
    let result = [...books];

    // Фильтрация по жанру
    if (req.query.genre) {
        result = result.filter(b => b.genre.toLowerCase() === req.query.genre.toLowerCase());
    }

    // Фильтрация по автору
    if (req.query.author) {
        result = result.filter(b => b.author.toLowerCase().includes(req.query.author.toLowerCase()));
    }

    // Фильтрация по минимальной цене
    if (req.query.minPrice) {
        result = result.filter(b => b.price >= parseInt(req.query.minPrice));
    }

    // Фильтрация по максимальной цене
    if (req.query.maxPrice) {
        result = result.filter(b => b.price <= parseInt(req.query.maxPrice));
    }

    // Пагинация
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const start = page * size;
    const end = start + size;

    const paginatedResult = result.slice(start, end);

    res.status(200).json({
        total: result.length,
        page: page,
        size: size,
        books: paginatedResult
    });
});

// 2. GET /books/{id} - получить книгу по ID
app.get('/books/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).json(book);
});

// 3. GET /books/isbn/{isbn} - получить книгу по ISBN
app.get('/books/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books.find(b => b.isbn === isbn);

    if (!book) {
        return res.status(404).json({ error: 'Book not found with this ISBN' });
    }

    res.status(200).json(book);
});

// 4. POST /books - добавить новую книгу (требуется API Key)
app.post('/books', validateApiKey, (req, res) => {
    const { isbn, title, author, genre, year, price, stock, pages } = req.body;

    // Валидация обязательных полей
    if (!isbn || !title || !author || !price) {
        return res.status(400).json({
            error: 'Missing required fields: isbn, title, author, price are mandatory'
        });
    }

    // Проверка уникальности ISBN
    if (books.find(b => b.isbn === isbn)) {
        return res.status(409).json({ error: 'Book with this ISBN already exists' });
    }

    const newBook = {
        id: books.length + 1,
        isbn,
        title,
        author,
        genre: genre || 'Uncategorized',
        year: year || new Date().getFullYear(),
        price,
        stock: stock || 0,
        rating: 0,
        pages: pages || 0
    };

    books.push(newBook);
    res.status(201).json(newBook);
});

// 5. PUT /books/{id} - полностью обновить книгу
app.put('/books/:id', validateApiKey, (req, res) => {
    const id = parseInt(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    const updatedBook = {
        id: id,
        ...req.body
    };

    books[index] = updatedBook;
    res.status(200).json(updatedBook);
});

// 6. PATCH /books/{id} - частично обновить книгу
app.patch('/books/:id', validateApiKey, (req, res) => {
    const id = parseInt(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    books[index] = { ...books[index], ...req.body };
    res.status(200).json(books[index]);
});

// 7. DELETE /books/{id} - удалить книгу
app.delete('/books/:id', validateApiKey, (req, res) => {
    const id = parseInt(req.params.id);
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    books.splice(index, 1);
    res.status(204).send();
});

// 8. POST /orders - создать заказ
app.post('/orders', (req, res) => {
    const { bookId, quantity, customerName, customerEmail } = req.body;

    if (!bookId || !quantity || !customerName || !customerEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const book = books.find(b => b.id === bookId);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    if (book.stock < quantity) {
        return res.status(400).json({
            error: 'Not enough stock',
            available: book.stock,
            requested: quantity
        });
    }

    // Уменьшаем количество на складе
    book.stock -= quantity;

    const order = {
        orderId: nextOrderId++,
        bookId: bookId,
        bookTitle: book.title,
        quantity: quantity,
        totalPrice: book.price * quantity,
        customerName: customerName,
        customerEmail: customerEmail,
        orderDate: new Date().toISOString(),
        status: 'confirmed'
    };

    orders.push(order);
    res.status(201).json(order);
});

// 9. GET /orders/{orderId} - получить заказ
app.get('/orders/:orderId', (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const order = orders.find(o => o.orderId === orderId);

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json(order);
});

// 10. GET /books/{id}/stock - проверить наличие
app.get('/books/:id/stock', (req, res) => {
    const id = parseInt(req.params.id);
    const book = books.find(b => b.id === id);

    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).json({
        bookId: id,
        title: book.title,
        stock: book.stock,
        available: book.stock > 0,
        inStock: book.stock > 0
    });
});

// 11. POST /books/{id}/reviews - добавить отзыв
app.post('/books/:id/reviews', (req, res) => {
    const id = parseInt(req.params.id);
    const { rating, comment, reviewerName } = req.body;

    const book = books.find(b => b.id === id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const review = {
        reviewId: reviews.length + 1,
        bookId: id,
        rating: rating,
        comment: comment || '',
        reviewerName: reviewerName || 'Anonymous',
        date: new Date().toISOString()
    };

    reviews.push(review);

    // Обновляем средний рейтинг книги
    const bookReviews = reviews.filter(r => r.bookId === id);
    const avgRating = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
    book.rating = Math.round(avgRating * 10) / 10;

    res.status(201).json(review);
});

// 12. GET /books/{id}/reviews - получить все отзывы на книгу
app.get('/books/:id/reviews', (req, res) => {
    const id = parseInt(req.params.id);
    const bookReviews = reviews.filter(r => r.bookId === id);

    res.status(200).json({
        bookId: id,
        totalReviews: bookReviews.length,
        averageRating: bookReviews.length > 0
            ? bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length
            : 0,
        reviews: bookReviews
    });
});

// 13. GET /books/stats/top-rated - топ книг по рейтингу
app.get('/books/stats/top-rated', (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const topBooks = [...books]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);

    res.status(200).json(topBooks);
});

// 14. GET /books/genres - получить все жанры
app.get('/books/genres', (req, res) => {
    const genres = [...new Set(books.map(b => b.genre))];
    const genreStats = genres.map(genre => ({
        genre: genre,
        count: books.filter(b => b.genre === genre).length,
        averagePrice: Math.round(books.filter(b => b.genre === genre).reduce((sum, b) => sum + b.price, 0) / books.filter(b => b.genre === genre).length)
    }));

    res.status(200).json(genreStats);
});

// 15. DELETE /orders/{orderId} - отменить заказ
app.delete('/orders/:orderId', (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const orderIndex = orders.findIndex(o => o.orderId === orderId);

    if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];

    // Возвращаем книги на склад
    const book = books.find(b => b.id === order.bookId);
    if (book) {
        book.stock += order.quantity;
    }

    orders.splice(orderIndex, 1);
    res.status(200).json({ message: 'Order cancelled successfully', orderId: orderId });
});

// ========== ДЕБАГ ЭНДПОИНТЫ ==========
app.get('/debug/books/all', (req, res) => {
    res.status(200).json(books);
});

app.get('/debug/orders/all', (req, res) => {
    res.status(200).json(orders);
});

app.post('/debug/reset', (req, res) => {
    // Сброс к начальному состоянию
    books = [
        {
            id: 1,
            isbn: "978-0141182803",
            title: "1984",
            author: "George Orwell",
            genre: "Dystopian",
            year: 1949,
            price: 450,
            stock: 15,
            rating: 4.8,
            pages: 328
        },
        {
            id: 2,
            isbn: "978-0061120084",
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            genre: "Classic",
            year: 1960,
            price: 520,
            stock: 8,
            rating: 4.9,
            pages: 336
        }
    ];
    orders = [];
    reviews = [];
    nextOrderId = 1;

    res.status(200).json({ message: 'Database reset to initial state' });
});

// ========== ЗАПУСК СЕРВЕРА ==========
app.listen(port, '0.0.0.0', () => {
    console.log(`
    ╔══════════════════════════════════════════════════════════════════╗
    ║                    📚 BOOKSTORE API SERVER 📚                   ║
    ║                    Running on: http://localhost:${port}          ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║  API Key: bookstore-2026-secret                                  ║
    ║  (Required for POST, PUT, PATCH, DELETE)                         ║
    ╠══════════════════════════════════════════════════════════════════╣
    ║  Total books available: ${books.length}                          ║
    ║  Total genres: ${[...new Set(books.map(b => b.genre))].length}   ║
    ╚══════════════════════════════════════════════════════════════════╝
    `);
});