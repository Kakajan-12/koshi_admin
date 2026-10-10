'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import { Card } from '@/Components/ui/Card';
import { ErrorState, LoadingState } from '@/Components/ui/Feedback';
import { uploadUrl } from '@/lib/api';
import { api } from '@/lib/http';
import { useRecord } from '@/lib/useRecord';
import TestimonialForm, { TestimonialValues } from '../../TestimonialForm';

type Testimonial = TestimonialValues & { id: number; image: string };

const EditTestimonials = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, loading, error } = useRecord<Testimonial>(id ? `/api/testimonials/${id}` : null);

    const handleSubmit = async (values: TestimonialValues, image: File | null) => {
        if (!data) return;
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('text', values.text);
        formData.append('rating', values.rating ? String(values.rating) : '');
        // Без нового файла сервер берёт путь картинки из поля image
        if (image) formData.append('image', image);
        else formData.append('image', data.image);
        await api(`/api/testimonials/${id}`, { method: 'PUT', form: formData });
        router.push(`/admin/testimonials/view-testimonials/${id}`);
    };

    return (
        <AdminShell>
            <PageHeader title="Edit testimonial" back={{ href: '/admin/testimonials', label: 'Testimonials' }} />
            {loading ? (
                <Card className="max-w-3xl"><LoadingState rows={4} /></Card>
            ) : error || !data ? (
                <Card className="max-w-3xl"><ErrorState message={error ?? 'Testimonial not found'} /></Card>
            ) : (
                <TestimonialForm
                    initial={{ name: data.name ?? '', text: data.text ?? '', rating: data.rating ?? null }}
                    currentImageUrl={uploadUrl(data.image)}
                    submitLabel="Save changes"
                    cancelHref={`/admin/testimonials/view-testimonials/${id}`}
                    onSubmit={handleSubmit}
                />
            )}
        </AdminShell>
    );
};

export default EditTestimonials;
