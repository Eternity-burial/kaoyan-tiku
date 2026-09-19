# Kaoyan Canonical Lexicon

Lexicon Pipeline v1.0 canonical fusion for **考研英语一备考**.

## Scope

- 1998–2009: legacy unified kaoyan English
- 2010–2026: English One
- 2007–2018: independent Personal PDF and Exam-point PDF evidence namespaces
- English Two: excluded
- UserWord: neither generated nor overwritten

## Frozen entities

- `Lexeme`: what a word or phrase is. `dictionary` and `kaoyanCorpus` are physically separated.
- `Occurrence`: one lexical item in one real exam context. Context meanings never overwrite another occurrence.
- `Conflict`: unresolved ambiguity retained for review.
- `Report`: coverage, provenance, matching, conflict, and unresolved metrics.

## Source policy

Field-level source priorities are applied exactly as specified for v1.0. Canonical
sentence locators use `P{paragraph}-S{sentenceWithinParagraph}`; historical indices
remain source locators. Lazynote `sentenceCount`, `occurrenceCount`, `paperCount`,
`yearDistribution`, and `questionTypeDistribution` are copied verbatim and are not
recomputed from this dataset. ECDICT BNC/FRQ values remain general-corpus ranks.

`personalPdf=true` is created only from an explicit vector highlight in `个人精读版`.
`examPointPdf=true` is created only from an explicit lexical highlight in `考点标注版`.
`isSelfAnnotated` is not used for PDF annotation derivation.

## Build summary

- Lexemes: 6554
- Occurrences: 21262
- Conflicts: 5837
- Unresolved: 6525
- Astra-derived context meanings: 0

See `review/report.json` and `manifests/` for full details.
