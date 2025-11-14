// تعيين رقم الهاتف الافتراضي
document.getElementById('wallet-number').value = '01113233690';
document.getElementById('instapay-number').value = '01113233690';

// اختيار طريقة الدفع
document.getElementById('wallet-btn').addEventListener('click', function() {
    setActive('wallet');
});

document.getElementById('instapay-btn').addEventListener('click', function() {
    setActive('instapay');
});

function setActive(method) {
    ['wallet', 'instapay'].forEach(m => {
        document.getElementById(m + '-btn').classList.remove('active');
        document.getElementById(m + '-fields').style.display = 'none';
    });
    document.getElementById(method + '-btn').classList.add('active');
    document.getElementById(method + '-fields').style.display = 'block';
}

// معلومات الدفع
document.getElementById('payment-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const activeBtn = document.querySelector('#payment-method .btn.active');
    const method = activeBtn.id.replace('-btn', '');

    const numberField = method === 'wallet' ? 'wallet-number' : 'instapay-number';
    const number = document.getElementById(numberField).value;
    if (!/^\d{11}$/.test(number)) {
        alert('يرجى إدخال رقم هاتف صحيح (11 رقم)');
        return;
    }

    // دفع حقيقي عبر Fawry
    const paymentMethod = method === 'wallet' ? 'PAYATFAWRY' : 'INSTAPAY';
    const mobile = document.getElementById(numberField).value;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const orderItems = cart.map(id => books.find(b => b.id == id)).filter(b => b);
    const total = orderItems.reduce((sum, b) => sum + b.price, 0);

    fetch('http://localhost:3003/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: total,
            paymentMethod,
            customerMobile: mobile,
            customerEmail: user ? user.email : 'test@example.com',
            customerName: user ? user.name : 'عميل',
            merchantRefNum: Date.now().toString()
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.type === 'SUCCESS') {
            processPayment();
        } else {
            alert('فشل في الدفع: ' + (data.message || 'خطأ غير معروف'));
        }
    })
    .catch(err => {
        alert('خطأ في الاتصال: ' + err.message);
    });

    function processPayment() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const pointsEarned = cart.length * 10;

        // تحديث النقاط
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            user.points += pointsEarned;
            localStorage.setItem('currentUser', JSON.stringify(user));
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const index = users.findIndex(u => u.email === user.email);
            if (index !== -1) {
                users[index] = user;
                localStorage.setItem('users', JSON.stringify(users));
            }
        }

        // حفظ الطلب
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const orderItems = cart.map(id => books.find(b => b.id == id)).filter(b => b);
        const total = orderItems.reduce((sum, b) => sum + b.price, 0);
        const order = {
            id: Date.now(),
            user: user ? user.name : 'غير مسجل',
            items: orderItems,
            total,
            date: new Date().toLocaleString('ar'),
            method: methodName
        };
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        const methodName = method === 'wallet' ? 'المحفظة الإلكترونية' : 'Instapay';
        alert(`تم الدفع بنجاح عبر ${methodName}! شكرًا لشرائك من عالم الصفحات. حصلت على ${pointsEarned} نقاط.`);

        localStorage.removeItem('cart');
        window.location.href = '../index.html';
    }
});