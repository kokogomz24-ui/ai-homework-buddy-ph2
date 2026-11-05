import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Determine if Gemini API Key is configured and valid
function getGeminiClient(): { ai: GoogleGenAI | null; isConfigured: boolean } {
  dotenv.config();
  const rawApiKey = (process.env.GEMINI_API_KEY || '').trim();
  const isConfigured = Boolean(
    rawApiKey &&
    rawApiKey !== 'MY_GEMINI_API_KEY' &&
    !rawApiKey.startsWith('MY_') &&
    rawApiKey.length > 20
  );

  if (!isConfigured) {
    return { ai: null, isConfigured: false };
  }

  try {
    const aiInstance = new GoogleGenAI({
      apiKey: rawApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    return { ai: aiInstance, isConfigured: true };
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
    return { ai: null, isConfigured: false };
  }
}

// Check AI status
app.get('/api/ai-status', (_req: Request, res: Response) => {
  const { isConfigured } = getGeminiClient();
  res.json({
    configured: isConfigured,
    model: 'gemini-3.1-flash-lite',
    message: isConfigured
      ? 'Gemini AI integration active and ready'
      : 'Gemini AI key is not configured in Settings > Secrets. Curated sample answers will be served.',
  });
});

// Helper for authentic sample answers when AI is not configured
function getSampleHomeworkAnswer(
  question: string,
  grade: number,
  subject: string,
  language: 'English' | 'Filipino' | 'Bisaya'
) {
  const qLower = question.toLowerCase();

  // Subject-specific default fallback database
  if (subject === 'Math') {
    if (language === 'Bisaya') {
      return {
        explanation: `Alang sa Grade ${grade} Math, sayon ra kaayo masulbad ang imong pangutana pinaagi sa pagsubay sa lakang-sa-lakang nga pamaagi: "${question}"`,
        steps: [
          'Lakang 1 (Gihatag): Ilha una kon unsa ang mga numero ug detalye nga gihatag sa problema.',
          'Lakang 2 (Gipangutana): Sabta kon unsa ang gipangita—pananglitan, pagdugang (addition), pagkunhod (subtraction), o pagsukod sa area.',
          'Lakang 3 (Solusyon): I-apply ang eksaktong pormula o operasyon nga angay alang sa Baitang ' + grade + '.',
          'Lakang 4 (Pag-review): I-recheck kon husto ba ang imong kwenta ug ayaw kalimot sa unit sama sa pesos (₱), sentimetro (cm), o metro (m).',
        ],
        finalAnswer: `Tubag: Sunda ang hapsay nga pagkalkula aron makuha ang eksaktong numero. Siguroha nga klaro ang imong solusyon sa notebook!`,
        tip: 'Ka-Buddy Tip sa Bisaya: Isulat pirme ang "Given" ug "Asked" aron dili maglibog sa word problems!',
      };
    } else if (language === 'Filipino') {
      return {
        explanation: `Para sa Grade ${grade} Math, madali nating masosolusyunan ang iyong tanong gamit ang step-by-step na paraan: "${question}"`,
        steps: [
          'Hakbang 1 (Given): Ilista ang lahat ng numerong ibinigay sa suliranin.',
          'Hakbang 2 (Asked): Tukuyin kung ano ang eksaktong hinahanap o tinatanong.',
          'Hakbang 3 (Operation / Formula): Gamitin ang tamang mathematical operation o formula na angkop sa Baitang ' + grade + '.',
          'Hakbang 4 (Solusyon): Gawin ang pagkwenta nang dahan-dahan at i-double check ang arithmetic.',
        ],
        finalAnswer: `Huling Sagot: Makukuha ang wastong solusyon sa pamamagitan ng paglalapat ng tamang formula at paglalagay ng tamang unit (hal. ₱, cm², o piraso).`,
        tip: 'Ka-Buddy Tip sa Filipino: Laging maglagay ng tamang unit tulad ng cm² o pesos sa huling sagot para hindi mabawasan ng puntos!',
      };
    } else {
      return {
        explanation: `Here is the step-by-step solution for your Grade ${grade} Math question: "${question}"`,
        steps: [
          'Step 1 (Identify Given): Write down all the numbers and facts provided in the problem.',
          'Step 2 (Identify What is Asked): Clearly determine what quantity or value needs to be solved.',
          'Step 3 (Select Formula / Operation): Choose the appropriate math rule or equation for Grade ' + grade + '.',
          'Step 4 (Calculate & Verify): Compute carefully step-by-step and double-check your arithmetic.',
        ],
        finalAnswer: `Final Answer: Follow through with the arithmetic steps shown to record the complete answer in your notebook.`,
        tip: 'Ka-Buddy Tip in English: Always show your complete scratch work and include units like cm, m, or ₱ in word problems!',
      };
    }
  }

  if (subject === 'Science') {
    if (language === 'Bisaya') {
      return {
        explanation: `Sa Grade ${grade} Science, kini may kalabutan sa pagsabot sa atong kinaiyahan ug siyensya: "${question}"`,
        steps: [
          'Panguna nga Konsepto: Tan-awa kon giunsa paglihok ang mga buhing butang (living things) o mga pwersa sa kinaiyahan.',
          'Obserbasyon: Paminawa o obserbari ang mga ehemplo sa palibot sama sa tanom, hangin, tubig, o panahon.',
          'Kahinungdanon: Ang siyensya nagtabang kanato nga masabtan kon ngano kini nahitabo.',
        ],
        finalAnswer: `Panghinapos: Ang kinaiyahan dunay hapsay nga proseso ug balaod nga nagdumala niini.`,
        tip: 'Ka-Buddy Tip: Mag-obserbar pirme sa palibot aron mas dali masabtan ang leksyon sa Science!',
      };
    } else if (language === 'Filipino') {
      return {
        explanation: `Sa Grade ${grade} Science, tinatalakay natin ang mga kamangha-manghang batas ng kalikasan: "${question}"`,
        steps: [
          'Pangunahing Konsepto: Unawain ang siyentipikong katangian ng paksa (hal. states of matter, organ systems, o water cycle).',
          'Paliwanag: Tingnan kung ano ang sanhi at epekto ng prosesong ito sa ating katawan o paligid.',
          'Aplikasyon: Paano natin ito nakikita sa pang-araw-araw na buhay sa Pilipinas.',
        ],
        finalAnswer: `Buod: Bawat kababalaghan sa Science ay may lohikal at siyentipikong paliwanag na madaling matutunan.`,
        tip: 'Ka-Buddy Tip: Gumuhit ng simpleng diagram o flowchart kapag nag-aaral ng Science processes!',
      };
    } else {
      return {
        explanation: `Here is a clear, age-appropriate scientific explanation for Grade ${grade}: "${question}"`,
        steps: [
          'Core Concept: Identify the main scientific principle (e.g. living systems, physical changes, or energy).',
          'Mechanism: Understand how cause and effect work together in this process.',
          'Real-World Example: Connect the science concept to everyday observations around your home or school.',
        ],
        finalAnswer: `Summary: Science helps us observe, measure, and understand how our world functions systematically.`,
        tip: 'Ka-Buddy Tip: Remembering scientific keywords with flashcards makes reviewing for quizzes much easier!',
      };
    }
  }

  if (subject === 'GMRC') {
    if (language === 'Bisaya') {
      return {
        explanation: `Sa GMRC (Good Moral and Right Conduct) alang sa Grade ${grade}, gitudlo kanato ang maayong pamatasan ug pagrespeto sa isigka-ingon: "${question}"`,
        steps: [
          '1. Pagkamatinuoron: Pagsulti pirme sa tinuod sa mga ginikanan, magtutudlo, ug higala.',
          '2. Pagrespeto: Paggamit og maayong pulong sama sa "palihug" ug "salamat".',
          '3. Pagtabang: Pagpakita og malasakit sa mga nanginahanglan sa balay ug sa eskwelahan.',
        ],
        finalAnswer: `Buod: Ang maayong pamatasan maoy bahandi nga magdala og kalinaw ug kadaugan sa kinabuhi.`,
        tip: 'Ka-Buddy Tip: Buhaton kanunay ang husto bisan kon walay nakakita kanimo!',
      };
    } else if (language === 'Filipino') {
      return {
        explanation: `Sa Edukasyon sa Pagpapakatao / GMRC para sa Grade ${grade}, pinahahalagahan natin ang wastong asal at pagmamalasakit: "${question}"`,
        steps: [
          '1. Paggalang sa Kapwa: Paggamit ng "Po" at "Opo" at pakikinig nang bukas ang isip sa opinyon ng iba.',
          '2. Katapatan: Pagsasabi ng totoo sa lahat ng pagkakataon at pag-iwas sa pandaraya.',
          '3. Disiplina at Pananagutan: Pagtupad sa mga tungkulin bilang mag-aaral at anak.',
        ],
        finalAnswer: `Kaisipan: Ang tunay na matalino ay may busilak na puso at magandang asal sa kapwa.`,
        tip: 'Ka-Buddy Tip: Ugaliing magpasalamat araw-araw sa mga biyayang natatanggap mula sa pamilya at Diyos!',
      };
    } else {
      return {
        explanation: `In GMRC (Good Moral and Right Conduct) for Grade ${grade}, we learn values that help us become caring and responsible citizens: "${question}"`,
        steps: [
          '1. Respect: Speaking politely to parents, teachers, and classmates.',
          '2. Honesty: Choosing truthfulness in homework, exams, and daily actions.',
          '3. Kindness: Helping others willingly without expecting anything in return.',
        ],
        finalAnswer: `Takeaway: Good character and empathy are just as important as good academic grades.`,
        tip: 'Ka-Buddy Tip: Practice one small act of kindness every day in your school or home!',
      };
    }
  }

  // General default for other subjects (Araling Panlipunan, MAPEH, TLE/EPP, English, Filipino)
  if (language === 'Bisaya') {
    return {
      explanation: `Alang sa ${subject} sa Grade ${grade}, ania ang matin-aw nga katin-awan alang sa imong homework: "${question}"`,
      steps: [
        `1. Sabta ang tema sa ${subject} sa imong leksyon sa Baitang ${grade}.`,
        '2. Hinumdomi ang mga mahinungdanong termino, petsa, tawo, o kahanas.',
        '3. I-apply kini sa pagtubag sa imong pangutana sa usa ka tin-aw ug masinabton nga paagi.',
      ],
      finalAnswer: `Panghinapos: Pinaagi sa makanunayong pagtuon, mas dali nimong ma-master ang mga konsepto sa ${subject}.`,
      tip: `Ka-Buddy Tip: Sulayi pagbasa pag-usab ang imong modyul sa ${subject} aron mas molig-on ang imong memorya!`,
    };
  } else if (language === 'Filipino') {
    return {
      explanation: `Para sa asignaturang ${subject} sa Baitang ${grade}, narito ang madaling maunawaang paliwanag para sa iyong takdang-aralin: "${question}"`,
      steps: [
        `1. Alamin ang pangunahing aralin sa ${subject} na itinuro sa klase.`,
        '2. Ilista ang mga mahahalagang detalye, talasalitaan, o prinsipyo.',
        '3. Isulat ang sagot nang buo at may kumpletong ideya sa iyong kwaderno.',
      ],
      finalAnswer: `Buod: Ang ${subject} ay tumutulong upang mapalawak ang ating kasanayan at pagkaunawa bilang batang Pilipino.`,
      tip: `Ka-Buddy Tip: Magtala ng mahahalagang tala (notes) sa bawat aralin sa ${subject} para handa ka sa pagsusulit!`,
    };
  } else {
    return {
      explanation: `Here is a clear, age-appropriate explanation for Grade ${grade} ${subject}: "${question}"`,
      steps: [
        `1. Review the key learning competency for ${subject} in Grade ${grade}.`,
        '2. Identify the main concepts, definitions, and supporting details.',
        '3. Formulate your answer in complete, clear sentences for your notebook.',
      ],
      finalAnswer: `Summary: Understanding the foundational concepts of ${subject} helps you build stronger study habits.`,
      tip: `Ka-Buddy Tip: Use highlighters or sticky notes to mark important concepts in your ${subject} textbook!`,
    };
  }
}

// POST /api/homework-helper
app.post('/api/homework-helper', async (req: Request, res: Response) => {
  try {
    const { question, grade, subject, language } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'Mangyaring maglagay ng wastong tanong.' });
      return;
    }

    const gradeLevel = Number(grade) >= 1 && Number(grade) <= 6 ? Number(grade) : 3;
    const selectedSubject = subject || 'Math';
    const chosenLanguage = ['English', 'Filipino', 'Bisaya'].includes(language)
      ? (language as 'English' | 'Filipino' | 'Bisaya')
      : 'Filipino';

    const { ai, isConfigured } = getGeminiClient();

    // If Gemini is not configured, explicitly serve sample answers with honest disclosure
    if (!isConfigured || !ai) {
      const sample = getSampleHomeworkAnswer(question, gradeLevel, selectedSubject, chosenLanguage);
      res.json({
        isAiConnected: false,
        aiNotice: 'Sampol na Kasagutan (AI key not configured in Settings > Secrets. Showing curated sample answer).',
        question: question.trim(),
        grade: gradeLevel,
        subject: selectedSubject,
        language: chosenLanguage,
        explanation: sample.explanation,
        steps: sample.steps,
        finalAnswer: sample.finalAnswer,
        tip: sample.tip,
        isSample: true,
      });
      return;
    }

    // Call Gemini API via @google/genai SDK on server-side
    const promptInstructions = `
You are 'AI Homework Buddy PH', a friendly, encouraging, and accurate elementary school tutor for Filipino students.
Student Grade Level: Grade ${gradeLevel} (DepEd Philippines Elementary Curriculum).
Subject: ${selectedSubject}
Target Language: ${chosenLanguage} (You MUST explain in ${chosenLanguage}. If Bisaya, use authentic, natural Cebuano/Bisaya words like 'Maayong adlaw', 'Lakang', 'Tubag'. If Filipino, use Tagalog/Filipino. If English, use elementary English).
Student Question: "${question.trim()}"

Specific Requirements:
1. Explain simply and in an age-appropriate manner suitable for Grade ${gradeLevel}.
2. If the subject is Math or involves calculation, solve it with 100% mathematical accuracy.
   - For example: if asked 125 × 24, break it down clearly:
     125 × 4 = 500
     125 × 20 = 2,500
     500 + 2,500 = 3,000.
     The final answer MUST be 3,000.
3. Show 3 to 5 clear, numbered step-by-step points in "steps".
4. State the direct answer clearly in "finalAnswer".
5. Provide an encouraging study tip in "tip".

Return a JSON object conforming strictly to this format:
- "explanation": Friendly introductory explanation of the concept or problem.
- "steps": An array of strings representing clear step-by-step solution steps.
- "finalAnswer": The direct summary answer or result (e.g., "3,000" or a concise final statement).
- "tip": An encouraging study tip or memory trick for the student.
`;

    // Try primary model (gemini-3.1-flash-lite) and fallback to gemini-3.8-flash if needed
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;
    let geminiResponse: any = null;

    for (const model of modelsToTry) {
      try {
        geminiResponse = await ai.models.generateContent({
          model,
          contents: promptInstructions,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                explanation: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                finalAnswer: { type: Type.STRING },
                tip: { type: Type.STRING },
              },
              required: ['explanation', 'steps', 'finalAnswer', 'tip'],
            },
          },
        });

        if (geminiResponse && geminiResponse.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, trying next if available:`, err?.message || err);
      }
    }

    if (!geminiResponse || !geminiResponse.text) {
      throw lastError || new Error('No response from Gemini API');
    }

    const parsedData = JSON.parse(geminiResponse.text);

    // Return real Gemini response! Do NOT use sample answer when Gemini is connected.
    res.json({
      isAiConnected: true,
      aiNotice: '✨ Powered by Gemini AI (Live Tutor)',
      question: question.trim(),
      grade: gradeLevel,
      subject: selectedSubject,
      language: chosenLanguage,
      explanation: parsedData.explanation || 'Narito ang paliwanag para sa iyong takdang-aralin.',
      steps: parsedData.steps || [],
      finalAnswer: parsedData.finalAnswer || '',
      tip: parsedData.tip || 'Mag-aral nang mabuti para sa kinabukasan!',
      isSample: false,
    });
  } catch (err: any) {
    console.error('Gemini API call failed:', err?.message || err);
    // When Gemini is configured but call fails, return helpful error response as required
    res.status(502).json({
      error: `Hindi makakonekta sa Gemini AI: ${err?.message || 'Network/Quota error'}. Pakisubukan muli o maghintay ng ilang sandali.`,
      isAiConnected: false,
    });
  }
});

// POST /api/homework-helper-photo - Photo Homework Scanner with Gemini AI Vision
app.post('/api/homework-helper-photo', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, studentNote, grade, subject, language } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.trim()) {
      res.status(400).json({
        error: 'Mangyaring mag-upload o kumuha ng litrato ng iyong takdang-aralin.',
      });
      return;
    }

    // Extract raw base64 data and detect mime type
    let cleanBase64 = imageBase64.trim();
    let detectedMime = mimeType || 'image/jpeg';

    const dataUriMatch = cleanBase64.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/s);
    if (dataUriMatch) {
      detectedMime = dataUriMatch[1];
      cleanBase64 = dataUriMatch[2];
    }

    // Normalize mime type
    if (detectedMime === 'image/jpg') {
      detectedMime = 'image/jpeg';
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(detectedMime)) {
      // Default to image/jpeg if unknown image type
      detectedMime = 'image/jpeg';
    }

    const gradeLevel = Number(grade) >= 1 && Number(grade) <= 6 ? Number(grade) : 3;
    const selectedSubject = subject || 'Math';
    const chosenLanguage = ['English', 'Filipino', 'Bisaya'].includes(language)
      ? (language as 'English' | 'Filipino' | 'Bisaya')
      : 'Filipino';

    const { ai, isConfigured } = getGeminiClient();

    if (!isConfigured || !ai) {
      res.status(503).json({
        error:
          'Kailangan ng aktibong Gemini AI connection para suriin ang litrato ng iyong homework. Pakisuri ang GEMINI_API_KEY sa Settings > Secrets ng AI Studio.',
        isAiConnected: false,
      });
      return;
    }

    const visionPrompt = `
You are 'Kuya Owl' from 'AI Homework Buddy PH', a friendly, encouraging, and accurate elementary school tutor for Filipino students.
Student Grade Level: Grade ${gradeLevel} (DepEd Philippines Elementary Curriculum).
Subject: ${selectedSubject}
Language for Explanation: ${chosenLanguage} (You MUST formulate your explanation in ${chosenLanguage}. If Bisaya, use authentic, natural Cebuano/Bisaya words like 'Maayong adlaw', 'Lakang', 'Tubag', 'Sunda'. If Filipino, use clear Tagalog/Filipino. If English, use friendly elementary English).
${studentNote ? `Student's specific question or instruction: "${studentNote.trim()}"` : ''}

Your tasks:
1. Examine the uploaded homework photo carefully. Read, transcribe, and understand the text, handwritten numbers, mathematical equations, diagrams, labels, and questions shown on the page.
2. In "extractedText": state clearly what specific problem, equation, or question you identified in the photo (e.g., "Problem #3: 125 × 24" or "Question: What are the three states of matter?"). If the student provided a specific note, focus on that requested question.
3. If the image is completely blank, unintelligible, or not homework at all, set "explanation" to a friendly request asking the student to take a clearer, well-lit photo of their homework paper.
4. Solve the homework question with 100% factual and mathematical accuracy suitable for Grade ${gradeLevel}.
   - For Math: Break down multiplication, division, fractions, geometry, or word problems step-by-step. Double-check all arithmetic.
5. Provide 3 to 5 clear, numbered step-by-step breakdown points in "steps".
6. Provide the clear direct result or answer in "finalAnswer".
7. Provide a cheerful, motivating Ka-Buddy study tip in "tip".

Return a strict JSON object:
- "extractedText": string (the exact question or equation transcribed from the photo)
- "explanation": string (introductory explanation of the problem for a Grade ${gradeLevel} student)
- "steps": string[] (clear, sequential steps to solve it)
- "finalAnswer": string (the final answer / conclusion)
- "tip": string (an encouraging study tip from Kuya Owl)
`;

    const imagePart = {
      inlineData: {
        mimeType: detectedMime,
        data: cleanBase64,
      },
    };
    const textPart = {
      text: visionPrompt,
    };

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;
    let geminiResponse: any = null;

    for (const model of modelsToTry) {
      try {
        geminiResponse = await ai.models.generateContent({
          model,
          contents: { parts: [imagePart, textPart] },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                extractedText: { type: Type.STRING },
                explanation: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                finalAnswer: { type: Type.STRING },
                tip: { type: Type.STRING },
              },
              required: ['extractedText', 'explanation', 'steps', 'finalAnswer', 'tip'],
            },
          },
        });

        if (geminiResponse && geminiResponse.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Vision model ${model} failed, trying fallback:`, err?.message || err);
      }
    }

    if (!geminiResponse || !geminiResponse.text) {
      throw lastError || new Error('Walang tugon mula sa Gemini Vision API.');
    }

    const parsedData = JSON.parse(geminiResponse.text);

    res.json({
      isAiConnected: true,
      aiNotice: '✨ Kuya Owl Vision Scanner (Gemini AI Live)',
      question: parsedData.extractedText || studentNote || 'Na-scan na Takdang-Aralin',
      extractedText: parsedData.extractedText || '',
      grade: gradeLevel,
      subject: selectedSubject,
      language: chosenLanguage,
      explanation: parsedData.explanation || 'Narito ang pagsusuri at solusyon para sa iyong homework.',
      steps: parsedData.steps || [],
      finalAnswer: parsedData.finalAnswer || '',
      tip: parsedData.tip || 'Mag-aral nang mabuti kasama si Kuya Owl!',
      isSample: false,
    });
  } catch (err: any) {
    console.error('Gemini Vision API call failed:', err?.message || err);
    res.status(502).json({
      error: `Hindi masuri ng Gemini AI ang litrato: ${err?.message || 'Network/Processing error'}. Pakisubukan muli gamit ang mas maliwanag at klarong larawan.`,
      isAiConnected: false,
    });
  }
});

// Setup Vite middleware in dev or static serve in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
