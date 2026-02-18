'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {EyeIcon, PlusCircleIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

interface SlidersItem {
    id: number;
    image: string;
    text: string;
    title: string;
}

const Sliders = () => {
    const [sliders, setSliders] = useState<SlidersItem[]>([]);

    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setSliders(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError("Ошибка при получении данных");

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push("/");
                }
            }
        };

        fetchData();
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
                            <h2 className="text-2xl font-bold mb-4">Sliders</h2>
                            <Link href="/admin/sliders/add-slider"
                                  className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center"><PlusCircleIcon
                                className="size-6" color="#ffffff"/>
                                <div className="ml-2">Add</div>
                            </Link>
                        </div>
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                            <tr className="divide-x-1 divide-gray-200">
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Image</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Title</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Text</th>
                                <th className="py-2 px-4 border-b-2 border-gray-200 text-center text-gray-600">View</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y-1 divide-gray-200">
                            {sliders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No data available</td>
                                </tr>
                            ) : (
                                sliders.map(slider => (
                                    <tr key={slider.id} className="divide-x-1 divide-gray-200">
                                        <td className="py-4 px-4">
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_URL}/${slider.image}`.replace(/\\/g, '/')}
                                                alt={`Image ${slider.id}`}
                                                width={100}
                                                height={100}
                                            />

                                        </td>
                                        <td className="py-4 px-4">
                                            <div dangerouslySetInnerHTML={{__html: slider.title}}/>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div dangerouslySetInnerHTML={{__html: slider.text}}/>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex justify-center items-center h-full">
                                                <Link href={`/admin/sliders/view-slider/${slider.id}`}
                                                      className="bg text-white py-2 px-8 rounded-md cursor-pointer flex w-32"><EyeIcon
                                                    color="#ffffff"/>
                                                    <div className="ml-2">View</div>
                                                </Link>
                                            </div>
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


    )
}

export default Sliders;