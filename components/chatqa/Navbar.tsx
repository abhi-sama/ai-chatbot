'use client';

import { Button } from '@/components/ui/button';

const links = [
  { label: 'Features', href: '#' },
  { label: 'Pricing', href: '#' },
  { label: 'About', href: '#' },
];

export function Navbar() {
  return (
    <header className="shrink-0 w-full border-b border-chatqa-border bg-chatqa-bg/95 backdrop-blur-lg supports-[backdrop-filter]:bg-chatqa-bg/50">
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
        <span className="text-lg font-bold text-chatqa-text tracking-tight">YourBrand</span>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-chatqa-text-secondary hover:text-chatqa-text hover:bg-chatqa-surface transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <Button variant="outline" className="h-8 border-chatqa-border text-chatqa-text-secondary hover:text-chatqa-text text-sm">
              Sign In
            </Button>
            <Button className="h-8 bg-chatqa-accent text-white hover:bg-chatqa-accent-hover text-sm">
              Get Started
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
