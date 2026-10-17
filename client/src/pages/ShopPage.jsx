import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api";
import ProductCard from "../components/ProductCard";

const sorts = [
  ["newest", "Newest"],
  ["price_asc", "Price, low to high"],
  ["price_desc", "Price, high to low"],
  ["name", "Name"],
];

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ data: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = params.get("category") || "all";
  const sort = params.get("sort") || "newest";
  const q = params.get("q") || "";
  const page = Number(params.get("page") || 1);

  useEffect(() => {
    document.title = "Shop · Agro Plantation";
    api.get("/product/categories").then((response) => setCategories(response.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/product/viewAll", { params: { paged: 1, limit: 12, page, sort, category, search: q } })
      .then((response) => setResult(response.data))
      .catch(() => setError("The catalogue could not be loaded."))
      .finally(() => setLoading(false));
  }, [category, sort, q, page]);

  function update(next) {
    const merged = { category, sort, q, page: 1, ...next };
    const query = {};
    if (merged.category && merged.category !== "all") query.category = merged.category;
    if (merged.sort && merged.sort !== "newest") query.sort = merged.sort;
    if (merged.q) query.q = merged.q;
    if (merged.page > 1) query.page = String(merged.page);
    setParams(query);
    setFiltersOpen(false);
  }

  return (
    <div className="page">
      <header className="page-hero">
        <p className="eyebrow">Catalogue</p>
        <h1>{q ? `Results for “${q}”` : category === "all" ? "The whole nursery" : category}</h1>
        <p>{result.total} plants and pots currently listed.</p>
      </header>
      <div className="shop">
        <aside className={filtersOpen ? "filters open" : "filters"}>
          <h2>Categories</h2>
          <button type="button" className={category === "all" ? "chip on" : "chip"} onClick={() => update({ category: "all" })}>
            All
          </button>
          {categories.map((item) => (
            <button
              type="button"
              key={item.name}
              className={category === item.name ? "chip on" : "chip"}
              onClick={() => update({ category: item.name })}
            >
              <span className="chip-name">{item.name}</span>
              <span>{item.count}</span>
            </button>
          ))}
        </aside>
        <div className="shop-main">
          <div className="shop-bar">
            <button type="button" className="btn ghost filter-toggle" onClick={() => setFiltersOpen((open) => !open)}>
              {filtersOpen ? "Hide filters" : "Filters"}
            </button>
            <label>
              Sort
              <select value={sort} onChange={(event) => update({ sort: event.target.value })}>
                {sorts.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          {loading ? (
            <div className="grid">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="skeleton" />)}</div>
          ) : result.data?.length ? (
            <div className="grid">{result.data.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          ) : (
            <div className="empty">
              <h2>Nothing matches that search.</h2>
              <p>Try another plant name, or clear the category filter.</p>
              <button type="button" className="btn" onClick={() => update({ category: "all", q: "" })}>
                Clear filters
              </button>
            </div>
          )}
          {result.pages > 1 && (
            <div className="pager">
              <button type="button" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>
                Previous
              </button>
              <span>
                Page {result.page} of {result.pages}
              </span>
              <button type="button" disabled={page >= result.pages} onClick={() => update({ page: page + 1 })}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
