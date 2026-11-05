import { GradeLevel, HelperSubject, HelperLanguage, HelperResponse } from '../types';

export async function askHomeworkHelper(
  question: string,
  grade: GradeLevel,
  subject: HelperSubject,
  language: HelperLanguage
): Promise<HelperResponse> {
  const cleanQ = question.trim();

  // Call server-side Gemini API endpoint
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch('/api/homework-helper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: cleanQ,
        grade,
        subject,
        language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: HelperResponse = await res.json();
      if (data && data.explanation) {
        return data;
      }
      throw new Error('Walang wastong sagot na natanggap mula sa server.');
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server status: ${res.status}`);
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Medyo matagal ang pagtugon ng Gemini AI. Mangyaring subukan muli.');
    }
    throw err;
  }
}

export async function askHomeworkHelperWithPhoto(params: {
  imageBase64: string;
  mimeType: string;
  studentNote?: string;
  grade: GradeLevel;
  subject: HelperSubject;
  language: HelperLanguage;
}): Promise<HelperResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch('/api/homework-helper-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: params.imageBase64,
        mimeType: params.mimeType,
        studentNote: params.studentNote,
        grade: params.grade,
        subject: params.subject,
        language: params.language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: HelperResponse = await res.json();
      if (data && data.explanation) {
        return data;
      }
      throw new Error('Walang wastong tugon na natanggap mula sa photo scanner.');
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server status: ${res.status}`);
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Medyo matagal ang pagsusuri sa litrato ng Gemini AI. Pakisubukan muli.');
    }
    throw err;
  }
}

export function generateLocalHomeworkAnswer(
  question: string,
  grade: GradeLevel,
  subject: HelperSubject,
  language: HelperLanguage
): HelperResponse {
  const qLower = question.toLowerCase();

  // MATH SOLVER
  if (subject === 'Math') {
    return solveMathQuestion(question, qLower, grade, language);
  }

  // SCIENCE SOLVER
  if (subject === 'Science') {
    return solveScienceQuestion(question, qLower, grade, language);
  }

  // ENGLISH SOLVER
  if (subject === 'English') {
    return solveEnglishQuestion(question, qLower, grade, language);
  }

  // FILIPINO SOLVER
  if (subject === 'Filipino') {
    return solveFilipinoQuestion(question, qLower, grade, language);
  }

  // ARALING PANLIPUNAN SOLVER
  if (subject === 'Araling Panlipunan') {
    return solveApQuestion(question, qLower, grade, language);
  }

  // MAPEH SOLVER
  if (subject === 'MAPEH') {
    return solveMapehQuestion(question, qLower, grade, language);
  }

  // TLE / EPP SOLVER
  if (subject === 'TLE/EPP') {
    return solveTleQuestion(question, qLower, grade, language);
  }

  // GMRC / ESP SOLVER
  return solveGmrcQuestion(question, qLower, grade, language);
}

// -------------------------------------------------------------
// Helper implementations for each subject
// -------------------------------------------------------------

