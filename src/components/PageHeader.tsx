interface PageHeaderProps {
  kicker: string;
  title: string;
  lead?: string;
}

/** Judul halaman yang seragam untuk seluruh laman publik. */
export default function PageHeader({ kicker, title, lead }: PageHeaderProps) {
  return (
    <header className="border-b border-forest-900/10 pb-8">
      <p className="kicker">{kicker}</p>
      <h1 className="page-title mt-3">{title}</h1>
      {lead && <p className="page-lead mt-4">{lead}</p>}
    </header>
  );
}
