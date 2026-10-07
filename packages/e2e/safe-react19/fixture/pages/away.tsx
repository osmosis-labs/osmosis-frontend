import Link from "next/link";

export default function Away() {
  return (
    <main>
      <h1>Fixture away</h1>
      <Link href="/" prefetch={false}>
        Return to smoke page
      </Link>
    </main>
  );
}
