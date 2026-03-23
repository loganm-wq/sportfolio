import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-white text-lg tracking-tight">
          Sportfolio
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-[#888] hover:text-white text-sm transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-[#888] hover:text-white text-sm transition-colors">
            Pricing
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm text-[#888] hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-lime-400 text-black px-4 py-2 rounded-lg hover:bg-lime-300 transition-colors"
          >
            Get started
          </Link>
        </div>
      </div>
    </nav>
  );
}
