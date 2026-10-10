'use client';

import React, { useState } from 'react';
import Button from '@/Components/ui/Button';
import { CardBody } from '@/Components/ui/Card';
import { Alert, Field, FormActions, Input } from '@/Components/ui/Form';
import SocialIcon, { SOCIAL_PLATFORMS } from '@/Components/SocialIcon';

export type LinkValues = { icon: string; url: string };

// Общая форма добавления и редактирования ссылки на соцсеть
export default function LinkForm({
    initial,
    submitLabel,
    onSubmit,
}: {
    initial: LinkValues;
    submitLabel: string;
    onSubmit: (values: LinkValues) => Promise<void>;
}) {
    const [icon, setIcon] = useState(initial.icon);
    const [url, setUrl] = useState(initial.url);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!icon) {
            setError('Please choose a platform');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await onSubmit({ icon, url });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save link');
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <CardBody className="space-y-5">
                {error && <Alert>{error}</Alert>}
                <Field label="Platform" required>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {SOCIAL_PLATFORMS.map((p) => {
                            const active = icon === p.value;
                            return (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setIcon(p.value)}
                                    aria-pressed={active}
                                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                                        active
                                            ? 'border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <SocialIcon name={p.value} className="size-4" />
                                    {p.label}
                                </button>
                            );
                        })}
                    </div>
                </Field>
                <Field label="Link" htmlFor="url" required hint="Full address, starting with https://">
                    <Input
                        id="url"
                        type="url"
                        placeholder="https://instagram.com/koshibakery"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                </Field>
            </CardBody>
            <FormActions>
                <Button variant="secondary" href="/admin/social-links">Cancel</Button>
                <Button type="submit" loading={saving}>{submitLabel}</Button>
            </FormActions>
        </form>
    );
}
