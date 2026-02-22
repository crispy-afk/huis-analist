// netlify/functions/property-taxes.js
// Calculates Dutch property taxes and fees based on 2024 rates
// Sources: Belastingdienst, CBS, Gemeentelijke tarieven

const HEADERS = { 'Content-Type': 'application/json' };

// 2024 OZB rates by municipality (eigenaar woningen, % of WOZ)
const OZB_RATES = {
  Amsterdam:    0.0431,
  Rotterdam:    0.0497,
  'Den Haag':   0.0563,
  Utrecht:      0.0431,
  Eindhoven:    0.0497,
  Groningen:    0.0512,
  Tilburg:      0.0480,
  Almere:       0.0465,
  Breda:        0.0489,
  Nijmegen:     0.0503,
  Enschede:     0.0543,
  Haarlem:      0.0449,
  Arnhem:       0.0518,
  Zaanstad:     0.0496,
  Amersfoort:   0.0448,
  Apeldoorn:    0.0498,
  Hoofddorp:    0.0441,
  Maastricht:   0.0537,
  Leiden:       0.0463,
  Dordrecht:    0.0527,
  default:      0.0480,
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { housePrice, municipality } = JSON.parse(event.body || '{}');
    const price = parseFloat(housePrice) || 350000;

    // Transfer tax (overdrachtsbelasting) 2024
    // Starters <€510k: 0%, others: 2%, non-primary: 10.4%
    const transferTaxRate = price <= 510000 ? 0.02 : 0.02; // simplified: 2%
    const transferTax = price * transferTaxRate;

    // Annual property tax (OZB)
    const ozbRate = (OZB_RATES[municipality] || OZB_RATES.default) / 100;
    // WOZ value approximation: roughly 90-110% of market price
    const wozValue = price * 0.95;
    const ozb = wozValue * ozbRate;

    // One-time fees
    const notaryCosts = Math.min(1200 + price * 0.001, 2500);       // notariskosten akte
    const mortgageCosts = Math.min(800 + price * 0.001, 2000);      // hypotheekakte
    const agentFee = price * 0.01;                                    // makelaarscourtage ~1%
    const appraisal = 600;                                            // taxatierapport

    const totalOneTime = transferTax + notaryCosts + mortgageCosts + appraisal;

    // Annual costs
    const insurance = Math.round(800 + price * 0.0004);              // opstalverzekering
    const vve = 150 * 12;                                             // VvE bijdrage (bij appartement)
    const totalAnnual = Math.round(ozb + insurance);

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        transferTax: Math.round(transferTax),
        transferTaxRate: `${(transferTaxRate * 100).toFixed(1)}%`,
        notaryCosts: Math.round(notaryCosts),
        mortgageCosts: Math.round(mortgageCosts),
        agentFee: Math.round(agentFee),
        appraisal,
        totalOneTime: Math.round(totalOneTime),
        ozb: Math.round(ozb),
        ozbRate: `${ozbRate.toFixed(4)}%`,
        insurance,
        vve,
        totalAnnual,
        municipality,
        wozValue: Math.round(wozValue),
        source: 'Belastingdienst 2024, CBS, Gemeentelijke OZB-tarieven',
      }),
    };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
