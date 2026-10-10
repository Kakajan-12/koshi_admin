'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid';
import AdminShell, { PageHeader } from '@/Components/AdminShell';
import Button from '@/Components/ui/Button';
import { Card, CardBody } from '@/Components/ui/Card';
import { Alert } from '@/Components/ui/Form';
import { ConfirmDialog, ErrorState, LoadingState } from '@/Components/ui/Feedback';
import { uploadUrl } from '@/lib/api';
import { api, errorMessage } from '@/lib/http';
import { useRecord } from '@/lib/useRecord';
import { Stars } from '@/Components/ui/StarRating';
import { htmlToText, safeHtml } from '@/lib/html';

type Testimonial = { id: number; image: string; text: string; name: string; rating: number | null };

const ViewTestimonials = () => {
    const { id } = useParams();
    const router = useRouter();
    const { data, loading, error } = useRecord<Testimonial>(id ? `/api/testimonials/${id}` : null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await api(`/api/testimonials/${id}`, { method: 'DELETE' });
            router.push('/admin/testimonials');
        } catch (err) {
            setDeleteError(errorMessage(err, 'Could not delete testimonial'));
            setDeleting(false);
            setConfirmOpen(false);
        }
    };

    return (
        <AdminShell>
            <PageHeader
                title="Testimonial"
                back={{ href: '/admin/testimonials', label: 'Testimonials' }}
                actions={
                    data && (
                        <>
                            <Button variant="danger" onClick={() => setConfirmOpen(true)} icon={<TrashIcon className="size-4" />}>
                                Delete
                            </Button>
                            <Button href={`/admin/testimonials/edit-testimonials/${id}`} icon={<PencilSquareIcon className="size-4" />}>
                                Edit
                            </Button>
                        </>
                    )
                }
            />

            {deleteError && <div className="mb-4"><Alert>{deleteError}</Alert></div>}

            <Card className="max-w-3xl">
                {loading ? (
                    <LoadingState rows={4} />
                ) : error || !data ? (
                    <ErrorState message={error ?? 'Testimonial not found'} />
                ) : (
                    <CardBody>
                        <div className="flex items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={uploadUrl(data.image)}
                                alt={data.name}
                                className="size-16 rounded-full border border-slate-200 object-cover"
                            />
                            <div>
                                <p className="text-base font-semibold text-slate-900">{htmlToText(data.name)}</p>
                                <div className="mt-1"><Stars value={data.rating} /></div>
                            </div>
                        </div>
                        <blockquote className="mt-6 border-l-2 border-brand-200 pl-5">
                            <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: safeHtml(data.text) }} />
                        </blockquote>
                    </CardBody>
                )}
            </Card>

            <ConfirmDialog
                open={confirmOpen}
                title="Delete testimonial?"
                description="The testimonial will be removed from the website."
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </AdminShell>
    );
};

export default ViewTestimonials;
