import Image from "next/image";
import Link from "next/link";

interface CategoryCardProps {
  name: string;
  image_url: string;
  slug: string;
  className?: string;
  id: string;
}

export const CategoryCard = ({
  name,
  image_url,
  slug,
  className = "",
  id,
}: CategoryCardProps) => {
  return (
    <Link
      href={`/products?per_page=24&page=1&category=${id}`}
      className={`flex  flex-col items-center justify-center relative  ${className}`}
    >
      <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden mb-3 bg-[#F5F5F5]">
        <Image
          src={image_url}
          alt={name}
          fill
          className="w-full object-cover items-center transition-transform duration-300 hover:scale-105"
        />
      </div>
      <h3 className="text-xs text-center font-medium line-clamp-1 text-gray-800">
        {name}
      </h3>
    </Link>
  );
};
