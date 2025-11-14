let books = JSON.parse(localStorage.getItem('books')) || [
    { id: 1, title: 'كتاب 1', author: 'مؤلف 1', category: 'روايات', price: 50, description: 'وصف', image: '../images/book1.jpg', pdf: null },
    { id: 2, title: 'كتاب 2', author: 'مؤلف 2', category: 'تطوير ذاتي', price: 40, description: 'وصف', image: '../images/book2.jpg', pdf: null },
    { id: 3, title: 'كتاب تعليمي', author: 'مؤلف 3', category: 'تعليم', price: 60, description: 'كتاب تعليمي مفيد', image: '../images/book3.jpg', pdf: null },
    { id: 4, title: 'كتاب أطفال', author: 'مؤلف 4', category: 'أطفال', price: 30, description: 'كتاب ممتع للأطفال', image: '../images/book4.jpg', pdf: null },
    { id: 5, title: 'كتاب ديني', author: 'مؤلف 5', category: 'دينية', price: 45, description: 'كتاب ديني روحي', image: '../images/book5.jpg', pdf: null },
    { id: 6, title: 'كتاب أجنبي', author: 'مؤلف 6', category: 'أجنبية', price: 70, description: 'كتاب مترجم', image: '../images/book6.jpg', pdf: null },
];

// تنظيف الفئات من المسافات
books = books.map(book => ({ ...book, category: book.category.trim() }));

// آراء العملاء
let reviews = JSON.parse(localStorage.getItem('reviews')) || [
    { text: "موقع رائع وخدمة ممتازة!", author: "عميل سعيد" }
];

// عرض الكتب
function displayBooks() {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
    books.forEach(book => {
        bookList.innerHTML += `
            <div class="book">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
                <p>${book.price} جنيه مصري</p>
                <button onclick="deleteBook(${book.id})">حذف</button>
            </div>
        `;
    });
}

// عرض آراء العملاء
function displayReviews() {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';
    reviews.forEach((review, index) => {
        reviewList.innerHTML += `
            <div class="review">
                <p>"${review.text}"</p>
                <cite>- ${review.author}</cite>
                <button onclick="deleteReview(${index})">حذف</button>
            </div>
        `;
    });
}

// إضافة كتاب
document.getElementById('add-book-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const category = document.getElementById('category').value.trim();
    if (!category) {
        alert('يرجى اختيار فئة للكتاب');
        return;
    }
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('author', document.getElementById('author').value);
    formData.append('category', category);
    formData.append('price', document.getElementById('price').value);
    formData.append('description', document.getElementById('description').value);
    const imageFile = document.getElementById('image').files[0];
    if (imageFile) formData.append('image', imageFile);
    const pdfFile = document.getElementById('pdf').files[0];
    if (pdfFile) formData.append('pdf', pdfFile);
    const wordFile = document.getElementById('word').files[0];
    if (wordFile) formData.append('word', wordFile);
    const epubFile = document.getElementById('epub').files[0];
    if (epubFile) formData.append('epub', epubFile);

    try {
        console.log('إرسال البيانات إلى الخادم...');
        const response = await fetch('http://localhost:3003/upload', {
            method: 'POST',
            body: formData
        });
        console.log('استجابة الخادم:', response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('البيانات المستلمة:', data);
        const newBook = {
            id: Date.now(),
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            category: document.getElementById('category').value.trim(),
            price: parseFloat(document.getElementById('price').value),
            description: document.getElementById('description').value,
            image: data.image || '../images/default.jpg',
            pdf: data.pdf || null,
            word: data.word || null,
            epub: data.epub || null
        };
        books.push(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        displayBooks();
        this.reset();
        alert('تم إضافة الكتاب بنجاح!');
    } catch (error) {
        console.error('خطأ في رفع الملفات:', error);
        alert('فشل في رفع الملفات. تأكد من تشغيل الخادم على localhost:3003. الخطأ: ' + error.message);
    }
});

// حذف كتاب
function deleteBook(id) {
    books = books.filter(book => book.id !== id);
    localStorage.setItem('books', JSON.stringify(books));
    displayBooks();
}

// إضافة رأي
document.getElementById('add-review-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const text = document.getElementById('review-text').value;
    const author = document.getElementById('review-author').value;
    reviews.push({ text, author });
    localStorage.setItem('reviews', JSON.stringify(reviews));
    displayReviews();
    this.reset();
    alert('تم إضافة الرأي بنجاح!');
});

// حذف رأي
function deleteReview(index) {
    reviews.splice(index, 1);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    displayReviews();
}