function solveMathQuestion(
  rawQ: string,
  q: string,
  grade: GradeLevel,
  language: HelperLanguage
): HelperResponse {
  const isBisaya = language === 'Bisaya';
  const isEnglish = language === 'English';

  let explanation = '';
  let steps: string[] = [];
  let finalAnswer = '';
  let tip = '';

  // Area of Triangle
  if (q.includes('area') && (q.includes('triangle') || q.includes('tatsulok') || q.includes('trianggulo'))) {
    const numbers = rawQ.match(/\d+(\.\d+)?/g)?.map(Number) || [6, 4];
    const b = numbers[0] || 6;
    const h = numbers[1] || 4;
    const area = (b * h) / 2;

    if (isBisaya) {
      explanation = `Sa Grade ${grade} Math, ang pormula sa pagkuha sa Area sa Triangle mao ang: Area = (Base × Height) ÷ 2.`;
      steps = [
        `Lakang 1 (Gihatag): Base (b) = ${b} cm, Height (h) = ${h} cm.`,
        `Lakang 2 (Pormula): Area = (Base × Height) ÷ 2.`,
        `Lakang 3 (Pag-multiply): ${b} × ${h} = ${b * h}.`,
        `Lakang 4 (Pagbahin sa 2): ${b * h} ÷ 2 = ${area} cm².`,
      ];
      finalAnswer = `Tubag: Ang Area sa Triangle kay ${area} square centimeters (${area} cm²).`;
      tip = 'Ka-Buddy Tip: Ayaw kalimot ibutang ang "cm²" o "square units" sa imong katapusang tubag!';
    } else if (isEnglish) {
      explanation = `For Grade ${grade} Math, the Area of a Triangle is calculated using the standard formula: Area = (Base × Height) ÷ 2.`;
      steps = [
        `Step 1 (Identify Given): Base = ${b} cm, Height = ${h} cm.`,
        `Step 2 (Formula): Area = (Base × Height) ÷ 2.`,
        `Step 3 (Multiply): ${b} × ${h} = ${b * h}.`,
        `Step 4 (Divide by 2): ${b * h} ÷ 2 = ${area} cm².`,
      ];
      finalAnswer = `Final Answer: The area of the triangle is ${area} cm².`;
      tip = 'Ka-Buddy Tip: Triangle area is always exactly half of the rectangle with the same base and height!';
    } else {
      explanation = `Para sa Grade ${grade} Math, ang pagkuha ng Area ng Tatsulok ay sumusunod sa pormulang: Area = (Base × Height) ÷ 2.`;
      steps = [
        `Hakbang 1 (Given): Base = ${b} cm, Height = ${h} cm.`,
        `Hakbang 2 (Formula): Area = (Base × Height) ÷ 2.`,
        `Hakbang 3 (Pag-multiply): ${b} × ${h} = ${b * h}.`,
        `Hakbang 4 (Paghati sa 2): ${b * h} ÷ 2 = ${area} cm².`,
      ];
      finalAnswer = `Huling Sagot: Ang Area ng tatsulok ay ${area} square centimeters (${area} cm²).`;
      tip = 'Ka-Buddy Tip: Laging lagyan ng square unit (cm², m²) ang sukat ng area!';
    }
  }
  // Percentage (e.g. 20% of 350)
  else if (q.includes('%') || q.includes('percent') || q.includes('porsyento')) {
    const numbers = rawQ.match(/\d+(\.\d+)?/g)?.map(Number) || [20, 350];
    const rate = numbers[0] || 20;
    const base = numbers[1] || 350;
    const decimalRate = rate / 100;
    const result = decimalRate * base;

    if (isBisaya) {
      explanation = `Aron makuha ang porsyento, i-convert una ang rate (${rate}%) ngadto sa decimal pinaagi sa pagbahin sa 100, dayon i-multiply sa base (${base}).`;
      steps = [
        `Lakang 1 (Given): Rate = ${rate}%, Base = ${base}.`,
        `Lakang 2 (Decimal): ${rate}% ÷ 100 = ${decimalRate}.`,
        `Lakang 3 (Pagkalkula): ${decimalRate} × ${base} = ${result}.`,
      ];
      finalAnswer = `Tubag: Ang ${rate}% sa ${base} kay ${result}.`;
      tip = 'Ka-Buddy Tip: P = R × B (Percentage = Rate × Base). I-move lang ang decimal point duha ka beses sa wala!';
    } else if (isEnglish) {
      explanation = `To calculate a percentage of a number, convert the percentage into a decimal by dividing by 100, then multiply by the base number.`;
      steps = [
        `Step 1 (Given): Rate = ${rate}%, Base = ${base}.`,
        `Step 2 (Convert to Decimal): ${rate}% = ${decimalRate}.`,
        `Step 3 (Multiply): ${decimalRate} × ${base} = ${result}.`,
      ];
      finalAnswer = `Final Answer: ${rate}% of ${base} is ${result}.`;
      tip = 'Ka-Buddy Tip: 20% is the same as dividing the number by 5!';
    } else {
      explanation = `Sa pagkuha ng porsyento ng isang bilang, i-convert muna ang porsyento (${rate}%) sa decimal at i-multiply sa kabuuang bilang (${base}).`;
      steps = [
        `Hakbang 1 (Given): Rate = ${rate}%, Base = ${base}.`,
        `Hakbang 2 (Gawing Decimal): ${rate}% ÷ 100 = ${decimalRate}.`,
        `Hakbang 3 (I-multiply): ${decimalRate} × ${base} = ${result}.`,
      ];
      finalAnswer = `Huling Sagot: Ang ${rate}% ng ${base} ay ${result}.`;
      tip = 'Ka-Buddy Tip: Tandaan ang formula: P = Rate × Base kung saan ang Rate ay palaging decimal.';
    }
  }
  // GEMDAS / Order of Operations
  else if (q.includes('gemdas') || q.includes('pemdas') || q.includes('order of operations')) {
    if (isBisaya) {
      explanation = `Ang GEMDAS mao ang sumbanan sa pag-solve sa Math aron dili maglibog kon unsa ang unahon.`;
      steps = [
        '1. G (Grouping): Unahon pirme ang naa sa sulod sa panaklong ().',
        '2. E (Exponents): Kwentaha ang mga numero nga naay power o exponent (sama sa 2²).',
        '3. M & D (Multiplication / Division): Buhata gikan sa KALIWA paingon sa TUO.',
        '4. A & S (Addition / Subtraction): Buhata gikan sa KALIWA paingon sa TUO.',
      ];
      finalAnswer = `Tubag: Sunda ang hapsay nga han-ay aron husto ang imong makuhang resulta.`;
      tip = 'Ka-Buddy Tip: Kon magkatapad ang multiplication ug division, unaha kon kinsay nag-una sa wala!';
    } else if (isEnglish) {
      explanation = `GEMDAS stands for Grouping, Exponents, Multiplication, Division, Addition, and Subtraction. It tells us which calculation to do first.`;
      steps = [
        '1. G (Grouping): Solve inside parentheses or brackets first.',
        '2. E (Exponents): Calculate any powers or square roots.',
        '3. M & D (Multiplication and Division): Calculate from LEFT to RIGHT whichever comes first.',
        '4. A & S (Addition and Subtraction): Calculate from LEFT to RIGHT whichever comes first.',
      ];
      finalAnswer = `Final Answer: Always follow the left-to-right priority for operations on the same rank.`;
      tip = 'Ka-Buddy Tip: Never add before multiplying unless the addition is inside parentheses!';
    } else {
      explanation = `Ang GEMDAS ay gabay sa tamang pagkakasunod-sunod ng pag-compute sa Math: Grouping, Exponents, Multiplication, Division, Addition, Subtraction.`;
      steps = [
        'Hakbang 1 (Grouping): Unahing lutasin ang nasa loob ng panaklong (parentheses).',
        'Hakbang 2 (Exponents): Kalkulahin ang mga exponent tulad ng 2² o 3³.',
        'Hakbang 3 (Multiply & Divide): Gawin mula kaliwa pakanan kung alin ang mauna.',
        'Hakbang 4 (Add & Subtract): Gawin mula kaliwa pakanan kung alin ang mauna.',
      ];
      finalAnswer = `Huling Sagot: Ang tamang pagkakasunod-sunod ang magdadala sa eksaktong solusyon.`;
      tip = 'Ka-Buddy Tip: Ang Multiplication at Division ay magkapantay ng antas—kung sino ang nasa kaliwa, siya ang unahin!';
    }
  }
  // General Math Step-by-Step Problem
  else {
    if (isBisaya) {
      explanation = `Alang sa Grade ${grade} Math, aniay lakang-sa-lakang nga pamaagi sa pag-solve sa imong pangutana: "${rawQ}"`;
      steps = [
        `Lakang 1 (Given): Ilha ang tanang numero ug detalye nga gihatag sa problema alang sa Baitang ${grade}.`,
        'Lakang 2 (Asked): Tinoa kon unsa ang eksaktong gipangayo sa magtutudlo o libro.',
        'Lakang 3 (Operation): Gamita ang tukmang pormula o operasyon (pagdugang, pagkunhod, pag-multiply, o pagbahin).',
        'Lakang 4 (Kalkulasyon): Isulat ang solusyon sa notebook ug siguroha nga husto ang kwenta.',
      ];
      finalAnswer = `Tubag: Kompletuha ang pagsubay sa pormula ug i-review ang arithmetic sa imong notebook.`;
      tip = 'Ka-Buddy Tip: I-check pirme ang imong solusyon pinaagi sa inverse operation (halimbawa: i-check ang subtraction gamit ang addition)!';
    } else if (isEnglish) {
      explanation = `Here is the step-by-step breakdown for your Grade ${grade} Math homework question: "${rawQ}"`;
      steps = [
        `Step 1 (Identify Given): Note down all given numerical values and quantities.`,
        'Step 2 (What is Asked): State clearly what unknown value needs to be solved.',
        'Step 3 (Select Method / Formula): Apply the standard Grade ' + grade + ' math procedure.',
        'Step 4 (Calculate & Verify): Compute carefully and double-check your arithmetic work.',
      ];
      finalAnswer = `Final Answer: Follow through with the arithmetic steps above to write your final boxed answer.`;
      tip = 'Ka-Buddy Tip: Always include units of measurement (e.g., cm, kg, ₱) in your final response!';
    } else {
      explanation = `Narito ang step-by-step na solusyon para sa iyong Grade ${grade} Math homework: "${rawQ}"`;
      steps = [
        `Hakbang 1 (Given): Ilista ang lahat ng numerong ibinigay sa suliranin.`,
        'Hakbang 2 (Asked): Tukuyin kung ano ang hinahanap o kailangang lutasin.',
        'Hakbang 3 (Paraan): Gamitin ang tamang mathematical operation o formula para sa Baitang ' + grade + '.',
        'Hakbang 4 (Pagkwenta): Isulat ang kumpletong solusyon nang malinaw sa iyong kwaderno.',
      ];
      finalAnswer = `Huling Sagot: Isagawa ang bawat hakbang at i-double check ang iyong sagot bago ipasa sa guro.`;
      tip = 'Ka-Buddy Tip: I-recheck ang addition o multiplication para makasigurong walang mintis sa pagsusulit!';
    }
  }

  return {
    isAiConnected: false,
    aiNotice: 'Demo Mode (Sample Answer) — Gemini API key not configured in Settings > Secrets.',
    question: rawQ,
    grade,
    subject: 'Math',
    language,
    explanation,
    steps,
    finalAnswer,
    tip,
    isSample: true,
  };
}

