import { Link } from "react-router-dom";
import { useEffect } from "react";
import { mediaUrl } from "../api";

const kinds = [
  ["House plants", "The everyday collection for rooms that need a living edge."],
  ["Air purifying", "Spider plants, lilies, and palms chosen for still indoor air."],
  ["Succulents", "Rosettes and aloes that prefer a bright sill and a light hand."],
  ["Outdoor", "Pines and cypress for entrances, terraces, and long afternoons."],
];

export default function AboutPage() {
  useEffect(() => {
    document.title = "About · Agro Plantation";
  }, []);

  return (
    <div>
      <header className="page-hero wide" style={{ backgroundImage: `linear-gradient(rgba(20,34,27,.45), rgba(20,34,27,.45)), url(${mediaUrl("/media/bg-breadcrumb.jpg")})` }}>
        <p className="eyebrow light">The nursery</p>
        <h1>Grown on the bench, sold without the theatre.</h1>
      </header>
      <section className="section prose">
        <p>
          Agro Plantation started as a college nursery catalogue and is now a full shop: live stock, accounts,
          wishlists, and orders that actually reserve a plant. The categories are the ones the original shop used,
          from cafe plants and ceramic pots to the grower lines Botanic, Flora, Freshy, Frienly, and Natural.
        </p>
      </section>
      <section className="kind-grid">
        {kinds.map(([title, text]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className="brand-row">
        {["brand.jpg", "brand-2.jpg", "brand-3.jpg", "brand-4.jpg"].map((file) => (
          <img key={file} src={mediaUrl(`/media/${file}`)} alt="Grower brand" />
        ))}
      </section>
      <section className="section center">
        <h2>Come and see a plant before it is packed.</h2>
        <p>Sivakasi, Tamil Nadu · 8:00am to 10:00pm, Sunday closed.</p>
        <Link className="btn" to="/contact">Get in touch</Link>
      </section>
    </div>
  );
}
