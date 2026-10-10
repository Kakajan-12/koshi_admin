"use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "./http";

// Одна запись для страниц редактирования и просмотра.
// Некоторые маршруты API отдают массив из одной записи — берём первую.
export function useRecord<T>(path: string | null) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!path) return;
        let cancelled = false;
        setLoading(true);
        api<T | T[]>(path)
            .then((res) => {
                if (cancelled) return;
                const record = Array.isArray(res) ? res[0] : res;
                if (!record) setError("Record not found");
                else setData(record);
            })
            .catch((err) => !cancelled && setError(errorMessage(err, "Could not load data")))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [path]);

    return { data, setData, loading, error };
}
