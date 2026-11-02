# MycoBox – bounded cultivation-source check

Checked 2026-10-29. Scope: sources supplied in the extension brief; no claim of exhaustive mycological validation. Do not treat a cited cultivation protocol as a universal species optimum or hardware safety boundary.

## Nameko / Goldkäppchen: preserve shared species identity

[BZfE – Bissfester Pilz mit nussigem Aroma](https://www.bzfe.de/presse/pressemeldungen-archiv/bissfester-pilz-mit-nussigem-aroma) explicitly identifies Goldkäppchen as **Pholiota nameko**, also called Nameko/japanisches Stockschwämmchen. The page mentions sawdust-based cultivation and high fruiting humidity, but does **not** establish the brief's two distinct temperature ranges. Confidence: high for the naming relationship; no universal temperature validation.

[Jung et al. (2007), Cultivation technique using plastic container and selection the superior strain of nameko mushroom (Pholiota nameko)](https://www.earticle.net/Article/A193394), Journal of MUSHROOMS 5(2):51–58. The brief linked its containing issue; this is the precise article. Its accessible primary-research abstract reports mycelial growth optimum **25 °C**, primordium induction **12 °C**, subsequent growth **16 °C**, and **95 % RH** in its particular plastic-container experiment. The full paper requires institutional access/payment and was not read. These are distinct phase-specific experimental conditions, **not proof that every value throughout 12–16 °C is a universal optimum**. Confidence: high for what the abstract reports, limited transferability to another growbox.

The brief's Nameko 12–16 °C / 88–95 % versus Goldkäppchen 16–21 °C / 85–95 % should therefore be recorded as conflicting provisional inputs, not separate verified species profiles. Retain one shared species profile; label conflict explicitly. Either keep both submitted ranges as unverified source alternatives or select a clearly named demo range; do not silently present either as scientifically validated.

## Shimeji: one directly supporting primary study

[Li et al. (2025), Genome-Wide SSR Markers Reveal Genetic Diversity and Establish a Core Collection for Commercial Hypsizygus marmoreus Germplasm](https://www.mdpi.com/2309-608X/11/12/842), DOI **10.3390/jof11120842**, section **2.5**. The publisher page's full methods were available through indexed search despite an initial 429 response to direct opening.

The cultivation protocol specifies **fruiting 13–15 °C and 90–95 % RH**; **incubation 21–25 °C and 75 % RH**. Reported CO₂ is **2,500–4,000 ppm during incubation** and **1,000–2,000 ppm in fruiting**. Light is phase/time-dependent: 50–100 lux in fruiting days 1–7, 200–300 lux in days 8–20. The study concerns H. marmoreus germplasm and bottle cultivation, with a stated substrate and industrial protocol. The user-supplied Shimeji fruiting range matches it. Confidence: high as a **study-specific protocol**; not a safety limit or a validated recommendation for this prototype's hardware. The simulated 49-day duration remains synthetic and is not supported by this study.

## Other supplied sources and validation limits

- [Cornell – Seven Stages of Cultivation](https://smallfarms.cornell.edu/resources/methods-of-commercial-mushroom-cultivation-in-the-northeastern-united-states/2-seven-stages-of-cultivation/) is accessible. It explains that strain, substrate, and stage materially affect cultivation requirements. It supplies general fruiting-room guidance, not the complete 15-entry table. Use it for the explanatory phase/strain caveat, not blanket numerical verification.
- [NCAT – Mushroom Cultivation](https://www.ncat.org/publication/mushroom-cultivation/) is accessible (April 2026 introduction). It supports general production-system context, not all exact ranges from the request. Do not use a broad source link to imply every numerical field has been checked.
- [Badoni & Siddiqui (2025), Metamorphosis of mushroom production from tradition to automation](https://link.springer.com/content/pdf/10.1007/s42452-025-07517-w.pdf), DOI 10.1007/s42452-025-07517-w, is accessible. It is labelled **Perspective**, not a primary cultivation experiment. Table 3 (PDF page 10) cites prior references and differs from the brief for several taxa (e.g. oyster/shiitake). It cannot validate the entire submitted table as-is. Keep it as secondary context until its underlying primary sources are checked.
- [PMC12364752](https://pmc.ncbi.nlm.nih.gov/articles/PMC12364752/) returned an NCBI browser-check/CAPTCHA page. Official metadata endpoints and Europe PMC were not accessible through the available browsing tool, and exact-ID search did not identify the paper. **Its title, species and cultivation values remain unverified. Do not assert that it concerns P. adiposa or any other species without seeing the article.**
- Stockschwämmchen: no numerical validation established in this bounded check. Keep **Datenprüfung erforderlich / unknown**, with its existing identification warning.

## Implementation recommendation

Keep provenance per parameter and phase (`source`, `phase`, `evidenceScope`, `verification`). Distinguish **unverified project input**, **source-observed experimental protocol**, **synthetic warning threshold**, and **unvalidated hardware applicability**. Allow explicit demo comparison against provisional ranges for presentation; label that mode visibly. An unknown phase/value must not become green merely because its number is inside an invented fallback. No colour establishes edibility or personal safety. CO₂ and light remain unknown unless a particular cited protocol genuinely supplies them.
