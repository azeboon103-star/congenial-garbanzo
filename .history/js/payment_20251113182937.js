// تعيين رقم الهاتف الافتراضي
document.getElementById('wallet-number').value = '01113233690';
document.getElementById('instapay-number').value = '01113233690';

// معاينة الصورة المرفوعة
document.getElementById('payment-proof').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('file-preview');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;">
                <p style="margin-top: 5px; font-size: 12px; color: #666;">${file.name}</p>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
});

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

    const paymentProof = document.getElementById('payment-proof').files[0];
    if (!paymentProof) {
        alert('يرجى رفع إثبات الدفع');
        return;
    }

    // إعداد البيانات للإرسال
    const formData = new FormData();
    formData.append('paymentProof', paymentProof);
    formData.append('paymentMethod', method === 'wallet' ? 'PAYATFAWRY' : 'INSTAPAY');
    formData.append('customerMobile', number);
    formData.append('merchantRefNum', Date.now().toString());

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const orderItems = cart.map(id => books.find(b => b.id == id)).filter(b => b);
    const total = orderItems.reduce((sum, b) => sum + b.price, 0);

    formData.append('amount', total);
    formData.append('customerEmail', user ? user.email : 'test@example.com');
    formData.append('customerName', user ? user.name : 'عميل');
    formData.append('orderItems', JSON.stringify(orderItems));

    // إرسال طلب الدفع للموافقة
    fetch('http://localhost:3003/submit-payment', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            processPendingPayment(data);
        } else {
            alert('فشل في إرسال طلب الدفع: ' + (data.message || 'خطأ غير معروف'));
        }
    })
    .catch(err => {
        alert('خطأ في الاتصال: ' + err.message);
    });

    function processPendingPayment(data) {
        // حفظ الطلب كطلب معلق
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const orderItems = cart.map(id => books.find(b => b.id == id)).filter(b => b);
        const total = orderItems.reduce((sum, b) => sum + b.price, 0);
        const methodName = method === 'wallet' ? 'المحفظة الإلكترونية' : 'Instapay';

        const pendingOrder = {
            id: Date.now(),
            user: user ? user.name : 'غير مسجل',
            userEmail: user ? user.email : 'غير مسجل',
            items: orderItems,
            total,
            date: new Date().toLocaleString('ar'),
            method: methodName,
            paymentProof: data.paymentProof,
            status: 'pending', // حالة معلقة للموافقة
            merchantRefNum: data.merchantRefNum
        };

        // حفظ الطلبات المعلقة
        const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders')) || [];
        pendingOrders.push(pendingOrder);
        localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));

        // حفظ بيانات الطلب المعلق لصفحة التأكيد
        const pendingData = {
            methodName: methodName,
            total: total,
            referenceNumber: data.merchantRefNum,
            orderId: pendingOrder.id,
            status: 'pending'
        };
        localStorage.setItem('pendingPayment', JSON.stringify(pendingData));

        localStorage.removeItem('cart');
        window.location.href = 'payment-pending.html';
    }
});