function solveScienceQuestion(
  rawQ: string,
  q: string,
  grade: GradeLevel,
  language: HelperLanguage
): HelperResponse {
  const isBisaya = language === 'Bisaya';
  const isEnglish = language === 'English';

  let explanation = '';
  let steps: string[] = [];
  let finalAnswer = '';
  let tip = '';

  if (q.includes('matter') || q.includes('solid') || q.includes('liquid') || q.includes('gas')) {
    if (isBisaya) {
      explanation = `Ang Matter mao ang bisan unsang butang nga naay gibug-aton (mass) ug nag-okupar og luna (space). Naay 3 ka pangunang estado sa matter: Solid, Liquid, ug Gas.`;
      steps = [
        '1. Solid: Naay klarong porma ug gidak-on (pananglitan: bato, libro, lapis).',
        '2. Liquid: Moagos ug mosunod sa porma sa sudlanan (pananglitan: tubig, gatas, juice).',
        '3. Gas: Walay klarong porma, mokaylap sa hangin (pananglitan: hangin, oxygen, aso).',
      ];
      finalAnswer = `Tubag: Ang tulo ka pangunang estado sa matter kay Solid, Liquid, ug Gas.`;
      tip = 'Ka-Buddy Tip: Ang tubig mahimong Solid (yelo), Liquid (tubig imnon), o Gas (singaw)!';
    } else if (isEnglish) {
      explanation = `Matter is anything that has mass and takes up space. In elementary science, matter exists in three fundamental states: Solid, Liquid, and Gas.`;
      steps = [
        '1. Solid: Has a definite shape and fixed volume (e.g., rock, pencil, ice).',
        '2. Liquid: Takes the shape of its container and flows (e.g., water, milk, oil).',
        '3. Gas: Expands to fill any space and has no fixed shape (e.g., air, oxygen, steam).',
      ];
      finalAnswer = `Final Answer: The three main states of matter are Solids, Liquids, and Gases.`;
      tip = 'Ka-Buddy Tip: Matter changes states through temperature changes like melting, freezing, and evaporation!';
    } else {
      explanation = `Ang Matter ay ang anumang bagay na may bigat (mass) at sumasakop sa espasyo (volume). May tatlong pangunahing anyo ng matter: Solid, Liquid, at Gas.`;
      steps = [
        '1. Solid: May sariling hugis at tiyak na sukat (halimbawa: bato, mesa, lapis).',
        '2. Liquid: Umaagos at sumusunod sa hugis ng lalagyan (halimbawa: tubig, gatas, toyo).',
        '3. Gas: Walang tiyak na hugis at kumakalat sa hangin (halimbawa: hangin, oxygen, usok).',
      ];
      finalAnswer = `Huling Sagot: Ang tatlong pangunahing anyo ng matter ay Solid, Liquid, at Gas.`;
      tip = 'Ka-Buddy Tip: Tandaan na ang yelo, tubig, at water vapor ay iisang sangkap (H₂O) sa magkakaibang anyo!';
    }
  } else {
    if (isBisaya) {
      explanation = `Sa Grade ${grade} Science, kini may kalabotan sa pagsabot sa atong kinaiyahan ug siyentipikong obserbasyon: "${rawQ}"`;
      steps = [
        '1. Konsepto: Ilha ang siyentipikong prinsipyo (pananglitan: kinabuhi sa tanom, panahon, o pwersa).',
        '2. Obserbasyon: Tan-awa ang mga ehemplo sa palibot sa atong komunidad.',
        '3. Resulta: Masabtan kon ngano kini nahitabo sa natural nga pamaagi.',
      ];
      finalAnswer = `Tubag: Ang siyensya nagpatin-aw sa mga katingalahang butang sa atong kalibutan.`;
      tip = 'Ka-Buddy Tip: Maghimo og mubo nga talaan sa imong Science notebook kada leksyon!';
    } else if (isEnglish) {
      explanation = `Here is a clear, age-appropriate science explanation for Grade ${grade}: "${rawQ}"`;
      steps = [
        '1. Core Principle: Identify the scientific process or living organism involved.',
        '2. Cause & Effect: Observe what happens when conditions change.',
        '3. Practical Application: Connect this principle to everyday life in school or at home.',
      ];
      finalAnswer = `Final Answer: Science helps us observe, test, and understand the natural world.`;
      tip = 'Ka-Buddy Tip: Drawing simple diagrams helps you remember science processes on test day!';
    } else {
      explanation = `Sa Grade ${grade} Science, tinatalakay natin ang siyentipikong katotohanan tungkol sa: "${rawQ}"`;
      steps = [
        'Hakbang 1: Unawain ang pangunahing konsepto sa Agham (hal. organ system, ecosystem, o enerhiya).',
        'Hakbang 2: Suriin ang ugnayan ng sanhi at bunga sa kalikasan.',
        'Hakbang 3: Iugnay ito sa iyong pang-araw-araw na karanasan bilang mag-aaral.',
      ];
      finalAnswer = `Huling Sagot: Bawat proseso sa Science ay may lohikal at siyentipikong paliwanag.`;
      tip = 'Ka-Buddy Tip: Tandaan ang mga mahahalagang siyentipikong termino gamit ang flashcards!';
    }
  }

  return {
    isAiConnected: false,
    aiNotice: 'Demo Mode (Sample Answer) — Gemini API key not configured in Settings > Secrets.',
    question: rawQ,
    grade,
    subject: 'Science',
    language,
    explanation,
    steps,
    finalAnswer,
    tip,
    isSample: true,
  };
}

