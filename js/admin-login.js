function showRegister() {
    document.getElementById('admin-register').style.display = 'block';
}

document.getElementById('admin-login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    const admins = JSON.parse(localStorage.getItem('admins')) || [{ username: 'admin', password: 'admin123' }];
    const admin = admins.find(a => a.username === username && a.password === password);

    if (admin) {
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        window.location.href = 'admin.html';
    } else {
        alert('بيانات غير صحيحة!');
    }
});

document.getElementById('admin-register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('new-username').value;
    const password = document.getElementById('new-password').value;

    const admins = JSON.parse(localStorage.getItem('admins')) || [{ username: 'admin', password: 'admin123' }];
    if (admins.find(a => a.username === username)) {
        alert('اسم المستخدم موجود بالفعل!');
        return;
    }

    admins.push({ username, password });
    localStorage.setItem('admins', JSON.stringify(admins));
    alert('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.');
    document.getElementById('admin-register').style.display = 'none';
});