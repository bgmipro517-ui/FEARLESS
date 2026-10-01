const products = [
  { name: 'Fearless Pro Headphones', price: '₹4,999', icon: '🎧' },
  { name: 'Crystal Smart Watch', price: '₹6,499', icon: '⌚' },
  { name: 'Ultra Gaming Controller', price: '₹3,299', icon: '🎮' },
];

export default function Home() {
  return (
    <main>
      <div className="aurora auroraOne" /><div className="aurora auroraTwo" />
      <nav className="glass nav">
        <a className="brand" href="#"><span className="brandOrb">F</span><span>FEARLESS <b>SHOPS</b></span></a>
        <div className="links"><a href="#products">Shop</a><a href="#features">Features</a><a href="#products">Offers</a><a href="/admin">Admin</a></div>
        <div className="actions"><button className="iconButton" aria-label="Search">⌕</button><button className="glassButton">Cart <span>0</span></button></div>
      </nav>

      <section className="hero">
        <div className="heroCopy">
          <div className="pill">✦ FUTURE OF SHOPPING</div>
          <h1>Shopping, made<br/><span>fearlessly beautiful.</span></h1>
          <p>Discover premium products through a crystal-clear shopping experience built around trust, speed and privacy.</p>
          <div className="heroActions"><a className="primary" href="#products">Explore Store <span>→</span></a><a className="glassButton large" href="#products">View Deals</a></div>
          <div className="trust"><span>✓ Secure checkout</span><span>✓ Privacy first</span><span>✓ Easy returns</span></div>
        </div>
        <div className="crystalStage">
          <div className="ring ring1"/><div className="ring ring2"/>
          <div className="crystal"><span>F</span></div>
          <div className="floating glass floatOne"><small>SECURE</small><strong>Protected Payments</strong></div>
          <div className="floating glass floatTwo"><small>PREMIUM</small><strong>Crystal Clear UI</strong></div>
        </div>
      </section>

      <section id="features" className="featureGrid">
        <article className="glass feature"><span>◈</span><div><strong>Trusted Shopping</strong><p>Designed around security and transparency.</p></div></article>
        <article className="glass feature"><span>⚡</span><div><strong>Fast Experience</strong><p>Responsive from mobile to desktop.</p></div></article>
        <article className="glass feature"><span>✦</span><div><strong>Premium Products</strong><p>Beautiful discovery and product experiences.</p></div></article>
      </section>

      <section id="products" className="products"><div className="sectionHead"><div><small>CURATED FOR YOU</small><h2>Featured products</h2></div><a className="glassButton" href="#products">View all →</a></div>
        <div className="productGrid">{products.map((product) => <article className="glass product" key={product.name}><div className="productVisual"><span>{product.icon}</span><button aria-label={`Add ${product.name} to wishlist`}>♡</button></div><div className="productInfo"><small>FEARLESS SELECT</small><h3>{product.name}</h3><div><strong>{product.price}</strong><button className="addButton">Add +</button></div></div></article>)}</div>
      </section>
    </main>
  );
}
