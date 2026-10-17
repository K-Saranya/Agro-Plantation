import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { mediaUrl } from "../api";
import ProductCard from "../components/ProductCard";

const notes = [
  ["Nursery direct", "Plants leave our benches, not a warehouse shelf."],
  ["Packed to travel", "Moisture wrap, sturdy cartons, and a care card."],
  ["Honest stock", "If a pot is down to the last one, the page says so."],
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Agro Plantation";
    Promise.all([api.get("/product/viewAll"), api.get("/testimonial/viewAll")])
      .then(([productRes, storyRes]) => {
        setProducts(Array.isArray(productRes.data) ? productRes.data : []);
        setStories(Array.isArray(storyRes.data) ? storyRes.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sale = products.filter((product) => product.salePrice && product.salePrice < product.price).slice(0, 4);
  const best = products.slice(0, 8);
  const story = stories[0];

  return (
    <div>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Nursery · since the first bench</p>
          <h1>Plants chosen the way a grower would choose them.</h1>
          <p>
            Indoor greens, patio trees, ceramic pots, and ready-made bundles. Shop the live catalogue, save a wishlist,
            and check out with a real order.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/shop">
              Shop the nursery
            </Link>
            <Link className="btn ghost" to="/about">
              How we grow
            </Link>
          </div>
        </div>
        <div className="hero-frame">
          <img src={mediaUrl("/media/banner-5.jpg")} alt="Sunlit greenhouse foliage" />
          <div className="hero-card">
            <img src={mediaUrl("/media/pro-47.jpg")} alt="" />
            <div>
              <strong>Spider Plant</strong>
              <span>Air purifying · in stock</span>
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        {notes.map(([title, text]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">On the bench</p>
            <h2>Sale plants, priced while they last.</h2>
          </div>
          <Link to="/shop?sort=price_asc">View the shop</Link>
        </div>
        {loading ? (
          <div className="grid">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="skeleton" />)}</div>
        ) : (
          <div className="grid">{sale.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        )}
      </section>

      <section className="split">
        <img src={mediaUrl("/media/green-field-with-sun.jpg")} alt="Morning light over the growing field" />
        <div>
          <p className="eyebrow">Tropical corner</p>
          <h2>A room changes when one plant is the right size.</h2>
          <p>
            We group the catalogue the way the old shop did: air purifiers, cafe plants, house plants, succulents,
            ceramic pots, and the grower brands Botanic, Flora, Freshy, Frienly, and Natural.
          </p>
          <Link className="btn" to="/shop?category=House%20Plants">
            Browse house plants
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Best of the benches</p>
            <h2>What people take home first.</h2>
          </div>
        </div>
        <div className="grid">
          {best.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="promo-pair">
        <Link to="/shop?category=Succulents" style={{ backgroundImage: `url(${mediaUrl("/media/pro-8-600x744.jpg")})` }}>
          <span>Succulents</span>
          <strong>Small plants, long lives.</strong>
        </Link>
        <Link to="/shop?category=Ceramic%20Pots" style={{ backgroundImage: `url(${mediaUrl("/media/pro-23.jpg")})` }}>
          <span>Ceramic pots</span>
          <strong>Clay, sized for the plant.</strong>
        </Link>
      </section>

      {story && (
        <section className="quote">
          <img src={mediaUrl(story.img)} alt="" />
          <blockquote>
            <p>“{story.content}”</p>
            <footer>{story.name}</footer>
          </blockquote>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">From the glasshouse</p>
            <h2>A look around the nursery.</h2>
          </div>
        </div>
        <div className="insta">
          {["ins.jpg", "ins-2.jpg", "ins-3.jpg", "ins-4.jpg", "ins-5.jpg", "ins-6.jpg", "ins-7.jpg", "ins-8.jpg"].map((file) => (
            <img key={file} src={mediaUrl(`/media/${file}`)} alt="Plant from the Agro nursery" />
          ))}
        </div>
      </section>
    </div>
  );
}
