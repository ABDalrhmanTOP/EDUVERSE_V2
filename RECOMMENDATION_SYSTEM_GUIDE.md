# 🎯 نظام التوصية التلقائي - دليل الاستخدام

## ✅ **النظام جاهز للاستخدام!**

تم إنشاء نظام توصية شامل يعمل تلقائياً كلما حدث تعديل على بيانات المستخدمين.

## 🚀 **الأوامر المتاحة**

### 1. **توليد قواعد التوصية**
```bash
php artisan recommendations:generate-rules
```
- يصدر بيانات المستخدمين إلى ملف JSON
- يشغل خوارزمية Python لتوليد القواعد
- يحفظ النتائج في قاعدة البيانات أو ملف JSON

### 2. **استيراد القواعد من JSON إلى قاعدة البيانات**
```bash
php artisan recommendations:import-rules
```
- يستورد القواعد المحفوظة في JSON إلى قاعدة البيانات
- مفيد عندما تصبح قاعدة البيانات متاحة

### 3. **عرض قائمة الأوامر المتاحة**
```bash
php artisan list --name=recommendations
```

## 🔄 **التشغيل التلقائي**

### **Observer (مراقب التغييرات)**
- يعمل تلقائياً عند إنشاء/تحديث/حذف سجل في `user_course_unlocks`
- يشغل Job في الخلفية مع تأخير 5 دقائق لتجميع التعديلات

### **Scheduled Task (المهمة المجدولة)**
- يعمل يومياً في الساعة 2:00 صباحاً
- يضمن تحديث القواعد حتى لو فشل Observer

### **Background Job (المهمة في الخلفية)**
- يعمل في الخلفية بدون إعاقة التطبيق الرئيسي
- يحاول 3 مرات مع تأخير 60 ثانية بين المحاولات

## 📊 **النتائج الحالية**

تم توليد **30 قاعدة توصية** بنجاح من بيانات 3 مستخدمين:

### **أمثلة على القواعد المولدة:**
- إذا درس المستخدم الكورس (2) → يوصى بالكورس (3) [ثقة: 100%]
- إذا درس المستخدم الكورس (3) → يوصى بالكورس (2) [ثقة: 66.7%]
- إذا درس المستخدم الكورس (2,3) → يوصى بالكورس (4) [ثقة: 50%]

## 📁 **الملفات المهمة**

### **ملفات النظام:**
- `EDUVERS/storage/app/recommendation_rules.json` - قواعد التوصية
- `EDUVERS/storage/app/transactions.json` - بيانات المستخدمين
- `generate_rules.py` - خوارزمية Python

### **ملفات Laravel:**
- `app/Console/Commands/GenerateRecommendationRules.php`
- `app/Console/Commands/ImportRecommendationRules.php`
- `app/Observers/UserCourseUnlockObserver.php`
- `app/Jobs/GenerateRecommendationRulesJob.php`

## 🛠️ **إعداد قاعدة البيانات (اختياري)**

### **إذا كنت تريد حفظ القواعد في قاعدة البيانات:**

1. **تأكد من تشغيل MySQL**
2. **أصلح إعدادات قاعدة البيانات في `.env`:**
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=junior
   DB_USERNAME=root
   DB_PASSWORD=your_password_here
   ```

3. **شغل migration:**
   ```bash
   php artisan migrate
   ```

4. **استورد القواعد الموجودة:**
   ```bash
   php artisan recommendations:import-rules
   ```

## 📈 **مراقبة النظام**

### **فحص حالة النظام:**
```bash
# فحص القواعد المحفوظة
php artisan tinker --execute="echo 'Rules count: ' . DB::table('recommendation_rules')->count();"

# فحص ملفات JSON
dir storage\app\recommendation_rules.json
dir storage\app\transactions.json
```

### **مراقبة Logs:**
```bash
# مراقبة logs للتأكد من التشغيل
tail -f storage/logs/laravel.log
```

## 🔧 **استكشاف الأخطاء**

### **مشاكل شائعة:**

1. **خطأ في قاعدة البيانات:**
   - النظام يحفظ في JSON تلقائياً
   - استخدم `php artisan recommendations:import-rules` لاحقاً

2. **خطأ في Python:**
   - تأكد من تثبيت المكتبات: `pip install pandas mlxtend mysql-connector-python`

3. **خطأ في Observer:**
   - تأكد من تسجيل Observer في `AppServiceProvider`

## 🎯 **الاستخدام في التطبيق**

### **في RecommendationController:**
```php
public function getRecommendations($userId)
{
    // يحصل على التوصيات من قاعدة البيانات أو JSON
    $rules = DB::table('recommendation_rules')->get();
    
    // أو من ملف JSON إذا لم تكن قاعدة البيانات متاحة
    if ($rules->isEmpty()) {
        $jsonPath = storage_path('app/recommendation_rules.json');
        if (file_exists($jsonPath)) {
            $rules = json_decode(file_get_contents($jsonPath), true);
        }
    }
    
    return response()->json([
        'recommendations' => $rules,
        'user_id' => $userId
    ]);
}
```

## 🚀 **الخطوات التالية**

1. **إضافة المزيد من البيانات** لتحسين دقة التوصيات
2. **إعداد قاعدة البيانات** لحفظ القواعد بشكل دائم
3. **تشغيل Queue Worker** للخلفية: `php artisan queue:work`
4. **إعداد Scheduler** للخادم: `* * * * * php artisan schedule:run`

## 📞 **الدعم**

إذا واجهت أي مشاكل:
1. راجع ملف `storage/logs/laravel.log`
2. تأكد من تثبيت جميع المتطلبات
3. اختبر الأوامر واحداً تلو الآخر

---

**🎉 النظام جاهز للاستخدام! يمكنك الآن الحصول على توصيات ذكية للمستخدمين بناءً على سلوكهم في التعلم.** 