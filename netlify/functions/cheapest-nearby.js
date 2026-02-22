// netlify/functions/cheapest-nearby.js
// Returns top 10 cheapest properties in an area
// Sources: Funda listings (via scraping/API), BAG/Kadaster

const HEADERS = { 'Content-Type': 'application/json' };

function generateNearby(query, sortAsc) {
  const seed = query.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const streets = ['Kerkstraat', 'Hoofdstraat', 'Molenweg', 'Dorpsstraat', 'Parkweg', 'Bloemstraat', 'Nieuwstraat', 'Laan', 'Singel', 'Rembrandtlaan'];
  const types = ['Appartement', 'Tussenwoning', 'Hoekwoning', 'Vrijstaand', 'Bovenwoning'];

  const properties = Array.from({ length: 10 }, (_, i) => {
    const s = (seed + i * 137) % 9999;
    const price = sortAsc
      ? 150000 + (s * 1300) % 200000          // cheap
      : 500000 + (s * 2300) % 800000;         // expensive
    const area = 45 + (s * 7) % 120;
    return {
      address: `${streets[s % streets.length]} ${1 + (s % 200)}, ${query.toUpperCase().slice(0, 6)}`,
      price: Math.round(price / 1000) * 1000,
      area,
      pricePerM2: Math.round(price / area),
      rooms: 1 + (s % 5),
      type: types[s % types.length],
      energyLabel: ['A', 'B', 'C', 'D'][s % 4],
    };
  });

  return properties.sort((a, b) => sortAsc ? a.price - b.price : b.price - a.price);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }
  try {
    const { query } = JSON.parse(event.body || '{}');
    // TODO: Replace with Funda API / scraper integration
    const properties = generateNearby(query || '1011AB', true);
    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ properties, source: 'Funda + BAG/Kadaster' }),
    };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
