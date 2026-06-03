const htmlStr = `
  <img src="https://s0.shbdn.com/ilan-fotograflari/12/34/56/123456_thmb.jpg" />
  <img data-src="//s0.shbdn.com/photos/123/456/789/987654_mega.jpg" />
  "url": "https:\\/\\/s0.shbdn.com\\/ilan-fotograflari\\/00\\/00\\/00\\/123_mega.jpg",
  "url2": "https:\\/\\/image5.sahibinden.com\\/photos\\/11\\/22\\/33\\/444.jpg"
`;

const urlRegex = /(?:https?:)?(?:\\?\/){2}[^"'\s<>]*?(?:shbdn\.com|sahibinden\.com)[^"'\s<>]*?\.(?:jpg|jpeg|png|webp)[^"'\s<>]*/gi;
console.log(htmlStr.match(urlRegex));
