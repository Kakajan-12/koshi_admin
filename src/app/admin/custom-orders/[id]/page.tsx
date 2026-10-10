"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarDaysIcon, ClockIcon, EnvelopeIcon, PhoneIcon, PhotoIcon, ScaleIcon, UserIcon } from "@heroicons/react/24/outline";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import { Card, CardBody, CardHeader } from "@/Components/ui/Card";
import { Alert } from "@/Components/ui/Form";
import { Badge, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import { API_URL, formatDateTime } from "@/lib/api";
import { api, errorMessage } from "@/lib/http";
import { useRecord } from "@/lib/useRecord";
import { refreshNavBadges } from "@/lib/navBadges";
import { CustomOrder, CustomOrderStatus, daysUntil, formatNeededDate, STATUSES, statusInfo } from "../customOrderUtils";

function InfoLine({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
    return (
        <div className="flex gap-3 text-sm">
            <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div className="min-w-0 break-words text-slate-700">{children}</div>
        </div>
    );
}

// Фото лежит в закрытой папке: загружаем с cookie админа и показываем как blob
function ReferenceImage({ id }: { id: number }) {
    const [src, setSrc] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let url: string | null = null;
        let cancelled = false;
        fetch(`${API_URL}/api/admin/custom-orders/${id}/image`, { credentials: "include" })
            .then((res) => {
                if (!res.ok) throw new Error(String(res.status));
                return res.blob();
            })
            .then((blob) => {
                if (cancelled) return;
                url = URL.createObjectURL(blob);
                setSrc(url);
            })
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
            if (url) URL.revokeObjectURL(url);
        };
    }, [id]);

    if (failed) return <p className="text-sm text-slate-500">The image could not be loaded.</p>;
    if (!src) return <div className="aspect-[4/3] w-full animate-pulse rounded-lg bg-slate-100" />;
    return (
        <a href={src} target="_blank" rel="noopener noreferrer" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element -- blob: из закрытого API, next/image не нужен */}
            <img src={src} alt="Reference from the customer" className="max-h-[480px] w-full rounded-lg object-contain bg-slate-50" />
        </a>
    );
}

const CustomOrderDetail = () => {
    const { id } = useParams();
    const { data: order, setData, loading, error } = useRecord<CustomOrder>(id ? `/api/admin/custom-orders/${id}` : null);
    const [saving, setSaving] = useState<CustomOrderStatus | null>(null);
    const [statusError, setStatusError] = useState<string | null>(null);

    const changeStatus = async (status: CustomOrderStatus) => {
        if (!order || status === order.status || saving) return;
        setSaving(status);
        setStatusError(null);
        try {
            await api(`/api/admin/custom-orders/${order.id}/status`, { method: "PUT", json: { status } });
            setData({ ...order, status });
            // Заявка ушла из «new» (или вернулась) — счётчик в сайдбаре меняется
            refreshNavBadges();
        } catch (err) {
            setStatusError(errorMessage(err, "Could not update the status"));
        } finally {
            setSaving(null);
        }
    };

    const info = order ? statusInfo(order.status) : null;
    const days = order ? daysUntil(order.needed_date) : 0;
    const active = order && order.status !== "done" && order.status !== "cancelled";

    return (
        <AdminShell>
            <PageHeader
                title={order ? `Custom order #${order.id}` : "Custom order"}
                description={order ? `Received ${formatDateTime(order.created_at)}` : undefined}
                back={{ href: "/admin/custom-orders", label: "Custom orders" }}
                actions={info && <Badge tone={info.tone}>{info.label}</Badge>}
            />

            {loading ? (
                <Card><LoadingState rows={6} /></Card>
            ) : error || !order ? (
                <Card><ErrorState message={error ?? "Request not found"} /></Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader title="The cake" />
                            <CardBody className="space-y-5">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><CalendarDaysIcon className="size-4" />Date</p>
                                        <p className="mt-1 font-semibold text-slate-900">{formatNeededDate(order.needed_date)}</p>
                                        {active && days <= 3 && (
                                            <p className={`mt-0.5 text-xs font-medium ${days <= 0 ? "text-red-600" : "text-amber-600"}`}>
                                                {days < 0 ? "Date has passed" : days === 0 ? "Today" : `In ${days} ${days === 1 ? "day" : "days"}`}
                                            </p>
                                        )}
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><ClockIcon className="size-4" />Time</p>
                                        <p className="mt-1 font-semibold text-slate-900">{order.needed_time}</p>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-3">
                                        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><ScaleIcon className="size-4" />Size</p>
                                        <p className="mt-1 font-semibold text-slate-900 break-words">{order.size}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</p>
                                    {/* Текст покупателя — как есть, с переносами строк; HTML не интерпретируется */}
                                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">{order.details}</p>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader title="Reference image" />
                            <CardBody>
                                {order.has_image ? (
                                    <ReferenceImage id={order.id} />
                                ) : (
                                    <p className="flex items-center gap-2 text-sm text-slate-500"><PhotoIcon className="size-5" />No image attached</p>
                                )}
                            </CardBody>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader title="Customer" />
                            <CardBody className="space-y-3">
                                <InfoLine icon={UserIcon}>{order.name}</InfoLine>
                                <InfoLine icon={EnvelopeIcon}>
                                    <a href={`mailto:${order.email}?subject=${encodeURIComponent(`Your custom order #${order.id} — Koşi Bakery`)}`}
                                       className="text-brand-600 hover:underline">{order.email}</a>
                                </InfoLine>
                                <InfoLine icon={PhoneIcon}>
                                    {order.phone ? (
                                        <a href={`tel:${order.phone}`} className="text-brand-600 hover:underline">{order.phone}</a>
                                    ) : (
                                        <span className="text-slate-400">No phone</span>
                                    )}
                                </InfoLine>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader title="Status" description="Only visible to the bakery team." />
                            <CardBody className="space-y-3">
                                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Request status">
                                    {STATUSES.map((s) => {
                                        const current = order.status === s.value;
                                        return (
                                            <button
                                                key={s.value}
                                                type="button"
                                                role="radio"
                                                aria-checked={current}
                                                disabled={!!saving}
                                                onClick={() => changeStatus(s.value)}
                                                className={`cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-wait ${
                                                    current
                                                        ? "bg-slate-900 text-white"
                                                        : "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
                                                }`}
                                            >
                                                {saving === s.value ? "Saving…" : s.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                {statusError && <Alert>{statusError}</Alert>}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            )}
        </AdminShell>
    );
};

export default CustomOrderDetail;
