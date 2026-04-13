interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-slate-500">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-white transition">
              {item.label}
            </a>
          ) : (
            <span className="text-slate-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
