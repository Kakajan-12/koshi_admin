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

type Allergen = { id: number; name: string };

const EditAllergens = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, setData, loading, error } = useRecord<Allergen>(id ? `/api/allergens/${id}` : null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setSaving(true);
        setSaveError(null);
        try {
            await api(`/api/allergens/${id}`, { method: 'PUT', json: { name: data.name } });
            router.push('/admin/allergens');
        } catch (err) {
            setSaveError(errorMessage(err, 'Could not save changes'));
            setSaving(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader title="Edit allergen" back={{ href: '/admin/allergens', label: 'Allergens' }} />
            <Card className="max-w-2xl">
                {loading ? (
                    <LoadingState rows={2} />
                ) : error || !data ? (
                    <ErrorState message={error ?? 'Allergen not found'} />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <CardBody className="space-y-5">
                            {saveError && <Alert>{saveError}</Alert>}
                            <Field label="Name" htmlFor="name" required>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    required
                                />
                            </Field>
                        </CardBody>
                        <FormActions>
                            <Button variant="secondary" href="/admin/allergens">Cancel</Button>
                            <Button type="submit" loading={saving}>Save changes</Button>
                        </FormActions>
                    </form>
                )}
            </Card>
        </AdminShell>
    );
};

export default EditAllergens;
