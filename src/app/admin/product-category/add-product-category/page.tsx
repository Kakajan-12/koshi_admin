'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import Button from '@/Components/ui/Button';
import { Card, CardBody } from '@/Components/ui/Card';
import { Alert, Field, FormActions, Input, Toggle } from '@/Components/ui/Form';
import ImageInput from '@/Components/ui/ImageInput';
import { api, errorMessage } from '@/lib/http';

const AddCategory = () => {
    const router = useRouter();
    const [image, setImage] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [allowsMessage, setAllowsMessage] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) {
            setError('Please choose an image');
            return;
        }
        const formData = new FormData();
        formData.append('image', image);
        formData.append('name', name);
        formData.append('allows_message', allowsMessage ? '1' : '0');

        setSaving(true);
        setError(null);
        try {
            await api('/api/product-category', { method: 'POST', form: formData });
            router.push('/admin/product-category');
        } catch (err) {
            setError(errorMessage(err, 'Could not add category'));
            setSaving(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader title="Add category" back={{ href: '/admin/product-category', label: 'Categories' }} />
            <Card className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <CardBody className="space-y-5">
                        {error && <Alert>{error}</Alert>}
                        <Field label="Name" htmlFor="name" required>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
                        </Field>
                        <Field label="Image" required>
                            <ImageInput file={image} onChange={setImage} required />
                        </Field>
                        <Toggle
                            checked={allowsMessage}
                            onChange={setAllowsMessage}
                            label="Allow a custom message"
                            description="Customers can add a message (+£10) to items in this category, e.g. on cakes. Turn off for biscuits."
                        />
                    </CardBody>
                    <FormActions>
                        <Button variant="secondary" href="/admin/product-category">Cancel</Button>
                        <Button type="submit" loading={saving}>Add category</Button>
                    </FormActions>
                </form>
            </Card>
        </AdminShell>
    );
};

export default AddCategory;
