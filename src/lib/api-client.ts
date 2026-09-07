import { useMutation, useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import {
  categoriesBySales, dashboardSeries,
  type Category, type Offer, type Product,
} from "./demo-data";

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

async function jsonList(table: string) {
  const { client } = await requireUser();
  const { data, error } = await client.from(table).select("data");
  if (error) throw error;
  return (data ?? []).map((x: any) => x.data);
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

export const useGetDashboardSummary = () => useQuery({
  queryKey: getGetDashboardSummaryQueryKey(),
  queryFn: async () => {
    const [products, orders, offers] = await Promise.all([
      fetchProducts(), jsonList("orders"), jsonList("offers"),
    ]);
    const active = orders.filter((o: any) => o.status !== "cancelled");
    const revenue = active.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
    return {
      todayRevenue: active.filter((o:any)=>String(o.createdAt ?? "").startsWith(new Date().toISOString().slice(0,10)))
        .reduce((s:number,o:any)=>s+Number(o.total||0),0),
      revenueChange: 0,
      todayOrders: orders.filter((o:any)=>String(o.createdAt ?? "").startsWith(new Date().toISOString().slice(0,10))).length,
      ordersChange: 0,
      customers: (await jsonList("customers")).length,
      averageOrder: Math.round((revenue / Math.max(active.length,1))*10)/10,
      menuItems: products.length,
      activeOffers: offers.filter((o:any)=>o.status==="active").length,
      revenueSeries: dashboardSeries,
      statusBreakdown: ["completed","preparing","new","ready"].map(label=>({label:titleize(label),value:orders.filter((o:any)=>o.status===label).length})),
      categorySales: categoriesBySales,
      topProducts: products.slice(0,4).map(p=>({name:p.name,category:p.category,units:0,revenue:0,image:p.image})),
      recentOrders: orders.slice(0,5),
    };
  }
});

export const useGetAnalytics = () => useQuery({
  queryKey: getGetAnalyticsQueryKey(),
  queryFn: async () => {
    const orders = await jsonList("orders");
    const active = orders.filter((o:any)=>o.status!=="cancelled");
    const revenue = active.reduce((s:number,o:any)=>s+Number(o.total||0),0);
    return { revenue, orders: orders.length, averageOrder: Math.round(revenue/Math.max(active.length,1)*10)/10,
      customerGrowth:0, peakHour:"—", newCustomers:0, returningCustomers:0, salesSeries:dashboardSeries,
      topProducts:[], categories:categoriesBySales };
  }
});

async function fetchProducts(params: any = {}) {
  const { client } = await requireUser();
  let q = client.from("products").select("*").order("created_at",{ascending:false});
  if (params.categoryId) q=q.eq("category_id",params.categoryId);
  if (params.availability==="available") q=q.eq("available",true);
  if (params.availability==="unavailable") q=q.eq("available",false);
  const [{ data, error }, { data: categoryRows, error: categoryError }] = await Promise.all([
    q,
    client.from("categories").select("id,sort_order"),
  ]);
  if(error) throw error;
  if(categoryError) throw categoryError;
  const rows=(data??[]).map(productFromRow);
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

export const useListOrders = (params:any={}) => useQuery({queryKey:getListOrdersQueryKey(params),queryFn:async()=>{
  const rows=await jsonList("orders"); const s=String(params.search??"").toLowerCase(), status=params.status??"all";
  return rows.filter((o:any)=>(!s||`${o.number} ${o.customer} ${o.phone}`.toLowerCase().includes(s))&&(status==="all"||o.status===status));
}});
export const useListCustomers = (params:any={}) => useQuery({queryKey:getListCustomersQueryKey(params),queryFn:async()=>{
  const rows=await jsonList("customers"),s=String(params.search??"").toLowerCase();
  return rows.filter((c:any)=>!s||`${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(s));
}});
export const useListOffers=()=>useQuery({queryKey:getListOffersQueryKey(),queryFn:()=>jsonList("offers")});
export const useListReviews=()=>useQuery({queryKey:getListReviewsQueryKey(),queryFn:()=>jsonList("reviews")});
export const useListNotifications=()=>useQuery({queryKey:getListNotificationsQueryKey(),queryFn:()=>jsonList("notifications")});
export const useGetWebsiteContent=()=>useQuery({queryKey:getGetWebsiteContentQueryKey(),queryFn:async()=>{const rows=await jsonList("website_content");return rows[0]??{};}});
export const useGetRestaurantSettings=()=>useQuery({queryKey:getGetRestaurantSettingsQueryKey(),queryFn:async()=>{const rows=await jsonList("restaurant_settings");return rows[0]??{};}});

export const useCreateProduct=()=>useMutation({mutationFn:async({data}:any)=>{
  const {client}=await requireUser();
  const {data:row,error}=await client.from("products").insert({
    id:`p-${crypto.randomUUID().slice(0,8)}`,name:data.name,name_ar:data.nameAr,description:data.description??"",
    price:Number(data.price)||0,discount_price:data.discountPrice==null?null:Number(data.discountPrice),category_id:data.categoryId,
    image:data.image||"",available:data.available??true,featured:data.featured??false,bestseller:data.bestseller??false,
    is_new:data.isNew??true,prep_time:Number(data.prepTime)||0,calories:data.calories==null?null:Number(data.calories)
  }).select("*").single(); if(error)throw error; return productFromRow(row);
}});
export const useUpdateProduct=()=>useMutation({mutationFn:async({id,data}:any)=>{
  const {client}=await requireUser();
  const patch:any={}; if("name"in data)patch.name=data.name;if("nameAr"in data)patch.name_ar=data.nameAr;
  if("description"in data)patch.description=data.description;if("price"in data)patch.price=Number(data.price)||0;
  if("discountPrice"in data)patch.discount_price=data.discountPrice==null?null:Number(data.discountPrice);
  if("categoryId"in data)patch.category_id=data.categoryId;if("image"in data)patch.image=data.image||"";
  for(const [a,b] of [["available","available"],["featured","featured"],["bestseller","bestseller"],["isNew","is_new"]])if(a in data)patch[b]=Boolean(data[a]);
  if("prepTime"in data)patch.prep_time=Number(data.prepTime)||0;if("calories"in data)patch.calories=data.calories==null?null:Number(data.calories);
  const {data:row,error}=await client.from("products").update(patch).eq("id",id).select("*").single();if(error)throw error;return productFromRow(row);
}});
export const useDeleteProduct=()=>useMutation({mutationFn:async({id}:any)=>{const {client}=await requireUser();const {error}=await client.from("products").delete().eq("id",id);if(error)throw error;}});
export const useDuplicateProduct=()=>useMutation({mutationFn:async({id}:any)=>{
  const {client}=await requireUser(); const {data:r,error}=await client.from("products").select("*").eq("id",id).single();if(error)throw error;
  const p=productFromRow(r); const {data:row,error:e}=await client.from("products").insert({...r,id:`p-${crypto.randomUUID().slice(0,8)}`,name:`${p.name} · Copy`,name_ar:`${p.nameAr} · نسخة`,is_new:true}).select("*").single();if(e)throw e;return productFromRow(row);
}});
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

export const useUpdateOrder=()=>useMutation({mutationFn:({id,data}:any)=>jsonUpdate("orders",id,data)});
export const useCreateOffer=()=>useMutation({mutationFn:({data}:any)=>jsonInsert("offers",{...data,id:`offer-${crypto.randomUUID().slice(0,8)}`})});
export const useUpdateOffer=()=>useMutation({mutationFn:({id,data}:any)=>jsonUpdate("offers",id,data)});
export const useDeleteOffer=()=>useMutation({mutationFn:({id}:any)=>jsonDelete("offers",id)});
export const useUpdateWebsiteContent=()=>useMutation({mutationFn:async({data}:any)=>{const {client}=await requireUser();const {data:r,error}=await client.from("website_content").select("id").limit(1).single();if(error)throw error;return jsonUpdate("website_content",r.id,data);}});
export const useUpdateRestaurantSettings=()=>useMutation({mutationFn:async({data}:any)=>{const {client}=await requireUser();const {data:r,error}=await client.from("restaurant_settings").select("id").limit(1).single();if(error)throw error;return jsonUpdate("restaurant_settings",r.id,data);}});
export const useUpdateReview=()=>useMutation({mutationFn:({id,data}:any)=>jsonUpdate("reviews",id,data)});
export const useDeleteReview=()=>useMutation({mutationFn:({id}:any)=>jsonDelete("reviews",id)});
export const useMarkNotificationRead=()=>useMutation({mutationFn:({id}:any)=>jsonUpdate("notifications",id,{read:true})});

function titleize(s:string){return s.charAt(0).toUpperCase()+s.slice(1).replaceAll("_"," ");}
