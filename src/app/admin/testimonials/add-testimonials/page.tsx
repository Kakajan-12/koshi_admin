'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import { api } from '@/lib/http';
import TestimonialForm, { TestimonialValues } from '../TestimonialForm';

const AddTestimonials = () => {
    const router = useRouter();

    const handleSubmit = async (values: TestimonialValues, image: File | null) => {
        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('text', values.text);
        formData.append('name', values.name);
        formData.append('rating', values.rating ? String(values.rating) : '');
        await api('/api/testimonials', { method: 'POST', form: formData });
        router.push('/admin/testimonials');
    };

    return (
        <AdminShell>
            <PageHeader title="Add testimonial" back={{ href: '/admin/testimonials', label: 'Testimonials' }} />
            <TestimonialForm
                initial={{ name: '', text: '', rating: 5 }}
                submitLabel="Add testimonial"
                cancelHref="/admin/testimonials"
                onSubmit={handleSubmit}
            />
        </AdminShell>
    );
};

export default AddTestimonials;
