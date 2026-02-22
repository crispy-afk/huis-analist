// netlify/functions/claude-explain.js
// Uses Claude API to generate human-readable explanations of property data
// Claude only explains/interprets — never calculates numeric values

const HEADERS = { 'Content-Type': 'application/json' };

const SYSTEM_PROMPTS = {
  property: {
    nl: `Je bent een Nederlandse vastgoedadviseur die woningdata uitlegt aan kopers. 
Je BEREKENT NOOIT getallen zelf — je legt de al berekende data uit in begrijpelijke taal.
Leg in 3-4 zinnen uit wat de prijs, buurtbeoordeling en woningkenmerken betekenen voor de koper.
Gebruik een vriendelijke, professionele toon.`,
    en: `You are a Dutch real estate advisor explaining property data to buyers.
You NEVER calculate numbers yourself — you explain the already-calculated data in understandable language.
Explain in 3-4 sentences what the price, neighborhood rating and property characteristics mean for the buyer.
Use a friendly, professional tone.`,
  },
  'rent-vs-buy': {
    nl: `Je bent een Nederlandse financieel adviseur die huur-vs-koop analyses uitlegt.
Je BEREKENT NOOIT getallen zelf — je legt de al berekende resultaten uit.
Leg in 3-4 zinnen uit wat de aanbeveling betekent, welke factoren hierbij belangrijk zijn, en wat iemand hierbij in overweging moet nemen.`,
    en: `You are a Dutch financial advisor explaining rent-vs-buy analyses.
You NEVER calculate numbers yourself — you explain the already-calculated results.
Explain in 3-4 sentences what the recommendation means, which factors matter, and what someone should consider.`,
  },
  'property-taxes': {
    nl: `Je bent een Nederlandse belastingadviseur die kosten bij woningaankoop uitlegt.
Je BEREKENT NOOIT getallen zelf — je legt de al berekende belastingen en kosten uit in begrijpelijke taal.
Leg in 3-4 zinnen uit welke kosten er zijn, waarom ze bestaan en wat de koper ervan moet weten.`,
    en: `You are a Dutch tax advisor explaining property purchase costs.
You NEVER calculate numbers yourself — you explain the already-calculated taxes and fees in understandable language.
Explain in 3-4 sentences what costs exist, why they exist and what the buyer should know.`,
  },
  neighborhood: {
    nl: `Je bent een Nederlandse buurtexpert die buurtscores uitlegt aan woningzoekers.
Je BEREKENT NOOIT getallen zelf — je legt de al berekende scores uit.
Leg in 3-4 zinnen uit wat de scores betekenen voor het dagelijks leven, welke sterke en zwakke punten er zijn.`,
    en: `You are a Dutch neighborhood expert explaining neighborhood scores to home seekers.
You NEVER calculate numbers yourself — you explain the already-calculated scores.
Explain in 3-4 sentences what the scores mean for daily life, what the strengths and weaknesses are.`,
  },
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { context, data, lang = 'nl' } = JSON.parse(event.body || '{}');
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          explanation: lang === 'nl'
            ? 'AI uitleg is momenteel niet beschikbaar. Voeg uw Anthropic API sleutel toe als ANTHROPIC_API_KEY in uw Netlify omgevingsvariabelen.'
            : 'AI explanation is currently unavailable. Add your Anthropic API key as ANTHROPIC_API_KEY in your Netlify environment variables.',
        }),
      };
    }

    const systemPrompt = (SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.property)[lang];
    const userMsg = lang === 'nl'
      ? `Leg de volgende woningdata uit: ${JSON.stringify(data, null, 2)}`
      : `Explain the following property data: ${JSON.stringify(data, null, 2)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    const json = await response.json();
    const explanation = json.content?.[0]?.text || (lang === 'nl' ? 'Uitleg niet beschikbaar.' : 'Explanation unavailable.');

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ explanation }),
    };
  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
