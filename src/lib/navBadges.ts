"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

export type NavBadges = { orders: number; customOrders: number };

const EVENT = "admin:badges-changed";
// Как часто проверять новые заказы, пока админка открыта
const POLL_MS = 60_000;

// Страница, которая меняет счётчики (открыли заказ, сменили статус заявки), просит сайдбар обновиться сразу
export const refreshNavBadges = () => {
    if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
};

/**
 * Счётчики новых заказов и заявок для сайдбара (GET /api/admin/orders/badges).
 * Обновляются раз в минуту, при возвращении на вкладку и по refreshNavBadges().
 * Ошибки молча игнорируются: счётчик — подсказка, из-за него страница не должна ломаться.
 */
export function useNavBadges(): NavBadges | null {
    const [badges, setBadges] = useState<NavBadges | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            // Свёрнутую вкладку не опрашиваем — догоним при возвращении
            if (document.visibilityState === "hidden") return;
            try {
                // Без api(): тот при 401 перекидывает на вход, а фоновой проверке это ни к чему
                const res = await fetch(`${API_URL}/api/admin/orders/badges`, { credentials: "include" });
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setBadges({ orders: Number(data.orders) || 0, customOrders: Number(data.customOrders) || 0 });
            } catch {
                // нет сети — покажем в следующий раз
            }
        };

        load();
        const timer = setInterval(load, POLL_MS);
        const onVisible = () => document.visibilityState === "visible" && load();
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener(EVENT, load);
        return () => {
            cancelled = true;
            clearInterval(timer);
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener(EVENT, load);
        };
    }, []);

    return badges;
}
