export interface CartItem {
    id: number;
    product_name: string;
    price: number;
    quantity: number;
    main_image?: string;
    variantName?: string;
    custom_message?: string | null;
    // В старых заказах надпись могла лежать под другими именами
    customMessage?: string | null;
    message?: string | null;
}

export interface OrderData {
    cart?: CartItem[];
    orderType?: string;
    selectedAddress?: string;
    deliveryFee?: number;
    customMessageFee?: number;
    // Когда заказ должен быть готов: «2026-10-12» и «14:00» (выбирает покупатель в корзине)
    neededDate?: string;
    neededTime?: string;
    guest_info?: { name: string; phone: string; email: string; address?: string | null };
}

export interface Order {
    id: number;
    user_id: number | null;
    email: string | null;
    fname?: string | null;
    lname?: string | null;
    phone?: string | null;
    name?: string;
    total: number | string;
    status: string;
    // Оплачен, но ещё не открыт в админке
    is_new?: boolean;
    createdAt: string;
    order_data: OrderData | string | null;
    is_guest: boolean;
    guest_name: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    guest_address: string | null;
}

export const orderData = (order: Order): OrderData => {
    if (!order.order_data) return {};
    if (typeof order.order_data === "string") {
        try {
            return JSON.parse(order.order_data);
        } catch {
            return {};
        }
    }
    return order.order_data;
};

export const itemMessage = (item: CartItem) => item.custom_message || item.customMessage || item.message || null;

export const customerOf = (order: Order) => {
    const data = orderData(order);
    if (order.is_guest) {
        return {
            name: order.guest_name || data.guest_info?.name || "Guest",
            email: order.guest_email || data.guest_info?.email || null,
            phone: order.guest_phone || data.guest_info?.phone || null,
            address: order.guest_address || data.guest_info?.address || data.selectedAddress || null,
        };
    }
    return {
        name: order.name || `${order.fname || ""} ${order.lname || ""}`.trim() || "Customer",
        email: order.email,
        phone: order.phone ?? null,
        address: data.selectedAddress || null,
    };
};

export const statusTone = (status: string): "green" | "amber" | "red" | "gray" =>
    status === "paid" ? "green" : status === "pending" ? "amber" : status === "failed" ? "red" : "gray";

export const statusLabel = (status: string) =>
    ({ paid: "Paid", pending: "Awaiting payment", failed: "Failed" })[status] ?? status;

// «Sat 12 Oct, 14:00» — когда заказ должен быть готов; null у старых заказов без даты
export const readyLabel = (data: OrderData, style: "short" | "long" = "short"): string | null => {
    if (!data.neededDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.neededDate)) return null;
    const [y, m, d] = data.neededDate.split("-").map(Number);
    const day = new Date(y, m - 1, d).toLocaleDateString("en-GB",
        style === "long" ? { weekday: "long", day: "numeric", month: "long", year: "numeric" } : { weekday: "short", day: "numeric", month: "short" });
    return data.neededTime ? `${day}, ${data.neededTime}` : day;
};

// Сколько дней до даты готовности: 0 — сегодня, 1 — завтра; null — даты нет или она прошла
export const daysUntilReady = (data: OrderData): number | null => {
    if (!data.neededDate) return null;
    const [y, m, d] = data.neededDate.split("-").map(Number);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 864e5);
    return days >= 0 ? days : null;
};

export const orderTypeLabel = (type?: string) =>
    type === "delivery" ? "Delivery" : type === "collect" ? "Collection" : "—";
