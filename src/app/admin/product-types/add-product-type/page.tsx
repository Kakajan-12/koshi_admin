'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import Button from '@/Components/ui/Button';
import { Card, CardBody } from '@/Components/ui/Card';
import { Alert, Field, FormActions, Input } from '@/Components/ui/Form';
import { api, errorMessage } from '@/lib/http';

const AddProductType = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await api('/api/product-types', { method: 'POST', json: { type_name: name } });
            router.push('/admin/product-types');
        } catch (err) {
            setError(errorMessage(err, 'Could not add product type'));
            setSaving(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader title="Add type" back={{ href: '/admin/product-types', label: 'Product types' }} />
            <Card className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <CardBody className="space-y-5">
                        {error && <Alert>{error}</Alert>}
                        <Field label="Name" htmlFor="name" required hint="For example: Cakes, Cookies, Pastries">
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
                        </Field>
                    </CardBody>
                    <FormActions>
                        <Button variant="secondary" href="/admin/product-types">Cancel</Button>
                        <Button type="submit" loading={saving}>Add type</Button>
                    </FormActions>
                </form>
            </Card>
        </AdminShell>
    );
};

export default AddProductType;
