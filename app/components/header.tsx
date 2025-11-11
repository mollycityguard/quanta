import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-[#0F0F11] text-[#FFFFFF] shadow-none border-b border-solid border-[#9a9a9b]/50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="hover:opacity-85 transition duration-200">
          <img
            src="/logo.svg"
            alt="Quanta Monitor Logo"
            className="h-8 w-auto"
          />
        </Link>
        <nav className="space-x-4">
          <Link
            to="/"
            className="text-[#9a9a9b] hover:brightness-125 font-medium transition duration-200 px-2 py-1 rounded-md"
          >
            Dashboard
          </Link>
          <Link
            to="/settings"
            className="text-[#9a9a9b] hover:brightness-125 font-medium transition duration-200 px-2 py-1 rounded-md"
          >
            Notification Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
