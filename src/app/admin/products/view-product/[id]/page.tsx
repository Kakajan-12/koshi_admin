'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import Button from '@/Components/ui/Button';
import { Card, CardBody, CardHeader, DetailList, DetailRow } from '@/Components/ui/Card';
import { Alert } from '@/Components/ui/Form';
import { Badge, ConfirmDialog, ErrorState, LoadingState } from '@/Components/ui/Feedback';
import { formatMoney, uploadUrl } from '@/lib/api';
import { api, errorMessage } from '@/lib/http';
import { useRecord } from '@/lib/useRecord';
import { safeHtml } from '@/lib/html';
import ProductGalleryManager from '@/Components/ProductGalleryManager';

type Product = {
    id: number;
    main_image: string;
    loved: number;
    product_name: string;
    product_desc: string;
    product_serves: string;
    product_ingredients: string;
    category_name?: string;
    type_name?: string;
    product_availability: number;
    delivery: string;
    notice: string | null;
    allergens: { id: number; name: string }[];
    variants: { id: number; variant_name: string; price: number }[];
};

const isEmptyHtml = (html?: string | null) => !html || !html.replace(/<[^>]*>/g, '').trim();

function HtmlSection({ title, html }: { title: string; html?: string | null }) {
    if (isEmptyHtml(html)) return null;
    return (
        <Card>
            <CardHeader title={title} />
            <CardBody>
                <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: safeHtml(html) }} />
            </CardBody>
        </Card>
    );
}

const ViewProduct = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, loading, error } = useRecord<Product>(id ? `/api/product/${id}` : null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api(`/api/product/${id}`, { method: 'DELETE' });
            router.push('/admin/products');
        } catch (err) {
            setDeleteError(errorMessage(err, 'Could not delete product'));
            setDeleting(false);
            setConfirmOpen(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader
                title={data?.product_name ?? 'Product'}
                back={{ href: '/admin/products', label: 'Products' }}
                actions={
                    data && (
                        <>
                            <Button variant="danger" onClick={() => setConfirmOpen(true)} icon={<TrashIcon className="size-4" />}>
                                Delete
                            </Button>
                            <Button href={`/admin/products/edit-product/${id}`} icon={<PencilSquareIcon className="size-4" />}>
                                Edit
                            </Button>
                        </>
                    )
                }
            />

            {deleteError && <div className="mb-4"><Alert>{deleteError}</Alert></div>}

            {loading ? (
                <Card><LoadingState rows={6} /></Card>
            ) : error || !data ? (
                <Card><ErrorState message={error ?? 'Product not found'} /></Card>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <HtmlSection title="Description" html={data.product_desc} />
                        <Card>
                            <CardHeader title="Sizes and prices" />
                            {data.variants.length === 0 ? (
                                <CardBody><p className="text-sm text-slate-500">No sizes — the product cannot be ordered.</p></CardBody>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {data.variants.map((v) => (
                                        <li key={v.id} className="flex items-center justify-between px-5 py-3 text-sm">
                                            <span className="text-slate-700">{v.variant_name}</span>
                                            <span className="font-medium text-slate-900">{formatMoney(v.price)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                        <ProductGalleryManager productId={data.id} />
                        <HtmlSection title="Serves" html={data.product_serves} />
                        <HtmlSection title="Ingredients" html={data.product_ingredients} />
                        <HtmlSection title="Delivery" html={data.delivery} />
                        <HtmlSection title="Notice" html={data.notice} />
                    </div>

                    <div className="space-y-6">
                        <Card className="overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={uploadUrl(data.main_image)} alt={data.product_name} className="aspect-square w-full object-cover" />
                        </Card>
                        <Card>
                            <CardBody>
                                <DetailList>
                                    <DetailRow label="Status">
                                        <div className="flex flex-wrap gap-1.5">
                                            {data.product_availability ? <Badge tone="green">In stock</Badge> : <Badge tone="amber">Pre-order</Badge>}
                                            {data.loved ? <Badge tone="brand">Favourite</Badge> : null}
                                        </div>
                                    </DetailRow>
                                    <DetailRow label="Category">{data.category_name ?? '—'}</DetailRow>
                                    <DetailRow label="Type">{data.type_name ?? '—'}</DetailRow>
                                    <DetailRow label="Allergens">
                                        {data.allergens.length === 0 ? (
                                            <span className="text-slate-400">None</span>
                                        ) : (
                                            <div className="flex flex-wrap gap-1.5">
                                                {data.allergens.map((a) => <Badge key={a.id}>{a.name}</Badge>)}
                                            </div>
                                        )}
                                    </DetailRow>
                                </DetailList>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Delete product?"
                description="The product will be removed from the menu together with its sizes and gallery photos."
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </AdminShell>
    );
};

export default ViewProduct;
