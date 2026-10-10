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

type OpenTime = { id: number; days: string; times: string };

const EditTime = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, setData, loading, error } = useRecord<OpenTime>(id ? `/api/open-time/${id}` : null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setSaving(true);
        setSaveError(null);
        try {
            await api(`/api/open-time/${id}`, { method: 'PUT', json: { days: data.days, times: data.times } });
            router.push('/admin/open-time');
        } catch (err) {
            setSaveError(errorMessage(err, 'Could not save changes'));
            setSaving(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader title="Edit opening hours" back={{ href: '/admin/open-time', label: 'Opening hours' }} />
            <Card className="max-w-2xl">
                {loading ? (
                    <LoadingState rows={2} />
                ) : error || !data ? (
                    <ErrorState message={error ?? 'Opening hours not found'} />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <CardBody className="grid gap-5 sm:grid-cols-2">
                            {saveError && <div className="sm:col-span-2"><Alert>{saveError}</Alert></div>}
                            <Field label="Days" htmlFor="days" required>
                                <Input
                                    id="days"
                                    value={data.days}
                                    onChange={(e) => setData({ ...data, days: e.target.value })}
                                    required
                                />
                            </Field>
                            <Field label="Hours" htmlFor="times" required>
                                <Input
                                    id="times"
                                    value={data.times}
                                    onChange={(e) => setData({ ...data, times: e.target.value })}
                                    required
                                />
                            </Field>
                        </CardBody>
                        <FormActions>
                            <Button variant="secondary" href="/admin/open-time">Cancel</Button>
                            <Button type="submit" loading={saving}>Save changes</Button>
                        </FormActions>
                    </form>
                )}
            </Card>
        </AdminShell>
    );
};

export default EditTime;
