# نظام التوصية - دليل الإعداد والتشغيل

## 📋 المتطلبات الأساسية

### 1. **Python Dependencies**
```bash
pip install pandas mlxtend mysql-connector-python
```

### 2. **Laravel Dependencies**
```bash
composer require mysql-connector-python
```

## 🚀 خطوات الإعداد

### الخطوة 1: تشغيل Migration
```bash
cd EDUVERS
php artisan migrate
```

### الخطوة 2: تصدير بيانات المستخدمين
```bash
# تشغيل الخادم أولاً
php artisan serve

# ثم تصدير البيانات
curl http://localhost:8000/export-user-courses
```

### الخطوة 3: تشغيل سكريبت Python
```bash
# من المجلد الرئيسي
python generate_rules.py
```

### الخطوة 4: اختبار النظام
```bash
# اختبار التوصيات لمستخدم معين
curl http://localhost:8000/recommendations/1
```

## ⚙️ إعداد قاعدة البيانات

### متغيرات البيئة (Environment Variables)
أضف هذه المتغيرات إلى ملف `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=junior
```

### أو قم بتعديل `generate_rules.py` مباشرة:
```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_password',
    'database': 'junior'
}
```

## 🔧 استكشاف الأخطاء

### مشكلة: "transactions.json not found"
**الحل:**
1. تأكد من تشغيل `/export-user-courses` أولاً
2. تحقق من المسار: `EDUVERS/storage/app/transactions.json`

### مشكلة: "Database connection error"
**الحل:**
1. تحقق من إعدادات قاعدة البيانات
2. تأكد من تشغيل MySQL
3. تحقق من صحة اسم قاعدة البيانات

### مشكلة: "No recommendation rules found"
**الحل:**
1. تأكد من وجود بيانات في `user_course_unlocks`
2. تشغيل `generate_rules.py` مرة أخرى
3. تحقق من جدول `recommendation_rules`

## 📊 اختبار النظام

### 1. **إضافة بيانات تجريبية**
```sql
INSERT INTO user_course_unlocks (user_id, course_id) VALUES 
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 4), (2, 3),
(3, 2), (3, 3), (3, 4);
```

### 2. **تصدير البيانات**
```bash
curl http://localhost:8000/export-user-courses
```

### 3. **تشغيل خوارزمية التوصية**
```bash
python generate_rules.py
```

### 4. **اختبار التوصيات**
```bash
curl http://localhost:8000/recommendations/1
```

## 🎯 النتيجة المتوقعة

```json
{
  "recommendations": [4, 5],
  "course_details": [
    {
      "id": 4,
      "name": "Advanced JavaScript",
      "description": "Learn advanced JavaScript concepts"
    },
    {
      "id": 5,
      "name": "React Fundamentals",
      "description": "Master React basics"
    }
  ],
  "count": 2
}
```

## 🔄 تحديث التوصيات

لتحديث التوصيات بشكل دوري:

1. **تصدير البيانات الجديدة:**
   ```bash
   curl http://localhost:8000/export-user-courses
   ```

2. **تشغيل الخوارزمية:**
   ```bash
   python generate_rules.py
   ```

## 📝 ملاحظات مهمة

- تأكد من وجود بيانات كافية في `user_course_unlocks`
- كلما زادت البيانات، كلما تحسنت التوصيات
- يمكن تعديل `min_support` و `min_threshold` في `generate_rules.py`
- النظام يعمل بشكل أفضل مع 10+ مستخدمين و 5+ كورسات

## 🆘 الدعم

إذا واجهت أي مشاكل:
1. تحقق من سجلات Laravel: `storage/logs/laravel.log`
2. تحقق من إعدادات قاعدة البيانات
3. تأكد من تشغيل جميع الخدمات المطلوبة 