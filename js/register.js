document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        alert('البريد الإلكتروني موجود بالفعل!');
        return;
    }

    const newUser = { name, email, password, points: 0 };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    alert('تم التسجيل بنجاح!');
    window.location.href = 'login.html';
});