function solveEnglishQuestion(rawQ: string, q: string, grade: GradeLevel, language: HelperLanguage): HelperResponse {
  const isBisaya = language === 'Bisaya';
  const isEnglish = language === 'English';

  let explanation = '';
  let steps: string[] = [];
  let finalAnswer = '';
  let tip = '';

  if (isBisaya) {
    explanation = `Alang sa Grade ${grade} English, ania ang matin-aw nga katin-awan alang sa imong homework: "${rawQ}"`;
    steps = [
      '1. Grammar Rule: Sabta ang lagda sa gramatika o bahin sa panulti (noun, verb, adjective).',
      '2. Context Clues: Basaha ang tibuok pahayag aron masabtan ang kahulugan.',
      '3. Pagsulat: Gamita ang saktong spelling ug punctuation mark sa imong tubag.',
    ];
    finalAnswer = `Tubag: Sunda ang husto nga gramatika ug bokabularyo aron mahimong klaro ang imong sinulat.`;
    tip = 'Ka-Buddy Tip: Ang kanunay nga pagbasa og mubo nga English story makatabang og dako!';
  } else if (isEnglish) {
    explanation = `Here is a helpful explanation for your Grade ${grade} English homework: "${rawQ}"`;
    steps = [
      '1. Language Rule: Identify the specific grammar rule or literary device being asked.',
      '2. Sentence Analysis: Break down the sentence into subject, verb, and supporting details.',
      '3. Application: Construct your response with clear capitalization and correct punctuation.',
    ];
    finalAnswer = `Final Answer: Follow proper grammatical rules and check for subject-verb agreement.`;
    tip = 'Ka-Buddy Tip: Always read your sentences out loud to hear if they sound natural and complete!';
  } else {
    explanation = `Para sa Grade ${grade} English, narito ang madaling maunawaang paliwanag para sa iyong takda: "${rawQ}"`;
    steps = [
      'Hakbang 1: Tukuyin ang panuntunan sa balarila (Grammar) o bahagi ng pananalita.',
      'Hakbang 2: Suriin ang pangungusap upang mahanap ang tamang simuno at pandiwa.',
      'Hakbang 3: Isulat ang sagot nang may tamang bantas at malalaking titik.',
    ];
    finalAnswer = `Huling Sagot: Ang pagsunod sa wastong balarila ang susi sa mahusay na komunikasyon.`;
    tip = 'Ka-Buddy Tip: Ugaliing magbasa ng maiikling kwentong Ingles araw-araw!';
  }

  return {
    isAiConnected: false,
    aiNotice: 'Demo Mode (Sample Answer) — Gemini API key not configured in Settings > Secrets.',
    question: rawQ,
    grade,
    subject: 'English',
    language,
    explanation,
    steps,
    finalAnswer,
    tip,
    isSample: true,
  };
}

