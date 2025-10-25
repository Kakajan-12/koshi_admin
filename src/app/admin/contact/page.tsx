'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {PencilIcon} from "@heroicons/react/16/solid";

interface Address {
    id: string;
    address: number;
    phone: string;
    mail: string;
    map: string;
}

const Contact = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setAddresses(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        fetchServices();
    }, [router]);

    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div className="container mx-auto">
            <div className="flex bg-gray-200">
                <Sidebar/>
                <div className="flex-1 p-10 ml-62">
                    <TokenTimer/>
                    <div className="mt-8">
                        <div className="w-full flex justify-between">
                            <h2 className="text-2xl font-bold mb-4">Contacts</h2>
                        </div>
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                            <tr className="divide-x-1 divide-gray-200">
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Map</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Address</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Phone</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Mail</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-center text-gray-600">Edit</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y-1 divide-gray-200">
                            {addresses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No contacts available</td>
                                </tr>
                            ) : (
                                addresses.map((address) => (
                                    <tr key={address.id} className="divide-x-1 divide-gray-200">
                                        <td className="py-4 px-4">
                                            <div dangerouslySetInnerHTML={{__html: address.map}}/>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>{address.address}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>{address.phone}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>{address.mail}</div>
                                        </td>
                                        <td className="py-4 px-4 flex justify-center">
                                            <Link
                                                href={`/admin/contact/edit-contact/${address.id}`}
                                                className="flex items-center text-white border-2 border-bg rounded-md bg w-fit px-4 py-1 cursor-pointer"
                                            >
                                                <PencilIcon className="w-5 h-5 mr-2"/>
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default Contact;
