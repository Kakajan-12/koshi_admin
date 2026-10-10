import React from "react";
import {
    FaFacebook,
    FaInstagram,
    FaLink,
    FaLinkedin,
    FaTelegram,
    FaTiktok,
    FaWhatsapp,
    FaXTwitter,
} from "react-icons/fa6";

// Значения совпадают с тем, что ожидает футер сайта
export const SOCIAL_PLATFORMS = [
    { value: "facebook", label: "Facebook", Icon: FaFacebook },
    { value: "instagram", label: "Instagram", Icon: FaInstagram },
    { value: "twitter", label: "X (Twitter)", Icon: FaXTwitter },
    { value: "linkedin", label: "LinkedIn", Icon: FaLinkedin },
    { value: "tiktok", label: "TikTok", Icon: FaTiktok },
    { value: "telegram", label: "Telegram", Icon: FaTelegram },
    { value: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp },
];

export const platformLabel = (value: string) =>
    SOCIAL_PLATFORMS.find((p) => p.value === value?.toLowerCase())?.label ?? value;

export default function SocialIcon({ name, className = "size-5" }: { name: string; className?: string }) {
    const Icon = SOCIAL_PLATFORMS.find((p) => p.value === name?.toLowerCase())?.Icon ?? FaLink;
    return <Icon className={className} aria-hidden />;
}