function solveFilipinoQuestion(rawQ: string, q: string, grade: GradeLevel, language: HelperLanguage): HelperResponse {
  const isBisaya = language === 'Bisaya';
  const isEnglish = language === 'English';

  let explanation = '';
  let steps: string[] = [];
  let finalAnswer = '';
  let tip = '';

  if (isBisaya) {
    explanation = `Alang sa asignaturang Filipino sa Grade ${grade}, aniay katin-awan aron masabtan ang leksyon: "${rawQ}"`;
    steps = [
      '1. Bahagi ng Pananalita: Ilha kon kini pangngalan, pandiwa, o pang-uri.',
      '2. Kahulugan: Sabta ang mensahe sa pulong o pahayag sa Tagalog/Filipino.',
      '3. Pagsulat: Isulat ang husto nga pulong gamit ang husto nga baybay (spelling).',
    ];
    finalAnswer = `Tubag: Ang pagkat-on sa Filipino makatabang sa atong nasudnong komunikasyon.`;
    tip = 'Ka-Buddy Tip: Tandaan ang "Pantangi" (nagsugod sa dakong letra) ug "Pambalana" (gamay nga letra)!';
  } else if (isEnglish) {
    explanation = `Here is a clear guide for your Grade ${grade} Filipino language lesson: "${rawQ}"`;
    steps = [
      '1. Part of Speech: Identify whether the topic is a noun (Pangngalan), verb (Pandiwa), or adjective (Pang-uri).',
      '2. Meaning & Context: Understand how the Filipino words relate in the sentence.',
      '3. Proper Spelling: Ensure correct Filipino orthography and letter usage.',
    ];
    finalAnswer = `Final Answer: Apply the standard Filipino grammar rules taught in your DepEd module.`;
    tip = 'Ka-Buddy Tip: Proper nouns (Pangngalang Pantangi) always begin with a capital letter!';
  } else {
    explanation = `Sa asignaturang Filipino para sa Grade ${grade}, narito ang madaling paliwanag: "${rawQ}"`;
    steps = [
      'Hakbang 1: Alamin ang aralin sa wika (hal. Pangngalan, Pandiwa, Pang-uri, o Tayutay).',
      'Hakbang 2: Unawain ang gamit ng salita sa loob ng pangungusap o talata.',
      'Hakbang 3: Isulat ang iyong sagot nang buo at may wastong baybay at bantas.',
    ];
    finalAnswer = `Huling Sagot: Ang wastong paggamit ng wikang Filipino ay nagpapakita ng pagmamahal sa sariling kultura.`;
    tip = 'Ka-Buddy Tip: Ang Pangngalang Pantangi ay nagsisimula sa malaking titik tulad ng "Maynila" at "Pilipinas"!';
  }

  return {
    isAiConnected: false,
    aiNotice: 'Demo Mode (Sample Answer) — Gemini API key not configured in Settings > Secrets.',
    question: rawQ,
    grade,
    subject: 'Filipino',
    language,
    explanation,
    steps,
    finalAnswer,
    tip,
    isSample: true,
  };
}

