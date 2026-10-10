'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import Button from '@/Components/ui/Button';
import { Card, CardBody } from '@/Components/ui/Card';
import { Alert, Field, FormActions, Input } from '@/Components/ui/Form';
import { api, errorMessage } from '@/lib/http';

const AddTime = () => {
    const router = useRouter();
    const [days, setDays] = useState('');
    const [times, setTimes] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await api('/api/open-time', { method: 'POST', json: { days, times } });
            router.push('/admin/open-time');
        } catch (err) {
            setError(errorMessage(err, 'Could not add opening hours'));
            setSaving(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader title="Add opening hours" back={{ href: '/admin/open-time', label: 'Opening hours' }} />
            <Card className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <CardBody className="grid gap-5 sm:grid-cols-2">
                        {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}
                        <Field label="Days" htmlFor="days" required hint="For example: Mon – Fri">
                            <Input id="days" value={days} onChange={(e) => setDays(e.target.value)} required autoFocus />
                        </Field>
                        <Field label="Hours" htmlFor="times" required hint="For example: 9:00 – 18:00">
                            <Input id="times" value={times} onChange={(e) => setTimes(e.target.value)} required />
                        </Field>
                    </CardBody>
                    <FormActions>
                        <Button variant="secondary" href="/admin/open-time">Cancel</Button>
                        <Button type="submit" loading={saving}>Add hours</Button>
                    </FormActions>
                </form>
            </Card>
        </AdminShell>
    );
};

export default AddTime;
