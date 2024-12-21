<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Question;


class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $questions = [
            // المستوى الأول
            1 => [
                ['question' => 'C++ يدعم البرمجة الكائنية التوجه.', 'correct_answer' => 'true'],
                ['question' => 'المؤشر في C++ هو نوع بيانات ثابت.', 'correct_answer' => 'false'],
                ['question' => 'الـ Constructor في C++ يمكن أن يكون له قيمة إرجاع.', 'correct_answer' => 'false'],
                ['question' => 'الـ Destructor في C++ يتم استدعاؤه تلقائيًا عند تدمير الكائن.', 'correct_answer' => 'true'],
                ['question' => 'الـ header file في C++ يمتلك الامتداد ".cpp".', 'correct_answer' => 'false'],
                ['question' => 'في C++، يمكن تعريف الـ function خارج الكلاس باستخدام static.', 'correct_answer' => 'true'],
                ['question' => 'تستخدم C++ الذاكرة الثابتة فقط دون دعم الذاكرة الديناميكية.', 'correct_answer' => 'false'],
                ['question' => 'المؤشرات في C++ يمكنها تخزين العناوين المؤقتة للكائنات فقط.', 'correct_answer' => 'false'],
                ['question' => 'الـ loop في C++ يمكن أن تحتوي على جملة break للخروج من الحلقة.', 'correct_answer' => 'true'],
                ['question' => 'في C++، يمكننا استخدام أكثر من دالة main في نفس الملف.', 'correct_answer' => 'false'],
            ],
            // المستوى الثاني
            2 => [
                ['question' => 'الـ virtual functions في C++ تسمح بتغيير سلوك الدالة في الكلاسات الفرعية.', 'correct_answer' => 'true'],
                ['question' => 'يمكن تعريف دالة عودية (Recursive function) في C++', 'correct_answer' => 'true'],
                ['question' => 'الـ namespace في C++ لا يساعد في تجنب التعارض بين الأسماء.', 'correct_answer' => 'false'],
                ['question' => 'المؤشر null في C++ يعني أنه يشير إلى قيمة غير معروفة.', 'correct_answer' => 'false'],
                ['question' => 'في C++، الـ exception handling يستخدم try, catch, finally.', 'correct_answer' => 'false'],
                ['question' => 'الـ class في C++ يمكن أن يحتوي على دوال بدون تعريفات، وهي تسمى pure virtual functions.', 'correct_answer' => 'true'],
                ['question' => 'تستخدم C++ المصفوفات ثابتة الحجم فقط.', 'correct_answer' => 'false'],
                ['question' => 'في C++، يمكن للمتغيرات أن تكون عامة (public) أو خاصة (private) أو محمية (protected).', 'correct_answer' => 'true'],
                ['question' => 'الـ constructor في C++ يحتاج إلى نفس اسم الكلاس الخاص به.', 'correct_answer' => 'true'],
                ['question' => 'الـ virtual destructors في C++ تجعل الحذف الديناميكي للكائنات آمنًا.', 'correct_answer' => 'true'],
            ],
            // المستوى الثالث
            3 => [
                ['question' => 'الـ operator overloading في C++ يسمح بتغيير سلوك العمليات الرياضية.', 'correct_answer' => 'true'],
                ['question' => 'في C++، إذا كان هناك Class يحتوي على private members، فإنه لا يمكن الوصول إليها مباشرة.', 'correct_answer' => 'true'],
                ['question' => 'الـ pointer arithmetic في C++ يسمح بالقيام بعمليات حسابية على المؤشرات.', 'correct_answer' => 'true'],
                ['question' => 'الـ friend functions في C++ يمكنها الوصول إلى الـ private members داخل الـ class.', 'correct_answer' => 'true'],
                ['question' => 'تستخدم C++ الذاكرة التلقائية فقط (stack memory) ولا تدعم الذاكرة الديناميكية.', 'correct_answer' => 'false'],
                ['question' => 'الـ templates في C++ تستخدم لتعميم الكود ليعمل مع أنواع بيانات متعددة.', 'correct_answer' => 'true'],
                ['question' => 'C++ تدعم التوريث المتعدد، مما يعني أن الكلاس يمكن أن يرث من عدة كائنات في نفس الوقت.', 'correct_answer' => 'true'],
                ['question' => 'في C++، يمكن استخدام المتغيرات العامة (public) لتخزين البيانات الحساسة.', 'correct_answer' => 'false'],
                ['question' => 'الـ static variables في C++ يمكن أن تحتفظ بقيمتها بين استدعاءات الدالة.', 'correct_answer' => 'true'],
                ['question' => 'في C++، يمكننا استخدام الـ goto statement لتحويل سير البرنامج إلى أي نقطة في الكود.', 'correct_answer' => 'true'],
            ]
        ];

        // إدخال الأسئلة في قاعدة البيانات حسب المستويات
        foreach ($questions as $levelId => $levelQuestions) {
            foreach ($levelQuestions as $q) {
                Question::create([
                    'level_id' => $levelId, // تعيين الـ level_id بناءً على المستوى
                    'question' => $q['question'],
                    'correct_answer' => $q['correct_answer']
                ]);
            }
        }

    }
}
