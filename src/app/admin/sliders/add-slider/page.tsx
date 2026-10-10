'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import { api } from '@/lib/http';
import SlideForm, { SlideValues } from '../SlideForm';

const AddSlider = () => {
    const router = useRouter();

    const handleSubmit = async (values: SlideValues, image: File | null) => {
        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('title', values.title);
        formData.append('text', values.text);
        formData.append('link', values.link);
        formData.append('link_text', values.link_text);
        await api('/api/sliders', { method: 'POST', form: formData });
        router.push('/admin/sliders');
    };

    return (
        <AdminShell>
            <PageHeader title="Add slide" back={{ href: '/admin/sliders', label: 'Hero slides' }} />
            <SlideForm
                initial={{ title: '', text: '', link: '', link_text: '' }}
                submitLabel="Add slide"
                cancelHref="/admin/sliders"
                onSubmit={handleSubmit}
            />
        </AdminShell>
    );
};

export default AddSlider;
