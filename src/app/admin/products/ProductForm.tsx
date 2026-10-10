'use client';

import React, { useEffect, useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/20/solid';
import Button from '@/Components/ui/Button';
import { Card, CardBody, CardHeader } from '@/Components/ui/Card';
import { Alert, Field, Input, Select } from '@/Components/ui/Form';
import ImageInput from '@/Components/ui/ImageInput';
import TipTapEditor from '@/Components/TipTapEditor';
import { api } from '@/lib/http';

export type Variant = { id?: number; variant_name: string; price: string };

export type ProductValues = {
    product_name: string;
    product_desc: string;
    product_serves: string;
    product_ingredients: string;
    product_category: string;
    product_types: string;
    product_availability: boolean;
    loved: boolean;
    delivery: string;
    notice: string;
    allergens: number[];
    variants: Variant[];
};

export const emptyProduct: ProductValues = {
    product_name: '',
    product_desc: '',
    product_serves: '',
    product_ingredients: '',
    product_category: '',
    product_types: '',
    // Как и раньше, новый товар по умолчанию «под заказ»
    product_availability: false,
    loved: false,
    delivery: '',
    notice: '',
    allergens: [],
    variants: [{ variant_name: '', price: '' }],
};

type Option = { id: number; name?: string; type_name?: string };

const isEmptyHtml = (html: string) => !html.replace(/<[^>]*>/g, '').trim();

function Toggle({
    checked,
    onChange,
    label,
    description,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description: string;
}) {
    return (
        <label className="flex cursor-pointer items-start justify-between gap-4">
            <span>
                <span className="block text-sm font-medium text-slate-900">{label}</span>
                <span className="block text-xs text-slate-500">{description}</span>
            </span>
            <span className="relative mt-0.5 inline-flex shrink-0">
                <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2" />
                <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </span>
        </label>
    );
}

// Общая форма добавления и редактирования товара
export default function ProductForm({
    initial,
    currentImageUrl,
    submitLabel,
    cancelHref,
    onSubmit,
    photos,
}: {
    initial: ProductValues;
    currentImageUrl?: string;
    submitLabel: string;
    cancelHref: string;
    onSubmit: (values: ProductValues, image: File | null) => Promise<void>;
    // Блок дополнительных фото (галерея товара) — справа, сразу под главным фото
    photos?: React.ReactNode;
}) {
    const [values, setValues] = useState<ProductValues>(initial);
    const [image, setImage] = useState<File | null>(null);
    const [categories, setCategories] = useState<Option[]>([]);
    const [types, setTypes] = useState<Option[]>([]);
    const [allergens, setAllergens] = useState<Option[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            api<Option[]>('/api/product-category'),
            api<Option[]>('/api/product-types'),
            api<Option[]>('/api/allergens'),
        ])
            .then(([c, t, a]) => {
                setCategories(c);
                setTypes(t);
                setAllergens(a);
            })
            .catch(() => setError('Could not load categories, types or allergens'));
    }, []);

    const set = <K extends keyof ProductValues>(key: K, value: ProductValues[K]) =>
        setValues((v) => ({ ...v, [key]: value }));

    const toggleAllergen = (id: number) =>
        set('allergens', values.allergens.includes(id) ? values.allergens.filter((a) => a !== id) : [...values.allergens, id]);

    const updateVariant = (index: number, field: 'variant_name' | 'price', value: string) =>
        set('variants', values.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image && !currentImageUrl) return setError('Please choose a main image');
        if (isEmptyHtml(values.product_desc)) return setError('Please add a description');
        const variants = values.variants.filter((v) => v.variant_name.trim() || v.price);
        if (variants.length === 0) return setError('Add at least one size with a price');
        if (variants.some((v) => !v.variant_name.trim() || v.price === '' || Number(v.price) < 0)) {
            return setError('Every size needs a name and a price');
        }

        setSaving(true);
        setError(null);
        try {
            await onSubmit({ ...values, variants }, image);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save product');
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="mb-6"><Alert>{error}</Alert></div>}

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <Card>
                        <CardHeader title="Product" />
                        <CardBody className="space-y-5">
                            <Field label="Name" htmlFor="product_name" required>
                                <Input
                                    id="product_name"
                                    value={values.product_name}
                                    onChange={(e) => set('product_name', e.target.value)}
                                    required
                                />
                            </Field>
                            <Field label="Description" required>
                                <TipTapEditor content={values.product_desc} onChange={(v) => set('product_desc', v)} />
                            </Field>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Sizes and prices" description="Each size is a separate option on the product page." />
                        <CardBody className="space-y-3">
                            {values.variants.map((variant, index) => (
                                <div key={variant.id ?? `new-${index}`} className="flex items-start gap-3">
                                    <Input
                                        aria-label="Size"
                                        placeholder="e.g. 8 inch"
                                        value={variant.variant_name}
                                        onChange={(e) => updateVariant(index, 'variant_name', e.target.value)}
                                    />
                                    <div className="relative w-36 shrink-0">
                                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">£</span>
                                        <Input
                                            aria-label="Price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={variant.price}
                                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                            className="pl-7"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-10 shrink-0 px-0"
                                        aria-label="Remove size"
                                        disabled={values.variants.length === 1}
                                        onClick={() => set('variants', values.variants.filter((_, i) => i !== index))}
                                        icon={<XMarkIcon className="size-4" />}
                                    />
                                </div>
                            ))}
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => set('variants', [...values.variants, { variant_name: '', price: '' }])}
                                icon={<PlusIcon className="size-4" />}
                            >
                                Add size
                            </Button>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Details" description="Shown in the tabs on the product page." />
                        <CardBody className="space-y-5">
                            <Field label="Serves">
                                <TipTapEditor content={values.product_serves} onChange={(v) => set('product_serves', v)} />
                            </Field>
                            <Field label="Ingredients">
                                <TipTapEditor content={values.product_ingredients} onChange={(v) => set('product_ingredients', v)} />
                            </Field>
                            <Field label="Delivery">
                                <TipTapEditor content={values.delivery} onChange={(v) => set('delivery', v)} />
                            </Field>
                            <Field label="Notice" hint="Optional. For example, how many days in advance to order.">
                                <TipTapEditor content={values.notice} onChange={(v) => set('notice', v)} />
                            </Field>
                        </CardBody>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader title="Main image" />
                        <CardBody>
                            <ImageInput file={image} onChange={setImage} currentUrl={currentImageUrl} required={!currentImageUrl} />
                        </CardBody>
                    </Card>

                    {photos}

                    <Card>
                        <CardHeader title="Status" />
                        <CardBody className="space-y-5">
                            <Toggle
                                checked={values.product_availability}
                                onChange={(v) => set('product_availability', v)}
                                label="In stock"
                                description="Off — shown as pre-order on the website."
                            />
                            <Toggle
                                checked={values.loved}
                                onChange={(v) => set('loved', v)}
                                label="Customer favourite"
                                description="Shown in the “Loved” section of the menu."
                            />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Organisation" />
                        <CardBody className="space-y-5">
                            <Field label="Category" htmlFor="product_category" required>
                                <Select
                                    id="product_category"
                                    value={values.product_category}
                                    onChange={(e) => set('product_category', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </Select>
                            </Field>
                            <Field label="Type" htmlFor="product_types" required>
                                <Select
                                    id="product_types"
                                    value={values.product_types}
                                    onChange={(e) => set('product_types', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select a type</option>
                                    {types.map((t) => (
                                        <option key={t.id} value={t.id}>{t.type_name}</option>
                                    ))}
                                </Select>
                            </Field>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Allergens" />
                        <CardBody>
                            {allergens.length === 0 ? (
                                <p className="text-sm text-slate-500">No allergens defined yet.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {allergens.map((a) => {
                                        const active = values.allergens.includes(a.id);
                                        return (
                                            <button
                                                key={a.id}
                                                type="button"
                                                onClick={() => toggleAllergen(a.id)}
                                                aria-pressed={active}
                                                className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors ${
                                                    active
                                                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                {a.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>

            <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex justify-end gap-2 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <Button variant="secondary" href={cancelHref}>Cancel</Button>
                <Button type="submit" loading={saving}>{submitLabel}</Button>
            </div>
        </form>
    );
}

// Поля формы товара → FormData для API
export function productFormData(values: ProductValues, image: File | null, { sendEmptyNotice }: { sendEmptyNotice: boolean }) {
    const formData = new FormData();
    if (image) formData.append('main_image', image);
    formData.append('loved', values.loved ? '1' : '0');
    formData.append('product_name', values.product_name);
    formData.append('product_desc', values.product_desc);
    formData.append('product_serves', values.product_serves);
    formData.append('product_ingredients', values.product_ingredients);
    formData.append('product_category', values.product_category);
    formData.append('product_types', values.product_types);
    formData.append('product_availability', values.product_availability ? '1' : '0');
    formData.append('allergens', JSON.stringify(values.allergens));
    formData.append('delivery', values.delivery);
    // При создании пустое примечание не отправляем — в базе останется NULL, как и раньше
    if (sendEmptyNotice || values.notice.trim() !== '') formData.append('notice', values.notice);
    formData.append('variants', JSON.stringify(values.variants));
    return formData;
}
