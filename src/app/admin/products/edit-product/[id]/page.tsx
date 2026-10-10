'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import { Card } from '@/Components/ui/Card';
import { ErrorState, LoadingState } from '@/Components/ui/Feedback';
import { uploadUrl } from '@/lib/api';
import { api } from '@/lib/http';
import { useRecord } from '@/lib/useRecord';
import ProductGalleryManager from '@/Components/ProductGalleryManager';
import ProductForm, { productFormData, ProductValues } from '../../ProductForm';

type ApiProduct = {
    id: number;
    main_image: string;
    loved: number;
    product_name: string;
    product_desc: string;
    product_serves: string;
    product_ingredients: string;
    product_category: number;
    product_types: number;
    product_availability: number;
    delivery: string;
    notice: string | null;
    allergens: { id: number; name: string }[];
    variants: { id: number; variant_name: string; price: number }[];
};

const toFormValues = (p: ApiProduct): ProductValues => ({
    product_name: p.product_name || '',
    product_desc: p.product_desc || '',
    product_serves: p.product_serves || '',
    product_ingredients: p.product_ingredients || '',
    product_category: String(p.product_category || ''),
    product_types: String(p.product_types || ''),
    product_availability: !!p.product_availability,
    loved: !!p.loved,
    delivery: p.delivery || '',
    notice: p.notice || '',
    allergens: (p.allergens ?? []).map((a) => a.id),
    variants: (p.variants ?? []).length
        ? p.variants.map((v) => ({ id: v.id, variant_name: v.variant_name || '', price: String(v.price ?? '') }))
        : [{ variant_name: '', price: '' }],
});

const EditProduct = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, loading, error } = useRecord<ApiProduct>(id ? `/api/product/${id}` : null);

    const handleSubmit = async (values: ProductValues, image: File | null) => {
        await api(`/api/product/${id}`, { method: 'PUT', form: productFormData(values, image, { sendEmptyNotice: true }) });
        router.push(`/admin/products/view-product/${id}`);
    };

    return (
        <AdminShell>
            <PageHeader
                title={data ? `Edit ${data.product_name}` : 'Edit product'}
                back={{ href: '/admin/products', label: 'Products' }}
            />
            {loading ? (
                <Card><LoadingState rows={6} /></Card>
            ) : error || !data ? (
                <Card><ErrorState message={error ?? 'Product not found'} /></Card>
            ) : (
                <ProductForm
                    initial={toFormValues(data)}
                    currentImageUrl={uploadUrl(data.main_image)}
                    submitLabel="Save changes"
                    cancelHref={`/admin/products/view-product/${id}`}
                    onSubmit={handleSubmit}
                    photos={<ProductGalleryManager productId={data.id} />}
                />
            )}
        </AdminShell>
    );
};

export default EditProduct;
