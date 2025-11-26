import { InterpretationResult } from "./interpret";
import { ReasoningResult } from "./reason";
import { StrategyResult } from "./strategy";

export interface DraftResult {
  draft: string;
}

export function draftModule(
  prompt: string,
  interpretation: InterpretationResult,
  reasoning: ReasoningResult,
  strategy: StrategyResult
): DraftResult {
  // Special handler for "dashboard"
  if (prompt.trim().toLowerCase() === "dashboard") {
    const dashboardDraft = `
### 🚀 Project Dashboard

**Project:** My New Venture
**Date:** ${new Date().toLocaleDateString()}

---

#### 📊 Key Metrics

| Metric          | Current | Target  | Trend |
|-----------------|---------|---------|-------|
| Users           | 4,321   | 10,000  | ▲ +5% |
| Revenue (MRR)   | $1,234  | $5,000  | ▲ +2% |
| Churn Rate      | 1.5%    | < 1%    | ▼ -0.2%|
| Customer Sat.   | 92%     | 95%     | ▲ +1% |

---

#### 👥 Team & Status

- **Lead:** Alex (On Track)
- **Dev:** Maria (On Track)
- **Design:** Sam (Blocked)
- **Marketing:** Chen (On Track)

---

#### ✅ Tasks & Roadmap

**Q4 Focus: User Growth**

- [x] **Launch v1.2:** New onboarding flow
- [ ] **Marketing Campaign:** Target new demographics
- [ ] **API Integration:** Connect with Service X
- [ ] **User Feedback:** Analyze survey results

---

#### 📈 Recent Activity

- **10 min ago:** New user signup from Germany
- **1 hour ago:** Server CPU usage at 35%
- **5 hours ago:** Deployed v1.2 to production
- **1 day ago:** 3 support tickets closed
`;
    return { draft: dashboardDraft };
  }

  const intro = `Po e marr si pikë nisjeje këtë kërkesë tënde: "${prompt.trim()}".`;

  const part1 = `🔹 Çfarë po kuptoj: ${reasoning.summary}`;

  const part2 =
    interpretation.coreMeanings.length > 0
      ? `🔹 Pikat kryesore që shfaqen: ${interpretation.coreMeanings.join(
          " | "
        )}.`
      : `🔹 Nuk ka shumë fjali të ndara, por ideja kryesore është e qartë.`;

  const part3 =
    interpretation.implicitSignals.length > 0
      ? `🔹 Nga nënteksti duket se: ${interpretation.implicitSignals.join(
          " | "
        )}.`
      : `🔹 Nuk ka sinjale shumë të forta të fshehura në tekst, kështu që përgjigjem direkt.`;

  let closing = "";
  switch (strategy.mode) {
    case "wisdom_tone":
      closing =
        "🔹 Si qasje, është më e dobishme të lëvizësh me hapa të vegjël, me kujdes ndaj vetes dhe me pak më shumë mirëkuptim për ritmin tënd.";
      break;
    case "analytical_breakdown":
      closing =
        "🔹 Hapi tjetër do të ishte të ndash problemin në nën-pjesë dhe t'i trajtosh një nga një, në vend që t'i mbash të gjitha në kokë njëherësh.";
      break;
    case "quick_intuition":
      closing =
        "🔹 Intuitivisht, duket më mirë të zgjedhësh një drejtim, ta testosh shpejt dhe të mësosh nga reagimi, sesa të presësh për momentin 'perfekt'.";
      break;
    case "practical_steps":
      closing =
        "🔹 Praktikisht, mund të fillosh duke caktuar 1–3 veprime konkrete për 24 orët e ardhshme, në vend që të mbingarkohesh me plan afatgjatë.";
      break;
    case "creative_expansion":
      closing =
        "🔹 Ndoshta ia vlen të eksplorosh disa alternativa në mënyrë lozonjare, pa presion, derisa njëra të ndjehet më 'e saktë' për ty.";
      break;
  }

  const draft = [intro, part1, part2, part3, closing].join("\n\n");

  return { draft };
}
