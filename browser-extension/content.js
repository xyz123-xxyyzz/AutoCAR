// AutoCAR Çoklu Platform Veri Çekme Motoru (Scraper)
if (typeof window.AutoCAR_ContentScript_Loaded === 'undefined') {
  window.AutoCAR_ContentScript_Loaded = true;

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

      // Ekspertiz / Hasar Durumu alanını kazıma (varsa)
      const expertiseEls = document.querySelectorAll('.expertise-report, #expertiseTable, .vehicle-condition, .boya-degisen');
      let expertiseText = "";
      if (expertiseEls.length > 0) {
        expertiseEls.forEach(el => {
          expertiseText += el.innerText.trim() + "\n";
        });
      } else {
         // Belki 'Ekspertiz Durumu' altındaki li veya tr öğeleri
         const expList = document.querySelectorAll('.classifiedInfoList li, .classifiedProperties li, table tr');
         expList.forEach(el => {
            const text = el.innerText.toLowerCase();
            if (text.includes('boyalı') || text.includes('değişen') || text.includes('orijinal') || text.includes('lokal')) {
                expertiseText += el.innerText.trim() + "\n";
            }
         });
      }
      
      if (expertiseText.length > 0) {
        data.description += "\n\nSİSTEM TARAFINDAN TESPİT EDİLEN EKSPERTİZ TABLOSU/VERİSİ:\n" + expertiseText;
      }
      
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
      const uniqueImageIds = new Set();
      
      imgEls.forEach(img => {
        let src = img.src || img.dataset.src || img.getAttribute('data-src');
        if (src && !src.includes('svg') && !src.includes('icon') && !src.includes('avatar') && !src.includes('data:image') && !src.includes('base64') && !src.includes('360') && !src.includes('video') && !src.includes('transparent') && !src.includes('blank') && !src.includes('/assets/')) {
          src = src.replace('thmb_', '').replace('/thmb/', '/mega/'); 
          
          // Sahibinden resim URL'sinden benzersiz ID'yi (sayıları) bulalım ki aynı resmi (mega ve normal) 2 kez eklemeyelim.
          const idMatch = src.match(/\/(\d+)[^/]*$/);
          const uniqueId = idMatch ? idMatch[1] : src;
          
          if (!uniqueImageIds.has(uniqueId)) {
            uniqueImageIds.add(uniqueId);
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

  async function extractCarDataAsync() {
    return extractCarData();
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
}
