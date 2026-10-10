'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import Button from '@/Components/ui/Button';
import { Card, CardBody } from '@/Components/ui/Card';
import { Alert, Field, FormActions, Input } from '@/Components/ui/Form';
import { ErrorState, LoadingState } from '@/Components/ui/Feedback';
import ImageInput from '@/Components/ui/ImageInput';
import { uploadUrl } from '@/lib/api';
import { api, errorMessage } from '@/lib/http';
import { useRecord } from '@/lib/useRecord';

type Category = { id: number; name: string; image: string };

const EditCategory = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, setData, loading, error } = useRecord<Category>(id ? `/api/product-category/${id}` : null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!data) return;
        const formData = new FormData();
        formData.append('name', data.name);
        // Без нового файла сервер оставляет прежнюю картинку
        if (imageFile) formData.append('image', imageFile);

        setSaving(true);
        setSaveError(null);
        try {
            await api(`/api/product-category/${id}`, { method: 'PUT', form: formData });
            router.push('/admin/product-category');
        } catch (err) {
            setSaveError(errorMessage(err, 'Could not save changes'));
            setSaving(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader title="Edit category" back={{ href: '/admin/product-category', label: 'Categories' }} />
            <Card className="max-w-2xl">
                {loading ? (
                    <LoadingState rows={3} />
                ) : error || !data ? (
                    <ErrorState message={error ?? 'Category not found'} />
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
                            <Field label="Image">
                                <ImageInput file={imageFile} onChange={setImageFile} currentUrl={uploadUrl(data.image)} />
                            </Field>
                        </CardBody>
                        <FormActions>
                            <Button variant="secondary" href="/admin/product-category">Cancel</Button>
                            <Button type="submit" loading={saving}>Save changes</Button>
                        </FormActions>
                    </form>
                )}
            </Card>
        </AdminShell>
    );
};

export default EditCategory;
