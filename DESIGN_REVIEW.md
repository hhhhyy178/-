# BonjourLab redesign review

| Before | After | Why |
| --- | --- | --- |
| Dashboard stats before lesson task | Current lesson, listenable phrase, one start action | A beginner can identify what to do first |
| All explanations, vocabulary and exercises in one long page | Four learning stages, one exercise at a time, manual next | Reduce working-memory load and keep feedback visible |
| First wrong answer reveals solution | Hint first, optional answer after two errors, return to explanation | Encourage a second attempt with support |
| Device-selected TTS at rate 0.65 | Fixed neural French samples with separately generated slow speech; configurable fallback | Consistent voices and offline playback across devices |
| Seven horizontally scrolling phone navigation items | Four bottom items, remaining tools under More | All destinations have visible labels without sideways hunting |
| Tiny technical/IPA labels | 16px reading, optional IPA, scenario-based Chinese explanations | Make introductory lessons readable without phonetics knowledge |

## Validation

20 unit/integration tests; 3 mobile browser flows; 2 desktop browser flows. Mobile tests cover IndexedDB reload, backup/restore, wrong-answer recovery, next-lesson gates, accent input, offline normal/slow MP3 playback with TTS absent, range requests and both repository URL prefixes. Next production build and TypeScript pass.

Chromium at 320, 375, 390, 768, 1280 and 1440 px: home and lesson had no horizontal overflow and no page errors. Programmatic focus moves to lesson stage heading. Representative home, lesson, explanation, error, success, More and light/dark screenshots reviewed. A phone next-action positioning issue was corrected. Dark screenshots captured after theme transitions settled. Bottom navigation stays fixed; page padding allows reaching the final action/footer by scrolling.

Taste source lint: 0 FAIL, 0 WARN for the three new primary components. Its bundled browser launcher could not start under this container's sandbox; Playwright with the environment's Chromium provided actual rendered screenshots and checks instead. Impeccable context engine did not run because its default cache was unwritable; project context and craft-floor instructions were read directly. Neither unavailable automatic check is claimed as passed.

## Screenshots Captured

`screenshots/home-{320,375,390,768,1280,1440}.png`, `lesson-{320,375,390,768,1280,1440}.png`, `lesson-dark-{375,768,1280}.png`, `explanation-390.png`, `quiz-error-390.png`, `quiz-success-390.png`, `tools-390.png`.

## Limits

No physical iPhone / Safari listening review, VoiceOver testing or independent French-teacher audio validation. Neural speech is not represented as human narration or guaranteed accent assessment. AI remains the existing optional server integration or offline preset rules. Repository rename was attempted with the authorized name and denied by GitHub (HTTP 403); only its owner can finish that setting with the current connection. No old learning data schema changed.
