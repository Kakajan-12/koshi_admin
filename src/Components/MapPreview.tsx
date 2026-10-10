import { mapEmbedSrc } from "@/lib/html";

// Превью карты из кода встраивания. Показываем так же, как сайт (koshi_frontend/src/components/MapEmbed.tsx):
// только iframe Google Maps — если код другой, сайт карту не покажет, и админ сразу видит почему.
export default function MapPreview({ html }: { html?: string | null }) {
    const src = mapEmbedSrc(html);
    if (!src) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center text-sm text-slate-500">
                {html?.trim() ? (
                    <>
                        <p className="font-medium text-amber-700">This isn&apos;t a Google Maps embed code</p>
                        <p>The website will not show it. In Google Maps open Share → Embed a map and copy the HTML.</p>
                    </>
                ) : (
                    <p>No map added yet.</p>
                )}
            </div>
        );
    }
    return (
        <iframe
            src={src}
            title="Map preview"
            className="h-full w-full"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
    );
}
