export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-6 md:grid-cols-2">
        <label className="text-sm">Merchant name<input className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue="Storefront" /></label>
        <label className="text-sm">Notification email<input className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue="merchant@yourdomain.com" /></label>
        <label className="text-sm">Low stock threshold<input className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue="5" /></label>
        <label className="text-sm">Download expiry days<input className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue="7" /></label>
        <label className="text-sm">Max downloads per purchase<input className="mt-1 w-full rounded-lg border px-3 py-2" defaultValue="5" /></label>
      </div>
    </div>
  );
}
