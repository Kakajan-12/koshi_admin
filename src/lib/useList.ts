"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "./http";

type WithId = { id: number | string };

// Список записей раздела: загрузка, ошибка, перезагрузка и удаление с подтверждением
export function useList<T extends WithId>(path: string) {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [pendingDelete, setPendingDelete] = useState<T | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api<T[]>(path);
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(errorMessage(err, "Could not load data"));
        } finally {
            setLoading(false);
        }
    }, [path]);

    useEffect(() => {
        reload();
    }, [reload]);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            await api(`${path}/${pendingDelete.id}`, { method: "DELETE" });
            setItems((prev) => prev.filter((item) => item.id !== pendingDelete.id));
            setPendingDelete(null);
        } catch (err) {
            setDeleteError(errorMessage(err, "Could not delete"));
            setPendingDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    return {
        items,
        loading,
        error,
        reload,
        pendingDelete,
        askDelete: setPendingDelete,
        cancelDelete: () => setPendingDelete(null),
        confirmDelete,
        deleting,
        deleteError,
    };
}
