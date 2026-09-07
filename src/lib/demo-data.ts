export type Product = {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  price: number;
  discountPrice: number | null;
  categoryId: string;
  category: string;
  image: string;
  available: boolean;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  prepTime: number;
  calories: number | null;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  nameAr: string;
  count: number;
  image: string;
  enabled: boolean;
  order: number;
};

export type OrderItem = { id: string; name: string; quantity: number; price: number };
export type Order = {
  id: string;
  number: string;
  customer: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  deliveryMethod: string;
  address: string;
  phone: string;
  createdAt: string;
  status:
    | "new"
    | "confirmed"
    | "preparing"
    | "ready"
    | "out_for_delivery"
    | "completed"
    | "cancelled";
  notes: string | null;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  orders: number;
  spending: number;
  lastOrder: string;
  registeredAt: string;
};

export type Offer = {
  id: string;
  name: string;
  description: string;
  type: "percentage" | "fixed" | "coupon" | "bogo";
  value: number;
  code: string | null;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired";
  uses: number;
  maxUses: number;
  target: string;
};

export type Review = {
  id: string;
  customer: string;
  rating: number;
  review: string;
  product: string;
  date: string;
  status: "pending" | "approved" | "hidden";
};

export type Notification = {
  id: string;
  type: "new_order" | "cancelled_order" | "review" | "stock" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
};

export const images = {
  burger: "https://specialty-burger.vercel.app/menu/burger-1.jpg",
  pomegranate: "https://specialty-burger.vercel.app/menu/burger-3.jpg",
  chicken: "https://specialty-burger.vercel.app/menu/burger-7.jpg",
  fries: "https://specialty-burger.vercel.app/menu/extra-4.jpg",
  wings: "https://specialty-burger.vercel.app/menu/extra-7.jpg",
  drink: "https://specialty-burger.vercel.app/menu/drink-1.jpg",
};

export const categories: Category[] = [
  { id: "appetizers", name: "Appetizers", nameAr: "المقبلات", count: 11, image: images.fries, enabled: true, order: 1 },
  { id: "burgers", name: "Burgers", nameAr: "البرجر", count: 9, image: images.burger, enabled: true, order: 2 },
  { id: "broast", name: "Broast", nameAr: "بروست", count: 2, image: images.chicken, enabled: true, order: 3 },
  { id: "meals", name: "Meals", nameAr: "الوجبات", count: 2, image: images.chicken, enabled: true, order: 4 },
  { id: "addons", name: "Sauces & Add-ons", nameAr: "صوصات وإضافات", count: 10, image: images.wings, enabled: true, order: 5 },
  { id: "drinks", name: "Drinks", nameAr: "المشروبات", count: 9, image: images.drink, enabled: true, order: 6 },
];

export const product = (
  id: string,
  name: string,
  nameAr: string,
  description: string,
  price: number,
  categoryId: string,
  image: string,
  flags: Partial<Pick<Product, "featured" | "bestseller" | "isNew">> = {},
): Product => ({
  id,
  name,
  nameAr,
  description,
  price,
  discountPrice: null,
  categoryId,
  category: categories.find((item) => item.id === categoryId)?.name ?? categoryId,
  image,
  available: true,
  featured: false,
  bestseller: false,
  isNew: false,
  prepTime: categoryId === "drinks" ? 3 : categoryId === "burgers" ? 12 : 8,
  calories: null,
  createdAt: "2026-08-18T12:00:00.000Z",
  ...flags,
});

export const products: Product[] = [
  product("p-original", "Original Specialty", "اوريجينال سبيشالتي", "Pretzel bun, fresh grilled beef patty, cheese, lettuce, white onion, tomato, special sauce", 26, "burgers", images.burger, { featured: true, bestseller: true }),
  product("p-pomegranate", "Pomegranate Specialty", "سبيشاليتي الرمان", "Fresh grilled beef, cheese, pomegranate, rocca, mayo and pomegranate molasses", 27, "burgers", images.pomegranate, { featured: true, isNew: true }),
  product("p-caramel", "Caramelized Onion Burger", "برجر البصل المكرمل", "Fresh beef patty, cheese, caramelized onions, special sauce", 25, "burgers", images.burger, { bestseller: true }),
  product("p-fried-chicken", "Fried Chicken Breast Burger", "برجر صدر الدجاج المقلي", "Fried fresh chicken breast, cheese, lettuce, coleslaw, special sauce", 24, "burgers", images.chicken),
  product("p-fries", "French Fries", "بطاطس مقلية", "Crispy fries served with our special seasoning", 6, "appetizers", images.fries, { bestseller: true }),
  product("p-wings", "Chicken Wings", "أجنحة الدجاج", "Three wings with your choice of spicy or BBQ sauce", 14, "appetizers", images.wings),
  product("p-broast", "Chicken Broast", "دجاج بروست", "Four pieces of crispy broasted chicken", 18, "broast", images.chicken),
  product("p-strips-meal", "Slow Strips Meal", "وجبة سلو ستربس", "Four crispy chicken strips with fries, coleslaw and a soft drink", 26, "meals", images.chicken, { featured: true }),
  product("p-coke", "Coca-Cola Classic", "كوكاكولا كلاسيك", "Chilled soft drink can", 3, "drinks", images.drink),
];

