import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

export type Product = {
  id: string; name: string; nameAr: string; description: string; price: number;
  discountPrice: number | null; categoryId: string; category: string; image: string;
  available: boolean; featured: boolean; bestseller: boolean; isNew: boolean;
  prepTime: number; calories: number | null; createdAt: string;
};
export type Category = { id: string; name: string; nameAr: string; count: number; image: string; enabled: boolean; order: number };
export type Offer = { id: string; name: string; description: string; type: string; value: number; code: string | null; startDate: string; endDate: string; status: string; uses: number; maxUses: number; target: string };
type OrderAddon = { id?: string; name?: string; name_ar?: string; price?: number; quantity?: number; [key: string]: unknown };
type OrderItem = {
  id?: string; productId?: string; name?: string; name_ar?: string; quantity?: number; price?: number;
  unitPrice?: number; subtotal?: number; addons?: OrderAddon[]; [key: string]: unknown;
};
type OrderRecord = {
  id: string; orderNumber?: string; tableNumber?: string | number; items?: OrderItem[]; subtotal?: number;
  total?: number; createdAt: string; updatedAt?: string; status?: string; [key: string]: unknown;
};
type JsonRow = { id: string; data: Record<string, unknown> | null; status?: string | null; created_at: string };

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  return supabase;
}
async function requireUser() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new Error("Your session has expired. Please sign in again.");
  return { client, user: data.user };
}
const key = (name: string, params?: unknown) =>
  params && Object.keys(params as object).length ? [name, params] : [name];

export const PRODUCT_IMAGE_BUCKET = "product-images";

export async function uploadProductImage(file: File) {
  const { client } = await requireUser();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = client.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export function getProductImagePath(value: unknown) {
  const image = String(value ?? "").trim();
  if (!image) return null;
  try {
    const url = new URL(image, window.location.origin);
    const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    return markerIndex >= 0 ? decodeURIComponent(url.pathname.slice(markerIndex + marker.length)) : null;
  } catch {
    return null;
  }
}

export async function deleteProductImage(value: unknown) {
  const path = getProductImagePath(value);
  if (!path) return;
  const { client } = await requireUser();
  const { error } = await client.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
  if (error) throw error;
}

export const getGetDashboardSummaryQueryKey = (params?: unknown) => key("dashboard-summary", params);
export const getGetAnalyticsQueryKey = (params?: unknown) => key("analytics", params);
export const getListProductsQueryKey = (params?: unknown) => key("products", params);
export const getListCategoriesQueryKey = () => ["categories"];
export const getListOrdersQueryKey = (params?: unknown) => key("orders", params);
export const getListCustomersQueryKey = (params?: unknown) => key("customers", params);
export const getListOffersQueryKey = () => ["offers"];
export const getGetWebsiteContentQueryKey = () => ["website-content"];
export const getGetRestaurantSettingsQueryKey = () => ["restaurant-settings"];
export const getListReviewsQueryKey = () => ["reviews"];
export const getListNotificationsQueryKey = () => ["notifications"];
const invalidateLiveStats = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  queryClient.invalidateQueries({ queryKey: getGetAnalyticsQueryKey() });
};


const normalizeImage = (value: unknown): string => {
  const image = String(value ?? "").trim();
  if (!image) return "";
  try {
    const url = new URL(image);
    if (url.hostname === "specialty-burger.vercel.app" && url.pathname.startsWith("/menu/")) {
      return `${url.pathname}${url.search}`;
    }
    return image;
  } catch {
    return image.startsWith("menu/") ? `/${image}` : image;
  }
};

