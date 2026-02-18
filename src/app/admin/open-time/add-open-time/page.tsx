'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const AddTime = () => {
    const [days, setDays] = useState('');
    const [times, setTimes] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const payload = {
            days,
            times
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/open-time`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Content added!', data);
                setDays('');
                setTimes('');
                router.push('/admin/open-time');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex bg-gray-200">
                <Sidebar/>
                <div className="flex-1 p-10 ml-62">
                    <TokenTimer/>
                    <div className="mt-8">
                        <form
                            onSubmit={handleSubmit}
                            className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                        >
                            <h2 className="text-2xl font-bold mb-4">Add open time</h2>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Days:</label>
                                <input
                                    value={days}
                                    onChange={(e) => setDays(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Times:</label>
                                <input
                                    value={times}
                                    onChange={(e) => setTimes(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Add open time
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default AddTime;
