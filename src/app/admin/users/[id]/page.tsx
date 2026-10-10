"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckBadgeIcon, EnvelopeIcon, HomeIcon, LockClosedIcon, LockOpenIcon, MapPinIcon, PhoneIcon, TrashIcon } from "@heroicons/react/24/outline";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import { Card, CardBody, CardHeader } from "@/Components/ui/Card";
import { Badge, ConfirmDialog, EmptyState, ErrorState, LoadingState, StatCard } from "@/Components/ui/Feedback";
import Button from "@/Components/ui/Button";
import { Alert } from "@/Components/ui/Form";
import { api, errorMessage } from "@/lib/http";
import { Table, TBody, TD, TH, THead, TR } from "@/Components/ui/Table";
import { formatDate, formatDateTime, formatMoney } from "@/lib/api";
import { useRecord } from "@/lib/useRecord";
import { orderTypeLabel, statusLabel, statusTone } from "../../orders/orderUtils";
import { fullName, initials } from "../userUtils";

type UserDetail = {
    id: number;
    fname: string;
    lname: string;
    email: string;
    phone: string;
    address: string;
    isVerified: boolean;
    is_active: boolean;
    has_google: boolean;
    created_at: string | null;
    addresses: { id: number; address: string }[];
    orders: { id: number; total: number; status: string; createdAt: string; orderType: string | null; itemsCount: number }[];
};