const productFromRow = (r: any): Product => ({
  id: r.id, name: r.name, nameAr: r.name_ar ?? "", description: r.description ?? "",
  price: Number(r.price ?? 0), discountPrice: r.discount_price == null ? null : Number(r.discount_price),
  categoryId: r.category_id ?? "", category: r.category_name ?? r.category_id ?? "",
  image: normalizeImage(r.image), available: Boolean(r.available), featured: Boolean(r.featured),
  bestseller: Boolean(r.bestseller), isNew: Boolean(r.is_new), prepTime: Number(r.prep_time ?? 0),
  calories: r.calories == null ? null : Number(r.calories), createdAt: r.created_at ?? new Date().toISOString(),
});
const categoryFromRow = (r: any): Category => ({
  id: r.id, name: r.name, nameAr: r.name_ar ?? "", count: Number(r.count ?? 0),
  image: normalizeImage(r.image), enabled: Boolean(r.enabled), order: Number(r.sort_order ?? 0),
});
const offerFromRow = (r: any): Offer => r.data as Offer;

async function jsonRows(table: string): Promise<JsonRow[]> {
  const { client } = await requireUser();
  const columns = table === "reviews" ? "id,data,status,created_at" : "id,data,created_at";
  const { data, error } = await client.from(table).select(columns);
  if (error) throw error;
  return (data ?? []) as JsonRow[];
}
const numericValue = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const firstValue = (...values: unknown[]) => values.find((value) => value !== undefined && value !== null && value !== "");
const normalizeStatus = (value: unknown) => String(value ?? "new").trim().toLowerCase().replaceAll(" ", "_");

function normalizeAddon(addon: any): OrderAddon {
  return {
    ...addon,
    id: addon.id ?? addon.addon_id,
    name: String(firstValue(addon.name, addon.title, addon.label, addon.addon_name, addon.id) ?? ""),
    price: numericValue(firstValue(addon.price, addon.unit_price, addon.amount)) ?? 0,
    quantity: numericValue(firstValue(addon.quantity, addon.qty)) ?? 1,
  };
}

function normalizeOrderItem(item: any, index: number): OrderItem {
  const addons = (firstValue(item.addons, item.add_ons, item.options, item.extras) as any[] | undefined)?.map(normalizeAddon) ?? [];
  const quantity = numericValue(firstValue(item.quantity, item.qty, item.count)) ?? 1;
  const addonTotal = addons.reduce((sum, addon) => sum + Number(addon.price ?? 0) * Number(addon.quantity ?? 1), 0);
  const storedSubtotal = numericValue(firstValue(item.subtotal, item.item_subtotal, item.line_total, item.total));
  const unitPrice = numericValue(firstValue(item.unitPrice, item.unit_price, item.price, item.product?.price)) ?? (storedSubtotal == null ? 0 : Math.max(0, (storedSubtotal - addonTotal) / quantity));
  const subtotal = storedSubtotal ?? quantity * unitPrice + addonTotal;
  return {
    ...item,
    id: item.id ?? item.product_id ?? `item-${index}`,
    productId: item.productId ?? item.product_id ?? item.product?.id,
    name: String(firstValue(item.name, item.product_name, item.productName, item.title, item.product?.name, item.product_id) ?? ""),
    quantity,
    price: unitPrice,
    unitPrice,
    subtotal,
    addons,
  };
}

