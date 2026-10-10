'use client';

import React, { FormEvent, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import Button from '@/Components/ui/Button';
import { Card, CardBody } from '@/Components/ui/Card';
import { Alert, Field, FormActions, Input } from '@/Components/ui/Form';
import { ErrorState, LoadingState } from '@/Components/ui/Feedback';
import { api, errorMessage } from '@/lib/http';
import { useRecord } from '@/lib/useRecord';

type ProductType = { id: number; type_name: string };

const EditProductType = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, setData, loading, error } = useRecord<ProductType>(id ? `/api/product-types/${id}` : null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setSaving(true);
        setSaveError(null);
        try {
            await api(`/api/product-types/${id}`, { method: 'PUT', json: { type_name: data.type_name } });
            router.push('/admin/product-types');
        } catch (err) {
            setSaveError(errorMessage(err, 'Could not save changes'));
            setSaving(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader title="Edit type" back={{ href: '/admin/product-types', label: 'Product types' }} />
            <Card className="max-w-2xl">
                {loading ? (
                    <LoadingState rows={2} />
                ) : error || !data ? (
                    <ErrorState message={error ?? 'Product type not found'} />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <CardBody className="space-y-5">
                            {saveError && <Alert>{saveError}</Alert>}
                            <Field label="Name" htmlFor="name" required>
                                <Input
                                    id="name"
                                    value={data.type_name}
                                    onChange={(e) => setData({ ...data, type_name: e.target.value })}
                                    required
                                />
                            </Field>
                        </CardBody>
                        <FormActions>
                            <Button variant="secondary" href="/admin/product-types">Cancel</Button>
                            <Button type="submit" loading={saving}>Save changes</Button>
                        </FormActions>
                    </form>
                )}
            </Card>
        </AdminShell>
    );
};

export default EditProductType;
