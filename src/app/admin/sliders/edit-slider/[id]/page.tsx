'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import { Card } from '@/Components/ui/Card';
import { ErrorState, LoadingState } from '@/Components/ui/Feedback';
import { uploadUrl } from '@/lib/api';
import { api } from '@/lib/http';
import { useRecord } from '@/lib/useRecord';
import SlideForm, { SlideValues } from '../../SlideForm';

type Slide = SlideValues & { id: number; image: string };

const EditSlider = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, loading, error } = useRecord<Slide>(id ? `/api/sliders/${id}` : null);

    const handleSubmit = async (values: SlideValues, image: File | null) => {
        if (!data) return;
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('text', values.text);
        formData.append('link', values.link);
        formData.append('link_text', values.link_text);
        // Без нового файла сервер берёт путь картинки из поля image
        if (image) formData.append('image', image);
        else formData.append('image', data.image);
        await api(`/api/sliders/${id}`, { method: 'PUT', form: formData });
        router.push(`/admin/sliders/view-slider/${id}`);
    };

    return (
        <AdminShell>
            <PageHeader title="Edit slide" back={{ href: '/admin/sliders', label: 'Hero slides' }} />
            {loading ? (
                <Card><LoadingState rows={4} /></Card>
            ) : error || !data ? (
                <Card><ErrorState message={error ?? 'Slide not found'} /></Card>
            ) : (
                <SlideForm
                    initial={{
                        title: data.title ?? '',
                        text: data.text ?? '',
                        link: data.link ?? '',
                        link_text: data.link_text ?? '',
                    }}
                    currentImageUrl={uploadUrl(data.image)}
                    submitLabel="Save changes"
                    cancelHref={`/admin/sliders/view-slider/${id}`}
                    onSubmit={handleSubmit}
                />
            )}
        </AdminShell>
    );
};

export default EditSlider;
