'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import { Card, CardBody, CardHeader } from '@/Components/ui/Card';
import MultiImageInput from '@/Components/ui/MultiImageInput';
import { uploadGalleryPhotos } from '@/lib/gallery';
import { api } from '@/lib/http';
import ProductForm, { emptyProduct, productFormData, ProductValues } from '../ProductForm';

const AddProduct = () => {
    const router = useRouter();
    const [extraPhotos, setExtraPhotos] = useState<File[]>([]);

    const handleSubmit = async (values: ProductValues, image: File | null) => {
        const created = await api<{ id: number }>('/api/product', {
            method: 'POST',
            form: productFormData(values, image, { sendEmptyNotice: false }),
        });
        // Фото галереи привязываются к товару, поэтому загружаем их после создания.
        // Если какое-то не загрузится — его можно добавить на странице товара.
        if (extraPhotos.length) await uploadGalleryPhotos(created.id, extraPhotos);
        router.push(`/admin/products/view-product/${created.id}`);
    };

    return (
        <AdminShell>
            <PageHeader title="Add product" back={{ href: '/admin/products', label: 'Products' }} />
            <ProductForm
                initial={emptyProduct}
                submitLabel="Add product"
                cancelHref="/admin/products"
                onSubmit={handleSubmit}
                photos={
                    <Card>
                        <CardHeader title="Gallery photos" description="Optional. Extra photos shown after the main image on the product page." />
                        <CardBody>
                            <MultiImageInput files={extraPhotos} onChange={setExtraPhotos} />
                        </CardBody>
                    </Card>
                }
            />
        </AdminShell>
    );
};

export default AddProduct;
