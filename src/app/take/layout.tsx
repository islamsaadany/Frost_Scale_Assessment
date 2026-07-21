import { BrandMark } from "@/components/BrandMark";

export default function TakeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-safe mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-8">
      <header className="mb-8">
        <BrandMark compact />
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
