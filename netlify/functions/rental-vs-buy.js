// netlify/functions/rental-vs-buy.js
// Calculates rent vs buy comparison using standard Dutch mortgage formulas

const HEADERS = { 'Content-Type': 'application/json' };

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { housePrice, mortgageRate, rentPrice, years } = JSON.parse(event.body || '{}');

    const P = parseFloat(housePrice);
    const r = parseFloat(mortgageRate) / 100 / 12;
    const rent = parseFloat(rentPrice);
    const Y = parseFloat(years);
    const n = 360; // 30-year mortgage in months

    // Monthly mortgage payment (annuity formula)
    const monthlyMortgage = r > 0
      ? P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : P / n;

    // One-time buying costs (k.k.)
    const transferTax = P * 0.02;        // 2% overdrachtsbelasting (starter <400k: 0%)
    const notaryCosts = 1800;
    const advisorCosts = 2500;
    const valuation = 600;
    const oneTimeCosts = transferTax + notaryCosts + advisorCosts + valuation;

    // Annual ownership costs beyond mortgage
    const ozb = P * 0.001;               // ~0.1% OZB
    const maintenance = P * 0.01 / 12;  // ~1% p.a. maintenance
    const insurance = 100;              // €1200/year

    const monthlyBuyCost = monthlyMortgage + (ozb / 12) + maintenance + insurance;
    const monthlyRentCost = rent;

    // Build year-by-year chart
    const chartData = [];
    let cumBuy = oneTimeCosts;
    let cumRent = 0;

    for (let y = 1; y <= Y; y++) {
      // Appreciation offset: Dutch avg ~3% p.a. reduces effective buy cost
      const appreciation = P * Math.pow(1.03, y) - P;
      cumBuy += monthlyBuyCost * 12;
      cumRent += monthlyRentCost * 12 * Math.pow(1.03, y - 1); // rent inflation 3%
      chartData.push({
        year: `${y}j`,
        kopen: Math.round(cumBuy - appreciation),
        huren: Math.round(cumRent),
      });
    }

    const finalBuy = chartData[chartData.length - 1]?.kopen || 0;
    const finalRent = chartData[chartData.length - 1]?.huren || 0;
    const recommendation = finalBuy < finalRent ? 'buy' : 'rent';
    const savings = Math.abs(finalBuy - finalRent);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        monthlyMortgage: Math.round(monthlyMortgage),
        oneTimeCosts: Math.round(oneTimeCosts),
        totalCostBuy: Math.round(finalBuy),
        totalCostRent: Math.round(finalRent),
        recommendation,
        savings: Math.round(savings),
        chartData,
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
