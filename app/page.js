import Nav from "./components/Nav";
import UsMap from "./components/UsMap";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-white">
      <Nav />
      <main className="flex flex-1 p-6" style={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
        <UsMap />
      </main>
    </div>
  );
}
