'use client';

import React, { FormEvent, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import Button from '@/Components/ui/Button';
import { Card, CardBody } from '@/Components/ui/Card';
import { Alert, Field, FormActions, Input, Textarea } from '@/Components/ui/Form';
import { ErrorState, LoadingState } from '@/Components/ui/Feedback';
import { api, errorMessage } from '@/lib/http';
import { useRecord } from '@/lib/useRecord';
import MapPreview from '@/Components/MapPreview';

type ContactData = { id: number; address: string; phone: string; mail: string; map: string };

const EditContact = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, setData, loading, error } = useRecord<ContactData>(id ? `/api/contact/${id}` : null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const update = (field: keyof ContactData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        data && setData({ ...data, [field]: e.target.value });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setSaving(true);
        setSaveError(null);
        try {
            await api(`/api/contact/${id}`, {
                method: 'PUT',
                json: { address: data.address, phone: data.phone, mail: data.mail, map: data.map },
            });
            router.push('/admin/contact');
        } catch (err) {
            setSaveError(errorMessage(err, 'Could not save changes'));
            setSaving(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader title="Edit contact details" back={{ href: '/admin/contact', label: 'Contact details' }} />
            {loading ? (
                <Card><LoadingState rows={4} /></Card>
            ) : error || !data ? (
                <Card><ErrorState message={error ?? 'Contact not found'} /></Card>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-5">
                        <Card className="lg:col-span-3">
                            <CardBody className="space-y-5">
                                {saveError && <Alert>{saveError}</Alert>}
                                <Field label="Address" htmlFor="address" required>
                                    <Input id="address" value={data.address} onChange={update('address')} required />
                                </Field>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <Field label="Phone" htmlFor="phone" required>
                                        <Input id="phone" type="tel" value={data.phone} onChange={update('phone')} required />
                                    </Field>
                                    <Field label="Email" htmlFor="mail" required>
                                        <Input id="mail" type="email" value={data.mail} onChange={update('mail')} required />
                                    </Field>
                                </div>
                                <Field
                                    label="Map embed code"
                                    htmlFor="map"
                                    hint="Google Maps → Share → Embed a map → copy the <iframe> code."
                                >
                                    <Textarea id="map" rows={5} value={data.map} onChange={update('map')} className="font-mono text-xs" />
                                </Field>
                            </CardBody>
                            <FormActions>
                                <Button variant="secondary" href="/admin/contact">Cancel</Button>
                                <Button type="submit" loading={saving}>Save changes</Button>
                            </FormActions>
                        </Card>
                        <Card className="overflow-hidden lg:col-span-2">
                            <p className="border-b border-slate-100 px-5 py-3 text-sm font-medium text-slate-700">Map preview</p>
                            <div className="h-72 bg-slate-50 [&_iframe]:h-full [&_iframe]:w-full">
                                <MapPreview html={data.map} />
                            </div>
                        </Card>
                    </div>
                </form>
            )}
        </AdminShell>
    );
};

export default EditContact;
