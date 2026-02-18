import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {IoLocationSharp, IoTimeOutline} from "react-icons/io5";
import { LuCake} from "react-icons/lu";
import { LiaAllergiesSolid } from "react-icons/lia";
import { FaIndent  } from "react-icons/fa";
import { MdOutlineMergeType  } from "react-icons/md";
import { TbCategoryFilled } from "react-icons/tb";
import { RiLinksLine } from "react-icons/ri";
import { VscFeedback } from "react-icons/vsc";
import { GrGallery } from "react-icons/gr";
import {TfiLayoutSlider} from "react-icons/tfi";

const menuGroups = [
    {
        title: "Sliders",
        key: "slides",
        links: [
            { href: "/admin/sliders", label: "Sliders", icon: TfiLayoutSlider }
        ],
    },
    {
        title: "Products",
        key: "products",
        links: [
            { href: "/admin/products", label: "Products", icon: LuCake},
            { href: "/admin/products-gallery", label: "Product Gallery", icon: GrGallery },
            { href: "/admin/product-category", label: "Category", icon: TbCategoryFilled},
            { href: "/admin/product-types", label: "Types", icon: MdOutlineMergeType },
        ],
    },
    {
        title: "Allergens",
        key: "allergens",
        links: [
            { href: "/admin/allergens", label: "Allergens", icon: LiaAllergiesSolid },
        ],
    },
    {
        title: "Testimonials",
        key: "testimonials",
        links: [
            { href: "/admin/testimonials", label: "Testimonials", icon: VscFeedback  },
        ],
    },
    {
        title: "Contacts",
        key: "contacts",
        links: [
            { href: "/admin/contact", label: "Contact", icon: IoLocationSharp },
            { href: "/admin/social-links", label: "Social Links", icon: RiLinksLine  },
            { href: "/admin/open-time", label: "Opening times", icon: IoTimeOutline  },
        ],
    },
    {
        title: "Orders",
        key: "orders",
        links: [
            { href: "/admin/orders", label: "Orders", icon: FaIndent  }
        ],
    },

];

const Sidebar = () => {
    const pathname = usePathname();
    const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const newOpenGroups: { [key: string]: boolean } = {};
        for (const group of menuGroups) {
            if (group.links.some((link) => pathname.startsWith(link.href))) {
                newOpenGroups[group.key] = true;
            }
        }
        setOpenGroups((prev) => ({ ...prev, ...newOpenGroups }));
    }, [pathname]);

    const toggleGroup = (key: string) => {
        setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <aside className="w-64 bg-white shadow-md h-screen fixed" aria-label="Sidebar">
            <div className="h-full px-3 py-4 overflow-y-auto space-y-4">
                <div>
                    <a
                        href="/admin"
                        className="block p-2 font-semibold text-gray-900 rounded-lg hover:bg-gray-100"
                    >
                        Dashboard
                    </a>
                </div>

                {menuGroups.map((group) => (
                    <div key={group.key}>
                        <button
                            onClick={() => toggleGroup(group.key)}
                            className="w-full text-left px-2 py-2 text-sm font-bold text-gray-600 uppercase hover:bg-gray-100 rounded"
                        >
                            {group.title}
                        </button>

                        {openGroups[group.key] && (
                            <ul className="mt-1 space-y-1 ml-2">
                                {group.links.map(({ href, label, icon: Icon }) => (
                                    <li
                                        key={href}
                                        className={`flex items-center p-2 rounded-md font-medium ${
                                            isActive(href) ? "bg text-white" : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <Icon className={`size-5 ${isActive(href) ? "text-white" : "text-gray-500"}`} />
                                        <a href={href} className="ml-3 w-full block">
                                            {label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
