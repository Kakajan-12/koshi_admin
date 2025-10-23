'use client';

import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

interface Variant {
    variant_name: string;
    price: string;
}

const AddProduct = () => {
    const [isClient, setIsClient] = useState(false);
    const [main_image, setMainImage] = useState<File | null>(null);
    const [loved, setLoved] = useState(false);
    const [product_name, setProductName] = useState('');
    const [product_desc, setProductDesc] = useState('');
    const [product_serves, setProductServes] = useState('');
    const [product_ingredients, setProductIngredients] = useState('');
    const [product_category, setProductCategory] = useState('');
    const [product_types, setProductTypes] = useState('');
    const [product_availability, setProductAvailability] = useState(false);
    const [delivery, setDelivery] = useState('');
    const [notice, setNotice] = useState('');
    const [cat, setCat] = useState<
        { id: number; name: string;}[]
    >([]);
    const [types, setTypes] = useState<
        { id: number; type_name: string;}[]
    >([]);

    const [allergens, setAllergens] = useState<{ id: number; name: string }[]>([]);
    const [selectedAllergens, setSelectedAllergens] = useState<number[]>([]);
    const [variants, setVariants] = useState<Variant[]>([
        { variant_name: '', price: '' },
    ]);


    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        const fetchData = async () => {
            try {
                const [typesRes, catRes, allergensRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-types`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-category`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/allergens`),
                ]);
                const [typesData, catData, allergensData] = await Promise.all([
                    typesRes.json(),
                    catRes.json(),
                    allergensRes.json(),
                ]);

                setTypes(typesData);
                setCat(catData);
                setAllergens(allergensData);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
            }
        };
        fetchData();
    }, []);

    const toggleAllergen = (id: number) => {
        setSelectedAllergens((prev) =>
            prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
        );
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (main_image) formData.append('main_image', main_image);
        formData.append('loved', loved ? '1' : '0');
        formData.append('product_name', product_name ?? '');
        formData.append('product_desc', product_desc ?? '');
        formData.append('product_serves', product_serves ?? '');
        formData.append('product_ingredients', product_ingredients ?? '');
        formData.append('product_category', product_category ?? '');
        formData.append('product_types', product_types ?? '');
        formData.append('product_availability', product_availability ? '1' : '0');
        formData.append('allergens', JSON.stringify(selectedAllergens));
        formData.append('delivery', delivery ?? '');
        formData.append('notice', notice ?? '');
        formData.append('variants', JSON.stringify(variants));
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setMainImage(null);
                setLoved(Boolean)
                setProductName('');
                setProductDesc('');
                setProductServes('');
                setProductIngredients('');
                setProductCategory('');
                setProductTypes('');
                setProductAvailability(Boolean);
                setDelivery('');
                setNotice('');
                router.push('/admin/products');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };
    const handleVariantChange = (
        index: number,
        field: keyof Variant, // ✅ строго ограничиваем допустимые поля
        value: string
    ) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    const addVariant = () => {
        setVariants([...variants, { variant_name: '', price: '' }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };


    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add Product</h2>

                        <div className="mb-4 grid grid-cols-3 gap-4">
                            <div className="w-full">
                                <label htmlFor="main_image" className="block text-gray-700 font-semibold mb-2">
                                    Main Image:
                                </label>
                                <input
                                    type="file"
                                    id="main_image"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setMainImage(e.target.files[0]);
                                        }
                                    }}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>
                            <div className="mb-4 w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Loved:
                                </label>
                                <select
                                    id="loved"
                                    name="loved"
                                    value={loved ? '1' : '0'}
                                    onChange={(e) => setLoved(e.target.value === '1')}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Types:
                                </label>
                                <select
                                    id="product_types"
                                    name="product_types"
                                    value={product_types}
                                    onChange={(e) => setProductTypes(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select type</option>
                                    {types.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.type_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Category:
                                </label>
                                <select
                                    id="product_category"
                                    name="product_category"
                                    value={product_category}
                                    onChange={(e) => setProductCategory(e.target.value)}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select category</option>
                                    {cat.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4 w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Available:
                                </label>
                                <select
                                    id="product_availability"
                                    name="product_availability"
                                    value={product_availability ? '1' : '0'}
                                    onChange={(e) => setProductAvailability(e.target.value === '1')}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                        </div>

                        {isClient && (
                            <>
                                <div className="tabs tabs-lift">
                                    <input type="radio" name="my_tabs_1" className="tab" aria-label="Content"
                                           defaultChecked/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Product
                                                Name:</label>
                                            <input
                                                content={product_name}
                                                onChange={(e) => setProductName(e.target.value)}
                                                type="text"
                                                required
                                                className="border border-gray-300 rounded p-2 w-full"
                                            />

                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Product
                                                Description:</label>
                                            <TipTapEditor
                                                content={product_desc}
                                                onChange={(content) => setProductDesc(content)}
                                            />
                                        </div>
                                        <div className="mb-4 w-full">
                                            <label
                                                className="block text-gray-700 font-semibold mb-2">Product
                                                Sereves:</label>
                                            <input
                                                content={product_serves}
                                                onChange={(e) => setProductServes(e.target.value)}
                                                type="text"
                                                required
                                                className="border border-gray-300 rounded p-2 w-full"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                className="block text-gray-700 font-semibold mb-2">Product
                                                Ingredients</label>
                                            <TipTapEditor
                                                content={product_ingredients}
                                                onChange={(content) => setProductIngredients(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label
                                                className="block text-gray-700 font-semibold mb-2">Delivery</label>
                                            <TipTapEditor
                                                content={delivery}
                                                onChange={(content) => setDelivery(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Notice:</label>
                                            <input
                                                content={notice}
                                                onChange={(e) => setNotice(e.target.value)}
                                                type="text"
                                                required
                                                className="border border-gray-300 rounded p-2 w-full"
                                            />
                                        </div>
                                    </div>
                                    <input type="radio" name="my_tabs_1" className="tab" aria-label="Allergens"/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <h3 className="text-lg font-semibold mb-4">Select Allergens</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {allergens.map((allergen) => (
                                                <label key={allergen.id} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAllergens.includes(allergen.id)}
                                                        onChange={() => toggleAllergen(allergen.id)}
                                                        className="checkbox checkbox-primary"
                                                    />
                                                    <span>{allergen.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </>
                        )}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Product Variants</h3>
                            {variants.map((variant, index) => (
                                <div key={index} className="grid grid-cols-2 gap-4 mb-2 items-center">
                                    <input
                                        type="text"
                                        placeholder="Variant name (e.g. Small)"
                                        value={variant.variant_name}
                                        onChange={(e) => handleVariantChange(index, 'variant_name', e.target.value)}
                                        className="border border-gray-300 rounded p-2"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        step="0.01"
                                        value={variant.price}
                                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                        className="border border-gray-300 rounded p-2"
                                        required
                                    />
                                    {variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="text-red-500 font-semibold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addVariant}
                                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            >
                                + Add Variant
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add product
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
