import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-[#222224] text-[#FFFFFF] shadow-xl border-b border-[#808081]/30">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-semibold hover:text-[#F8604A] transition duration-200"
        >
          Quanta Monitor
        </Link>
        <nav className="space-x-4">
          <Link
            to="/"
            className="text-[#808081] hover:text-[#F8604A] font-medium transition duration-200"
          >
            Dashboard
          </Link>
          <Link
            to="/settings"
            className="text-[#808081] hover:text-[#F8604A] font-medium transition duration-200"
          >
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
