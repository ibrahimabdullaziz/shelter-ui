import type { ReactNode } from "react";

interface AuthFormLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthFormLayout({
  eyebrow,
  title,
  description,
  children,
}: AuthFormLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <a className="auth-brand" href="/" aria-label="Shelter home">
          shelter<span>.</span>
        </a>
        <p className="auth-eyebrow">{eyebrow}</p>
        <h1 id="auth-title">{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
      </section>
      <aside className="auth-aside" aria-label="Shelter">
        <div className="auth-aside-copy">
          <span>STAY A LITTLE CLOSER</span>
          <p>Find a place that feels like yours.</p>
        </div>
      </aside>
    </main>
  );
}