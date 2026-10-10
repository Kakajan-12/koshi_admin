'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import Button from '@/Components/ui/Button';
import { Card, CardBody } from '@/Components/ui/Card';
import { Alert, Field, FormActions, Input } from '@/Components/ui/Form';
import { api, errorMessage } from '@/lib/http';

const AddAllergens = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await api('/api/allergens', { method: 'POST', json: { name } });
            router.push('/admin/allergens');
        } catch (err) {
            setError(errorMessage(err, 'Could not add allergen'));
            setSaving(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader title="Add allergen" back={{ href: '/admin/allergens', label: 'Allergens' }} />
            <Card className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <CardBody className="space-y-5">
                        {error && <Alert>{error}</Alert>}
                        <Field label="Name" htmlFor="name" required hint="For example: Nuts, Gluten, Milk">
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
                        </Field>
                    </CardBody>
                    <FormActions>
                        <Button variant="secondary" href="/admin/allergens">Cancel</Button>
                        <Button type="submit" loading={saving}>Add allergen</Button>
                    </FormActions>
                </form>
            </Card>
        </AdminShell>
    );
};

export default AddAllergens;
