'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import Button from '@/Components/ui/Button';
import { Card, CardBody } from '@/Components/ui/Card';
import { Alert, Field, FormActions, Input, Textarea } from '@/Components/ui/Form';
import ImageInput from '@/Components/ui/ImageInput';

export type SlideValues = { title: string; text: string; link: string; link_text: string };

// Форма слайда с превью: так слайд будет выглядеть на главной сайта
export default function SlideForm({
    initial,
    currentImageUrl,
    submitLabel,
    cancelHref,
    onSubmit,
}: {
    initial: SlideValues;
    currentImageUrl?: string;
    submitLabel: string;
    cancelHref: string;
    onSubmit: (values: SlideValues, image: File | null) => Promise<void>;
}) {
    const [values, setValues] = useState<SlideValues>(initial);
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!image) {
            setPreviewUrl(currentImageUrl);
            return;
        }
        const url = URL.createObjectURL(image);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [image, currentImageUrl]);

    const update = (field: keyof SlideValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValues((v) => ({ ...v, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image && !currentImageUrl) {
            setError('Please choose an image');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await onSubmit(values, image);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save slide');
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
                <CardBody className="space-y-5">
                    {error && <Alert>{error}</Alert>}
                    <Field label="Title" htmlFor="title" required>
                        <Input id="title" value={values.title} onChange={update('title')} required />
                    </Field>
                    <Field label="Text" htmlFor="text" required>
                        <Textarea id="text" rows={3} value={values.text} onChange={update('text')} required />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Button link" htmlFor="link" hint="Leave empty to hide the button. /menu or a full URL.">
                            <Input id="link" value={values.link} onChange={update('link')} placeholder="/menu" />
                        </Field>
                        <Field label="Button text" htmlFor="link_text">
                            <Input id="link_text" value={values.link_text} onChange={update('link_text')} placeholder="Our Menu" />
                        </Field>
                    </div>
                    <Field label="Background image" required={!currentImageUrl}>
                        <ImageInput file={image} onChange={setImage} currentUrl={currentImageUrl} required={!currentImageUrl} />
                    </Field>
                </CardBody>
                <FormActions>
                    <Button variant="secondary" href={cancelHref}>Cancel</Button>
                    <Button type="submit" loading={saving}>{submitLabel}</Button>
                </FormActions>
            </Card>

            <div className="lg:col-span-2">
                <p className="mb-2 text-sm font-medium text-slate-700">Preview</p>
                <SlidePreview {...values} imageUrl={previewUrl} />
            </div>
        </form>
    );
}

export function SlidePreview({ title, text, link, link_text, imageUrl }: SlideValues & { imageUrl?: string }) {
    return (
        <div className="relative flex aspect-[4/3] items-center overflow-hidden rounded-xl bg-slate-800 shadow-sm">
            {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="absolute inset-0 size-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative space-y-3 p-6">
                <p className="text-xl font-bold leading-tight text-white">{title || 'Slide title'}</p>
                <p className="line-clamp-3 text-sm text-white/90">{text || 'Slide text'}</p>
                {link && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-1.5 text-sm font-medium text-white">
                        {link_text || 'Learn more'}
                        <ArrowRightIcon className="size-4" />
                    </span>
                )}
            </div>
        </div>
    );
}