function solveApQuestion(rawQ: string, q: string, grade: GradeLevel, language: HelperLanguage): HelperResponse {
  const isBisaya = language === 'Bisaya';
  const isEnglish = language === 'English';

  let explanation = '';
  let steps: string[] = [];
  let finalAnswer = '';
  let tip = '';

  if (isBisaya) {
    explanation = `Sa Araling Panlipunan alang sa Grade ${grade}, gitudlo kanato ang kasaysayan ug kultura sa Pilipinas: "${rawQ}"`;
    steps = [
      '1. Kasaysayan o Heograpiya: Ilha ang mga mahinungdanong bayani, lugar, o panghitabo sa atong nasod.',
      '2. Pagtuki: Sabta kon giunsa pagpanalipod sa atong mga katigulangan ang atong kagawasan.',
      '3. Pagpabili: Isumpay kini sa atong responsibilidad isip maayong lungsoranong Pilipino.',
    ];
    finalAnswer = `Tubag: Ang pagkat-on sa kasaysayan nagpalig-on sa atong pagka-Pilipino.`;
    tip = 'Ka-Buddy Tip: Tandaan ang Hunyo 12, 1898—adlaw sa deklarasyon sa Kagawasan sa Pilipinas sa Kawit, Cavite!';
  } else if (isEnglish) {
    explanation = `In Araling Panlipunan (Social Studies) for Grade ${grade}, we explore Philippine history, geography, and civic identity: "${rawQ}"`;
    steps = [
      '1. Historical / Geographic Fact: Identify key Philippine heroes, historical dates, or landforms.',
      '2. Analysis: Understand the significance of these events in forming our nation.',
      '3. Civic Duty: Reflect on how this knowledge makes us proud Filipino citizens.',
    ];
    finalAnswer = `Final Answer: Understanding Philippine history helps us appreciate the freedom we enjoy today.`;
    tip = 'Ka-Buddy Tip: Remember that Dr. Jose Rizal is our National Hero and Andres Bonifacio is the Father of the Katipunan!';
  } else {
    explanation = `Sa Araling Panlipunan para sa Grade ${grade}, pinag-aaralan natin ang ating kasaysayan, kultura, at pamahalaan: "${rawQ}"`;
    steps = [
      'Hakbang 1: Alamin ang makasaysayang pangyayari, bayani, o anyong lupa/tubig sa Pilipinas.',
      'Hakbang 2: Unawain ang aral at kahalagahan nito sa ating bansa.',
      'Hakbang 3: Isabuhay ang pagiging makabayan sa pamamagitan ng pagiging mabuting mag-aaral.',
    ];
    finalAnswer = `Huling Sagot: Ang kasaysayan ng Pilipinas ay patunay ng katapangan at pagkakaisa ng mga Pilipino.`;
    tip = 'Ka-Buddy Tip: Tandaan ang tatlong sangay ng pamahalaan: Ehekutibo, Lehislatibo, at Hudikatura!';
  }

  return {
    isAiConnected: false,
    aiNotice: 'Demo Mode (Sample Answer) — Gemini API key not configured in Settings > Secrets.',
    question: rawQ,
    grade,
    subject: 'Araling Panlipunan',
    language,
    explanation,
    steps,
    finalAnswer,
    tip,
    isSample: true,
  };
}

