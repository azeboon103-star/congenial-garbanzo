// بيانات الكتب
const books = JSON.parse(localStorage.getItem('books')) || [
    { id: 1, title: 'كتاب 1', author: 'مؤلف 1', category: 'روايات', price: 50, pdf: null },
    { id: 2, title: 'كتاب 2', author: 'مؤلف 2', category: 'تطوير ذاتي', price: 40, pdf: null },
    { id: 3, title: 'كتاب تعليمي', author: 'مؤلف 3', category: 'تعليم', price: 60, pdf: null },
    { id: 4, title: 'كتاب أطفال', author: 'مؤلف 4', category: 'أطفال', price: 30, pdf: null },
    { id: 5, title: 'كتاب ديني', author: 'مؤلف 5', category: 'دينية', price: 45, pdf: null },
    { id: 6, title: 'كتاب أجنبي', author: 'مؤلف 6', category: 'أجنبية', price: 70, pdf: null },
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// عرض السلة
function displayCart() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(itemId => {
        const book = books.find(b => b.id == itemId);
        if (book) {
            total += book.price;
            cartItems.innerHTML += `
                <div class="cart-item">
                    <h4>${book.title}</h4>
                    <p>${book.author}</p>
                    <p>${book.price} جنيه مصري</p>
                    <button onclick="removeFromCart(${itemId})">إزالة</button>
                </div>
            `;
        }
    });
    document.getElementById('total').textContent = total + ' جنيه مصري';
}

// إزالة من السلة
function removeFromCart(id) {
    cart = cart.filter(item => item != id);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

// الدفع
document.getElementById('checkout').addEventListener('click', function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert('يرجى تسجيل الدخول أولاً.');
        return;
    }
    if (cart.length === 0) {
        alert('السلة فارغة.');
        return;
    }
    // إعادة توجيه إلى صفحة الدفع
    window.location.href = 'payment.html';
});

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', displayCart);