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
books = books.map(book => ({ ...book, category: book.category.trim() }));

let cart = [];

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

// عرض الكتب في الصفحة الرئيسية
function displayBooksOnHome(filteredBooks = books) {
    const bookGrid = document.querySelector('.book-grid');
    if (!bookGrid) return;
    bookGrid.innerHTML = '';
    filteredBooks.forEach(book => {
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
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const bookId = parseInt(this.dataset.id);
            cart.push(bookId);
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        });
    });
}



// تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category')?.trim();
    if (category) {
        const filtered = books.filter(book => book.category === category);
        displayBooksOnHome(filtered);
    } else {
        displayBooksOnHome();
    }
    updateCartCount();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        document.getElementById('user-info').innerHTML = `<span>${user.name} - نقاط: ${user.points}</span>`;
    }
});