// عرض الطلبات
function displayOrders() {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '';
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.forEach(order => {
        const itemsHTML = order.items.map(item => `<li>${item.title} - ${item.price} جنيه</li>`).join('');
        ordersList.innerHTML += `
            <div class="order">
                <h4>طلب رقم: ${order.id}</h4>
                <p>العميل: ${order.user}</p>
                <p>التاريخ: ${order.date}</p>
                <p>المجموع: ${order.total} جنيه مصري</p>
                <ul>${itemsHTML}</ul>
            </div>
        `;
    });
}

function showChangePassword() {
    document.getElementById('change-password').style.display = 'block';
}

document.getElementById('change-password-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password-change').value;

    const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
    if (currentAdmin.password !== oldPassword) {
        alert('كلمة المرور القديمة غير صحيحة!');
        return;
    }

    // تحديث كلمة المرور
    const admins = JSON.parse(localStorage.getItem('admins')) || [];
    const index = admins.findIndex(a => a.username === currentAdmin.username);
    if (index !== -1) {
        admins[index].password = newPassword;
        localStorage.setItem('admins', JSON.stringify(admins));
        currentAdmin.password = newPassword;
        localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
        alert('تم تغيير كلمة المرور بنجاح!');
        document.getElementById('change-password').style.display = 'none';
    }
});

// تحميل الصفحة
// عرض الطلبات المعلقة
function displayPendingOrders() {
    fetch('http://localhost:3003/pending-orders')
        .then(res => res.json())
        .then(pendingOrders => {
            const pendingList = document.getElementById('pending-orders-list');
            pendingList.innerHTML = '';

            if (pendingOrders.length === 0) {
                pendingList.innerHTML = '<p>لا توجد طلبات معلقة</p>';
                return;
            }

            pendingOrders.forEach(order => {
                const orderDiv = document.createElement('div');
                orderDiv.className = 'order';
                orderDiv.style.border = '2px solid #ffc107';
                orderDiv.style.background = '#fff3cd';

                orderDiv.innerHTML = `
                    <h4>طلب رقم: ${order.merchantRefNum}</h4>
                    <p><strong>العميل:</strong> ${order.customerName} (${order.customerEmail})</p>
                    <p><strong>طريقة الدفع:</strong> ${order.paymentMethod}</p>
                    <p><strong>المبلغ:</strong> ${order.amount} جنيه</p>
                    <p><strong>التاريخ:</strong> ${new Date(order.submittedAt).toLocaleString('ar')}</p>
                    <p><strong>إثبات الدفع:</strong></p>
                    <img src="http://localhost:3003${order.paymentProof}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; margin: 10px 0;" alt="إثبات الدفع">
                    <div style="margin-top: 10px;">
                        <button onclick="approveOrder('${order.id}')" style="background: #28a745; color: white; border: none; padding: 5px 10px; margin-right: 5px; cursor: pointer;">موافقة</button>
                        <button onclick="rejectOrder('${order.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer;">رفض</button>
                    </div>
                `;

                pendingList.appendChild(orderDiv);
            });
        })
        .catch(err => {
            console.error('خطأ في تحميل الطلبات المعلقة:', err);
            document.getElementById('pending-orders-list').innerHTML = '<p>خطأ في تحميل الطلبات المعلقة</p>';
        });
}

// موافقة على الطلب
function approveOrder(orderId) {
    if (confirm('هل أنت متأكد من الموافقة على هذا الطلب؟')) {
        fetch(`http://localhost:3003/approve-order/${orderId}`, {
            method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('تمت الموافقة على الطلب بنجاح');
                displayPendingOrders();
                displayOrders(); // تحديث قائمة الطلبات المكتملة
            } else {
                alert('فشل في الموافقة على الطلب');
            }
        })
        .catch(err => {
            console.error('خطأ في الموافقة:', err);
            alert('خطأ في الموافقة على الطلب');
        });
    }
}

// رفض الطلب
function rejectOrder(orderId) {
    if (confirm('هل أنت متأكد من رفض هذا الطلب؟')) {
        fetch(`http://localhost:3003/reject-order/${orderId}`, {
            method: 'POST'
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert('تم رفض الطلب');
                displayPendingOrders();
            } else {
                alert('فشل في رفض الطلب');
            }
        })
        .catch(err => {
            console.error('خطأ في الرفض:', err);
            alert('خطأ في رفض الطلب');
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('currentAdmin')) {
        window.location.href = 'admin-login.html';
    }
    displayBooks();
    displayReviews();
    displayOrders();
    displayPendingOrders();
});