function normalizeOrder(row: any): OrderRecord {
  const items = (Array.isArray(row.items) ? row.items : []).map(normalizeOrderItem);
  const calculatedSubtotal = items.reduce((sum: number, item: OrderItem) => sum + Number(item.subtotal ?? 0), 0);
  const storedSubtotal = numericValue(row.subtotal);
  const storedTotal = numericValue(row.total_amount);
  const total = storedTotal ?? calculatedSubtotal;
  return {
    id: row.id,
    orderNumber: String(row.order_number ?? ""),
    tableNumber: row.table_number,
    items,
    subtotal: storedSubtotal ?? calculatedSubtotal,
    total,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
    status: normalizeStatus(row.status),
  };
}
async function listOrders() {
  const { client } = await requireUser();
  const { data, error } = await client
    .from("orders")
    .select("id,order_number,table_number,items,subtotal,total_amount,status,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeOrder);
}
export type DineInOrderInput = {
  orderNumber: string | number;
  tableNumber: string | number;
  items: OrderItem[];
  subtotal: number;
  totalAmount: number;
};

export async function createDineInOrder(input: DineInOrderInput) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("orders")
    .insert({
      id: crypto.randomUUID(),
      order_number: String(input.orderNumber),
      table_number: input.tableNumber,
      items: input.items,
      subtotal: Number(input.subtotal),
      total_amount: Number(input.totalAmount),
    })
    .select("id,order_number,table_number,items,subtotal,total_amount,created_at")
    .single();
  if (error) throw error;
  return normalizeOrder(data);
}
export async function createOrderNotification(order: any) {
  const { client } = await requireUser();
  const orderNumber = String(order.order_number ?? order.number ?? "").replace(/^#/, "");
  const tableNumber = order.table_number ?? order.tableNumber ?? "—";
  const items = Array.isArray(order.items) ? order.items : [];
  const itemCount = items.reduce((count: number, item: any) => count + Number(item.quantity ?? 1), 0);
  const createdAt = String(order.created_at ?? order.createdAt ?? new Date().toISOString());
  const id = `order-${String(order.id)}`;
  const { error } = await client.from("notifications").upsert(
    {
      id,
      data: {
        id,
        type: "new_order",
        title: `New order #${orderNumber}`,
        description: `Table ${tableNumber} · ${itemCount} items`,
        time: new Date(createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        read: false,
        createdAt,
      },
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
  if (error) throw error;
}
async function jsonList(table: string) {
  const rows = await jsonRows(table);
  return rows.map((row) => {
    const value = {
      ...(row.data ?? {}),
      ...(table === "reviews" && row.status ? { status: row.status } : {}),
      id: row.data?.id ?? row.id,
      createdAt: row.data?.createdAt ?? row.data?.created_at ?? row.created_at,
    };
    return table === "orders" ? normalizeOrder(value) : value;
  });
}
async function jsonUpdate(table: string, id: string, patch: any) {
  const { client } = await requireUser();
  const { data: current, error: readError } = await client.from(table).select("data").eq("id", id).single();
  if (readError) throw readError;
  const next = { ...(current?.data ?? {}), ...patch };
  const { data, error } = await client.from(table).update({ data: next }).eq("id", id).select("data").single();
  if (error) throw error;
  return data.data;
}
async function jsonInsert(table: string, value: any) {
  const { client } = await requireUser();
  const id = value.id ?? crypto.randomUUID();
  const { data, error } = await client.from(table).insert({ id, data: { ...value, id } }).select("data").single();
  if (error) throw error;
  return data.data;
}
async function jsonDelete(table: string, id: string) {
  const { client } = await requireUser();
  const { error } = await client.from(table).delete().eq("id", id);
  if (error) throw error;
}

const localDayKey = (date: Date) => {
  const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const orderDate = (order: OrderRecord) => new Date(order.createdAt);
const isCancelled = (order: OrderRecord) => String(order.status ?? "").toLowerCase() === "cancelled";
const orderValue = (order: OrderRecord) => Number(order.total ?? 0);
const rangeStart = (range: string) => { const date = new Date(); date.setHours(0, 0, 0, 0); if (range === "today") return date; if (range === "30d") date.setDate(date.getDate() - 29); else if (range === "month") date.setDate(1); else date.setDate(date.getDate() - 6); return date; };
const daysBetween = (start: Date, count: number) => Array.from({ length: count }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day; });

function buildSalesData(orders: OrderRecord[], start: Date, count: number) {
  return daysBetween(start, count).map((day) => { const key = localDayKey(day); const value = orders.filter((order) => !isCancelled(order) && localDayKey(orderDate(order)) === key).reduce((sum, order) => sum + orderValue(order), 0); return { label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value }; });
}

function buildProductSales(orders: OrderRecord[], products: Product[]) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const sales = new Map<string, { name: string; category: string; units: number; revenue: number; image: string }>();
  for (const order of orders) for (const item of order.items ?? []) {
    const productId = item.productId ?? item.id; const product = productId ? productMap.get(productId) : undefined;
    if (!product) continue;
    const units = Number(item.quantity ?? 0); const revenue = units * Number(item.price ?? product.price ?? 0); const current = sales.get(product.id) ?? { name: product.name, category: product.category, units: 0, revenue: 0, image: product.image };
    current.units += units; current.revenue += revenue; sales.set(product.id, current);
  }
  return [...sales.values()].sort((a, b) => b.revenue - a.revenue);
}

function buildCategorySales(orders: OrderRecord[], products: Product[]) {
  const productMap = new Map(products.map((product) => [product.id, product])); const sales = new Map<string, number>();
  for (const order of orders) for (const item of order.items ?? []) { const product = productMap.get(item.productId ?? item.id ?? ""); if (!product) continue; sales.set(product.category, (sales.get(product.category) ?? 0) + Number(item.quantity ?? 0) * Number(item.price ?? product.price ?? 0)); }
  return [...sales.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

async function fetchDashboardData() {
  const [products, orderRows, offers, customers] = await Promise.all([fetchProducts(), listOrders(), jsonList("offers"), jsonList("customers")]);
  const orders = orderRows as OrderRecord[]; const active = orders.filter((order) => !isCancelled(order)); const activeOrders = orders.filter((order) => !["completed", "cancelled"].includes(String(order.status ?? "").toLowerCase())); const now = new Date(); const today = localDayKey(now); const todayOrders = orders.filter((order) => localDayKey(orderDate(order)) === today); const weekStart = new Date(now); weekStart.setHours(0, 0, 0, 0); weekStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); const weekOrders = orders.filter((order) => orderDate(order) >= weekStart); const monthOrders = orders.filter((order) => orderDate(order) >= monthStart); const todayRevenue = todayOrders.filter((order) => !isCancelled(order)).reduce((sum, order) => sum + orderValue(order), 0); const previousDay = new Date(); previousDay.setDate(previousDay.getDate() - 1); const previousRevenue = active.filter((order) => localDayKey(orderDate(order)) === localDayKey(previousDay)).reduce((sum, order) => sum + orderValue(order), 0);
  const lastOrder = [...orders].sort((a, b) => orderDate(b).getTime() - orderDate(a).getTime())[0]; const activeStatusBreakdown = [...new Set(activeOrders.map((order) => String(order.status ?? "").toLowerCase()).filter(Boolean))].map((status) => ({ label: titleize(status), value: activeOrders.filter((order) => order.status === status).length })); const productSales = buildProductSales(active, products);
  return { todayRevenue, revenueChange: previousRevenue > 0 ? ((todayRevenue - previousRevenue) / previousRevenue) * 100 : null, todayOrders: todayOrders.length, weekOrders: weekOrders.length, monthOrders: monthOrders.length, customers: customers.length, averageOrder: todayOrders.length ? todayRevenue / todayOrders.length : 0, menuItems: products.length, activeOffers: offers.filter((offer: any) => offer.status === "active").length, revenueSeries: buildSalesData(orders, rangeStart("7d"), 7), activeOrders: activeOrders.length, lastOrderAt: lastOrder?.createdAt ?? null, activeStatusBreakdown, categorySales: buildCategorySales(active, products), topProducts: productSales.slice(0, 5), recentOrders: orders.sort((a, b) => orderDate(b).getTime() - orderDate(a).getTime()).slice(0, 5) };
}

export const useGetDashboardSummary = (params: unknown = {}) => useQuery({ queryKey: getGetDashboardSummaryQueryKey(params), queryFn: fetchDashboardData, refetchInterval: 30000 });

export const useGetAnalytics = (params: { range?: string } = {}) => useQuery({
  queryKey: getGetAnalyticsQueryKey(params), refetchInterval: 30000,
  queryFn: async () => { const [products, orderRows] = await Promise.all([fetchProducts(), listOrders()]); const orders = orderRows as OrderRecord[]; const start = rangeStart(params.range ?? "7d"); const count = params.range === "today" ? 1 : params.range === "30d" || params.range === "month" ? 30 : 7; const filtered = orders.filter((order) => orderDate(order) >= start); const active = filtered.filter((order) => !isCancelled(order)); const today = localDayKey(new Date()); const todayOrders = orders.filter((order) => localDayKey(orderDate(order)) === today); const todayActiveOrders = todayOrders.filter((order) => !isCancelled(order)); const productSales = buildProductSales(active, products); const peakHours = new Map<number, number>(); for (const order of filtered) { const hour = orderDate(order).getHours(); peakHours.set(hour, (peakHours.get(hour) ?? 0) + 1); } const peak = [...peakHours.entries()].sort((a, b) => b[1] - a[1])[0]; const todayRevenue = todayActiveOrders.reduce((sum, order) => sum + orderValue(order), 0); return { revenue: active.reduce((sum, order) => sum + orderValue(order), 0), orders: filtered.length, averageOrder: active.length ? active.reduce((sum, order) => sum + orderValue(order), 0) / active.length : 0, peakHour: peak ? `${String(peak[0]).padStart(2, "0")}:00` : "—", ordersToday: todayOrders.length, averageOrderToday: todayActiveOrders.length ? todayRevenue / todayActiveOrders.length : null, salesSeries: buildSalesData(orders, start, count), topProducts: productSales, categories: buildCategorySales(active, products) }; }
});

async function fetchProducts(params: any = {}) {
  const { client } = await requireUser();
  let q = client.from("products").select("*").order("created_at",{ascending:false});
  if (params.categoryId) q=q.eq("category_id",params.categoryId);
  if (params.availability==="available") q=q.eq("available",true);
  if (params.availability==="unavailable") q=q.eq("available",false);
  const [{ data, error }, { data: categoryRows, error: categoryError }] = await Promise.all([
    q,
    client.from("categories").select("id,name,name_ar,sort_order"),
  ]);
  if(error) throw error;
  if(categoryError) throw categoryError;
  const categoryMap = new Map((categoryRows ?? []).map((row: any) => [row.id, row]));
  const rows=(data??[]).map((r: any) => {
    const category = categoryMap.get(r.category_id);
    return productFromRow({
      ...r,
      category_name: category?.name ?? r.category_name,
      category_name_ar: category?.name_ar ?? r.category_name_ar,
    });
  });
  const search=String(params.search??"").toLowerCase();
  const categoryOrder = new Map((categoryRows ?? []).map((row: any) => [row.id, Number(row.sort_order ?? 999)]));
  const itemOrder = (product: Product) => {
    const match = product.image.match(/(?:^|\/)([^/]+?)-(\d+)(?:\.[^/]+)?$/i);
    return { group: match?.[1] ?? product.categoryId, number: Number(match?.[2] ?? 999) };
  };
  return rows
    .filter(p=>!search || `${p.name} ${p.nameAr}`.toLowerCase().includes(search))
    .sort((a, b) => {
      const categoryDifference = (categoryOrder.get(a.categoryId) ?? 999) - (categoryOrder.get(b.categoryId) ?? 999);
      if (categoryDifference) return categoryDifference;
      const aOrder = itemOrder(a); const bOrder = itemOrder(b);
      if (aOrder.group !== bOrder.group) return aOrder.group.localeCompare(bOrder.group);
      if (aOrder.number !== bOrder.number) return aOrder.number - bOrder.number;
      return a.name.localeCompare(b.name);
    });
}
export const useListProducts = (params: any = {}) => useQuery({
  queryKey:getListProductsQueryKey(params), queryFn:()=>fetchProducts(params)
});

export const useListCategories = () => useQuery({
  queryKey:getListCategoriesQueryKey(),
  queryFn:async()=>{
    const {client}=await requireUser();
    const {data,error}=await client.from("categories").select("*").order("sort_order",{ascending:true});
    if(error) throw error;
    const {data:ps,error:productsError}=await client.from("products").select("category_id");
    if(productsError) throw productsError;
    return (data??[]).map(r=>({...categoryFromRow(r),count:(ps??[]).filter((p:any)=>p.category_id===r.id).length}));
  }
});

export const useListOrders = (params:any={}) => useQuery({
  queryKey:getListOrdersQueryKey(params), refetchInterval:30000, queryFn:async()=>{
    const rows=await listOrders(); const s=String(params.search??"").toLowerCase(), date=params.date;
    return rows.filter((o:any)=>{const matchesSearch=!s||`${o.orderNumber} ${o.tableNumber ?? ""}`.toLowerCase().includes(s);const matchesDate=!date||localDayKey(new Date(o.createdAt))===date;return matchesSearch&&matchesDate;});
  }
});
export const useListCustomers = (params:any={}) => useQuery({queryKey:getListCustomersQueryKey(params),queryFn:async()=>{
  const rows=await jsonList("customers"),s=String(params.search??"").toLowerCase();
  return rows.filter((c:any)=>!s||`${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(s));
}});
export const useListOffers=()=>useQuery({queryKey:getListOffersQueryKey(),queryFn:()=>jsonList("offers")});
export const useListReviews=()=>useQuery({queryKey:getListReviewsQueryKey(),queryFn:()=>jsonList("reviews")});
export const useListNotifications=()=>useQuery({queryKey:getListNotificationsQueryKey(),queryFn:()=>jsonList("notifications")});
export const useGetWebsiteContent=()=>useQuery({queryKey:getGetWebsiteContentQueryKey(),queryFn:async()=>{const rows=await jsonList("website_content");return rows[0]??{};}});
export const useGetRestaurantSettings=()=>useQuery({queryKey:getGetRestaurantSettingsQueryKey(),queryFn:async()=>{const rows=await jsonList("restaurant_settings");return rows[0]??{};}});

export const useCreateProduct=()=>{const queryClient=useQueryClient();return useMutation({mutationFn:async({data}:any)=>{
  const {client}=await requireUser();
  const {data:row,error}=await client.from("products").insert({
    id:`p-${crypto.randomUUID().slice(0,8)}`,name:data.name,name_ar:data.nameAr,description:data.description??"",
    price:Number(data.price)||0,discount_price:data.discountPrice==null?null:Number(data.discountPrice),category_id:data.categoryId,
    image:data.image||"",available:data.available??true,featured:data.featured??false,bestseller:data.bestseller??false,
    is_new:data.isNew??true,prep_time:Number(data.prepTime)||0,calories:data.calories==null?null:Number(data.calories)
  }).select("*").single(); if(error)throw error; return productFromRow(row);
},onSuccess:()=>invalidateLiveStats(queryClient)});};
export const useUpdateProduct=()=>{const queryClient=useQueryClient();return useMutation({mutationFn:async({id,data}:any)=>{
  const {client}=await requireUser();
  const patch:any={}; if("name"in data)patch.name=data.name;if("nameAr"in data)patch.name_ar=data.nameAr;
  if("description"in data)patch.description=data.description;if("price"in data)patch.price=Number(data.price)||0;
  if("discountPrice"in data)patch.discount_price=data.discountPrice==null?null:Number(data.discountPrice);
  if("categoryId"in data)patch.category_id=data.categoryId;if("image"in data)patch.image=data.image||"";
  for(const [a,b] of [["available","available"],["featured","featured"],["bestseller","bestseller"],["isNew","is_new"]])if(a in data)patch[b]=Boolean(data[a]);
  if("prepTime"in data)patch.prep_time=Number(data.prepTime)||0;if("calories"in data)patch.calories=data.calories==null?null:Number(data.calories);
  const {data:row,error}=await client.from("products").update(patch).eq("id",id).select("*").single();if(error)throw error;return productFromRow(row);
},onSuccess:()=>invalidateLiveStats(queryClient)});};
export const useDeleteProduct=()=>{const queryClient=useQueryClient();return useMutation({mutationFn:async({id}:any)=>{const {client}=await requireUser();const {data:row,error:readError}=await client.from("products").select("image").eq("id",id).single();if(readError)throw readError;const {error}=await client.from("products").delete().eq("id",id);if(error)throw error;await deleteProductImage(row?.image);},onSuccess:()=>invalidateLiveStats(queryClient)});};
export const useDuplicateProduct=()=>{const queryClient=useQueryClient();return useMutation({mutationFn:async({id}:any)=>{
  const {client}=await requireUser(); const {data:r,error}=await client.from("products").select("*").eq("id",id).single();if(error)throw error;
  const p=productFromRow(r); const {data:row,error:e}=await client.from("products").insert({...r,id:`p-${crypto.randomUUID().slice(0,8)}`,name:`${p.name} · Copy`,name_ar:`${p.nameAr} · نسخة`,is_new:true}).select("*").single();if(e)throw e;return productFromRow(row);
},onSuccess:()=>invalidateLiveStats(queryClient)});};
export const useCreateCategory=()=>useMutation({mutationFn:async({data}:any)=>{
  const {client}=await requireUser(); const id=`cat-${crypto.randomUUID().slice(0,8)}`;
  const {data:row,error}=await client.from("categories").insert({id,name:data.name,name_ar:data.nameAr??"",image:data.image||"",enabled:data.enabled??true,sort_order:Number(data.order)||1}).select("*").single();
  if(error)throw error;return categoryFromRow(row);
}});
export const useUpdateCategory=()=>useMutation({mutationFn:async({id,data}:any)=>{
  const {client}=await requireUser();const patch:any={};if("name"in data)patch.name=data.name;if("nameAr"in data)patch.name_ar=data.nameAr;
  if("image"in data)patch.image=data.image||"";if("enabled"in data)patch.enabled=Boolean(data.enabled);if("order"in data)patch.sort_order=Number(data.order)||1;
  const {data:row,error}=await client.from("categories").update(patch).eq("id",id).select("*").single();if(error)throw error;return categoryFromRow(row);
}});
export const useDeleteCategory=()=>useMutation({mutationFn:async({id}:any)=>{const {client}=await requireUser();const {error}=await client.from("categories").delete().eq("id",id);if(error)throw error;}});

export const useCreateOffer=()=>{const queryClient=useQueryClient();return useMutation({mutationFn:({data}:any)=>jsonInsert("offers",{...data,id:`offer-${crypto.randomUUID().slice(0,8)}`}),onSuccess:()=>invalidateLiveStats(queryClient)});};
export const useUpdateOffer=()=>{const queryClient=useQueryClient();return useMutation({mutationFn:({id,data}:any)=>jsonUpdate("offers",id,data),onSuccess:()=>invalidateLiveStats(queryClient)});};
export const useDeleteOffer=()=>{const queryClient=useQueryClient();return useMutation({mutationFn:({id}:any)=>jsonDelete("offers",id),onSuccess:()=>invalidateLiveStats(queryClient)});};
export const useUpdateWebsiteContent=()=>useMutation({mutationFn:async({data}:any)=>{const {client}=await requireUser();const {data:r,error}=await client.from("website_content").select("id").limit(1).single();if(error)throw error;return jsonUpdate("website_content",r.id,data);}});
export const useUpdateRestaurantSettings=()=>useMutation({mutationFn:async({data}:any)=>{const {client}=await requireUser();const {data:r,error}=await client.from("restaurant_settings").select("id").limit(1).single();if(error)throw error;return jsonUpdate("restaurant_settings",r.id,data);}});
export const useUpdateReview=()=>useMutation({mutationFn:async({id,data}:any)=>{
  const {client}=await requireUser();
  const {data:current,error:readError}=await client.from("reviews").select("data").eq("id",id).single();
  if(readError)throw readError;
  const next={...(current?.data??{}),...data};
  const {data:row,error}=await client.from("reviews").update({status:data.status,data:next}).eq("id",id).select("data,status").single();
  if(error)throw error;
  return {...(row.data??{}),status:row.status};
}});
export const useDeleteReview=()=>useMutation({mutationFn:({id}:any)=>jsonDelete("reviews",id)});
export const useMarkNotificationRead=()=>useMutation({mutationFn:({id}:any)=>jsonUpdate("notifications",id,{read:true})});

function titleize(s:string){return s.charAt(0).toUpperCase()+s.slice(1).replaceAll("_"," ");}