function InfoLine({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
    return (
        <div className="flex gap-3 text-sm">
            <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div className="min-w-0 break-words text-slate-700">{children}</div>
        </div>
    );
}

const UserPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data: user, setData, loading, error } = useRecord<UserDetail>(id ? `/api/admin/users/${id}` : null);
    // Какое подтверждение открыто и какое действие сейчас выполняется
    const [confirm, setConfirm] = useState<null | "deactivate" | "delete">(null);
    const [busy, setBusy] = useState<null | "status" | "verify" | "delete">(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const run = async (kind: "status" | "verify" | "delete", action: () => Promise<void>) => {
        setBusy(kind);
        setActionError(null);
        try {
            await action();
        } catch (err) {
            setActionError(errorMessage(err, "Something went wrong. Please try again."));
        } finally {
            setBusy(null);
            setConfirm(null);
        }
    };

    const setActive = (active: boolean) =>
        run("status", async () => {
            await api(`/api/admin/users/${user!.id}/status`, { method: "PUT", json: { active } });
            setData({ ...user!, is_active: active });
        });

    const verifyEmail = () =>
        run("verify", async () => {
            await api(`/api/admin/users/${user!.id}/verify`, { method: "PUT" });
            setData({ ...user!, isVerified: true });
        });

    const deleteUser = () =>
        run("delete", async () => {
            await api(`/api/admin/users/${user!.id}`, { method: "DELETE" });
            router.replace("/admin/users");
        });

    const paid = user?.orders.filter((o) => o.status === "paid") ?? [];
    const spent = paid.reduce((s, o) => s + Number(o.total), 0);

    return (
        <AdminShell>
            <PageHeader
                title={user ? fullName(user) : "User"}
                back={{ href: "/admin/users", label: "Users" }}
                actions={
                    user && (
                        <div className="flex flex-wrap gap-2">
                            {!user.is_active && <Badge tone="red">Deactivated</Badge>}
                            {user.isVerified ? <Badge tone="green">Email verified</Badge> : <Badge tone="amber">Email not verified</Badge>}
                        </div>
                    )
                }
            />

            {loading ? (
                <Card><LoadingState rows={6} /></Card>
            ) : error || !user ? (
                <Card><ErrorState message={error ?? "User not found"} /></Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <StatCard label="Orders" value={user.orders.length} />
                            <StatCard label="Paid orders" value={paid.length} />
                            <StatCard label="Total spent" value={formatMoney(spent)} />
                        </div>

                        <Card>
                            <CardHeader title="Orders" />
                            {user.orders.length === 0 ? (
                                <EmptyState title="No orders yet" description="This customer hasn't placed an order." />
                            ) : (
                                <Table>
                                    <THead>
                                        <TH>Order</TH>
                                        <TH className="hidden sm:table-cell">Type</TH>
                                        <TH>Status</TH>
                                        <TH align="right">Total</TH>
                                    </THead>
                                    <TBody>
                                        {user.orders.map((o) => (
                                            <TR key={o.id} onClick={() => router.push(`/admin/orders/view-orders/${o.id}`)}>
                                                <TD>
                                                    <p className="font-medium text-slate-900">#{o.id}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {formatDateTime(o.createdAt)} · {o.itemsCount} {o.itemsCount === 1 ? "item" : "items"}
                                                    </p>
                                                </TD>
                                                <TD className="hidden sm:table-cell">{orderTypeLabel(o.orderType ?? undefined)}</TD>
                                                <TD><Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge></TD>
                                                <TD align="right" className="font-medium text-slate-900">{formatMoney(o.total)}</TD>
                                            </TR>
                                        ))}
                                    </TBody>
                                </Table>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardBody className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="flex size-12 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                                        {initials(user)}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">{fullName(user)}</p>
                                        <p className="text-xs text-slate-500">
                                            Customer #{user.id} ·{" "}
                                            {user.created_at ? `registered ${formatDate(user.created_at)}` : "registration date unknown"}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3 border-t border-slate-100 pt-4">
                                    <InfoLine icon={EnvelopeIcon}>
                                        <a href={`mailto:${user.email}`} className="text-brand-600 hover:underline">{user.email}</a>
                                    </InfoLine>
                                    <InfoLine icon={PhoneIcon}>
                                        {user.phone ? (
                                            <a href={`tel:${user.phone}`} className="text-brand-600 hover:underline">{user.phone}</a>
                                        ) : (
                                            <span className="text-slate-400">No phone</span>
                                        )}
                                    </InfoLine>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader
                                title="Account"
                                description={user.has_google ? "Signs in with email or Google" : "Signs in with email and password"}
                            />
                            <CardBody className="space-y-4">
                                <div className="flex items-start gap-3 text-sm">
                                    {user.is_active ? (
                                        <LockOpenIcon className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                                    ) : (
                                        <LockClosedIcon className="mt-0.5 size-5 shrink-0 text-red-600" />
                                    )}
                                    <div>
                                        <p className="font-medium text-slate-900">{user.is_active ? "Active" : "Deactivated"}</p>
                                        <p className="text-slate-500">
                                            {user.is_active
                                                ? "The customer can log in and place orders."
                                                : "The customer can't log in. Their orders and details are kept."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {user.is_active ? (
                                        <Button variant="danger" size="sm" icon={<LockClosedIcon className="size-4" />}
                                                loading={busy === "status"} onClick={() => setConfirm("deactivate")}>
                                            Deactivate
                                        </Button>
                                    ) : (
                                        <Button size="sm" icon={<LockOpenIcon className="size-4" />}
                                                loading={busy === "status"} onClick={() => setActive(true)}>
                                            Activate
                                        </Button>
                                    )}
                                    {!user.isVerified && (
                                        <Button variant="secondary" size="sm" icon={<CheckBadgeIcon className="size-4" />}
                                                loading={busy === "verify"} onClick={verifyEmail}>
                                            Mark email as verified
                                        </Button>
                                    )}
                                </div>

                                {actionError && <Alert>{actionError}</Alert>}

                                <div className="border-t border-slate-100 pt-4">
                                    <Button variant="ghostDanger" size="sm" icon={<TrashIcon className="size-4" />}
                                            onClick={() => setConfirm("delete")}>
                                        Delete account
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader title="Addresses" />
                            <CardBody className="space-y-3">
                                {user.address ? (
                                    <InfoLine icon={HomeIcon}>
                                        {user.address}
                                        <span className="ml-2 align-middle"><Badge>Main</Badge></span>
                                    </InfoLine>
                                ) : null}
                                {user.addresses.map((a) => (
                                    <InfoLine key={a.id} icon={MapPinIcon}>{a.address}</InfoLine>
                                ))}
                                {!user.address && user.addresses.length === 0 && (
                                    <p className="text-sm text-slate-500">No saved addresses.</p>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={confirm === "deactivate"}
                title="Deactivate this account?"
                description="The customer will be logged out everywhere and won't be able to log in until you activate the account again. Their orders are not affected."
                confirmLabel="Deactivate"
                loading={busy === "status"}
                onConfirm={() => setActive(false)}
                onCancel={() => setConfirm(null)}
            />
            <ConfirmDialog
                open={confirm === "delete"}
                title="Delete this account permanently?"
                description={
                    user && user.orders.length > 0
                        ? `This can't be undone. The account and saved addresses will be removed. Their ${user.orders.length} ${user.orders.length === 1 ? "order stays" : "orders stay"} in Orders with the customer's name, email and phone.`
                        : "This can't be undone. The account and saved addresses will be removed."
                }
                confirmLabel="Delete account"
                loading={busy === "delete"}
                onConfirm={deleteUser}
                onCancel={() => setConfirm(null)}
            />
        </AdminShell>
    );
};

export default UserPage;
