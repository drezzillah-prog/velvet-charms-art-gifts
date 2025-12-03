// script.js - shared for both sites
function fetchJSON(path){
  return fetch(path).then(r=>{
    if(!r.ok) throw new Error('Failed to load '+path);
    return r.json();
  });
}

function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); }
function createEl(tag,cls,html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; }

function renderProductCard(p){
  const card=createEl('div','product-card');
  const img=createEl('img'); img.src = p.images && p.images.length ? p.images[0] : 'placeholder.png'; img.alt=p.name;
  card.appendChild(img);
  card.appendChild(createEl('h4',null,p.name));
  card.appendChild(createEl('div','price', (p.price ? (p.price + ' USD') : 'Price on request') ));
  const a=createEl('a',null,'See details'); a.href = `product.html?id=${encodeURIComponent(p.id)}`; card.appendChild(a);
  return card;
}

function renderCatalogue(data, containerId='catalogue-container'){
  const container=document.getElementById(containerId); if(!container) return;
  clear(container);
  if(!data || !Array.isArray(data.categories)){ container.appendChild(createEl('p',null,'No categories found.')); return; }
  data.categories.forEach(cat=>{
    const wrap = createEl('div','category-card');
    wrap.appendChild(createEl('h2',null,cat.name));
    if(cat.banner) { const bi=createEl('img','category-banner'); bi.src = cat.banner; bi.alt = cat.name; wrap.appendChild(bi); }
    if(Array.isArray(cat.subcategories)) {
      cat.subcategories.forEach(sub=>{
        wrap.appendChild(createEl('h3',null,sub.name));
        const grid=createEl('div','product-grid');
        if(Array.isArray(sub.products) && sub.products.length){
          sub.products.forEach(p=> grid.appendChild(renderProductCard(p)));
        } else {
          grid.appendChild(createEl('p',null,'No products in this subcategory.'));
        }
        wrap.appendChild(grid);
      });
    } else {
      wrap.appendChild(createEl('p',null,'No subcategories.'));
    }
    container.appendChild(wrap);
  });
}

function findProductById(data,id){
  if(!data || !Array.isArray(data.categories)) return null;
  for(const cat of data.categories){
    if(!cat.subcategories) continue;
    for(const sub of cat.subcategories){
      if(!sub.products) continue;
      for(const p of sub.products){
        if(p.id === id) return p;
      }
    }
  }
  return null;
}

function renderProductPage(product){
  const cont = document.getElementById('product-container'); if(!cont) return;
  clear(cont);
  cont.appendChild(createEl('h2',null,product.name));
  if(product.images && product.images.length){
    const gallery = createEl('div','product-gallery');
    product.images.forEach(src=>{
      const im = createEl('img'); im.src = src; im.alt = product.name; im.style.maxWidth='260px'; im.style.margin='8px';
      gallery.appendChild(im);
    });
    cont.appendChild(gallery);
  }
  cont.appendChild(createEl('p',null,product.description || ''));
  if(product.options){
    for(const optName in product.options){
      const opts = product.options[optName];
      const lab = createEl('label',null,optName + ': ');
      const sel = createEl('select'); sel.id = `opt-${optName}`;
      opts.forEach(o=>{ const op=document.createElement('option'); op.value=o; op.textContent=o; sel.appendChild(op); });
      cont.appendChild(lab); cont.appendChild(sel); cont.appendChild(createEl('br'));
    }
  }
  cont.appendChild(createEl('div','price', (product.price ? (product.price + ' USD') : 'Price on request') ));
  const buy = createEl('a','pay-btn','Buy via PayPal'); buy.href = product.paymentLink || '#'; buy.target='_blank'; buy.rel='noopener noreferrer';
  cont.appendChild(buy);
  cont.appendChild(createEl('div',null,`Product ID: ${product.id}`));
}

// Loader helpers
function loadCatalogue(file='catalogue.json'){ fetchJSON(file).then(data=>renderCatalogue(data)).catch(err=>{ console.error(err); const c=document.getElementById('catalogue-container'); if(c){ clear(c); c.appendChild(createEl('p',null,'Failed to load catalogue.')); } }); }
function loadProduct(file='catalogue.json'){ const params = new URLSearchParams(window.location.search); const id = params.get('id'); if(!id){ const c = document.getElementById('product-container'); if(c) c.appendChild(createEl('p',null,'No product selected.')); return; } fetchJSON(file).then(data=>{ const p = findProductById(data,id); if(!p){ const c=document.getElementById('product-container'); if(c){ clear(c); c.appendChild(createEl('p',null,'Product not found.')); } return; } renderProductPage(p); }).catch(err=>{ console.error(err); const c=document.getElementById('product-container'); if(c){ clear(c); c.appendChild(createEl('p',null,'Failed to load product.')); } }); }

// Auto-run
document.addEventListener('DOMContentLoaded', function(){
  if(document.getElementById('catalogue-container') && typeof window._catalogueLoaded === 'undefined'){ loadCatalogue('catalogue.json'); window._catalogueLoaded=true; }
});
