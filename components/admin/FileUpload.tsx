"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Turn a stored value (public URL or storage path) into a readable filename.
 *  Uploaded objects are stored as `${prefix}/${uuid}-${originalName}`, so we
 *  strip the directory and the 36-char UUID + hyphen prefix when present. */
function displayName(value: string) {
  const lastSegment = value.split("/").pop() ?? value;
  const decoded = (() => {
    try {
      return decodeURIComponent(lastSegment);
    } catch {
      return lastSegment;
    }
  })();
  return decoded.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, "");
}

export function FileUpload({
  bucket,
  pathPrefix,
  values,
  onChange,
  returnPublicUrl,
  previewImages,
  accept,
  label,
  helpText
}: {
  bucket: string;
  pathPrefix: string;
  values: string[];
  onChange: (values: string[]) => void;
  returnPublicUrl?: boolean;
  previewImages?: boolean;
  accept?: string;
  label?: string;
  helpText?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFiles(files: FileList) {
    setUploading(true);
    setError("");
    const client = createClient();
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const path = `${pathPrefix}/${crypto.randomUUID()}-${file.name}`;
      const { error: uploadError } = await client.storage.from(bucket).upload(path, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message || "Upload failed. Please try again.");
        break;
      }

      uploaded.push(returnPublicUrl ? client.storage.from(bucket).getPublicUrl(path).data.publicUrl : path);
    }

    if (uploaded.length) {
      onChange([...values, ...uploaded]);
    }

    setUploading(false);
  }

  function remove(index: number) {
    onChange(values.filter((_, position) => position !== index));
  }

  return (
    <div>
      {label ? <p className="mb-1 text-sm font-medium text-gray-700">{label}</p> : null}

      {values.length ? (
        <ul className="mb-3 space-y-2">
          {values.map((value, index) => (
            <li key={`${value}-${index}`} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
              {previewImages ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={value} alt="" className="h-10 w-10 flex-none rounded object-cover" />
              ) : (
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded bg-red-50 text-xs font-semibold text-red-600">PDF</span>
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{displayName(value)}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="flex-none rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <label className="block rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-sm text-gray-600">
        <input
          className="hidden"
          type="file"
          accept={accept}
          multiple
          onChange={(event) => {
            if (event.target.files?.length) {
              void uploadFiles(event.target.files);
            }
            event.target.value = "";
          }}
        />
        {uploading ? "Uploading..." : values.length ? "Add more files" : "Drop or choose files"}
      </label>

      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      {helpText && !error ? <p className="mt-1 text-xs text-gray-500">{helpText}</p> : null}
    </div>
  );
}
