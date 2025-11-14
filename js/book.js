// بيانات الكتب
const books = JSON.parse(localStorage.getItem('books')) || [
    { id: 1, title: 'كتاب 1', author: 'مؤلف 1', category: 'روايات', price: 50, description: 'وصف مفصل للكتاب 1', image: '../images/book1.jpg', pdf: null },
    { id: 2, title: 'كتاب 2', author: 'مؤلف 2', category: 'تطوير ذاتي', price: 40, description: 'وصف مفصل للكتاب 2', image: '../images/book2.jpg', pdf: null },
    { id: 3, title: 'كتاب تعليمي', author: 'مؤلف 3', category: 'تعليم', price: 60, description: 'كتاب تعليمي مفيد', image: '../images/book3.jpg', pdf: null },
    { id: 4, title: 'كتاب أطفال', author: 'مؤلف 4', category: 'أطفال', price: 30, description: 'كتاب ممتع للأطفال', image: '../images/book4.jpg', pdf: null },
    { id: 5, title: 'كتاب ديني', author: 'مؤلف 5', category: 'دينية', price: 45, description: 'كتاب ديني روحي', image: '../images/book5.jpg', pdf: null },
    { id: 6, title: 'كتاب أجنبي', author: 'مؤلف 6', category: 'أجنبية', price: 70, description: 'كتاب مترجم', image: '../images/book6.jpg', pdf: null },
];

// الحصول على id من URL
const urlParams = new URLSearchParams(window.location.search);
const bookId = parseInt(urlParams.get('id'));

const book = books.find(b => b.id === bookId);

if (book) {
    document.getElementById('book-title').textContent = book.title;
    document.getElementById('book-author').textContent = `المؤلف: ${book.author}`;
    document.getElementById('book-description').textContent = book.description;
    document.getElementById('book-price').textContent = `السعر: ${book.price} جنيه مصري`;
    document.getElementById('book-image').src = book.image;

    const pdfLink = document.getElementById('pdf-link');
    let links = '';
    if (book.pdf) links += `<a href="${book.pdf}" target="_blank" class="btn">تحميل PDF</a> `;
    if (book.word) links += `<a href="${book.word}" target="_blank" class="btn">تحميل Word</a> `;
    if (book.epub) links += `<a href="${book.epub}" target="_blank" class="btn">تحميل EPUB</a> `;
    pdfLink.innerHTML = links;

    // إضافة إلى السلة
    document.getElementById('add-to-cart-detail').addEventListener('click', function() {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(bookId);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert('تم إضافة الكتاب إلى السلة!');
    });
} else {
    document.getElementById('book-details').innerHTML = '<p>الكتاب غير موجود.</p>';
}