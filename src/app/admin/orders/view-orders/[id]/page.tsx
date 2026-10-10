"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { CalendarDaysIcon, ChatBubbleBottomCenterTextIcon, EnvelopeIcon, MapPinIcon, PhoneIcon, TruckIcon, UserIcon } from "@heroicons/react/24/outline";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import { Card, CardBody, CardHeader } from "@/Components/ui/Card";
import { Badge, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import { formatDateTime, formatMoney, uploadUrl } from "@/lib/api";
import { useRecord } from "@/lib/useRecord";
import { refreshNavBadges } from "@/lib/navBadges";
import { CartItem, customerOf, daysUntilReady, itemMessage, Order, orderData, orderTypeLabel, readyLabel, statusLabel, statusTone } from "../../orderUtils";

// В заказах картинка хранится то полным URL, то путём на сервере
const itemImage = (item: CartItem) =>
    !item.main_image ? "" : item.main_image.startsWith("http") ? item.main_image : uploadUrl(item.main_image);

function InfoLine({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
    return (
        <div className="flex gap-3 text-sm">
            <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div className="min-w-0 break-words text-slate-700">{children}</div>
        </div>
    );
}

const OrderDetail = () => {
    const { id } = useParams();
    const { data: order, loading, error } = useRecord<Order>(id ? `/api/admin/orders/${id}` : null);

    // Сервер отметил заказ просмотренным при загрузке — счётчик в сайдбаре нужно уменьшить
    useEffect(() => {
        if (order?.is_new) refreshNavBadges();
    }, [order?.is_new]);

    const details = order ? orderData(order) : {};
    const cart = details.cart ?? [];
    const customer = order ? customerOf(order) : null;
    const itemsTotal = cart.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);
    const messages = cart.filter((i) => itemMessage(i));

    return (
        <AdminShell>
            <PageHeader
                title={order ? `Order #${order.id}` : "Order"}
                description={order ? formatDateTime(order.createdAt) : undefined}
                back={{ href: "/admin/orders", label: "Orders" }}
                actions={
                    order && (
                        <div className="flex gap-2">
                            <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                            {order.is_guest && <Badge tone="blue">Guest checkout</Badge>}
                        </div>
                    )
                }
            />

            {loading ? (
                <Card><LoadingState rows={6} /></Card>
            ) : error || !order || !customer ? (
                <Card><ErrorState message={error ?? "Order not found"} /></Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {messages.length > 0 && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                                    <ChatBubbleBottomCenterTextIcon className="size-5" />
                                    Messages to write on cakes
                                </div>
                                <ul className="mt-3 space-y-2">
                                    {messages.map((item, i) => (
                                        <li key={i} className="rounded-lg bg-white px-4 py-3 text-sm shadow-sm">
                                            <p className="text-xs text-slate-500">
                                                {item.product_name}{item.variantName ? ` · ${item.variantName}` : ""}
                                            </p>
                                            <p className="mt-0.5 font-medium text-slate-900">“{itemMessage(item)}”</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <Card>
                            <CardHeader title="Items" description={`${cart.length} ${cart.length === 1 ? "item" : "items"}`} />
                            <ul className="divide-y divide-slate-100">
                                {cart.map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 px-5 py-4">
                                        <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                            {itemImage(item) && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={itemImage(item)} alt="" className="size-full object-cover" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-slate-900">{item.product_name}</p>
                                            <p className="text-sm text-slate-500">
                                                {item.variantName && `${item.variantName} · `}
                                                {formatMoney(item.price)} × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-medium text-slate-900">{formatMoney(Number(item.price) * Number(item.quantity))}</p>
                                    </li>
                                ))}
                            </ul>
                            <dl className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <dt>Items</dt>
                                    <dd>{formatMoney(itemsTotal)}</dd>
                                </div>
                                {Number(details.deliveryFee) > 0 && (
                                    <div className="flex justify-between text-slate-600">
                                        <dt>Delivery</dt>
                                        <dd>{formatMoney(details.deliveryFee)}</dd>
                                    </div>
                                )}
                                {Number(details.customMessageFee) > 0 && (
                                    <div className="flex justify-between text-slate-600">
                                        <dt>Cake messages</dt>
                                        <dd>{formatMoney(details.customMessageFee)}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                                    <dt>Total</dt>
                                    <dd>{formatMoney(order.total)}</dd>
                                </div>
                            </dl>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader title="Customer" />
                            <CardBody className="space-y-3">
                                <InfoLine icon={UserIcon}>{customer.name}</InfoLine>
                                <InfoLine icon={EnvelopeIcon}>
                                    {customer.email ? (
                                        <a href={`mailto:${customer.email}`} className="text-brand-600 hover:underline">{customer.email}</a>
                                    ) : (
                                        <span className="text-slate-400">No email</span>
                                    )}
                                </InfoLine>
                                <InfoLine icon={PhoneIcon}>
                                    {customer.phone ? (
                                        <a href={`tel:${customer.phone}`} className="text-brand-600 hover:underline">{customer.phone}</a>
                                    ) : (
                                        <span className="text-slate-400">No phone</span>
                                    )}
                                </InfoLine>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader title={orderTypeLabel(details.orderType)} />
                            <CardBody className="space-y-3">
                                {readyLabel(details, "long") ? (
                                    <InfoLine icon={CalendarDaysIcon}>
                                        <span className="font-semibold text-slate-900">{readyLabel(details, "long")}</span>
                                        {daysUntilReady(details) === 0 && <span className="ml-2"><Badge tone="amber">Today</Badge></span>}
                                        {daysUntilReady(details) === 1 && <span className="ml-2"><Badge tone="amber">Tomorrow</Badge></span>}
                                    </InfoLine>
                                ) : (
                                    <InfoLine icon={CalendarDaysIcon}><span className="text-slate-400">No date chosen (older order)</span></InfoLine>
                                )}
                                {details.orderType === "delivery" ? (
                                    <InfoLine icon={MapPinIcon}>
                                        {customer.address ?? <span className="text-slate-400">No address</span>}
                                    </InfoLine>
                                ) : (
                                    <InfoLine icon={TruckIcon}>Customer collects from the bakery</InfoLine>
                                )}
                            </CardBody>
                        </Card>
                    </div>
                </div>
            )}
        </AdminShell>
    );
};

export default OrderDetail;
