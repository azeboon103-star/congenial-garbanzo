const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3003;

// تهيئة Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE');

// إعداد multer لرفع الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// استخدام CORS
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// صفحة رئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// رفع الملفات
app.post('/upload', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'word', maxCount: 1 },
  { name: 'epub', maxCount: 1 }
]), (req, res) => {
  const files = req.files;
  const response = {};
  if (files.image) response.image = `/uploads/${files.image[0].filename}`;
  if (files.pdf) response.pdf = `/uploads/${files.pdf[0].filename}`;
  if (files.word) response.word = `/uploads/${files.word[0].filename}`;
  if (files.epub) response.epub = `/uploads/${files.epub[0].filename}`;
  res.json(response);
});

// دفع عبر Fawry (لـ Instapay)
app.post('/charge', async (req, res) => {
  const { amount, paymentMethod, customerMobile, customerEmail, customerName, merchantRefNum } = req.body;

  // محاكاة الدفع للاختبار (بدون مفاتيح API حقيقية)
  if (!process.env.FAWRY_MERCHANT_CODE || !process.env.FAWRY_SECURITY_KEY) {
    console.log('استخدام محاكاة الدفع - لم يتم تعيين مفاتيح Fawry');
    // محاكاة نجاح الدفع
    setTimeout(() => {
      res.json({
        type: 'SUCCESS',
        referenceNumber: 'TEST_' + Date.now(),
        paymentMethod: paymentMethod,
        amount: amount,
        merchantRefNum: merchantRefNum
      });
    }, 1000); // تأخير 1 ثانية للمحاكاة
    return;
  }

  try {
    const response = await axios.post('https://www.atfawry.com/ECommerceWeb/Fawry/payments/charge', {
      merchantCode: process.env.FAWRY_MERCHANT_CODE,
      merchantRefNum,
      customerProfileId: customerMobile,
      paymentMethod,
      amount,
      currencyCode: 'EGP',
      description: 'شراء كتب من عالم الصفحات',
      customerMobile,
      customerEmail,
      customerName,
      paymentExpiry: 60 * 24 * 7 // 7 days
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FAWRY_SECURITY_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('خطأ في Fawry:', error.response?.data || error.message);
    res.status(500).json({ error: 'فشل في إنشاء الدفع' });
  }
});

// إرسال طلب دفع للموافقة
app.post('/submit-payment', upload.single('paymentProof'), async (req, res) => {
  console.log('Received submit-payment request');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  try {
    const {
      paymentMethod,
      customerMobile,
      merchantRefNum,
      amount,
      customerEmail,
      customerName,
      orderItems
    } = req.body;

    const paymentProof = req.file ? `/uploads/${req.file.filename}` : null;

    if (!paymentProof) {
      return res.status(400).json({ success: false, message: 'إثبات الدفع مطلوب' });
    }

    // حفظ الطلب المعلق في ملف JSON (في الإنتاج سيتم حفظ في قاعدة بيانات)
    const pendingOrder = {
      id: Date.now(),
      merchantRefNum,
      paymentMethod,
      customerMobile,
      customerEmail,
      customerName,
      amount: parseFloat(amount),
      orderItems: JSON.parse(orderItems || '[]'),
      paymentProof,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    // قراءة الطلبات المعلقة الموجودة
    let pendingOrders = [];
    try {
      const data = fs.readFileSync('pending-orders.json', 'utf8');
      pendingOrders = JSON.parse(data);
    } catch (err) {
      // الملف غير موجود، سيتم إنشاؤه
    }

    // إضافة الطلب الجديد
    pendingOrders.push(pendingOrder);

    // حفظ في الملف
    fs.writeFileSync('pending-orders.json', JSON.stringify(pendingOrders, null, 2));

    console.log('تم استلام طلب دفع جديد:', merchantRefNum);

    res.json({
      success: true,
      message: 'تم إرسال طلب الدفع بنجاح',
      merchantRefNum,
      paymentProof,
      orderId: pendingOrder.id
    });

  } catch (error) {
    console.error('خطأ في إرسال طلب الدفع:', error);
    res.status(500).json({ success: false, message: 'فشل في إرسال طلب الدفع' });
  }
});

// الحصول على الطلبات المعلقة
app.get('/pending-orders', (req, res) => {
  try {
    let pendingOrders = [];
    try {
      const data = fs.readFileSync('pending-orders.json', 'utf8');
      pendingOrders = JSON.parse(data);
    } catch (err) {
      // الملف غير موجود
    }
    res.json(pendingOrders);
  } catch (error) {
    console.error('خطأ في الحصول على الطلبات المعلقة:', error);
    res.status(500).json({ error: 'فشل في الحصول على الطلبات المعلقة' });
  }
});

// موافقة على الطلب
app.post('/approve-order/:orderId', (req, res) => {
  try {
    const orderId = req.params.orderId;
    let pendingOrders = [];

    try {
      const data = fs.readFileSync('pending-orders.json', 'utf8');
      pendingOrders = JSON.parse(data);
    } catch (err) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    const orderIndex = pendingOrders.findIndex(order => order.id == orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    const approvedOrder = pendingOrders[orderIndex];

    // إضافة الطلب إلى الطلبات المكتملة (في ملف منفصل)
    let completedOrders = [];
    try {
      const data = fs.readFileSync('completed-orders.json', 'utf8');
      completedOrders = JSON.parse(data);
    } catch (err) {
      // الملف غير موجود
    }

    const completedOrder = {
      id: approvedOrder.id,
      user: approvedOrder.customerName,
      userEmail: approvedOrder.customerEmail,
      items: approvedOrder.orderItems,
      total: approvedOrder.amount,
      date: new Date().toLocaleString('ar'),
      method: approvedOrder.paymentMethod,
      status: 'approved',
      approvedAt: new Date().toISOString()
    };

    completedOrders.push(completedOrder);
    fs.writeFileSync('completed-orders.json', JSON.stringify(completedOrders, null, 2));

    // إزالة الطلب من المعلقة
    pendingOrders.splice(orderIndex, 1);
    fs.writeFileSync('pending-orders.json', JSON.stringify(pendingOrders, null, 2));

    console.log('تمت الموافقة على الطلب:', orderId);
    res.json({ success: true, message: 'تمت الموافقة على الطلب بنجاح' });

  } catch (error) {
    console.error('خطأ في الموافقة على الطلب:', error);
    res.status(500).json({ success: false, message: 'فشل في الموافقة على الطلب' });
  }
});

// رفض الطلب
app.post('/reject-order/:orderId', (req, res) => {
  try {
    const orderId = req.params.orderId;
    let pendingOrders = [];

    try {
      const data = fs.readFileSync('pending-orders.json', 'utf8');
      pendingOrders = JSON.parse(data);
    } catch (err) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    const orderIndex = pendingOrders.findIndex(order => order.id == orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    // إزالة الطلب من المعلقة
    pendingOrders.splice(orderIndex, 1);
    fs.writeFileSync('pending-orders.json', JSON.stringify(pendingOrders, null, 2));

    console.log('تم رفض الطلب:', orderId);
    res.json({ success: true, message: 'تم رفض الطلب بنجاح' });

  } catch (error) {
    console.error('خطأ في رفض الطلب:', error);
    res.status(500).json({ success: false, message: 'فشل في رفض الطلب' });
  }
});

// دردشة مع Gemini
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(`أنت مساعد في متجر كتب عربي يدعى "عالم الصفحات". أجب بالعربية بشكل مفيد وودود. السؤال: ${message}`);
    const response = result.response.text();
    res.json({ response });
  } catch (error) {
    console.error('خطأ في Gemini:', error);
    res.status(500).json({ error: 'حدث خطأ في الدردشة' });
  }
});

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`الخادم يعمل على http://localhost:${PORT}`);
});