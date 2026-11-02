import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container notfound">
      <span className="kicker">404 · Out of bounds</span>
      <h1 className="display display-xl">
        Wrong <span className="text-outline">field</span>
      </h1>
      <p className="lede">That page isn&apos;t part of the playbook.</p>
      <Link href="/" className="btn btn--primary">
        <span>Back to home</span>
      </Link>
    </section>
  );
}