function solveMapehQuestion(rawQ: string, q: string, grade: GradeLevel, language: HelperLanguage): HelperResponse {
  const isBisaya = language === 'Bisaya';
  const isEnglish = language === 'English';

  let explanation = '';
  let steps: string[] = [];
  let finalAnswer = '';
  let tip = '';

  if (isBisaya) {
    explanation = `Sa MAPEH (Music, Arts, PE, Health) sa Grade ${grade}, gipalambo ang atong talento ug kahimsog sa lawas: "${rawQ}"`;
    steps = [
      '1. Musika ug Sining: Pagkat-on sa tono, nota, ritmo, ug lumadnong disenyo.',
      '2. Physical Education: Pag-ehersisyo ug pagdula sa mga tradisyonal nga dula sama sa piko ug patintero.',
      '3. Health: Pagtuman sa himsog nga nutrisyon (Go, Grow, Glow foods) ug kalimpyo sa kaugalingon.',
    ];
    finalAnswer = `Tubag: Ang MAPEH nagtabang aron mahimsog ang atong panglawas ug madasig ang atong pagka-kreatibo.`;
    tip = 'Ka-Buddy Tip: Mag-inom pirme og 8 ka basong tubig kada adlaw alang sa maayong panglawas!';
  } else if (isEnglish) {
    explanation = `In MAPEH (Music, Arts, Physical Education, and Health) for Grade ${grade}: "${rawQ}"`;
    steps = [
      '1. Music & Arts: Recognize rhythmic patterns, musical notes, and cultural Filipino art designs.',
      '2. Physical Education: Maintain an active lifestyle with regular exercise and native Filipino games.',
      '3. Health: Choose nutritious Go, Grow, and Glow foods and practice proper hygiene.',
    ];
    finalAnswer = `Final Answer: MAPEH nurtures creativity, physical fitness, and healthy lifelong habits.`;
    tip = 'Ka-Buddy Tip: Grow foods (like fish and milk) make your bones and muscles strong!';
  } else {
    explanation = `Sa MAPEH (Musika, Sining, PE, at Kalusugan) para sa Grade ${grade}: "${rawQ}"`;
    steps = [
      'Hakbang 1: Musika at Sining—Pagkilala sa ritmo, nota, kulay, at katutubong disenyo.',
      'Hakbang 2: Physical Education—Pagpapanatili ng liksi at lakas sa pamamagitan ng Laro ng Lahi.',
      'Hakbang 3: Kalusugan—Wastong nutrisyon gamit ang Go, Grow, and Glow foods at tamang kalinisan.',
    ];
    finalAnswer = `Huling Sagot: Ang malusog na katawan at masiglang pag-iisip ay bunga ng wastong pagsasagawa ng MAPEH.`;
    tip = 'Ka-Buddy Tip: Laging maghugas ng kamay bago kumain upang makaiwas sa sakit!';
  }

  return {
    isAiConnected: false,
    aiNotice: 'Demo Mode (Sample Answer) — Gemini API key not configured in Settings > Secrets.',
    question: rawQ,
    grade,
    subject: 'MAPEH',
    language,
    explanation,
    steps,
    finalAnswer,
    tip,
    isSample: true,
  };
}

