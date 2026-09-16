export type GenerationLike = {
  id: string;
  prompt: string;
  image_url: string;
  model: string;
  aspect_ratio: string;
};

export default function GenerationCard({ generation }: { generation: GenerationLike }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface animate-fade-up">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={generation.image_url}
        alt={generation.prompt}
        loading="lazy"
        className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/0 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <p className="line-clamp-3 p-3 text-xs font-medium text-white/90">
          {generation.prompt}
        </p>
      </div>
    </div>
  );
}
