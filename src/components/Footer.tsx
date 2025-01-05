import Link from "next/link";

export function Footer() {
  return (
    <footer className="h-[10vh] w-full flex items-center justify-center py-4">
      <span className="text-sm text-[#383838]">
        developed by{" "}
        <Link
          href="https://github.com/restlucas"
          target="_blank"
          className="font-bold cursor-pointer duration-100 hover:underline hover:text-white"
        >
          restlucas
        </Link>
      </span>
    </footer>
  );
}
