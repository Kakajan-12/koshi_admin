'use client';

import React, { useState } from 'react';
import Button from '@/Components/ui/Button';
import { Card, CardBody } from '@/Components/ui/Card';
import { Alert, Field, FormActions, Input } from '@/Components/ui/Form';
import ImageInput from '@/Components/ui/ImageInput';
import TipTapEditor from '@/Components/TipTapEditor';
import { StarRatingInput } from '@/Components/ui/StarRating';

export type TestimonialValues = { name: string; text: string; rating: number | null };

// Общая форма добавления и редактирования отзыва
export default function TestimonialForm({
    initial,
    currentImageUrl,
    submitLabel,
    cancelHref,
    onSubmit,
}: {
    initial: TestimonialValues;
    currentImageUrl?: string;
    submitLabel: string;
    cancelHref: string;
    onSubmit: (values: TestimonialValues, image: File | null) => Promise<void>;
}) {
    const [name, setName] = useState(initial.name);
    const [text, setText] = useState(initial.text);
    const [rating, setRating] = useState<number | null>(initial.rating);
    const [image, setImage] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image && !currentImageUrl) {
            setError('Please choose a photo');
            return;
        }
        if (!text.replace(/<[^>]*>/g, '').trim()) {
            setError('Please write the testimonial text');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await onSubmit({ name, text, rating }, image);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save testimonial');
            setSaving(false);
        }
    };

    return (
        <Card className="max-w-3xl">
            <form onSubmit={handleSubmit}>
                <CardBody className="space-y-5">
                    {error && <Alert>{error}</Alert>}
                    <Field label="Customer name" htmlFor="name" required>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </Field>
                    <Field label="Rating" hint="Shown as stars on the website. Click the selected star again to remove the rating.">
                        <StarRatingInput value={rating} onChange={setRating} />
                    </Field>
                    <Field label="Photo" required={!currentImageUrl}>
                        <ImageInput file={image} onChange={setImage} currentUrl={currentImageUrl} required={!currentImageUrl} />
                    </Field>
                    <Field label="Testimonial" required>
                        <TipTapEditor content={text} onChange={setText} />
                    </Field>
                </CardBody>
                <FormActions>
                    <Button variant="secondary" href={cancelHref}>Cancel</Button>
                    <Button type="submit" loading={saving}>{submitLabel}</Button>
                </FormActions>
            </form>
        </Card>
    );
}
