export default function ProductTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-sm border border-black/10 bg-lilac/20 px-2.5 py-1 text-xs text-[#2b2622]/70"
        >
          #{tag.replace(/\s+/g, "")}
        </span>
      ))}
    </div>
  );
}
