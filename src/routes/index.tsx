import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowLeft, Check, Clock3, Ghost, Instagram, MapPin, Minus, Plus,
  ShoppingBag, Trash2, X, MessageCircle, Phone, Quote, Star, Send,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
const heroImage = "/images/restaurant-background.jpg";
const bbqBoxImage = "/images/bbq-box.jpg";
const cateringImage = "/images/image.jpg";


const WHATSAPP_NUMBER = "966580835125";
// عروض المجموعات مخفية عن المستخدم — غيّرها إلى true لإظهار القسم مرة أخرى
const SHOW_GROUP_OFFERS = false;
// معاينة الصورة عند الضغط عليها
const SHOW_LIGHTBOX = true;
// قسم الكاترينج
const SHOW_CATERING = true;

const testimonials = [
  { name: 'وليد الفقيه', city: 'جدة', rating: 5, text: 'تجربة استثنائية! برجر اللحم جوسي ومطهو بإتقان وجودته عالية، والبطاطس مميزة جدًا بنكهة خاصة. المكان هادئ ومريح، والكاشير وطاقم العمل في قمة اللطافة. أكيد سأكرر الزيارة 🔥' },
  { name: 'Piano B', city: 'جدة', rating: 5, text: 'أكلهم لذيذ جدًا، أخذنا ٣ أنواع برجر لحم مختلفة وكلهم لذيذين، واللحم فريش والبطاطس لذيذة. تعامل الموظفين راقي جدًا.' },
  { name: 'رغد سرج', city: 'جدة', rating: 5, text: 'طلبت برجر البصل المكرمل وكان رهيب، أخذته دبل وحجمه كبير وما قدرت أخلصه. ١٠٠٪ باجي ثاني إن شاء الله.' },
  { name: 'عبدالمجيد محمد', city: 'جدة', rating: 5, text: 'جميل جدًا للأمانة، خذيت العرض بـ ٢٣ ريال وكان عرض ممتاز. الطلب يوصل فريش، خدمة ممتازة وموظفين ممتازين وعروض جميلة.' },
  { name: 'أحمد الغبيني', city: 'جدة', rating: 5, text: 'تجربة مميزة في هذا المطعم، تعامل ممتاز من الاستقبال والموظفين والأكل لذيذ جدًا. جربوا التشيك توست + برجر الدجاج المشوي، وراح تتكرر الزيارة.' },
  { name: 'Sam M', city: 'جدة', rating: 4, text: 'الأسعار والكمية ممتازة، والبرجر والستربس لذيذين جدًا وصوص الجبنة رهيب. ملاحظتي على البطاطس أتمنى تقديمها ساخنة. الموظف اللي استقبلنا كان بشوش ولطيف جدًا.' },
];

type Review = (typeof testimonials)[number];

