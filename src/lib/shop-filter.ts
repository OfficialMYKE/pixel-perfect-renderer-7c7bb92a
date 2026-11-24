import type { Product } from "./products";

export type ShopSort = "featured" | "price-asc" | "price-desc";
export interface ArchiveFilters {
  query: string;
  category: string;
  favoritesOnly: boolean;
  favorites: string[];
  sort: ShopSort;
  /** Selected sizes; a product matches if it offers any of them. Empty = all sizes. */
  sizes?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
}

export function filterArchive(items: Product[], options: ArchiveFilters): Product[] {
  const query = options.query.trim().toLocaleLowerCase();
  const sizes = (options.sizes ?? []).map((s) => s.toLowerCase());
  const min = options.minPrice ?? null;
  const max = options.maxPrice ?? null;
  const result = items.filter((product) =>
    (options.category === "all" || product.category === options.category) &&
    (!options.favoritesOnly || options.favorites.includes(product.slug)) &&
    (sizes.length === 0 || product.sizes.some((s) => sizes.includes(s.toLowerCase()))) &&
    (min === null || product.price >= min) &&
    (max === null || product.price <= max) &&
    (!query || [product.name.en, product.name.es, product.brand, product.sub, product.category]
      .join(" ").toLocaleLowerCase().includes(query)));
  if (options.sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (options.sort === "price-desc") result.sort((a, b) => b.price - a.price);
  return result;
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
/** Every size offered in the catalog: letter sizes first in wearing order, then waist numbers, then the rest. */
export function availableSizes(items: Product[]): string[] {
  const all = [...new Set(items.flatMap((p) => p.sizes))];
  const rank = (s: string) => {
    const i = SIZE_ORDER.indexOf(s.toUpperCase());
    if (i >= 0) return i;
    const n = Number(s);
    return Number.isFinite(n) ? 100 + n : 1000;
  };
  return all.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}