export const orders: Order[] = [
  { id: "o-1048", number: "#1048", customer: "Lina Alharbi", customerId: "c-lina", items: [{ id: "p-original", name: "Original Specialty", quantity: 2, price: 26 }, { id: "p-fries", name: "French Fries", quantity: 1, price: 6 }], total: 58, paymentMethod: "Card", deliveryMethod: "Delivery", address: "Al Rawdah, Jeddah", phone: "+966 55 213 8401", createdAt: "2026-09-07T12:42:00.000Z", status: "preparing", notes: "Extra sauce, please" },
  { id: "o-1047", number: "#1047", customer: "Omar Alotaibi", customerId: "c-omar", items: [{ id: "p-pomegranate", name: "Pomegranate Specialty", quantity: 1, price: 27 }, { id: "p-coke", name: "Coca-Cola Classic", quantity: 2, price: 3 }], total: 33, paymentMethod: "Cash", deliveryMethod: "Pickup", address: "Pickup counter", phone: "+966 50 991 7420", createdAt: "2026-09-07T12:25:00.000Z", status: "new", notes: null },
  { id: "o-1046", number: "#1046", customer: "Sara M. Hamed", customerId: "c-sara", items: [{ id: "p-strips-meal", name: "Slow Strips Meal", quantity: 2, price: 26 }], total: 52, paymentMethod: "Card", deliveryMethod: "Delivery", address: "Al Safa, Jeddah", phone: "+966 54 334 1892", createdAt: "2026-09-07T11:58:00.000Z", status: "ready", notes: "Call on arrival" },
  { id: "o-1045", number: "#1045", customer: "Faisal Alzahrani", customerId: "c-faisal", items: [{ id: "p-caramel", name: "Caramelized Onion Burger", quantity: 1, price: 25 }, { id: "p-fries", name: "French Fries", quantity: 1, price: 6 }], total: 31, paymentMethod: "Card", deliveryMethod: "Delivery", address: "Al Hamra, Jeddah", phone: "+966 56 770 1128", createdAt: "2026-09-07T11:21:00.000Z", status: "completed", notes: null },
  { id: "o-1044", number: "#1044", customer: "Noura Alghamdi", customerId: "c-noura", items: [{ id: "p-fried-chicken", name: "Fried Chicken Breast Burger", quantity: 1, price: 24 }, { id: "p-wings", name: "Chicken Wings", quantity: 1, price: 14 }], total: 38, paymentMethod: "Cash", deliveryMethod: "Pickup", address: "Pickup counter", phone: "+966 55 024 8890", createdAt: "2026-09-07T10:45:00.000Z", status: "confirmed", notes: null },
  { id: "o-1043", number: "#1043", customer: "Khalid Saeed", customerId: "c-khalid", items: [{ id: "p-broast", name: "Chicken Broast", quantity: 2, price: 18 }], total: 36, paymentMethod: "Card", deliveryMethod: "Delivery", address: "Al Faisaliyah, Jeddah", phone: "+966 59 220 3871", createdAt: "2026-09-06T22:16:00.000Z", status: "cancelled", notes: "Customer cancelled" },
];

export const customers: Customer[] = [
  { id: "c-lina", name: "Lina Alharbi", phone: "+966 55 213 8401", email: "lina.alharbi@example.com", orders: 12, spending: 428, lastOrder: "2026-09-07T12:42:00.000Z", registeredAt: "2026-02-14T09:00:00.000Z" },
  { id: "c-omar", name: "Omar Alotaibi", phone: "+966 50 991 7420", email: "omar.a@example.com", orders: 8, spending: 256, lastOrder: "2026-09-07T12:25:00.000Z", registeredAt: "2026-03-02T09:00:00.000Z" },
  { id: "c-sara", name: "Sara M. Hamed", phone: "+966 54 334 1892", email: "sara.hamed@example.com", orders: 5, spending: 174, lastOrder: "2026-09-07T11:58:00.000Z", registeredAt: "2026-05-22T09:00:00.000Z" },
  { id: "c-faisal", name: "Faisal Alzahrani", phone: "+966 56 770 1128", email: "faisal.z@example.com", orders: 4, spending: 131, lastOrder: "2026-09-07T11:21:00.000Z", registeredAt: "2026-06-04T09:00:00.000Z" },
  { id: "c-noura", name: "Noura Alghamdi", phone: "+966 55 024 8890", email: "noura.a@example.com", orders: 3, spending: 97, lastOrder: "2026-09-07T10:45:00.000Z", registeredAt: "2026-07-11T09:00:00.000Z" },
  { id: "c-khalid", name: "Khalid Saeed", phone: "+966 59 220 3871", email: "khalid.s@example.com", orders: 2, spending: 68, lastOrder: "2026-09-06T22:16:00.000Z", registeredAt: "2026-08-01T09:00:00.000Z" },
];