type ReviewRow = {
  id: string;
  data: {
    name?: string;
    city?: string;
    rating?: number | string;
    text?: string;
    approved?: boolean | string;
  } | null;
  created_at: string;
};



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "اختصاص البرجر Specialty Burger — منيو المطعم" },
      { name: "description", content: "منيو Specialty Burger في جدة: برجر مشوي على اللهب، عروض مجموعات، مقبلات ومشروبات. خصّص طلبك واختر رقم الطاولة وأرسله عبر واتساب." },
      { property: "og:title", content: "Specialty Burger — منيو المطعم" },
      { property: "og:description", content: "برجر على أصوله في جدة. اطلب من المنيو وخصّص طلبك وأرسله عبر واتساب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});


type MenuItem = {
  id: string; name: string; english: string; description: string; descriptionEn?: string; price: number;
  image: string; section: string; tag?: string; customizable?: boolean; doubleExtra?: number; available?: boolean;
};
type CartItem = MenuItem & { quantity: number; without: string[]; addons: string[]; isDouble: boolean; unitPrice: number };
type OrderAddon = { name: string; name_ar: string; price: number; quantity: number };
type OrderItem = {
  product_id: string;
  name: string;
  name_ar: string;
  quantity: number;
  unit_price: number;
  addons: OrderAddon[];
  subtotal: number;
};

const burgers: MenuItem[] = [
{id:'original-specialty',name:'اوريجينال سبيشالتي',english:'Original Specialty',description:'خبز البريتزل، لحم طازج مشوي على الصاج، جبنة، خس، بصل أبيض، طماطم، صوص خاص',descriptionEn:'Pretzel bun, fresh grilled beef patty, cheese, lettuce, white onion, tomato, special sauce',price:26,image:'/menu/burger-1.jpg',section:'burgers',tag:'الأكثر طلباً',customizable:true,doubleExtra:9},
{id:'wood-beef',name:'برجر لحم الحطب',english:'Wood Beef Burger',description:'خبز البريتزل، لحم طازج مشوي على الحطب، خس، جبنة، صوص خاص',descriptionEn:'Pretzel bun, wood-fired fresh beef patty, lettuce, cheese, special sauce',price:24,image:'/menu/burger-2.jpg',section:'burgers',customizable:true,doubleExtra:9},
{id:'pomegranate',name:'سبيشاليتي الرمان',english:'Pomegranate Speciality',description:'خبز البريتزل، لحم طازج على الصاج، جبنة، رمان، جرجير، مايونيز ودبس الرمان',descriptionEn:'Pretzel bun, fresh grilled beef, cheese, pomegranate, rocca, mayo and pomegranate molasses',price:27,image:'/menu/burger-3.jpg',section:'burgers',tag:'اختيار الشيف',customizable:true,doubleExtra:9},
{id:'caramelized-onion',name:'برجر البصل المكرمل',english:'Caramelized Onion Burger',description:'خبز البريتزل، لحم طازج، جبنة، بصل مكرمل، صوص خاص',descriptionEn:'Pretzel bun, fresh beef patty, cheese, caramelized onions, special sauce',price:25,image:'/menu/burger-4.jpg',section:'burgers',customizable:true,doubleExtra:9},
{id:'bacon',name:'برجر البيكون',english:'Bacon Burger',description:'خبز البريتزل، لحم طازج، جبنة، بيكون، صوص خاص',descriptionEn:'Pretzel bun, fresh beef patty, cheese, beef bacon, special sauce',price:27,image:'/menu/burger-5.jpg',section:'burgers',customizable:true,doubleExtra:9},
{id:'bbq-specialty',name:'باربكيو سبيشالتي',english:'BBQ Specialty',description:'خبز البريتزل، لحم طازج على الصاج، عيدان البطاطس، جبنة، خس، طماطم، صوص الباربيكيو',descriptionEn:'Pretzel bun, fresh grilled beef, potato sticks, cheese, lettuce, tomato, BBQ sauce',price:25,image:'/menu/burger-6.jpg',section:'burgers',customizable:true,doubleExtra:9},
{id:'fried-chicken',name:'برجر صدر الدجاج المقلي',english:'Fried Chicken Breast Burger',description:'خبز البريتزل، صدر دجاج طازج مقلي، جبنة، خس، سلطة الملفوف، صوص خاص',descriptionEn:'Pretzel bun, fried fresh chicken breast, cheese, lettuce, coleslaw, special sauce',price:24,image:'/menu/burger-7.jpg',section:'burgers',customizable:true,doubleExtra:6},
{id:'grilled-chicken',name:'برجر صدر الدجاج المشوي',english:'Grilled Chicken Breast Burger',description:'خبز البريتزل، دجاج طازج على الصاج، جبنة، خس، بصل أبيض، طماطم، صوص خاص',descriptionEn:'Pretzel bun, grilled fresh chicken, cheese, lettuce, white onion, tomato, special sauce',price:24,image:'/menu/burger-8.jpg',section:'burgers',customizable:true,doubleExtra:6},
{id:'spicy-220',name:'برجر حار 220',english:'Spicy Burger 220',description:'خبز البريتزل، صدر دجاج طازج مقلي، جبنة، خس، طماطم، صوص السيراتشا الحار',descriptionEn:'Pretzel bun, fried fresh chicken breast, cheese, lettuce, tomato, hot sriracha sauce',price:24,image:'/menu/burger-9.jpg',section:'burgers',tag:'حار',customizable:true,doubleExtra:6},
{id:'wood-chicken',name:'برجر دجاج الحطب',english:'Wood-fired Chicken Burger',description:'خبز البريتزل، دجاج طازج على الحطب، خس، جبنة، صوص خاص',descriptionEn:'Pretzel bun, wood-fired fresh chicken, lettuce, cheese, special sauce',price:24,image:'/menu/burger-10.jpg',section:'burgers',customizable:true,doubleExtra:6},
];

const broast: MenuItem[] = [
{id:'chicken-proust',name:'دجاج بروست',english:'Chicken Broast',description:'أربع قطع من الدجاج المقرمشة — عادي أو حراق',descriptionEn:'Four pieces of crispy broasted chicken — regular or spicy',price:18,image:'/menu/meal-3.jpg',section:'broast'},
{id:'chicken-strips',name:'دجاج ستربس',english:'Chicken Strips',description:'خمس قطع من الدجاج المقرمشة',descriptionEn:'Five pieces of crispy chicken strips',price:17,image:'/menu/extra-10.jpg',section:'broast'},
];

const meals: MenuItem[] = [
{id:'slow-strips',name:'وجبة سلو ستربس',english:'Slow Strips Meal',description:'٤ قطع من الدجاج الستربس المقرمش مع البطاطس وسلطة الملفوف ومشروب غازي',descriptionEn:'4 crispy chicken strips served with fries, coleslaw and a soft drink',price:26,image:'/menu/meal-1.jpg',section:'meals',tag:'وجبة كاملة'},
{id:'kids',name:'وجبة الأطفال',english:'Kids Meal',description:'ناجت الدجاج (٤ قطع) يقدم مع البطاطس المقلية وعصير التفاح',descriptionEn:'Chicken nuggets (4 pcs) served with french fries and apple juice',price:17,image:'/menu/meal-2.jpg',section:'meals',tag:'للصغار'},
];

const fries: MenuItem[] = [
{id:'fries',name:'بطاطس مقلية',english:'French Fries',description:'بطاطس مقلية مقرمشة تقدم مع البهارات الخاصة',descriptionEn:'Crispy french fries served with our special seasoning',price:6,image:'/menu/extra-4.jpg',section:'appetizers'},
{id:'cheese-fries',name:'بطاطس بالجبنة',english:'Cheese Fries',description:'بطاطس مقرمشة مغطاة بصوص الجبن',descriptionEn:'Crispy fries topped with cheese sauce',price:10,image:'/menu/extra-13.jpg',section:'appetizers'},
{id:'chi-fries',name:'تشي فرايز',english:'Chi Fries',description:'قطع دجاج مقرمشة مع البطاطس وصوص الجبن والهالابينو والتشيتوس',descriptionEn:'Crispy chicken pieces over fries with cheese sauce, jalapeño and Cheetos',price:25,image:'/menu/extra-9.jpg',section:'appetizers',tag:'الأكثر طلباً'},
{id:'chili-fries',name:'تشيلي فرايز',english:'Chili Fries',description:'بطاطس مقرمشة مع اللحم المفروم والهالابينو والطماطم والبصل الأخضر وصوص الجبن',descriptionEn:'Crispy fries with minced beef, jalapeño, tomato, spring onion and cheese sauce',price:25,image:'/menu/extra-11.jpg',section:'appetizers'},
];

const appetizers: MenuItem[] = [
{id:'coleslaw',name:'سلطة الملفوف',english:'Coleslaw',description:'جزر، ملفوف، مايونيز',descriptionEn:'Carrot, cabbage, mayonnaise',price:6,image:'/menu/extra-1.jpg',section:'appetizers'},
{id:'rocca-pomegranate',name:'سلطة الجرجير بالرمان',english:'Rocca Pomegranate Salad',description:'جرجير، رمان، طماطم، بصل أبيض، صوص خاص',descriptionEn:'Rocca, pomegranate, tomato, white onion, special dressing',price:13,image:'/menu/extra-2.jpg',section:'appetizers'},
{id:'caesar',name:'سلطة سيزر',english:'Caesar Salad',description:'خس روماني، صوص السيزر، خبز محمص وجبنة',descriptionEn:'Romaine lettuce, Caesar dressing, croutons and cheese',price:18,image:'/menu/extra-3.jpg',section:'appetizers'},
{id:'onion-rings',name:'حلقات البصل الذهبية المقرمشة',english:'Crispy Golden Onion Rings',description:'حلقات بصل ذهبية مقرمشة',descriptionEn:'Crispy golden onion rings',price:12,image:'/menu/extra-5.jpg',section:'appetizers'},
{id:'mozzarella-sticks',name:'أصابع جبنة الموزريلا (٥ قطع)',english:'Mozzarella Cheese Sticks (5 PC)',description:'أصابع موزريلا مقرمشة من الخارج وذائبة من الداخل',descriptionEn:'Mozzarella sticks, crispy outside and melty inside',price:18,image:'/menu/extra-6.jpg',section:'appetizers'},
{id:'nuggets',name:'ناجت الدجاج (٥ قطع)',english:'Chicken Nuggets (5 PC)',description:'قطع دجاج مقرمشة',descriptionEn:'Crispy chicken nuggets',price:15,image:'/menu/extra-7.jpg',section:'appetizers'},
{id:'jalapeno-cheese',name:'هالابينو تشيز (٥ قطع)',english:'Jalapeño Cheese (5 PC)',description:'قطع الهالابينو الحارة المقلية مع جبن التشيدر الكريمي',descriptionEn:'Fried spicy jalapeño bites with creamy cheddar cheese',price:19,image:'/menu/extra-8.jpg',section:'appetizers',tag:'حار'},
{id:'chicken-wings',name:'أجنحة الدجاج',english:'Chicken Wings',description:'٣ قطع من أجنحة الدجاج بصوص من اختيارك: سبايسي أو باربكيو',descriptionEn:'3 chicken wings with your choice of sauce: spicy or BBQ',price:14,image:'/menu/extra-12.jpg',section:'appetizers'},
];
const drinks: MenuItem[] = [
{id:'fanta',name:'فانتا برتقال',english:'Fanta Orange',description:'علبة مشروب غازي باردة',descriptionEn:'Chilled soft drink can',price:3,image:'/menu/drink-1.jpg',section:'drinks'},
{id:'coke-light',name:'كوكاكولا دايت',english:'Coca-Cola Light',description:'علبة مشروب غازي باردة',descriptionEn:'Chilled soft drink can',price:3,image:'/menu/drink-2.jpg',section:'drinks'},
{id:'sprite',name:'سبرايت',english:'Sprite',description:'علبة مشروب غازي باردة',descriptionEn:'Chilled soft drink can',price:3,image:'/menu/drink-3.jpg',section:'drinks'},
{id:'coke',name:'كوكاكولا كلاسيك',english:'Coca-Cola Classic',description:'علبة مشروب غازي باردة',descriptionEn:'Chilled soft drink can',price:3,image:'/menu/drink-4.jpg',section:'drinks'},
{id:'peach-ice-tea',name:'الشاي المثلج بالخوخ',english:'Peach Iced Tea',description:'شاي مثلج منعش بالخوخ',descriptionEn:'Refreshing peach iced tea',price:5,image:'/menu/drink-5.jpg',section:'drinks'},
{id:'pomegranate-juice',name:'عصير الرمان الطازج',english:'Fresh Pomegranate Juice',description:'عصير رمان طازج ١٠٠٪',descriptionEn:'100% fresh pomegranate juice',price:15,image:'/menu/drink-6.jpg',section:'drinks',tag:'طازج'},
{id:'orange-juice',name:'عصير البرتقال الطازج',english:'Fresh Orange Juice',description:'عصير برتقال طازج ١٠٠٪',descriptionEn:'100% fresh orange juice',price:15,image:'/menu/drink-7.jpg',section:'drinks',tag:'طازج'},
{id:'water',name:'مياه معدنية',english:'Mineral Water',description:'مياه معدنية باردة',descriptionEn:'Chilled mineral water',price:1,image:'/menu/drink-8.jpg',section:'drinks'},
{id:'mojito',name:'موهيتو توت أزرق / بطيخ',english:'Blueberry / Watermelon Mojito',description:'موهيتو منعش بنكهة التوت الأزرق أو البطيخ',descriptionEn:'Refreshing blueberry or watermelon mojito',price:12,image:'/menu/drink-9.jpg',section:'drinks'},
];

type BundleSize = { id: string; name: string; english: string; price: number; pieces: number };
const bbqBoxSizes: [BundleSize, ...BundleSize[]] = [
  { id: 'bbq-box-4', name: 'بوكس الشواء — ٤ قطع', english: 'BBQ Box — 4 Pieces', price: 79, pieces: 4 },
  { id: 'bbq-box-6', name: 'بوكس الشواء — ٦ قطع', english: 'BBQ Box — 6 Pieces', price: 112, pieces: 6 },
  { id: 'bbq-box-8', name: 'بوكس الشواء — ٨ قطع', english: 'BBQ Box — 8 Pieces', price: 164, pieces: 8 },
  { id: 'bbq-box-12', name: 'بوكس الشواء — ١٢ قطعة', english: 'BBQ Box — 12 Pieces', price: 222, pieces: 12 },
];
const bbqBox: MenuItem = {
  id: 'bbq-box',
  name: 'بوكس الشواء',
  english: 'BBQ Box',
  description: 'تشكيلة متكاملة من البرجر الطازج مع الخبز والخضار والجبن والصوصات — اختر الباقة المناسبة للمجموعة.',
  price: bbqBoxSizes[0].price,
  image: bbqBoxImage,
  section: 'groups',
  tag: 'عروض المجموعات',
};
const addonOptions:{name:string;english:string;price:number;image?:string}[]=[
{name:'صوص حار',english:'Spicy Sauce',price:3,image:'/menu/ext1.jpg'},
{name:'صوص سبيشالتي',english:'Specialty Sauce',price:3,image:'/menu/ext2.jpg'},
{name:'صوص جبنة',english:'Cheese Sauce',price:3,image:'/menu/ext3.jpg'},
{name:'صوص باربكيو',english:'BBQ Sauce',price:3,image:'/menu/ext4.jpg'},
{name:'بيكون',english:'Bacon',price:5,image:'/menu/ext5.jpg'},
{name:'مخلل',english:'Pickles',price:2,image:'/menu/ext6.jpg'},
{name:'هالابينو حار',english:'Hot Jalapeño',price:5,image:'/menu/ext7.jpg'},
{name:'بصل مكرمل',english:'Caramelized Onions',price:3,image:'/menu/ext8.jpg'},
{name:'بطاطا عيدان',english:'Potato Sticks',price:3},
{name:'شيبسى شيتوس',english:'Cheetos Chips',price:3},
];
const vegetables = ['خس', 'طماطم', 'مخلل', 'بصل'];

const LOCAL_MENU_ITEMS = [...burgers, ...broast, ...meals, ...fries, ...appetizers, ...drinks];

type ProductRow = {
  id: string;
  name: string;
  name_ar: string | null;
  english_name: string | null;
  description: string | null;
  description_en: string | null;
  price: number | string | null;
  discount_price: number | string | null;
  category_id: string | null;
  image: string | null;
  available: boolean | null;
  tag: string | null;
  customizable: boolean | null;
  double_extra: number | string | null;
  sort_order: number | null;
};

function imageForProduct(image: string | null | undefined) {
  if (!image) return '';
  return image.startsWith('/') || image.startsWith('http') ? image : `/${image}`;
}

function mapProductRow(row: ProductRow): MenuItem {
  const local = LOCAL_MENU_ITEMS.find((item) => item.id === row.id);
  return {
    id: row.id,
    name: row.name_ar || row.name || local?.name || '',
    english: row.name || row.english_name || local?.english || '',
    description: local?.description || row.name_ar || row.description || '',
    descriptionEn: row.description_en || row.description || local?.descriptionEn || '',
    price: Number(row.discount_price ?? row.price ?? 0),
    image: imageForProduct(row.image) || local?.image || '',
    section: row.category_id || local?.section || 'appetizers',
    tag: row.tag || local?.tag,
    customizable: row.customizable ?? local?.customizable,
    doubleExtra: row.double_extra == null ? local?.doubleExtra : Number(row.double_extra),
    available: row.available ?? true,
  };
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function buildOrderItems(cartItems: CartItem[]): OrderItem[] {
  return cartItems.map((item) => {
    const addons: OrderAddon[] = [
      ...(item.isDouble && item.doubleExtra
        ? [{ name: 'Double Patty', name_ar: 'دبل', price: Number(item.doubleExtra), quantity: 1 }]
        : []),
      ...item.addons.map((name) => {
        const option = addonOptions.find((candidate) => candidate.name === name);
        return {
          name: option?.english ?? name,
          name_ar: name,
          price: Number(option?.price ?? 0),
          quantity: 1,
        };
      }),
    ];
    const subtotal = roundCurrency(
      item.quantity * (Number(item.price) + addons.reduce((sum, addon) => sum + addon.quantity * addon.price, 0)),
    );

    return {
      product_id: item.id,
      name: item.english,
      name_ar: item.name,
      quantity: item.quantity,
      unit_price: Number(item.price),
      addons,
      subtotal,
    };
  });
}

async function fetchPublishedMenu(): Promise<MenuItem[]> {
  if (!supabase) return LOCAL_MENU_ITEMS;
  const { data, error } = await supabase
    .from('products')
    .select('id,name,name_ar,english_name,description,description_en,price,discount_price,category_id,image,available,tag,customizable,double_extra,sort_order')
    .eq('available', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Specialty Burger] Failed to load menu from Supabase:', error);
    return LOCAL_MENU_ITEMS;
  }

  const mapped = ((data ?? []) as ProductRow[]).map(mapProductRow);
  return mapped.length ? mapped : LOCAL_MENU_ITEMS;
}

async function fetchApprovedReviews(): Promise<Review[]> {
  if (!supabase) return testimonials;

  const { data, error } = await supabase
    .from('reviews')
    .select('id,data,created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[Specialty Burger] Failed to load reviews from Supabase:', error);
    return testimonials;
  }

  const reviews = ((data ?? []) as ReviewRow[])
    .filter((row) => row.data?.approved === true || row.data?.approved === 'true')
    .map((row) => ({
      name: row.data?.name?.trim() ?? '',
      city: row.data?.city?.trim() ?? '',
      rating: Number(row.data?.rating ?? 0),
      text: row.data?.text?.trim() ?? '',
    }))
    .filter((review) => review.name && review.city && review.text && review.rating >= 1 && review.rating <= 5);

  return reviews.length ? reviews : testimonials;
}

