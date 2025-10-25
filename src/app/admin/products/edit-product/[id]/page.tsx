'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

type Category = { id: number; name: string };
type TypeItem = { id: number; type_name: string };
type Allergen = { id: number; name: string };

type ApiVariant = {
    id?: number;
    variant_name?: string;
    price?: string | number;
};


const EditProduct = () => {
    const { id } = useParams();
    const router = useRouter();

    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);

    const [mainImage, setMainImage] = useState<File | null>(null);
    const [loved, setLoved] = useState(false);
    const [productName, setProductName] = useState('');
    const [productDesc, setProductDesc] = useState('');
    const [productServes, setProductServes] = useState('');
    const [productIngredients, setProductIngredients] = useState('');
    const [productCategory, setProductCategory] = useState('');
    const [productTypes, setProductTypes] = useState('');
    const [productAvailability, setProductAvailability] = useState(false);
    const [delivery, setDelivery] = useState('');
    const [notice, setNotice] = useState('');

    const [categories, setCategories] = useState<Category[]>([]);
    const [types, setTypes] = useState<TypeItem[]>([]);
    const [allergens, setAllergens] = useState<Allergen[]>([]);
    const [selectedAllergens, setSelectedAllergens] = useState<number[]>([]);
    type Variant = { id?: number; variant_name: string; price: string };

    const [variants, setVariants] = useState<Variant[]>([]);


    useEffect(() => {
        setIsClient(true);

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const [typesRes, catRes, allergRes, productRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-types`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-category`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/allergens`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const [typesData, catData, allergData, productData] = await Promise.all([
                    typesRes.json(),
                    catRes.json(),
                    allergRes.json(),
                    productRes.json(),
                ]);

                setTypes(typesData);
                setCategories(catData);
                setAllergens(allergData);

                setLoved(!!productData.loved);
                setProductName(productData.product_name || '');
                setProductDesc(productData.product_desc || '');
                setProductServes(productData.product_serves || '');
                setProductIngredients(productData.product_ingredients || '');
                setProductCategory(String(productData.product_category || ''));
                setProductTypes(String(productData.product_types || ''));
                setProductAvailability(!!productData.product_availability);
                setDelivery(productData.delivery || '');
                setNotice(productData.notice || '');

                if (productData.allergens) {
                    setSelectedAllergens(productData.allergens.map((a: Allergen) => a.id));
                }
                if (productData.variants) {
                    setVariants(
                        (productData.variants as ApiVariant[]).map(v => ({
                            id: v.id,
                            variant_name: v.variant_name || '',
                            price: String(v.price || '')
                        }))
                    );
                }


            } catch (err) {
                console.error('Ошибка загрузки:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleCheckbox = (allergenId: number) => {
        setSelectedAllergens(prev =>
            prev.includes(allergenId)
                ? prev.filter(id => id !== allergenId)
                : [...prev, allergenId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) return console.error('Нет токена');

        const formData = new FormData();
        if (mainImage) formData.append('main_image', mainImage);
        formData.append('loved', loved ? '1' : '0');
        formData.append('product_name', productName);
        formData.append('product_desc', productDesc);
        formData.append('product_serves', productServes);
        formData.append('product_ingredients', productIngredients);
        formData.append('product_category', productCategory);
        formData.append('product_types', productTypes);
        formData.append('product_availability', productAvailability ? '1' : '0');
        formData.append('allergens', JSON.stringify(selectedAllergens));
        formData.append('delivery', delivery);
        formData.append('notice', notice);
        formData.append('variants', JSON.stringify(variants));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                router.push('/admin/products');
            } else {
                console.error('Ошибка сохранения:', await res.text());
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    if (loading) return <div className="p-4">Загрузка...</div>;

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
                            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-2">Main Image:</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => e.target.files && setMainImage(e.target.files[0])}
                                        className="border rounded p-2 w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">Loved:</label>
                                    <select
                                        value={loved ? '1' : '0'}
                                        onChange={e => setLoved(e.target.value === '1')}
                                        className="border rounded p-2 w-full"
                                    >
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">Available:</label>
                                    <select
                                        value={productAvailability ? '1' : '0'}
                                        onChange={e => setProductAvailability(e.target.value === '1')}
                                        className="border rounded p-2 w-full"
                                    >
                                        <option value="1">Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">Type:</label>
                                    <select
                                        value={productTypes}
                                        onChange={e => setProductTypes(e.target.value)}
                                        className="border rounded p-2 w-full"
                                    >
                                        <option value="">Select type</option>
                                        {types.map(t => (
                                            <option key={t.id} value={t.id}>{t.type_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-2">Category:</label>
                                    <select
                                        value={productCategory}
                                        onChange={e => setProductCategory(e.target.value)}
                                        className="border rounded p-2 w-full"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {isClient && (
                                <>
                                    <div className="mb-4">
                                        <label className="block font-semibold mb-2">Product Name:</label>
                                        <input
                                            value={productName}
                                            onChange={e => setProductName(e.target.value)}
                                            className="border rounded p-2 w-full"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-semibold mb-2">Product Description:</label>
                                        <TipTapEditor content={productDesc} onChange={setProductDesc}/>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-semibold mb-2">Serves:</label>
                                        <input
                                            value={productServes}
                                            onChange={e => setProductServes(e.target.value)}
                                            className="border rounded p-2 w-full"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-semibold mb-2">Ingredients:</label>
                                        <TipTapEditor content={productIngredients} onChange={setProductIngredients}/>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-semibold mb-2">Delivery:</label>
                                        <TipTapEditor content={delivery} onChange={setDelivery}/>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-semibold mb-2">Notice:</label>
                                        <input
                                            value={notice}
                                            onChange={e => setNotice(e.target.value)}
                                            className="border rounded p-2 w-full"
                                        />
                                    </div>
                                    <div className="mb-6">
                                        <label className="block font-semibold mb-2">Allergens:</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {allergens.map(a => (
                                                <label key={a.id} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAllergens.includes(a.id)}
                                                        onChange={() => handleCheckbox(a.id)}
                                                    />
                                                    {a.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="mb-6">
                                <label className="block font-semibold mb-2">Variants:</label>
                                {variants.map((v, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2 items-center">
                                        <input
                                            type="text"
                                            value={v.variant_name}
                                            onChange={e => {
                                                const newVariants = [...variants];
                                                newVariants[idx].variant_name = e.target.value;
                                                setVariants(newVariants);
                                            }}
                                            placeholder="Variant Name"
                                            className="border rounded p-2 w-1/2"
                                        />
                                        <input
                                            type="number"
                                            value={v.price}
                                            onChange={e => {
                                                const newVariants = [...variants];
                                                newVariants[idx].price = e.target.value;
                                                setVariants(newVariants);
                                            }}
                                            placeholder="Price"
                                            className="border rounded p-2 w-1/4"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setVariants([...variants, {variant_name: '', price: ''}])}
                                    className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                                >
                                    Add Variant
                                </button>
                            </div>


                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default EditProduct;
