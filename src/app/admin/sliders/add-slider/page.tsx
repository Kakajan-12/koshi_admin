'use client';

import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

const AddSlider = () => {
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [title,setTitle] = useState('');


    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('title', title ?? '');
        formData.append('text', text ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setImage(null);
                setTitle('');
                setText('');
                router.push('/admin/sliders');
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
                            <h2 className="text-2xl font-bold mb-4 text-left">Add new slider</h2>

                            <div className="mb-4 flex space-x-4">
                                <div className="w-full">
                                    <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                                        Image:
                                    </label>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImage(e.target.files[0]);
                                            }
                                        }}
                                        required
                                        className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                    />
                                </div>
                            </div>

                            {isClient && (
                                <>
                                    <div className="tabs tabs-lift">
                                        <input type="radio" name="my_tabs_3" className="tab" aria-label="Testimonials"
                                               defaultChecked/>
                                        <div className="tab-content bg-base-100 border-base-300 p-6">
                                            <div className="mb-4">
                                                <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                                <input
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    type="text"
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label
                                                    className="block text-gray-700 font-semibold mb-2">Text:</label>
                                                <textarea
                                                    value={text}
                                                    onChange={(e) => setText(e.target.value)}
                                                    rows={2}
                                                    required
                                                    className="border border-gray-300 rounded p-2 w-full"
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                type="submit"
                                className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                            >
                                Add slider
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default AddSlider;
