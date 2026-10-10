'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import { Card } from '@/Components/ui/Card';
import { ErrorState, LoadingState } from '@/Components/ui/Feedback';
import { api } from '@/lib/http';
import { useRecord } from '@/lib/useRecord';
import LinkForm, { LinkValues } from '../../LinkForm';

type SocialLink = { id: number; icon: string; url: string };

const EditLink = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, loading, error } = useRecord<SocialLink>(id ? `/api/links/${id}` : null);

    const handleSubmit = async (values: LinkValues) => {
        await api(`/api/links/${id}`, { method: 'PUT', json: values });
        router.push('/admin/social-links');
    };

    return (
        <AdminShell>
            <PageHeader title="Edit social link" back={{ href: '/admin/social-links', label: 'Social links' }} />
            <Card className="max-w-2xl">
                {loading ? (
                    <LoadingState rows={3} />
                ) : error || !data ? (
                    <ErrorState message={error ?? 'Link not found'} />
                ) : (
                    <LinkForm
                        initial={{ icon: data.icon?.toLowerCase() ?? '', url: data.url ?? '' }}
                        submitLabel="Save changes"
                        onSubmit={handleSubmit}
                    />
                )}
            </Card>
        </AdminShell>
    );
};

export default EditLink;
