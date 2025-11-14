// بيانات الكتب (محاكاة)
let books = JSON.parse(localStorage.getItem('books')) || [
    { id: 1, title: 'كتاب 1', author: 'مؤلف 1', category: 'روايات', price: 50, description: 'وصف كتاب 1', image: 'images/book1.jpg', pdf: null, word: null, epub: null },
    { id: 2, title: 'كتاب 2', author: 'مؤلف 2', category: 'تطوير ذاتي', price: 40, description: 'وصف كتاب 2', image: 'images/book2.jpg', pdf: null, word: null, epub: null },
    { id: 3, title: 'كتاب تعليمي', author: 'مؤلف 3', category: 'تعليم', price: 60, description: 'كتاب تعليمي مفيد', image: 'images/book3.jpg', pdf: null, word: null, epub: null },
    { id: 4, title: 'كتاب أطفال', author: 'مؤلف 4', category: 'أطفال', price: 30, description: 'كتاب ممتع للأطفال', image: 'images/book4.jpg', pdf: null, word: null, epub: null },
    { id: 5, title: 'كتاب ديني', author: 'مؤلف 5', category: 'دينية', price: 45, description: 'كتاب ديني روحي', image: 'images/book5.jpg', pdf: null, word: null, epub: null },
    { id: 6, title: 'كتاب أجنبي', author: 'مؤلف 6', category: 'أجنبية', price: 70, description: 'كتاب مترجم', image: 'images/book6.jpg', pdf: null, word: null, epub: null },
];

// تنظيف الفئات من المسافات
books = books.map(book => {
    let updatedBook = { ...book, category: book.category.trim() };
    // تصحيح مسارات الصور للصفحة الرئيسية
    if (updatedBook.image && updatedBook.image.startsWith('../images/')) {
        updatedBook.image = updatedBook.image.replace('../images/', 'images/');
    }
    return updatedBook;
});
// حفظ البيانات المحدثة
localStorage.setItem('books', JSON.stringify(books));

let cart = [];

// آراء العملاء
let reviews = JSON.parse(localStorage.getItem('reviews')) || [
    { text: "موقع رائع وخدمة ممتازة!", author: "عميل سعيد" }
];

// تحديث عدد السلة
function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}

// البحث
document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('search').value.toLowerCase();
    const results = books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query)
    );
    console.log('نتائج البحث:', results);
    // عرض النتائج (يمكن تحسينها لعرض في الصفحة)
});

// إضافة إلى السلة
document.querySelectorAll('.add-to-cart').forEach((button, index) => {
    button.addEventListener('click', function() {
        const bookId = index + 1; // افتراضيًا، استخدم الفهرس +1 كـ id
        cart.push(bookId);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    });
});

// عرض الكتب في مكان محدد
function displayBooks(selector, bookList) {
    const bookGrid = document.querySelector(selector);
    if (!bookGrid) return;
    bookGrid.innerHTML = '';
    bookList.forEach(book => {
        bookGrid.innerHTML += `
            <div class="book">
                <a href="pages/book.html?id=${book.id}">
                    <img src="${book.image || 'images/default.jpg'}" alt="${book.title}">
                    <h4>${book.title}</h4>
                    <p>${book.author}</p>
                    <p>${book.price} جنيه مصري</p>
                </a>
                <button class="add-to-cart" data-id="${book.id}">أضف إلى السلة</button>
            </div>
        `;
    });
    // إعادة ربط الأحداث
    document.querySelectorAll(`${selector} .add-to-cart`).forEach(button => {
        button.addEventListener('click', function() {
            const bookId = parseInt(this.dataset.id);
            cart.push(bookId);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        });
    });
}

// عرض الكتب في الصفحة الرئيسية (الأكثر مبيعًا)
function displayBooksOnHome(filteredBooks = books) {
    displayBooks('#bestsellers .book-grid', filteredBooks);
}

// عرض التوصيات
function displayRecommendations() {
    const recommended = [...books].sort(() => 0.5 - Math.random()).slice(0, 4);
    displayBooks('#recommendations .book-grid', recommended);
}

// عرض آراء العملاء
function displayReviews() {
    const reviewsContainer = document.querySelector('#reviews .container');
    if (!reviewsContainer) return;
    const reviewsHTML = reviews.map(review => `<div class="review"><p>"${review.text}"</p><cite>- ${review.author}</cite></div>`).join('');
    reviewsContainer.innerHTML = `<h2>آراء العملاء</h2>${reviewsHTML}`;
}



// تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = decodeURIComponent(urlParams.get('category') || '').trim();
    if (category) {
        const filtered = books.filter(book => book.category === category);
        displayBooksOnHome(filtered);
    } else {
        displayBooksOnHome();
    }
    displayRecommendations();
    displayReviews();
    updateCartCount();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('user-info').innerHTML = `<span>${user.name} - نقاط: ${user.points}</span>`;
    }

    // تهيئة الدردشة
    initChat();
});

// تهيئة أداة الدردشة
function initChat() {
    document.getElementById('chat-toggle').addEventListener('click', () => {
        const window = document.getElementById('chat-window');
        window.style.display = window.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('chat-send').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    addMessage('user', message);
    input.value = '';

    fetch('http://localhost:3003/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    })
    .then(res => res.json())
    .then(data => {
        addMessage('bot', data.response || data.error);
    })
    .catch(err => {
        addMessage('bot', 'عذرًا، حدث خطأ في الاتصال.');
    });
}

function addMessage(sender, text) {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = sender;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}