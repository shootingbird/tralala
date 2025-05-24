import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
    name: string;
    image_url: string;
    slug: string;
    className?: string;
    id: string;
}

export const CategoryCard = ({ name, image_url, slug, className = '', id }: CategoryCardProps) => {
    console.log("Slug: ", slug)
 
    return (
        <Link href={'/products/category/' + id} className={`flex flex-col  items-center justify-center relative ${className}`}>
            <div className="relative w-[10rem] h-[10rem] overflow-hidden aspect-square rounded-full border border-[#00000020] mb-3">
                <Image
                    src={image_url}
                    alt={name}
                    width={500}
                    height={500}
                    className="object-cover transition-transform  aspect-square duration-300 group-hover:scale-110"
                />
            </div>
            <h3 className="text-sm font-medium line-clamp-1">{name}</h3>
        </Link>
    );
};