export default function Footer() {
  return (
    <footer className="border-t border-[#111] py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <span className="font-bold text-white tracking-tight">Sportfolio</span>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#444] hover:text-white text-sm transition-colors">
              Privacy
            </a>
            <a href="#" className="text-[#444] hover:text-white text-sm transition-colors">
              Terms
            </a>
          </div>
        </div>
        <p className="text-[#333] text-sm text-center sm:text-left">© 2025 Sportfolio</p>
      </div>
    </footer>
  );
}
