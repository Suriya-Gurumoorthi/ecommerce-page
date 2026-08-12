import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-store-bg text-store-text">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