export const offers: Offer[] = [
  { id: "offer-weekend", name: "Weekend Specialty", description: "15% off all burgers every Thursday and Friday", type: "percentage", value: 15, code: null, startDate: "2026-08-28", endDate: "2026-09-30", status: "active", uses: 84, maxUses: 200, target: "Burgers" },
  { id: "offer-lunch", name: "Lunch Break", description: "Save 10 SAR on orders over 60 SAR", type: "fixed", value: 10, code: "LUNCH10", startDate: "2026-09-10", endDate: "2026-09-30", status: "scheduled", uses: 0, maxUses: 100, target: "All menu" },
  { id: "offer-bogo", name: "Burger Night", description: "Buy one Original Specialty and get fries free", type: "bogo", value: 0, code: "BURGERNIGHT", startDate: "2026-08-01", endDate: "2026-08-31", status: "expired", uses: 144, maxUses: 150, target: "Original Specialty" },
];

export const websiteContent = {
  heroTitle: "رحلة نكهات لا تنسى",
  heroSubtitle: "لحم بقري بلدي طازج، خبز بريتزل يخبز يومياً، وصوصات من مطبخنا. كل قضمة تحكي طعم.",
  heroImage: "https://specialty-burger.vercel.app/images/restaurant-background.jpg",
  restaurantDescription: "برجر على أصوله في جدة. نبدأ من خبزنا الطازج ونبني فوقه شيء يستاهل كل قضمة.",
  whatsapp: "+966 55 123 4567",
  phone: "+966 12 345 6789",
  address: "جدة، المملكة العربية السعودية",
  footer: "Specialty Burger — since Jeddah",
  openingHours: "السبت إلى الخميس ١٢م — ٣ص، والجمعة ١م — ٤ص",
  instagram: "@specialtyburger",
  snapchat: "@specialtyburger",
};

export const restaurantSettings = {
  name: "Specialty Burger",
  logo: "https://specialty-burger.vercel.app/logo.png",
  favicon: "https://specialty-burger.vercel.app/favicon.png",
  minimumOrder: 25,
  deliveryFee: 10,
  deliveryTime: 35,
  pickup: true,
  delivery: true,
  status: "open" as "open" | "closed" | "busy",
  hours: [
    { day: "Saturday", open: "12:00", close: "03:00", enabled: true },
    { day: "Sunday", open: "12:00", close: "03:00", enabled: true },
    { day: "Monday", open: "12:00", close: "03:00", enabled: true },
    { day: "Tuesday", open: "12:00", close: "03:00", enabled: true },
    { day: "Wednesday", open: "12:00", close: "03:00", enabled: true },
    { day: "Thursday", open: "12:00", close: "03:00", enabled: true },
    { day: "Friday", open: "13:00", close: "04:00", enabled: true },
  ],
};

export const reviews: Review[] = [
  { id: "r-1", customer: "وليد الفقيه", rating: 5, review: "تجربة استثنائية! برجر اللحم جوسي ومطهو بإتقان وجودته عالية، والبطاطس مميزة جدًا.", product: "Original Specialty", date: "2026-09-06", status: "approved" },
  { id: "r-2", customer: "Piano B", rating: 5, review: "أكلهم لذيذ جدًا، أخذنا ٣ أنواع برجر لحم مختلفة وكلهم لذيذين.", product: "Caramelized Onion Burger", date: "2026-09-05", status: "approved" },
  { id: "r-3", customer: "رغد سرج", rating: 4, review: "طلبت برجر البصل المكرمل وكان رهيب، أخذته دبل وحجمه كبير.", product: "Caramelized Onion Burger", date: "2026-09-04", status: "pending" },
  { id: "r-4", customer: "Sam M", rating: 4, review: "الأسعار والكمية ممتازة، والبرجر والستربس لذيذين جدًا.", product: "Slow Strips Meal", date: "2026-09-02", status: "hidden" },
];

export const notifications: Notification[] = [
  { id: "n-1", type: "new_order", title: "New order #1047", description: "Omar Alotaibi placed a 33 SAR pickup order.", time: "2 min ago", read: false },
  { id: "n-2", type: "review", title: "New review to approve", description: "Raghad left a 4-star review for Caramelized Onion Burger.", time: "48 min ago", read: false },
  { id: "n-3", type: "stock", title: "Low stock alert", description: "Hot Jalapeño add-on is running low.", time: "1 hr ago", read: false },
  { id: "n-4", type: "system", title: "Weekly report ready", description: "Your August performance report is available.", time: "Yesterday", read: true },
];

export const dashboardSeries = [
  { label: "Sep 1", value: 1820 },
  { label: "Sep 2", value: 2140 },
  { label: "Sep 3", value: 1960 },
  { label: "Sep 4", value: 2480 },
  { label: "Sep 5", value: 2760 },
  { label: "Sep 6", value: 2310 },
  { label: "Today", value: 1850 },
];

export const categoriesBySales = [
  { label: "Burgers", value: 54, color: "#d79024" },
  { label: "Meals", value: 21, color: "#e7a83e" },
  { label: "Appetizers", value: 14, color: "#253a53" },
  { label: "Drinks", value: 11, color: "#9b553e" },
];

