'use client';

const links = [
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'About', href: '#' },
];

export function Navbar() {
  return (
    <header className="shrink-0 w-full border-b border-gray-200 bg-white">
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <span className="text-lg font-bold text-gray-900 tracking-tight">YourBrand</span>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <button className="h-8 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Sign In
            </button>
            <button className="h-8 rounded-md bg-indigo-500 px-3 text-sm font-medium text-white hover:bg-indigo-600 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
