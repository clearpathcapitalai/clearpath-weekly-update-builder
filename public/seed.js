// Default seed (mirrors the May 8, 2026 template)
window.cpSeed = function () {
  return {
    client: { name: "" },
    weekEnding: "May 8, 2026",
    signature: {
      name: "Nathaniel",
      fullName: "Nathaniel Lane",
      title: "Managing Partner",
      firm: "ClearPath Capital Partners",
      address: "80 Willow Road, Menlo Park, CA 94025",
      phone: "415.682.6891",
      web: "www.clearpathcapital.com",
    },
    metrics: {
      sp500:       { label: "S&P 500",       value: "+2.33%", sub: "7,398.93 · record",  tone: "up",      source: "", locked: false },
      dow:         { label: "Dow Jones",     value: "+0.22%", sub: "49,609.16",          tone: "up",      source: "", locked: false },
      nasdaq:      { label: "Nasdaq-100",    value: "+5.50%", sub: "~28,564 · record",   tone: "up",      source: "", locked: false },
      eafe:        { label: "MSCI EAFE",     value: "+1.85%", sub: "Developed Intl.",    tone: "up",      source: "", locked: false },
      em:          { label: "MSCI EM",       value: "+6.22%", sub: "Emerging Markets",   tone: "up",      source: "", locked: false },
      agg:         { label: "Bloomberg AGG", value: "+0.29%", sub: "Bonds, yields ▼",    tone: "up",      source: "", locked: false },
      treasury10y: { label: "10-Yr Treasury",value: "~4.38%", sub: "▼ Off 4.46% peak",   tone: "neutral", subTone: "up", source: "", locked: false },
      brent:       { label: "Brent Crude",   value: "$100.54",sub: "▼ ~−7% WTD",         tone: "neutral", subTone: "up", source: "", locked: false },
      gold:        { label: "Gold",          value: "$4,732", sub: "▲ +2.2% WTD",        tone: "gold",    subTone: "up", source: "", locked: false },
      bitcoin:     { label: "Bitcoin",       value: "$79,700",sub: "May 8 close",        tone: "neutral", source: "", locked: false },
    },
    spotlightLabel: "Spotlight — Beneath the Surface",
    spotlightOrder: ["spotlight1", "spotlight2"],
    economicOrder: ["econ1", "econ2", "econ3"],
    paragraphs: {
      brief: {
        subject: "This Week in Brief",
        body: "A risk-on week as U.S.-Iran peace negotiations advanced, oil prices cooled, and a solid-but-softer April jobs report reinforced the soft-landing narrative — pushing both the S&P 500 and Nasdaq-100 to fresh records and their sixth consecutive weekly gain. Beneath the headline, however, cashflows are concentrating into a narrow, stretched cohort of high-valuation momentum names while profitable, low-leverage quality stocks have actually drifted lower.",
        source: "", mode: "auto",
      },
      spotlight1: {
        tag: "★ Narrow rally, speculative tone", tagTone: "warn",
        subject: "Equities — Headline Records, Cautionary Internals",
        body: "Cashflows are concentrating into a [b]narrow, stretched cohort of high-valuation momentum names[/b], while profitable, low-leverage quality stocks have actually drifted lower this week. Fundamentals remain supportive — Q1 earnings continue to track strongly, the labor market is resilient, and Friday's April payrolls print reinforced the soft-landing narrative — but the persistence of [b]speculative leadership at extended valuations[/b] is increasingly difficult to ignore.",
        source: "", mode: "auto",
      },
      spotlight2: {
        tag: "↑ Sticky inflation, fewer cuts priced", tagTone: "down",
        subject: "Treasuries — Off Mid-Week Highs, AGG Eked Out a Gain",
        body: "Bonds clawed back from a Wednesday spike that took the 10-year to [b]4.46%[/b], with Friday's softer wage data and cooling oil prices pulling yields back below 4.40% to finish the week near [b]4.38%[/b]. The Bloomberg AGG rose [b]+0.29%[/b] on the week. CME FedWatch now shows a 25 bp cut at the June 17 meeting at roughly [b]18–22%[/b].",
        source: "", mode: "auto",
      },
      econ1: {
        tag: "↑ Beat expectations", tagTone: "up",
        subject: "April Jobs Report",
        body: "Nonfarm payrolls rose [b]115,000[/b] in April — well ahead of the 55,000 consensus, though down from March's unusually strong 185,000. The unemployment rate held at [b]4.3%[/b]. Average hourly earnings cooled to [b]+0.2% MoM[/b] and [b]+3.6% YoY[/b].",
        source: "", mode: "auto",
      },
      econ2: {
        tag: "↔ Mixed signal", tagTone: "neutral",
        subject: "April ISM Services PMI",
        body: "The services-sector index slipped to [b]53.6[/b] from 54.0 in March — still firmly in expansion territory and roughly in line with the 53.7 consensus.",
        source: "", mode: "auto",
      },
      econ3: {
        tag: "— Transition watch", tagTone: "neutral",
        subject: "Fed Leadership — Powell Step-Down May 15",
        body: "No FOMC meeting this week, but the leadership transition is one week away. Chair Powell's final term as chair ends [b]May 15[/b]; he remains on the Board of Governors. Kevin Warsh chairs his first meeting June 16–17.",
        source: "", mode: "auto",
      },
    },
    intlRows: [
      { name: "MSCI EAFE (Dev. International)",      value: "Higher",     tone: "up" },
      { name: "MSCI EM (Emerging Markets)",          value: "Higher",     tone: "up" },
      { name: "European Equities (peace-deal lift)", value: "Higher",     tone: "up" },
      { name: "Brent Crude Oil",                     value: "~$100/bbl",  tone: "up" },
      { name: "Bloomberg US Aggregate Bond",         value: "+0.29%",     tone: "up" },
    ],
    detailCards: [
      {
        title: "Bank of Japan",
        lines: ["Policy rate held at: [b]0.75%[/b]", "Vote split: [b]6–3[/b] (3 for hike to 1%)"],
        note: "Hawkish hold from late April carries over: FY2026 inflation forecast raised to 2.8%; further hikes flagged if Iran-driven energy shock persists. Yen still pressured near 159.",
        source: "", mode: "auto",
      },
      {
        title: "Iran & Strait of Hormuz",
        lines: ["Brent crude: [b]~$100/bbl[/b]", "Down sharply from $108 last week"],
        note: "One-page peace memo under Tehran's review; reopening of the Strait, partial sanctions relief, and enrichment moratorium are key terms. S&P up 1.46% on Wednesday's progress headlines.",
        source: "", mode: "auto",
      },
    ],
  };
};
