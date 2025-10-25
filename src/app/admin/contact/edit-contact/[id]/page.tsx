'use client';
import React, {FormEvent, useEffect, useState} from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

const EditContact = () => {
    const { id } = useParams();
    const router = useRouter();
    const [data, setData] = useState({ address: '', phone:'', mail:'',map:''});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setData(response.data[0]);
                setLoading(false);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}`, {
                address: data.address,
                phone: data.phone,
                mail: data.mail,
                map: data.map
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            router.push('/admin/contact');
        } catch (err) {
            console.error('Ошибка при сохранении:', err);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto">
            <div className="flex bg-gray-200 min-h-screen">
                <Sidebar/>
                <div className="flex-1 p-10 ml-62">
                    <TokenTimer/>
                    <div className="mt-8">
                        <h1 className="text-2xl font-bold mb-4">Edit Contact</h1>
                        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Address</label>
                                <input
                                    name="address"
                                    value={data.address}
                                    onChange={handleChange}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                            <div className="flex space-x-4 mb-4">
                                <div className="w-full">
                                    <label className="block text-gray-700 font-semibold mb-2">Phone</label>
                                    <input
                                        name="phone"
                                        value={data.phone}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="block text-gray-700 font-semibold mb-2">Mail</label>
                                    <input
                                        name="mail"
                                        value={data.mail}
                                        onChange={handleChange}
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>
                            <div className="mb-4 w-full">
                                <label
                                    className="block text-gray-700 font-semibold mb-2">Map:</label>
                                <textarea value={data.map}
                                          onChange={(e) => setData((prev) => ({...prev, map: e.target.value}))}
                                          rows={10}
                                          required
                                          className="border border-gray-300 rounded p-2 w-full">

                            </textarea>
                            </div>
                            <button
                                type="submit"
                                className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                            >
                                <DocumentIcon className="size-5 mr-2"/>
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default EditContact;
