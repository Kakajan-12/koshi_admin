export type CustomOrderStatus = "new" | "in_progress" | "done" | "cancelled";

export interface CustomOrder {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    needed_date: string;
    needed_time: string;
    size: string;
    details: string;
    has_image: boolean;
    status: CustomOrderStatus;
    created_at: string;
}

export const STATUSES: { value: CustomOrderStatus; label: string; tone: "brand" | "amber" | "green" | "gray" }[] = [
    { value: "new", label: "New", tone: "brand" },
    { value: "in_progress", label: "In progress", tone: "amber" },
    { value: "done", label: "Done", tone: "green" },
    { value: "cancelled", label: "Cancelled", tone: "gray" },
];

export const statusInfo = (status: string) => STATUSES.find((s) => s.value === status) ?? STATUSES[0];

// «Sat, 15 Oct 2026» — дата, к которой нужен торт (хранится как yyyy-mm-dd без времени)
export const formatNeededDate = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return value;
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

// Сколько дней до даты заказа: для пометки «скоро» в списке
export const daysUntil = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    const target = new Date(y, m - 1, d).getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today.getTime()) / 864e5);
};
