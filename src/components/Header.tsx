import Link from "next/link";

export function Header() {
  return (
    <header className="h-[10vh] w-full flex items-center justify-center py-4">
      <Link href="/" className="text-2xl font-semibold hover:underline">
        tubeify
      </Link>
    </header>
  );
}
