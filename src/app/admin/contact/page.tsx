'use client';
import React from "react";

import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import AdminShell, { PageHeader } from "@/Components/AdminShell";
import Button from "@/Components/ui/Button";
import { Card } from "@/Components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/Components/ui/Feedback";
import { useList } from "@/lib/useList";
import MapPreview from "@/Components/MapPreview";

type ContactData = {
    id: number;
    address: string;
    phone: string;
    mail: string;
    map: string;
};

function ContactLine({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
    return (
        <div className="flex gap-3">
            <Icon className="mt-0.5 size-5 shrink-0 text-slate-400" />
            <span className="text-sm text-slate-700">{children || <span className="text-slate-400">Not set</span>}</span>
        </div>
    );
}

const Contact = () => {
    const list = useList<ContactData>("/api/contact");

    return (
        <AdminShell>
            <PageHeader title="Contact details" description="Address, phone, email and map shown on the website." />

            {list.loading ? (
                <Card><LoadingState rows={3} /></Card>
            ) : list.error ? (
                <Card><ErrorState message={list.error} onRetry={list.reload} /></Card>
            ) : list.items.length === 0 ? (
                <Card><EmptyState title="No contact details" description="Contact details are missing in the database." /></Card>
            ) : (
                <div className="space-y-6">
                    {list.items.map((contact) => (
                        <Card key={contact.id} className="overflow-hidden">
                            <div className="grid lg:grid-cols-5">
                                <div className="space-y-4 p-6 lg:col-span-2">
                                    <ContactLine icon={MapPinIcon}>{contact.address}</ContactLine>
                                    <ContactLine icon={PhoneIcon}>{contact.phone}</ContactLine>
                                    <ContactLine icon={EnvelopeIcon}>{contact.mail}</ContactLine>
                                    <div className="pt-2">
                                        <Button
                                            variant="secondary"
                                            href={`/admin/contact/edit-contact/${contact.id}`}
                                            icon={<PencilSquareIcon className="size-4" />}
                                        >
                                            Edit details
                                        </Button>
                                    </div>
                                </div>
                                <div className="h-64 border-t border-slate-200 bg-slate-50 lg:col-span-3 lg:h-auto lg:min-h-72 lg:border-t-0 lg:border-l [&_iframe]:h-full [&_iframe]:w-full">
                                    <MapPreview html={contact.map} />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </AdminShell>
    );
};

export default Contact;