function solveTleQuestion(rawQ: string, q: string, grade: GradeLevel, language: HelperLanguage): HelperResponse {
  const isBisaya = language === 'Bisaya';
  const isEnglish = language === 'English';

  let explanation = '';
  let steps: string[] = [];
  let finalAnswer = '';
  let tip = '';

  if (isBisaya) {
    explanation = `Sa TLE / EPP alang sa Grade ${grade}, nagkat-on kita og praktikal nga kahanas sa panginabuhi, kompyuter, ug agrikultura: "${rawQ}"`;
    steps = [
      '1. Praktikal nga Kahanas: Pagtanom og utanon, basic nga panahi, o paggamit og computer.',
      '2. Kaluwasan: Pag-amping sa mga gamit ug kuryente sa balay ug tunghaan.',
      '3. Negosyo: Pagsabot sa simpleng kita ug gasto (Tubo = Halin - Gasto).',
    ];
    finalAnswer = `Tubag: Ang kahanas sa EPP/TLE magamit sa tibuok kinabuhi alang sa pagka-produktibo.`;
    tip = 'Ka-Buddy Tip: I-save pirme ang imong trabaho sa computer aron dili mawala!';
  } else if (isEnglish) {
    explanation = `In TLE / EPP (Technology and Livelihood Education) for Grade ${grade}: "${rawQ}"`;
    steps = [
      '1. Life Skills: Practical learning in agriculture, home economics, industrial arts, and basic ICT.',
      '2. Safety First: Following safety protocols when using tools, appliances, or internet resources.',
      '3. Entrepreneurship: Understanding simple profit calculation (Profit = Sales - Cost).',
    ];
    finalAnswer = `Final Answer: TLE equips students with valuable hands-on skills for self-reliance and daily life.`;
    tip = 'Ka-Buddy Tip: Always practice internet safety by never sharing passwords with strangers!';
  } else {
    explanation = `Sa TLE / EPP para sa Grade ${grade}, tinuturuan tayo ng mga praktikal na kasanayan sa tahanan, agrikultura, at teknolohiya: "${rawQ}"`;
    steps = [
      'Hakbang 1: Alamin ang gawaing pangkabuhayan (pagtatanim, basic computing, pananahi, o negosyo).',
      'Hakbang 2: Sundin ang mga panuntunan sa kaligtasan sa paghawak ng mga kagamitan.',
      'Hakbang 3: Kwentahin ang kita at gastos sa simpleng pagnenegosyo (Tubo = Benta - Gastos).',
    ];
    finalAnswer = `Huling Sagot: Ang sipag at tiyaga sa paggawa ay susi sa maunlad na pamumuhay.`;
    tip = 'Ka-Buddy Tip: Ang paggawa ng organikong abono (compost) ay nakakatulong sa halaman at sa kalikasan!';
  }

  return {
    isAiConnected: false,
    aiNotice: 'Demo Mode (Sample Answer) — Gemini API key not configured in Settings > Secrets.',
    question: rawQ,
    grade,
    subject: 'TLE/EPP',
    language,
    explanation,
    steps,
    finalAnswer,
    tip,
    isSample: true,
  };
}

function solveGmrcQuestion(rawQ: string, q: string, grade: GradeLevel, language: HelperLanguage): HelperResponse {
  const isBisaya = language === 'Bisaya';
  const isEnglish = language === 'English';

  let explanation = '';
  let steps: string[] = [];
  let finalAnswer = '';
  let tip = '';

  if (isBisaya) {
    explanation = `Sa GMRC (Good Moral and Right Conduct) sa Grade ${grade}, gitudlo kanato ang pagkamatinuoron, pagrespeto, ug pagmahal sa kapwa: "${rawQ}"`;
    steps = [
      '1. Pagkamatinuoron: Pagsulti pirme sa tinuod sa mga ginikanan, magtutudlo, ug kalaro.',
      '2. Pagrespeto: Paggamit og maayong pulong sama sa "palihug" ug "salamat" ug pagtahod sa mga katigulangan.',
      '3. Malasakit: Pagtabang sa mga nanginahanglan nga walay gipaabot nga bayad o pasidungog.',
    ];
    finalAnswer = `Tubag: Ang maayong pamatasan maoy pinakadakong bahandi sa usa ka batang Pilipino.`;
    tip = 'Ka-Buddy Tip: Buhata kanunay ang maayo bisan walay nakakita kanimo!';
  } else if (isEnglish) {
    explanation = `In GMRC (Good Moral and Right Conduct / Values Education) for Grade ${grade}: "${rawQ}"`;
    steps = [
      '1. Honesty: Always telling the truth in school, at home, and with friends.',
      '2. Respect: Using polite words, listening attentively, and valuing elders and teachers.',
      '3. Empathy & Responsibility: Helping others and doing our personal duties willingly.',
    ];
    finalAnswer = `Final Answer: Character, kindness, and moral integrity are just as essential as academic success.`;
    tip = 'Ka-Buddy Tip: Practice doing one kind act every day for your family or classmates!';
  } else {
    explanation = `Sa GMRC / Edukasyon sa Pagpapakatao para sa Grade ${grade}: "${rawQ}"`;
    steps = [
      'Hakbang 1: Katapatan—Pagsasabi ng totoo sa lahat ng oras kahit mahirap o nakakatakot.',
      'Hakbang 2: Paggalang—Paggamit ng "Po" at "Opo" at pagrespeto sa karapatan at damdamin ng iba.',
      'Hakbang 3: Malasakit—Pagtulong sa kapwa nang bukal sa puso at pangangalaga sa kalikasan.',
    ];
    finalAnswer = `Huling Sagot: Ang batang may magandang asal ay kinatutuwaan ng Diyos at ng kapwa.`;
    tip = 'Ka-Buddy Tip: Ang paghingi ng tawad kapag nagkamali ay tanda ng katapangan at kababaang-loob!';
  }

  return {
    isAiConnected: false,
    aiNotice: 'Demo Mode (Sample Answer) — Gemini API key not configured in Settings > Secrets.',
    question: rawQ,
    grade,
    subject: 'GMRC',
    language,
    explanation,
    steps,
    finalAnswer,
    tip,
    isSample: true,
  };
}