function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(LOCAL_MENU_ITEMS);
  const [menuLoading, setMenuLoading] = useState(isSupabaseConfigured);
  const [reviews, setReviews] = useState<Review[]>(testimonials);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [table, setTable] = useState('');
  const [activeSection, setActiveSection] = useState('appetizers');

  useEffect(() => {
    let mounted = true;
    fetchPublishedMenu()
      .then((items) => { if (mounted) setMenuItems(items); })
      .finally(() => { if (mounted) setMenuLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchApprovedReviews().then((items) => { if (mounted) setReviews(items); });
    return () => { mounted = false; };
  }, []);

  const sectionItems = useMemo(() => ({
    appetizers: menuItems.filter((item) => item.section === 'appetizers'),
    burgers: menuItems.filter((item) => item.section === 'burgers'),
    broast: menuItems.filter((item) => item.section === 'broast'),
    meals: menuItems.filter((item) => item.section === 'meals'),
    drinks: menuItems.filter((item) => item.section === 'drinks'),
  }), [menuItems]);
  const [customizing, setCustomizing] = useState<MenuItem | null>(null);
  const [without, setWithout] = useState<string[]>([]);
  const [addons, setAddons] = useState<string[]>([]);
  const [isDouble, setIsDouble] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bundle, setBundle] = useState<{ item: MenuItem; sizes: BundleSize[] } | null>(null);
  const [bundleSize, setBundleSize] = useState<BundleSize | null>(null);
  const [bundleQty, setBundleQty] = useState(1);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState('');

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const orderItems = useMemo(() => buildOrderItems(cart), [cart]);
  const total = useMemo(() => roundCurrency(orderItems.reduce((sum, item) => sum + item.subtotal, 0)), [orderItems]);

  const addonsPrice = (names: string[]) =>
    names.reduce((sum, name) => sum + (addonOptions.find((option) => option.name === name)?.price ?? 0), 0);

  const customizingPrice = customizing
    ? customizing.price + (isDouble ? (customizing.doubleExtra ?? 0) : 0) + addonsPrice(addons)
    : 0;

  const addToCart = (item: MenuItem, removed: string[] = [], qty = 1, chosen: string[] = [], double = false) => {
    setCart((current) => {
      const key = `${item.id}|${[...removed].sort().join('-')}|${[...chosen].sort().join('-')}|${double}`;
      const existing = current.find(
        (entry) => `${entry.id}|${[...entry.without].sort().join('-')}|${[...entry.addons].sort().join('-')}|${entry.isDouble}` === key,
      );
      if (existing) {
        return current.map((entry) => (entry === existing ? { ...entry, quantity: entry.quantity + qty } : entry));
      }
      return [...current, { ...item, quantity: qty, without: removed, addons: chosen, isDouble: double, unitPrice: item.price }];
    });
    setNotice(`تمت إضافة ${item.name} إلى الطلب`);
    window.setTimeout(() => setNotice(''), 2400);
  };
  const openCustomize = (item: MenuItem) => {
    setCustomizing(item); setWithout([]); setAddons([]); setIsDouble(false); setQuantity(1);
  };
  const openLightbox = (src: string, alt: string) => { setLightboxImage(src); setLightboxAlt(alt); };
  const confirmCustomize = () => {
    if (!customizing) return;
    addToCart(customizing, without, quantity, addons, isDouble);
    setCustomizing(null);
  };
  const changeQuantity = (index: number, delta: number) => {
    setCart((current) => current.flatMap((item, i) => {
      if (i !== index) return [item];
      const next = item.quantity + delta;
      return next > 0 ? [{ ...item, quantity: next }] : [];
    }));
  };
  const sendOrder = async () => {
    if (!table) { setNotice('اختر رقم الطاولة أولاً'); return; }
    if (!cart.length) { setNotice('أضف صنفاً واحداً على الأقل'); return; }
    if (!supabase) { setNotice('تعذر تسجيل الطلب. حاول مرة أخرى.'); return; }
    if (isSubmitting) return;

    setIsSubmitting(true);
    const orderNumber = Date.now();
    const lines = orderItems.map((item, index) => {
      const cartItem = cart[index];
      const details = [
        item.addons.some((addon) => addon.name_ar === 'دبل') ? 'دبل' : '',
        cartItem.without.length ? `بدون ${cartItem.without.join('، ')}` : '',
        item.addons.filter((addon) => addon.name_ar !== 'دبل').length
          ? `إضافة ${item.addons.filter((addon) => addon.name_ar !== 'دبل').map((addon) => addon.name_ar).join('، ')}`
          : '',
      ].filter(Boolean).join(' — ');
      return `- ${item.name_ar} × ${item.quantity}${details ? ` (${details})` : ''}`;
    });

    const { error } = await supabase.from('orders').insert({
      order_number: orderNumber,
      table_number: table,
      items: orderItems,
      subtotal: total,
      total_amount: total,
      status: 'new',
    });

    setIsSubmitting(false);
    if (error) {
      console.error('[Specialty Burger] Failed to save order:', error);
      setNotice('لم يتم تسجيل الطلب. حاول مرة أخرى.');
      return;
    }

    const message = `🧾 Order #${orderNumber}\n\n🪑 Table: ${table}\n\nالمنتجات:\n${lines.join('\n')}\n\n💰 Total: ${total} SAR`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const sendFeedback = () => {
    const message = 'مرحباً Specialty Burger،\nلدي ملاحظة / اقتراح:\n\n';
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };




  return (
    <div dir="rtl" className="paper-grain relative isolate min-h-[100dvh]">
      {/* Hero image fixed behind the whole site */}
      <div className="pointer-events-none fixed inset-0 z-0 h-[100dvh] w-full after:absolute after:inset-0 after:z-[1] after:bg-[#100905]/72 after:content-['']">
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
      </div>
      <header className="load-fade sticky top-0 z-40 border-b border-[#dbe3ef]/40 bg-[#f6f8fc]/55 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-8">
          <a href="#top" className="flex items-center gap-3" data-testid="link-home">
            <img src="/logo.png" alt="شعار اختصاص البرجر" className="h-12 w-12 rounded-full shadow-[0_8px_22px_rgba(22,35,59,0.14)]" />
            <div className="leading-none">
              <div className="font-display text-[23px] font-bold tracking-wide text-[#ffffff] [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">SPECIALTY <span className="text-[#c97a06]">BURGER</span></div>
              <div className="mt-1 text-[10px] font-bold tracking-[.23em] text-[#c97a06] [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">اختصاص البرجر</div>

            </div>
          </a>
          <div className="hidden items-center gap-5 text-xs font-bold text-[#5b6a83] sm:flex">
            <span className="flex items-center gap-1.5"><Clock3 size={15} className="text-[#c2410c]" /> السبت–الخميس ١٢م–٣ص · الجمعة ١م–٤ص</span>
            <span className="flex items-center gap-1.5"><MapPin size={15} className="text-[#c2410c]" /> جدة، حي السلامة — شارع قريش</span>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 rounded-full bg-[#000000] px-4 py-2.5 text-sm font-bold text-[#f6f8fc] transition hover:bg-[#c2410c]" data-testid="button-open-cart">
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">طلبك</span>
            {totalItems > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#e0a93b] px-1 text-[11px] text-[#000000]" data-testid="text-cart-count">{totalItems}</span>}
          </button>
        </div>
      </header>

      <section className="relative z-10 overflow-hidden border-b border-[#dbe3ef]/40">
        <div
          className="absolute inset-0 z-[2]"
          style={{ background: 'radial-gradient(70% 60% at 50% 38%, rgba(224,169,59,0.16), transparent 72%), linear-gradient(to bottom, rgba(16,9,5,0.55), transparent 30%, transparent 70%, rgba(16,9,5,0.75))' }}
        />
        <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-76px)] max-w-3xl flex-col items-center justify-center px-5 pb-16 pt-14 text-center">
          <div className="load-fade mono text-[11px] font-bold tracking-[.5em] text-[#d4b896]/80" style={{ "--ld": "0.1s" } as CSSProperties}>SINCE JEDDAH</div>
          <h1 className="load-fade mt-6 text-[clamp(3rem,12vw,6rem)] font-extrabold leading-[1.2] text-[#c97a06]" style={{ "--ld": "0.22s", textShadow: "0 4px 30px rgba(0,0,0,0.45)" } as CSSProperties}>
            رحلة <span className="text-[#d4b896]">نكهات لا تنسى</span>
          </h1>
          <div className="load-fade mx-auto mt-6 h-px w-28 bg-[#d4b896]/70" style={{ "--ld": "0.34s" } as CSSProperties} />
          <div className="load-fade mono mt-5 text-[12px] font-bold tracking-[.42em] text-[#d4b896]/85" style={{ "--ld": "0.46s" } as CSSProperties}>SPECIALTY BURGER</div>
          <p className="load-fade mx-auto mt-7 max-w-xl text-[15px] leading-8 text-[#d4b896]/85" style={{ "--ld": "0.58s" } as CSSProperties}>
            لحم بقري بلدي طازج، خبز بريتزل يخبز يومياً، وصوصات من مطبخنا.
            <br className="hidden sm:block" />
            كل قضمة تحكي طعم.
          </p>
          <div className="load-fade mt-10 flex flex-wrap justify-center gap-3" style={{ "--ld": "0.7s" } as CSSProperties}>
            <a
              href="#appetizers"
              className="inline-flex items-center gap-2 rounded-full bg-[#e0a93b] px-9 py-4 text-sm font-bold text-[#231508] transition hover:-translate-y-0.5 hover:bg-[#f0c165]"
              data-testid="link-browse-menu"
            >
              عرض المنيو <ArrowLeft size={17} />
            </a>
            <a
              href="https://wa.me/966580835125"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#d4b896]/45 px-9 py-4 text-sm font-bold text-[#d4b896] transition hover:-translate-y-0.5 hover:border-[#d4b896]/70 hover:bg-[#d4b896]/12"
              data-testid="link-hero-whatsapp"
            >
              <MessageCircle size={17} /> اطلب عبر واتساب
            </a>
          </div>
          <a href="#appetizers" aria-label="انتقل إلى المنيو" className="load-fade absolute bottom-6 left-1/2 -translate-x-1/2" style={{ "--ld": "1s" } as CSSProperties}>
            <span className="block h-12 w-px bg-gradient-to-b from-transparent via-[#d4b896]/50 to-[#d4b896]" />
          </a>
        </div>
      </section>

      <main id="top" className="relative z-10 mx-auto max-w-[1440px] px-4 pb-24 sm:px-8">



        <nav className="load-fade scrollbar-hide sticky top-[76px] z-30 -mx-4 flex gap-2 overflow-x-auto border-b border-[#dbe3ef]/40 bg-[#f6f8fc]/55 px-4 py-4 backdrop-blur-md sm:-mx-8 sm:px-8" style={{ "--ld": "0.95s" } as CSSProperties} aria-label="أقسام المنيو">
          {([['appetizers', 'المقبلات'], ['burgers', 'البرجر'], ['broast', 'البروست'], ['meals', 'الوجبات'], ['addons', 'صوصات وإضافات'], ['drinks', 'المشروبات'], ...(SHOW_GROUP_OFFERS ? [['groups', 'عروض المجموعات'] as const] : []), ['testimonials', 'آراء العملاء'], ['feedback', 'الشكاوى والاقتراحات']] as const).map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setActiveSection(id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${activeSection === id ? 'bg-[#000000] text-[#f6f8fc]' : 'bg-[#e7edf7] text-[#5b6a83] hover:bg-[#e0a93b] hover:text-[#000000]'}`} data-testid={`link-section-${id}`}>{label}</a>
          ))}
        </nav>

        {menuLoading ? (
          <div className="py-6 text-center text-sm font-bold text-[#5b6a83]" role="status">جاري تحديث المنيو…</div>
        ) : null}

        <section id="appetizers" className="load-fade scroll-mt-36 pt-12 sm:pt-16" style={{ "--ld": "1.05s" } as CSSProperties}>
          <SectionHeading title="المقبلات" english="APPETIZERS" subtitle="سلطات، بطاطس ومقرمشات — الطبق الجانبي مو جانبي أبداً." accent />
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sectionItems.appetizers.filter((item) => !['fries','cheese-fries','chi-fries','chili-fries'].includes(item.id)).map((item, index) => <ProductCard key={item.id} item={item} index={index} compact onAdd={() => addToCart(item)} onImageClick={SHOW_LIGHTBOX ? () => openLightbox(item.image, item.name) : undefined} />)}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4">
            {sectionItems.appetizers.filter((item) => item.id.startsWith('fries') || ['cheese-fries','chi-fries','chili-fries'].includes(item.id)).map((item, index) => <ProductCard key={item.id} item={item} index={index} compact onAdd={() => addToCart(item)} onImageClick={SHOW_LIGHTBOX ? () => openLightbox(item.image, item.name) : undefined} />)}
          </div>
        </section>

        <section id="burgers" className="scroll-mt-36 pt-16 sm:pt-24">
          <SectionHeading title="البرجر" english="BURGERS" subtitle="نبدأ من خبزنا الطازج، ونبني فوقه شيء يستاهل كل قضمة." />
          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sectionItems.burgers.map((item, index) => <ProductCard key={item.id} item={item} index={index} onAdd={() => item.customizable ? openCustomize(item) : addToCart(item)} onImageClick={SHOW_LIGHTBOX ? () => openLightbox(item.image, item.name) : undefined} />)}
          </div>
        </section>

        <section id="broast" className="scroll-mt-36 pt-16 sm:pt-24">
          <SectionHeading title="البروست" english="BROAST" subtitle="دجاج مقرمش من الخارج وطري من الداخل — عادي أو حراق." />
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {sectionItems.broast.map((item, index) => <ProductCard key={item.id} item={item} index={index} onAdd={() => addToCart(item)} onImageClick={SHOW_LIGHTBOX ? () => openLightbox(item.image, item.name) : undefined} />)}
          </div>
        </section>

        <section id="meals" className="scroll-mt-36 pt-16 sm:pt-24">
          <SectionHeading title="الوجبات" english="MEALS" subtitle="وجبات كاملة جاهزة — لحم أو دجاج مع البطاطس والمشروب." />
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {sectionItems.meals.map((item, index) => <ProductCard key={item.id} item={item} index={index} onAdd={() => addToCart(item)} onImageClick={SHOW_LIGHTBOX ? () => openLightbox(item.image, item.name) : undefined} />)}
          </div>
        </section>

        <section id="addons" className="scroll-mt-36 pt-16 sm:pt-24">
          <SectionHeading title="صوصات وإضافات" english="SAUCES & ADD-ONS" subtitle="زوّد برجرك زي ما تحب — تختارها عند تخصيص الصنف." />

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {addonOptions.map((option) => (
              <div key={option.name} className="overflow-hidden rounded-2xl border border-[#dbe3ef]/40 bg-[#ffffff]/45 backdrop-blur-md" data-testid={`addon-${option.english}`}>
                {option.image ? (
                  SHOW_LIGHTBOX ? (
                    <button
                      type="button"
                      onClick={() => openLightbox(option.image!, option.name)}
                      className="photo-contain h-20 w-full cursor-zoom-in"
                      aria-label={`عرض صورة ${option.name}`}
                    >
                      <img src={option.image} alt={option.name} className="h-full w-full" data-testid={`img-addon-${option.english}`} />
                    </button>
                  ) : (
                    <div className="photo-contain h-20 w-full">
                      <img src={option.image} alt={option.name} className="h-full w-full" data-testid={`img-addon-${option.english}`} />
                    </div>
                  )
                ) : null}
                <div className="px-4 py-3">
                <div className="font-bold text-[#000000]">{option.name}</div>
                <div className="mono mt-1 flex items-center justify-between text-sm leading-7 tracking-wide text-[#5b6a83]">
                  <span>{option.english}</span>
                  <span className="text-sm font-bold text-[#000000]">+{option.price} ر.س</span>
                </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="drinks" className="scroll-mt-36 pt-16 sm:pt-24">
          <SectionHeading title="المشروبات" english="DRINKS" subtitle="غازية، عصائر طازجة وموهيتو منعش." />
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sectionItems.drinks.map((item, index) => <ProductCard key={item.id} item={item} index={index} compact contain onAdd={() => addToCart(item)} onImageClick={SHOW_LIGHTBOX ? () => openLightbox(item.image, item.name) : undefined} />)}
          </div>
        </section>


        {SHOW_GROUP_OFFERS && (<section id="groups" className="scroll-mt-36 pt-16 sm:pt-24">
          <SectionHeading title="عروض المجموعات" english="GROUP OFFERS" subtitle="عرض واحد لكل المجموعات — اختر عدد القطع عند إضافة الطلب." />
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Reveal
              as="article"
              className="menu-card group relative overflow-hidden rounded-[22px] border border-[#dbe3ef]/40 bg-[#ffffff]/45 p-3 backdrop-blur-md"
              data-testid="card-bbq-box"
            >
              <button
                type="button"
                onClick={() => openLightbox('/images/bbq-box.jpg', bbqBox.name)}
                className="relative h-48 w-full overflow-hidden rounded-[16px] bg-[#000000] text-right cursor-zoom-in"
                aria-label={`عرض صورة ${bbqBox.name}`}
              >
                <picture>
                  <source media="(min-width: 1024px)" srcSet="/images/bbq-box-desktop.png" />
                  <source media="(min-width: 640px)" srcSet="/images/bbq-box-tablet.png" />
                  <img
                    src="/images/bbq-box-mobile.png"
                    alt={bbqBox.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                    data-testid="img-product-bbq-box"
                  />
                </picture>
                <span className="absolute right-3 top-3 rounded-full bg-[#e0a93b] px-3 py-1 text-[10px] font-extrabold text-[#000000]">{bbqBox.tag}</span>
              </button>

              <div className="p-2 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold leading-tight text-[#000000]">{bbqBox.name}</h3>
                    <div className="mono mt-1 text-sm tracking-wide text-[#e0a93b]">{bbqBox.english}</div>
                  </div>
                  <span className="mono shrink-0 text-2xl font-extrabold text-[#000000]">
                    من {bbqBoxSizes[0].price} <small className="font-sans text-sm">ر.س</small>
                  </span>
                </div>
                <p className="mt-2 min-h-[56px] text-sm font-medium leading-7 text-[#f6f8fc] drop-shadow-sm">{bbqBox.description}</p>
                <button
                  onClick={() => { setBundle({ item: bbqBox, sizes: bbqBoxSizes }); setBundleSize(bbqBoxSizes[0]); setBundleQty(1); }}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#c97a06] px-4 py-2.5 text-xs font-bold text-[#000000] transition hover:bg-[#c2410c] hover:text-[#f6f8fc]"
                  data-testid="button-add-bbq-box"
                >
                  <Plus size={15} /> أضف للطلب
                </button>
              </div>
            </Reveal>
          </div>
        </section>)}


        <section id="testimonials" className="scroll-mt-36 pt-16 sm:pt-24">
          <SectionHeading title="ماذا يقول عملاؤنا عنا" english="CUSTOMER REVIEWS" subtitle="آراء وصلتنا من ضيوفنا في المطعم وعبر واتساب." accent />
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((person, index) => (
              <Reveal
                as="article"
                key={person.name}
                delay={(index % 3) * 110}
                className="relative overflow-hidden rounded-[22px] border border-[#dbe3ef]/50 bg-[#ffffff]/80 p-6 backdrop-blur-sm"
                data-testid={`card-testimonial-${index}`}
              >
                <Quote size={30} className="absolute left-5 top-5 text-[#e7edf7]" />
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#000000] font-bold text-[#e0a93b]">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[#000000]">{person.name}</div>
                    <div className="text-[11px] font-bold text-[#5b6a83]">{person.city}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className={i < person.rating ? 'fill-[#e0a93b] text-[#e0a93b]' : 'text-[#dbe3ef]'} />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-7 text-[#5b6a83]">{person.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {SHOW_CATERING && (<section id="catering" className="scroll-mt-36 pt-16 sm:pt-24">
          <Reveal from="scale" className="relative overflow-hidden rounded-[24px] border border-[#dbe3ef]/40 bg-[#0d1420] px-6 py-10 text-center backdrop-blur-sm sm:px-10 sm:py-14">
            <img
              src={cateringImage}
              alt="خدمة الكاترينج من اختصاص البرجر"
              loading="lazy"
              className="mx-auto mb-8 max-h-[520px] w-full rounded-[18px] object-contain"
            />

            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e0a93b] text-[#000000]">
              <Phone size={26} />
            </div>
            <h3 className="mt-5 font-display text-4xl text-[#f6f8fc]">نجعل مناسباتكم أكثر تميزًا</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#f6f8fc]/70">
              بخدمة الكاترينج الخاصة بنا — نجهّز لكم منيو متكامل لحفلاتكم ومناسباتكم بأعلى جودة.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <a
                href={`tel:+${WHATSAPP_NUMBER}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#c97a06] px-6 py-3.5 text-sm font-bold text-[#000000] transition hover:-translate-y-0.5 hover:bg-[#c2410c] hover:text-[#f6f8fc]"
                data-testid="link-catering-call"
                dir="ltr"
              >
                <Phone size={17} /> للحجز والاستفسار: +966580835125
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('مرحباً Specialty Burger،\nأرغب بالاستفسار عن خدمة الكاترينج لمناسبة.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#f6f8fc]/30 px-6 py-3.5 text-sm font-bold text-[#f6f8fc] transition hover:bg-[#f6f8fc]/10"
                data-testid="link-catering-whatsapp"
              >
                <MessageCircle size={17} /> راسلنا واتساب
              </a>
            </div>
          </Reveal>
        </section>)}

        <section id="feedback" className="scroll-mt-36 pt-16 sm:pt-24">
          <SectionHeading title="الشكاوى والاقتراحات" english="FEEDBACK" subtitle="رأيك يهمنا — أخبرنا بأي ملاحظة وسنتواصل معك." />
          <Reveal from="scale" className="mt-7 overflow-hidden rounded-[24px] border border-[#dbe3ef]/40 bg-[#000000]/85 px-6 py-10 text-center backdrop-blur-sm sm:px-10 sm:py-14">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e0a93b] text-[#000000]">
              <MessageCircle size={26} />
            </div>
            <h3 className="mt-5 font-display text-4xl text-[#f6f8fc]">صوتك يوصلنا مباشرة</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[#f6f8fc]/70">
              إذا كان لديك شكوى عن طلب، أو اقتراح يحسّن تجربتك معنا، راسلنا على واتساب وسيتم الرد عليك من فريق الإدارة.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                onClick={sendFeedback}
                className="inline-flex items-center gap-2 rounded-full bg-[#1f9d63] px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#177a4d]"
                data-testid="button-feedback-whatsapp"
              >
                <Send size={17} /> أرسل شكوى أو اقتراح
              </button>
              <a
                href={`tel:+${WHATSAPP_NUMBER}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#f6f8fc]/30 px-6 py-3.5 text-sm font-bold text-[#f6f8fc] transition hover:bg-[#f6f8fc]/10"
                data-testid="link-feedback-call"
              >
                <Phone size={17} /> اتصل بنا
              </a>
            </div>
            <p className="mt-5 text-[11px] text-[#f6f8fc]/50">نرد عادةً خلال ساعات العمل: السبت إلى الخميس ١٢م — ٣ص، والجمعة ١م — ٤ص</p>
          </Reveal>
        </section>



        <footer className="mt-20 grid gap-6 border-t border-[#dbe3ef]/40 pt-8 text-sm text-[#dcc29a] sm:grid-cols-3">
          <div><div className="flex items-center gap-3"><img src="/logo.png" alt="شعار اختصاص البرجر" className="h-12 w-12 rounded-full" /><div><div className="font-display text-2xl text-[#f6f8fc]">SPECIALTY <span className="text-[#c97a06]">BURGER</span></div><div className="text-xs font-bold text-[#c97a06]">اختصاص البرجر</div></div></div><p className="mt-3 leading-7">صُنع بشغف، ليُقدَّم لك بطعمٍ لا يُنسى.</p></div>
          <div><div className="font-bold text-[#f6f8fc]">زورونا</div><p className="mt-2 flex items-center gap-2"><MapPin size={15} /> جدة - حي السلامة - شارع قريش - أمام فندق راديسون بلو</p></div>
          <div><div className="font-bold text-[#f6f8fc]">تواصلوا معنا</div><a href="tel:+966580835125" className="mt-2 flex items-center gap-2 hover:text-[#c97a06]"><Phone size={15} /> +966 58 083 5125</a><a href="https://wa.me/966580835125" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 hover:text-[#c97a06]"><MessageCircle size={15} /> واتساب</a><a href="https://instagram.com/specialty_burger" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 hover:text-[#c97a06]"><Instagram size={15} /> specialty_burger</a><a href="https://snapchat.com/add/specialty_burger" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-2 hover:text-[#c97a06]"><Ghost size={15} /> specialty_burger</a></div>
        </footer>
      </main>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="تواصل معنا عبر واتساب"
        className="fixed bottom-5 right-5 z-[65] grid h-14 w-14 place-items-center rounded-full bg-[#1f9d63] text-white shadow-[0_10px_26px_rgba(22,35,59,0.28)] transition hover:-translate-y-1 hover:bg-[#177a4d]"
        data-testid="button-floating-whatsapp"
      >
        <MessageCircle size={26} />
      </a>

      {notice && <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-[#000000] px-5 py-3 text-center text-sm font-bold text-[#f6f8fc] shadow-xl pop-in" role="status" data-testid="status-notice">{notice}</div>}

      {customizing && <div className="fixed inset-0 z-[60] grid place-items-end bg-[#000000]/55 p-0 sm:place-items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="customize-title">
        <div className="pop-in max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-[#f6f8fc] p-5 shadow-2xl sm:rounded-[28px] sm:p-7">
          <div className="flex items-start justify-between"><div><div className="text-xs font-bold tracking-widest text-[#c2410c]">CUSTOMIZE YOURS</div><h2 id="customize-title" className="mt-1 font-display text-3xl text-[#000000]">{customizing.name}</h2><p className="mt-1 text-xs text-[#5b6a83]">{customizing.english}</p></div><button onClick={() => setCustomizing(null)} className="rounded-full p-2 text-[#5b6a83] hover:bg-[#e7edf7]" aria-label="إغلاق" data-testid="button-close-customize"><X size={20} /></button></div>
          <div className="mt-6 rounded-2xl border border-[#dbe3ef] bg-[#f1f5fb] p-4"><div className="flex items-center justify-between"><div><div className="font-bold text-[#000000]">بدون خضار؟</div><div className="mt-1 text-xs text-[#5b6a83]">اختَر المكونات التي تريد إزالتها</div></div><span className="text-xs font-bold text-[#c2410c]">{without.length} مختار</span></div><div className="mt-4 grid grid-cols-2 gap-2">{vegetables.map((vegetable) => <button key={vegetable} onClick={() => setWithout((current) => current.includes(vegetable) ? current.filter((v) => v !== vegetable) : [...current, vegetable])} className={`flex items-center justify-between rounded-xl border px-3 py-3 text-sm font-bold transition ${without.includes(vegetable) ? 'border-[#c2410c] bg-[#c2410c] text-[#f6f8fc]' : 'border-[#dbe3ef] bg-[#f6f8fc] text-[#5b6a83]'}`} data-testid={`button-remove-${customizing.id}-${vegetable}`}>{vegetable}{without.includes(vegetable) && <Check size={15} />}</button>)}</div></div>

          {customizing.doubleExtra ? (
            <button onClick={() => setIsDouble((current) => !current)} className={`mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-sm font-bold transition ${isDouble ? 'border-[#c2410c] bg-[#c2410c] text-[#f6f8fc]' : 'border-[#dbe3ef] bg-[#f1f5fb] text-[#000000]'}`} data-testid="button-toggle-double">
              <span className="flex items-center gap-2">{isDouble && <Check size={16} />} دبل — قطعتين لحم</span>
              <span className="mono">+{customizing.doubleExtra} ر.س</span>
            </button>
          ) : null}

          <div className="mt-4 rounded-2xl border border-[#dbe3ef] bg-[#f1f5fb] p-4">
            <div className="flex items-center justify-between"><div><div className="font-bold text-[#000000]">إضافات</div><div className="mt-1 text-xs text-[#5b6a83]">صوصات ومكونات إضافية</div></div><span className="text-xs font-bold text-[#c2410c]">{addons.length} مختار</span></div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {addonOptions.map((option) => (
                <button key={option.name} onClick={() => setAddons((current) => current.includes(option.name) ? current.filter((entry) => entry !== option.name) : [...current, option.name])} className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition ${addons.includes(option.name) ? 'border-[#000000] bg-[#000000] text-[#f6f8fc]' : 'border-[#dbe3ef] bg-[#f6f8fc] text-[#5b6a83]'}`} data-testid={`button-addon-${option.english}`}>
                  <span>{option.name}</span>
                  <span className="mono">+{option.price}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between"><div className="text-sm font-bold text-[#5b6a83]">الكمية</div><div className="flex items-center gap-3 rounded-full border border-[#dbe3ef] bg-[#f1f5fb] p-1"><button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="grid h-8 w-8 place-items-center rounded-full text-[#000000] hover:bg-[#f6f8fc]" data-testid="button-customize-minus"><Minus size={15} /></button><span className="mono w-5 text-center text-sm font-bold" data-testid="text-customize-quantity">{quantity}</span><button onClick={() => setQuantity((q) => q + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-[#e0a93b] text-[#000000] hover:bg-[#c2410c] hover:text-[#f6f8fc]" data-testid="button-customize-plus"><Plus size={15} /></button></div></div>
          <button onClick={confirmCustomize} className="mt-6 flex w-full items-center justify-between rounded-full bg-[#c2410c] px-5 py-4 font-bold text-[#f6f8fc] shadow-[0_8px_22px_rgba(22,35,59,0.14)] transition hover:translate-y-[-2px]" data-testid="button-confirm-customize"><span>أضف إلى الطلب</span><span className="mono">{customizingPrice * quantity} ر.س</span></button>
        </div>
      </div>}

      {bundle && bundleSize && <div className="fixed inset-0 z-[60] grid place-items-end bg-[#000000]/55 p-0 sm:place-items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="bundle-title">
        <div className="pop-in max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-[#f6f8fc] p-5 shadow-2xl sm:rounded-[28px] sm:p-7">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold tracking-widest text-[#c2410c]">CHOOSE YOUR BOX</div>
              <h2 id="bundle-title" className="mt-1 font-display text-3xl text-[#000000]">{bundle.item.name}</h2>
              <p className="mt-1 text-sm text-[#5b6a83]">{bundle.item.english}</p>
            </div>
            <button onClick={() => setBundle(null)} className="rounded-full p-2 text-[#5b6a83] hover:bg-[#e7edf7]" aria-label="إغلاق" data-testid="button-close-bundle"><X size={20} /></button>
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl bg-[#e7edf7]">
            <img src={bundle.item.image} alt={bundle.item.name} className="h-auto max-h-64 w-full object-contain" />
          </div>
          <div className="mt-5 rounded-2xl border border-[#dbe3ef] bg-[#f1f5fb] p-4">
            <div className="font-bold text-[#000000]">اختر الباقة</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {bundle.sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setBundleSize(size)}
                  className={`flex items-center justify-between rounded-xl border px-3 py-3 text-sm font-bold transition ${bundleSize.id === size.id ? 'border-[#c2410c] bg-[#c2410c] text-[#f6f8fc]' : 'border-[#dbe3ef] bg-[#f6f8fc] text-[#5b6a83]'}`}
                  data-testid={`button-bundle-${size.id}`}
                >
                  <span>{size.name}</span>
                  <span className="mono">{size.price} ر.س</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm font-bold text-[#5b6a83]">الكمية</div>
            <div className="flex items-center gap-3 rounded-full border border-[#dbe3ef] bg-[#f1f5fb] p-1">
              <button onClick={() => setBundleQty((q) => Math.max(1, q - 1))} className="grid h-8 w-8 place-items-center rounded-full text-[#000000] hover:bg-[#f6f8fc]" data-testid="button-bundle-minus"><Minus size={15} /></button>
              <span className="mono w-5 text-center text-sm font-bold" data-testid="text-bundle-quantity">{bundleQty}</span>
              <button onClick={() => setBundleQty((q) => q + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-[#e0a93b] text-[#000000] hover:bg-[#c2410c] hover:text-[#f6f8fc]" data-testid="button-bundle-plus"><Plus size={15} /></button>
            </div>
          </div>
          <button
            onClick={() => {
              addToCart({ ...bundle.item, id: bundleSize.id, name: bundleSize.name, english: bundleSize.english, price: bundleSize.price }, [], bundleQty, [], false);
              setBundle(null);
            }}
            className="mt-6 flex w-full items-center justify-between rounded-full bg-[#c2410c] px-5 py-4 font-bold text-[#f6f8fc] shadow-[0_8px_22px_rgba(22,35,59,0.14)] transition hover:translate-y-[-2px]"
            data-testid="button-confirm-bundle"
          >
            <span>أضف إلى الطلب</span>
            <span className="mono">{bundleSize.price * bundleQty} ر.س</span>
          </button>
        </div>
      </div>}

      {cartOpen && <div className="fixed inset-0 z-[60] bg-[#000000]/55" onClick={() => setCartOpen(false)}>

        <aside onClick={(event) => event.stopPropagation()} className="absolute left-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f6f8fc] shadow-2xl" dir="rtl">
          <div className="flex items-center justify-between border-b border-[#dbe3ef] p-5"><div><div className="text-xs font-bold tracking-widest text-[#c2410c]">YOUR ORDER</div><h2 className="font-display text-3xl text-[#000000]">طلبك</h2></div><button onClick={() => setCartOpen(false)} className="rounded-full p-2 hover:bg-[#e7edf7]" aria-label="إغلاق السلة" data-testid="button-close-cart"><X size={20} /></button></div>
          <div className="flex-1 overflow-y-auto p-5">
            {!cart.length ? <div className="grid h-full place-items-center text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e7edf7] text-[#c2410c]"><ShoppingBag size={27} /></div><h3 className="mt-4 font-display text-2xl text-[#000000]">السلة فاضية</h3><p className="mt-2 text-sm text-[#5b6a83]">ابدأ بإضافة شيء يشهيك.</p><button onClick={() => setCartOpen(false)} className="mt-5 rounded-full bg-[#000000] px-5 py-3 text-sm font-bold text-[#f6f8fc]" data-testid="button-back-to-menu">ارجع للمنيو</button></div></div> : <div className="space-y-3">{cart.map((item, index) => <div key={`${item.id}-${index}`} className="rounded-2xl border border-[#dbe3ef] bg-[#f1f5fb] p-4" data-testid={`cart-item-${item.id}-${index}`}><div className="flex justify-between gap-3"><div><div className="font-bold text-[#000000]">{item.name}</div><div className="mt-1 text-xs text-[#5b6a83]">{[item.isDouble ? 'دبل' : '', item.without.length ? `بدون ${item.without.join('، ')}` : '', item.addons.length ? `إضافة ${item.addons.join('، ')}` : ''].filter(Boolean).join(' — ') || item.english}</div></div><button onClick={() => setCart((current) => current.filter((_, i) => i !== index))} className="h-fit p-1 text-[#c2410c] hover:text-[#7c2d12]" aria-label={`حذف ${item.name}`} data-testid={`button-delete-cart-${item.id}-${index}`}><Trash2 size={16} /></button></div><div className="mt-3 flex items-center justify-between"><span className="mono text-sm font-bold text-[#c2410c]">{item.unitPrice * item.quantity} ر.س</span><div className="flex items-center gap-2 rounded-full bg-[#f6f8fc] p-1"><button onClick={() => changeQuantity(index, -1)} className="grid h-7 w-7 place-items-center rounded-full text-[#000000] hover:bg-[#e7edf7]" data-testid={`button-minus-cart-${item.id}-${index}`}><Minus size={14} /></button><span className="mono w-4 text-center text-xs">{item.quantity}</span><button onClick={() => changeQuantity(index, 1)} className="grid h-7 w-7 place-items-center rounded-full bg-[#e0a93b] text-[#000000]" data-testid={`button-plus-cart-${item.id}-${index}`}><Plus size={14} /></button></div></div></div>)}</div>}
          </div>
          {cart.length > 0 && <div className="border-t border-[#dbe3ef] bg-[#f1f5fb] p-5">
            <div className="mb-3 text-sm font-bold text-[#000000]">رقم الطاولة</div>
            <div className="grid grid-cols-6 gap-2">{Array.from({ length: 9 }, (_, i) => String(i + 1)).map((number) => <button key={number} onClick={() => setTable(number)} className={`rounded-lg py-2 text-sm font-bold transition ${table === number ? 'bg-[#c2410c] text-[#f6f8fc]' : 'bg-[#f6f8fc] text-[#5b6a83] hover:bg-[#e0a93b]'}`} data-testid={`button-table-${number}`}>{number}</button>)}</div>
            <div className="mt-5 flex items-center justify-between border-t border-[#dbe3ef] pt-4"><span className="font-bold text-[#5b6a83]">الإجمالي</span><span className="mono text-xl font-bold text-[#000000]" data-testid="text-cart-total">{total} ر.س</span></div>
            <button onClick={sendOrder} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#1f9d63] px-4 py-4 font-bold text-white transition hover:bg-[#177a4d]" data-testid="button-send-whatsapp"><MessageCircle size={19} /> أرسل الطلب عبر واتساب</button>
            <p className="mt-3 text-center text-[11px] leading-5 text-[#5b6a83]">سيتم إرسال تفاصيل طلبك ورقم الطاولة إلى المطعم</p>
          </div>}
        </aside>
      </div>}

      {SHOW_LIGHTBOX && lightboxImage && <div
        className="fixed inset-0 z-[80] grid place-items-center bg-[#000000]/88 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={lightboxAlt}
        onClick={() => setLightboxImage(null)}
        data-testid="lightbox-overlay"
      >
        <button
          type="button"
          onClick={() => setLightboxImage(null)}
          className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-[#f6f8fc]/90 text-[#000000] shadow-lg transition hover:scale-105 hover:bg-[#f6f8fc]"
          aria-label="إغلاق الصورة"
          data-testid="button-close-lightbox"
        >
          <X size={24} />
        </button>
        <img
          src={lightboxImage}
          alt={lightboxAlt}
          className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          data-testid="lightbox-image"
        />
      </div>}
    </div>
  );
}

function SectionHeading({ title, english, subtitle, accent = false }: { title: string; english: string; subtitle: string; accent?: boolean }) {
  return <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className={`font-display text-5xl font-bold leading-none ${accent ? 'text-[#c97a06]' : 'text-[#f6f8fc]'}`}>{title}</h2><div className="mono mt-2 text-sm font-bold leading-7 tracking-[.2em] text-[#e0a93b]">{english}</div></div><p className="max-w-sm text-sm leading-7 text-[#dcc29a] sm:text-right">{subtitle}</p></Reveal>;
}

function ProductCard({ item, onAdd, onImageClick, index, compact = false, contain = false }: { item: MenuItem; onAdd: () => void; onImageClick?: (() => void) | undefined; index: number; compact?: boolean; contain?: boolean }) {
  const imageWrapperClass = `${compact ? 'h-20 w-20 shrink-0' : 'h-48 w-full'} ${contain ? 'photo-contain' : 'burger-cutout'} rounded-[16px] relative overflow-hidden`;
  const image = <img src={item.image} alt={item.name} className="h-full w-full" data-testid={`img-product-${item.id}`} />;
  return <Reveal as="article" delay={(index % 4) * 90} className={`menu-card group relative overflow-hidden rounded-[22px] border border-[#dbe3ef]/40 bg-[#ffffff]/45 backdrop-blur-md ${compact ? 'flex items-center gap-4 p-3' : 'p-3'}`}>

    {onImageClick ? (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onImageClick(); }}
        className={`${imageWrapperClass} cursor-zoom-in text-right`}
        aria-label={`عرض صورة ${item.name}`}
      >
        {image}
        {!compact && item.tag && <span className="absolute right-5 top-5 rounded-full bg-[#e0a93b] px-3 py-1 text-[10px] font-extrabold text-[#000000]">{item.tag}</span>}
      </button>
    ) : (
      <div className={imageWrapperClass}>
        {image}
        {!compact && item.tag && <span className="absolute right-5 top-5 rounded-full bg-[#e0a93b] px-3 py-1 text-[10px] font-extrabold text-[#000000]">{item.tag}</span>}
      </div>
    )}
    <div className={compact ? 'min-w-0 flex-1' : 'p-2 pt-4'}>
      <div className="flex items-start justify-between gap-2"><div><h3 className="text-xl font-bold leading-tight text-[#000000]">{item.name}</h3><div className="mono mt-1 text-sm tracking-wide text-[#e0a93b]">{item.english}</div></div><span className="mono shrink-0 text-2xl font-extrabold text-[#000000]">{item.price} <small className="font-sans text-sm">ر.س</small></span></div>
      <p className={`mt-2 text-sm font-medium leading-7 text-[#f6f8fc] drop-shadow-sm ${compact ? '' : ''}`}>{item.description}</p>
      {item.descriptionEn ? <p className="mt-1 text-xs font-medium leading-6 text-[#d4b896] drop-shadow-sm" dir="ltr">{item.descriptionEn}</p> : null}
      <button onClick={onAdd} className={`mt-3 flex items-center justify-center gap-2 rounded-full bg-[#c97a06] px-4 py-2.5 text-xs font-bold text-[#000000] transition hover:bg-[#c2410c] hover:text-[#f6f8fc] ${compact ? 'w-full' : 'w-full'}`} data-testid={`button-add-${item.id}`}><Plus size={15} /> أضف للطلب</button>
    </div>
  </Reveal>;
}
