'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import { Card } from '@/Components/ui/Card';
import { api } from '@/lib/http';
import LinkForm, { LinkValues } from '../LinkForm';

const AddLink = () => {
    const router = useRouter();

    const handleSubmit = async (values: LinkValues) => {
        await api('/api/links', { method: 'POST', json: values });
        router.push('/admin/social-links');
    };

    return (
        <AdminShell>
            <PageHeader title="Add social link" back={{ href: '/admin/social-links', label: 'Social links' }} />
            <Card className="max-w-2xl">
                <LinkForm initial={{ icon: '', url: '' }} submitLabel="Add link" onSubmit={handleSubmit} />
            </Card>
        </AdminShell>
    );
};

export default AddLink;
