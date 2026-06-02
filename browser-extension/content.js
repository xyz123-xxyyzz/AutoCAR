// AutoCAR Çoklu Platform Veri Çekme Motoru (Scraper)
function extractCarData() {
  const url = window.location.href;
  
  // Çekilecek saf veri iskeleti
  let data = {
    url: url,
    title: '',
    price: '',
    description: '',
    specs: {},
    images: [],
    platform: ''
  };

  try {
    if (url.includes('sahibinden.com')) {
      data.platform = 'Sahibinden';
      const titleEl = document.querySelector('.classifiedDetailTitle h1');
      if (titleEl) data.title = titleEl.innerText.trim();

      const priceEl = document.querySelector('.classifiedInfo h3');
      if (priceEl) data.price = priceEl.innerText.trim();
      
      const descEl = document.querySelector('#classifiedDescription');
      if (descEl) data.description = descEl.innerText.trim();
      
      const specEls = document.querySelectorAll('.classifiedInfoList li');
      specEls.forEach(li => {
        const keyEl = li.querySelector('strong');
        const valEl = li.querySelector('span');
        if (keyEl && valEl) {
          const key = keyEl.innerText.replace(':', '').trim();
          data.specs[key] = valEl.innerText.trim();
        }
      });

      // Ayrıca "Donanım" ve "Teknik Özellikler" sekmelerini (varsa) topla
      const propertyEls = document.querySelectorAll('#classifiedProperties ul li.selected');
      if (propertyEls.length > 0) {
        let donanimListesi = [];
        propertyEls.forEach(li => {
          donanimListesi.push(li.innerText.trim());
        });
        if (donanimListesi.length > 0) {
          data.specs["Ek Donanımlar"] = donanimListesi.join(', ');
        }
      }

      const imgEls = document.querySelectorAll('.mega-photo-nav label img, .rsImg, .classifiedDetailMainPhoto img, .classifiedDetailThumbList img, .photo-nav img');
      imgEls.forEach(img => {
        let src = img.src || img.dataset.src || img.getAttribute('data-src');
        if (src && !src.includes('svg') && !src.includes('icon') && !src.includes('avatar')) {
          src = src.replace('thmb_', '').replace('/thmb/', '/mega/'); 
          if (!data.images.includes(src)) {
            data.images.push(src);
          }
        }
      });
      
      // Fallback: if no images found, grab any large image
      if (data.images.length === 0) {
        document.querySelectorAll('img').forEach(img => {
          let src = img.src || img.dataset.src;
          if (src && src.includes('mega') && !data.images.includes(src)) {
            data.images.push(src);
          }
        });
      }
    } 
    else if (url.includes('arabam.com')) {
      data.platform = 'Arabam';
      const titleEl = document.querySelector('.product-name, h1');
      if (titleEl) data.title = titleEl.innerText.trim();

      const priceEl = document.querySelector('.color-red4.font-default-plus, .product-price');
      if (priceEl) data.price = priceEl.innerText.trim();
      
      const descEl = document.querySelector('.property-item-text.desc-text, .product-description');
      if (descEl) data.description = descEl.innerText.trim();
      
      const specEls = document.querySelectorAll('.property-item');
      specEls.forEach(li => {
        const parts = li.innerText.split(':');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join(':').trim();
          data.specs[key] = value;
        }
      });

      const imgEls = document.querySelectorAll('.gallery-container img, .product-images img');
      imgEls.forEach(img => {
        let src = img.src || img.dataset.src;
        if (src && !data.images.includes(src)) {
          data.images.push(src);
        }
      });
    }
    else if (url.includes('letgo.com') || url.includes('otoplus.com')) {
      data.platform = 'Letgo/Otoplus';
      const titleEl = document.querySelector('[data-aut-id="itemTitle"], h1');
      if (titleEl) data.title = titleEl.innerText.trim();

      const priceEl = document.querySelector('[data-aut-id="itemPrice"]');
      if (priceEl) data.price = priceEl.innerText.trim();
      
      const descEl = document.querySelector('[data-aut-id="itemDescription"]');
      if (descEl) data.description = descEl.innerText.trim();
      
      const specEls = document.querySelectorAll('[data-aut-id="itemParams"] div, .parameters span');
      specEls.forEach(el => {
        // Letgo often formats specs weirdly, grab raw text
        const text = el.innerText.trim();
        if (text && text.includes(':')) {
           const parts = text.split(':');
           data.specs[parts[0].trim()] = parts.slice(1).join(':').trim();
        } else if (text) {
           data.specs["Feature"] = text;
        }
      });

      const imgEls = document.querySelectorAll('img');
      imgEls.forEach(img => {
        let src = img.src;
        if (src && src.includes('images') && !data.images.includes(src)) {
          data.images.push(src);
        }
      });
    }
  } catch (error) {
    console.error("AutoCAR Eklenti Hatası:", error);
  }

  return data;
}

async function fetchImageAsBase64InContent(url) {
  try {
    const response = await fetch(url, { cache: 'force-cache' });
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob, { resizeWidth: 256, resizeQuality: 'low' });
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.6);
  } catch (error) {
    console.error("AutoCAR Image Fetch Error:", error);
    return null;
  }
}

async function extractCarDataAsync() {
  const data = extractCarData();
  data.base64Images = [];
  
  const maxPoolSize = 10;
  let poolUrls = [];
  if (data.images.length <= maxPoolSize) {
    poolUrls = [...data.images];
  } else {
    const step = data.images.length / maxPoolSize;
    for (let i = 0; i < maxPoolSize; i++) {
      poolUrls.push(data.images[Math.floor(i * step)]);
    }
  }

  for (const url of poolUrls) {
    const b64 = await fetchImageAsBase64InContent(url);
    if (b64) data.base64Images.push(b64);
    await new Promise(r => setTimeout(r, 100)); // WAF bypass delay
  }
  
  return data;
}

// Background script'ten gelen komutu dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extract_data") {
    extractCarDataAsync().then(scrapedData => {
      console.log(`AutoCAR ${scrapedData.platform} Verisi Çekildi:`, scrapedData);
      sendResponse(scrapedData);
    });
    return true; // Keep message channel open for async response
  }
});
