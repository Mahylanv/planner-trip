import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="offline-page">
      <section>
        <p className="eyebrow">Mode hors ligne</p>
        <h1>Amsud Planner</h1>
        <p>La connexion est indisponible. Les donnees deja ouvertes restent accessibles si elles ont ete mises en cache.</p>
        <Link className="button primary" href="/">
          Revenir au voyage
        </Link>
      </section>
    </main>
  );
}
