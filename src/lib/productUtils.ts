import { Product as ApiProduct } from "@/types/product";
import { NormalizedProduct } from "@/types/product";

// ---------- Normalizer for API response ----------
export const normalizeProduct = (raw: ApiProduct): NormalizedProduct => {
  const variations = (raw.variations || []).map((v) => ({
    id: String(v.id ?? Math.random()),
    variation: String(v.variation ?? ""),
    price: Number(v.price ?? 0),
    quantity: Number(v.quantity ?? 0),
    variationQuantityInCart: 0,
  }));

  const normalizeSpecs = (
    specs: Record<string, unknown> | undefined
  ): { key: string; value: string }[] => {
    if (!specs) return [];

    const normalizeKey = (k: string) =>
      k.trim().toLowerCase().replace(/\s+/g, "_");

    const normalizeValue = (v: unknown) => {
      if (v == null) return "";
      if (Array.isArray(v)) return v.join(", ");
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    };

    // object of key -> value
    if (typeof specs === "object" && !Array.isArray(specs)) {
      return Object.entries(specs).map(([k, v]) => ({
        key: normalizeKey(k),
        value: normalizeValue(v),
      }));
    }

    // array (could be array of strings or array of objects)
    if (Array.isArray(specs)) {
      return specs.flatMap((item) => {
        if (typeof item === "string") {
          const m = item.match(/^([^:;]+)[:;]\s*(.*)$/);
          if (m) {
            return [
              {
                key: normalizeKey(m[1]),
                value: m[2].trim(),
              },
            ];
          }
          // string without separator -> put it as value with empty key
          return [
            {
              key: "",
              value: item.trim(),
            },
          ];
        }

        if (typeof item === "object" && item !== null) {
          return Object.entries(item).map(([k, v]) => ({
            key: normalizeKey(k),
            value: normalizeValue(v),
          }));
        }

        // fallback primitive
        return [
          {
            key: "",
            value: String(item),
          },
        ];
      });
    }

    // fallback: single primitive value
    return [
      {
        key: "",
        value: String(specs),
      },
    ];
  };

  console.log(raw);

  return {
    productId: String(raw.productId ?? ""),
    name: raw.name ?? raw.title ?? "",
    title: raw.title ?? "",
    brand: "", // API doesn't have brand field
    price: Number(raw.price ?? raw.effective_price ?? 0),
    is_variable_product: !!raw.is_variable_product,
    rating: raw.rating ?? 0,
    image: (raw.image_urls?.[0] || raw.images?.[0]) ?? "",
    images: raw.image_urls ?? raw.images ?? [],
    image_urls: raw.image_urls ?? raw.images ?? [],
    dateCreated: raw.created_at,
    dateUpdated: raw.updated_at,
    stock: Number(raw.stock_quantity ?? 0),
    review_count: Number(raw.review_count ?? 0),
    category: raw.category ?? "",
    totalSold: Number(raw.total_sold ?? 0),
    specifications: normalizeSpecs(raw.specifications),
    highlights: raw.highlights ?? [],
    whats_in_box: raw.whats_in_box ?? [],
    description: raw.description ?? "",
    discount: raw.discount_price
      ? { amount: raw.discount_price, percentage: 0 }
      : undefined, // approximate
    variations,
    stock_quantity: Number(raw.stock_quantity ?? 0),
  };
};
