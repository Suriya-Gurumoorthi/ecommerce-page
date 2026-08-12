"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FileUpload } from "@/components/admin/FileUpload";
import { PRODUCT_CATEGORIES } from "@/lib/categories";
import { CreateProductSchema } from "@/lib/validations/schemas";
import { slugify } from "@/lib/utils";
import type { Product } from "@/types";

const MarkdownEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(product?.short_description ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(product?.category ?? PRODUCT_CATEGORIES[0]);
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [compareAtPrice, setCompareAtPrice] = useState(String(product?.compare_at_price ?? ""));
  const [stockQuantity, setStockQuantity] = useState(String(product?.stock_quantity ?? -1));
  const [status, setStatus] = useState(product?.status ?? "draft");
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.image_urls?.length ? product.image_urls : product?.image_url ? [product.image_url] : []
  );
  const [filePaths, setFilePaths] = useState<string[]>(
    product?.file_paths?.length ? product.file_paths : product?.file_path ? [product.file_path] : []
  );
  const [error, setError] = useState("");
  const discount = useMemo(() => {
    const priceNumber = Number(price);
    const compareNumber = Number(compareAtPrice);
    return compareNumber > priceNumber ? Math.round(((compareNumber - priceNumber) / compareNumber) * 100) : 0;
  }, [compareAtPrice, price]);

  async function save(publish: boolean) {
    const payload = {
      slug,
      title,
      description,
      short_description: shortDescription,
      price: Number(price),
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
      category,
      tags: [],
      image_urls: imageUrls,
      file_paths: filePaths,
      stock_quantity: Number(stockQuantity),
      status: publish ? "active" : status,
      metadata: {}
    };
    const parsed = CreateProductSchema.safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid product details.");
      return;
    }

    const response = await fetch(product ? `/api/products/${product.id}` : "/api/products", {
      method: product ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message || body?.error || `Unable to save product (${response.status}).`);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Title<input className="mt-1 w-full rounded-lg border px-3 py-2" value={title} onChange={(event) => { setTitle(event.target.value); if (!product) setSlug(slugify(event.target.value)); }} /></label>
        <label className="text-sm">Slug<input className="mt-1 w-full rounded-lg border px-3 py-2" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} /></label>
      </div>
      <label className="block text-sm">Short description<input maxLength={160} className="mt-1 w-full rounded-lg border px-3 py-2" value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} /><span className="text-xs text-gray-500">{shortDescription.length}/160</span></label>
      <div data-color-mode="light"><MarkdownEditor value={description} onChange={(value) => setDescription(value ?? "")} /></div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="text-sm">
          Category
          <select className="mt-1 w-full rounded-lg border px-3 py-2" value={category} onChange={(event) => setCategory(event.target.value)}>
            {PRODUCT_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Selling price (₹)
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={price} onChange={(event) => setPrice(event.target.value)} />
          <span className="text-xs text-gray-500">What the customer actually pays.</span>
        </label>
        <label className="text-sm">
          Original price (₹) — optional
          <input className="mt-1 w-full rounded-lg border px-3 py-2" value={compareAtPrice} onChange={(event) => setCompareAtPrice(event.target.value)} />
          <span className="text-xs text-gray-500">Old/MRP price shown crossed out, to display a discount. Leave blank if there&apos;s no discount.</span>
        </label>
        <label className="text-sm">Stock<input className="mt-1 w-full rounded-lg border px-3 py-2" value={stockQuantity} onChange={(event) => setStockQuantity(event.target.value)} /></label>
      </div>
      <p className="text-sm text-gray-500">Discount shown to customers: {discount}%</p>
      <div className="grid gap-4 md:grid-cols-2">
        <FileUpload
          bucket="product-images"
          pathPrefix="images"
          values={imageUrls}
          onChange={setImageUrls}
          returnPublicUrl
          previewImages
          accept="image/*"
          label="Cover images"
          helpText="Public — shown to everyone on the storefront. The first image is used as the cover."
        />
        <FileUpload
          bucket="digital-products"
          pathPrefix="files"
          values={filePaths}
          onChange={setFilePaths}
          accept="application/pdf"
          label="PDF files"
          helpText="Private — only visible to customers who have paid. Add multiple PDFs for a combo offer."
        />
      </div>
      <select className="rounded-lg border px-3 py-2" value={status} onChange={(event) => setStatus(event.target.value as Product["status"])}>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="archived">Archived</option>
      </select>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-3">
        <button onClick={() => void save(false)} className="rounded-lg border px-4 py-2">Save draft</button>
        <button onClick={() => void save(true)} className="rounded-lg bg-admin-accent px-4 py-2 text-white">Publish</button>
      </div>
    </div>
  );
}
