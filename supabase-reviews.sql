-- Specialty Burger: migrate the existing website reviews into the existing
-- public.reviews table. The table stores review details in its data JSONB column.
-- Run this once in the Supabase SQL editor. It is safe to run repeatedly.

with seed(data) as (
  values
    ('{"name":"وليد الفقيه","city":"جدة","rating":5,"text":"تجربة استثنائية! برجر اللحم جوسي ومطهو بإتقان وجودته عالية، والبطاطس مميزة جدًا بنكهة خاصة. المكان هادئ ومريح، والكاشير وطاقم العمل في قمة اللطافة. أكيد سأكرر الزيارة 🔥","approved":true}'::jsonb),
    ('{"name":"Piano B","city":"جدة","rating":5,"text":"أكلهم لذيذ جدًا، أخذنا ٣ أنواع برجر لحم مختلفة وكلهم لذيذين، واللحم فريش والبطاطس لذيذة. تعامل الموظفين راقي جدًا.","approved":true}'::jsonb),
    ('{"name":"رغد سرج","city":"جدة","rating":5,"text":"طلبت برجر البصل المكرمل وكان رهيب، أخذته دبل وحجمه كبير وما قدرت أخلصه. ١٠٠٪ باجي ثاني إن شاء الله.","approved":true}'::jsonb),
    ('{"name":"عبدالمجيد محمد","city":"جدة","rating":5,"text":"جميل جدًا للأمانة، خذيت العرض بـ ٢٣ ريال وكان عرض ممتاز. الطلب يوصل فريش، خدمة ممتازة وموظفين ممتازين وعروض جميلة.","approved":true}'::jsonb),
    ('{"name":"أحمد الغبيني","city":"جدة","rating":5,"text":"تجربة مميزة في هذا المطعم، تعامل ممتاز من الاستقبال والموظفين والأكل لذيذ جدًا. جربوا التشيك توست + برجر الدجاج المشوي، وراح تتكرر الزيارة.","approved":true}'::jsonb),
    ('{"name":"Sam M","city":"جدة","rating":4,"text":"الأسعار والكمية ممتازة، والبرجر والستربس لذيذين جدًا وصوص الجبنة رهيب. ملاحظتي على البطاطس أتمنى تقديمها ساخنة. الموظف اللي استقبلنا كان بشوش ولطيف جدًا.","approved":true}'::jsonb)
)
insert into public.reviews (id, data)
select gen_random_uuid(), seed.data
from seed
where not exists (
  select 1
  from public.reviews existing
  where existing.data->>'name' = seed.data->>'name'
    and existing.data->>'city' = seed.data->>'city'
    and existing.data->>'rating' = seed.data->>'rating'
    and existing.data->>'text' = seed.data->>'text'
);