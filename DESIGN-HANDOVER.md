# Portfolio redesign handover

Implemented in React + Vite with no new dependencies. Direction: restrained console home screen, dark blue ambient background, project rail, white selected outline, abstract CSS project artwork, and concise professional content.

## Files
- src/App.jsx: page sections, project selection, arrow/Home/End keyboard navigation, direct contact links.
- src/App.css: responsive presentation, project artwork, motion.
- src/index.css: global tokens, focus states, skip link, reduced motion.
- src/data/projects.js: curated public project content and canonical repository IDs.

## Content evidence
Read public GitHub READMEs on 2026-10-08:
- https://github.com/ahmadzamir1403/ahmadzamir1403
- https://github.com/ahmadzamir1403/n8n-starter
- https://github.com/ahmadzamir1403/ats-resume-layout-skill
- https://github.com/ahmadzamir1403/personal-waystone
- https://github.com/ahmadzamir1403/mining-companion

Included public projects that demonstrate automation, tooling, and Java development. Profile README supplies education, career interests, and web/data technologies. Email and LinkedIn are retained from the original portfolio. Private repositories, activity counts, skill percentages, and unverified contribution claims are omitted. Artwork is decorative CSS, not a project screenshot.

## Validation
Production Vite build and oxlint passed. Browser visual and interactive verification could not run because no browser is connected. Review at 1440px, 768px, and 390px; confirm no page overflow, all four selectors update details and repository links, keyboard navigation retains focus, anchors work, and reduced motion disables transitions.

## Future edits
Keep project information in the data module. Retain descriptive repository links and factual copy. No experience timeline or resume download is included because verified source material is not present. The old contact form prevented submission; contact now opens the email client.

## Atmospheric background update
Added src/components/ParticleBackground.jsx and its CSS: seeded canvas particles, blue/warm-white depth layers, animated light ribbons, and project-colored glow. Header control pauses/resumes ambience. Mobile uses 40 particles; desktop uses 82. Canvas drawing is capped at 30fps and 1.5 device pixel ratio. Reduced motion produces a static frame; hidden tabs stop scheduling animation. Cleanup removes listeners, resize observer, and animation frames. Production build, lint, and isolated mocked lifecycle checks (running, paused, reduced motion, visibility, cleanup) pass. Visual browser verification remains unavailable.

## Welcome screen
Added WelcomeScreen.jsx/CSS: full-viewport particle entrance with name, monogram, and “Click anywhere to explore” (touch uses “Tap anywhere to explore”). Native button supports Enter/Space and receives initial focus. Entrance fades out over 520ms; reduced motion enters immediately. Background portfolio stays inert and hidden from assistive technology until entry, then focus moves to main. Body scroll is restored on unmount. Direct links with a URL fragment bypass the entrance. Separate ambience pause control remains available on the welcome screen. Build and lint pass; visual browser verification remains unavailable.

## Reactive atmosphere
Background now uses passive pointer listeners for mouse/touch: smoothed cursor glow, nearby particle repulsion, depth parallax, and up to four soft click/tap ripples. Inputs never intercept normal navigation or scrolling. Touch release, pointer cancellation, window exit/blur, scrolling, and tab visibility reset interaction. Pause and reduced motion disable interaction. Listeners and animation frames are cleaned up. Production build, lint, and mocked interaction checks pass (parallax, ripple, touch release, pause, reduced motion, hidden tab, cleanup). Browser visual testing is still unavailable.

## Scale and pointer polish
Desktop layout enlarged approximately 10% through actual dimensions: 1400px max content width, larger heading/body type, 158px project tiles, and slightly larger artwork. Mobile sizes are preserved. Background click ripples removed (supersedes earlier ripple notes). Pointer highlight is now a broad, blurred CSS light wash tinted by project, with slower follow and gentler particle movement. Touch only starts pointer tracking; no click effect. Pause/reduced motion clears the aura immediately. Build, lint, and mocked interaction/cleanup checks pass.

## Selected work replacements
Resume Layout Skill replaced with Resume Screener (FYP), verified from ahmadzamir1403/resume-screener README: current Express/Node.js application, embedding matching, LLM analysis, Supabase, OCR. Personal Waystone replaced with Internship Logbook, verified from ahmadzamir1403/logbook README: Next.js/TypeScript, Neon Postgres/Drizzle, daily placement entries, picture attachments, PDF import/export. Both repositories are private; the FYP uses a discuss-by-email action and Logbook links to the live application documented in its README. No private repository content beyond the user-requested high-level project summaries is included. Project data now supports optional url and actionLabel.

## Project thumbnails and background edge
Replaced rail letter/orbit tiles with four bespoke local SVG illustrations in public/projects: workflow graph, resume matching document, internship journal/calendar, copper mining companion. Illustrations are symbolic artwork rather than application screenshots. Project data supplies thumbnail paths; selected/hover/focus treatment is retained. Large featured artwork now has a centered radial fade reaching transparency at its edges; the ambient layer also fades at its bottom to remove rectangular cutoffs. Build and lint pass.

## Brighter palette
Replaced the desaturated charcoal/purple atmosphere with a consistent cobalt-blue base, cyan light, and warm peach actions. Project selection no longer recolors the full-page lighting. Landing screen, pointer aura, particles, cards, and main project illustration colors follow this palette. Logbook thumbnail now has warm peach accents. Background fades and reduced-motion behavior remain. Build and lint pass; core body/button color pairs checked for contrast.

## Matching large previews
ProjectArt now uses the same project illustration in both tile and featured view. Separate transparent -art.svg assets remove the tile background and border for the larger preview, preventing rectangular cutoffs. Old letter/orbit placeholder artwork is no longer rendered. Build/lint and all four preview asset requests pass. Local dev server confirmed to serve the brighter palette.

## Name hover and header links
Added reusable ReactiveName component to the welcome and main headings: pointer-positioned cyan/peach text sheen, diffuse glow, subtle tilt/lift, and highlighted dot. Touch has no hover animation; reduced motion removes movement. Welcome name remains an enter button and keeps the click-anywhere behavior. GitHub, LinkedIn, and Email moved from the footer into a labeled top navigation group, with a second header row on narrow screens. Build and lint pass.

## Welcome refinement
Removed full-screen focus outline and placed keyboard focus styling on the visible enter icon. Replaced boxed AZ with a free-standing az/ wordmark, tightened center composition, refined responsive heading sizes, and updated subtitle. Enter key hint now uses a compact keycap. Page remains click/touch/keyboard accessible and motion preferences are respected. Build and lint pass.

## Space-inspired upper welcome area
Added WelcomeSky.jsx/CSS with a CSS-lit planet and orbital ring, sparse SVG stars, a decorative constellation, subtle wide orbital arcs, and diffuse nebula lighting. Art is static and decorative; existing reactive particles supply motion. Layer uses pointer-events:none and aria-hidden, with smaller/hidden planet on compact and short viewports. Build and lint pass.

## Realistic moon replacement
Replaced the smooth ringed CSS planet with a detailed transparent moon cutout, created using the built-in imagegen tool and saved to public/images/moon.png. WelcomeSky uses a subtle CSS halo and responsive placement; rings removed. Production build/lint pass and moon asset serves HTTP 200.

Generation prompt:
Use case: photorealistic-natural. Asset type: transparent decorative moon cutout for a polished blue space-inspired portfolio landing page. Generate one isolated realistic Earth's Moon, near-full waxing gibbous phase, clean circular silhouette with a gentle shadow along the lower-right edge. Detailed natural grey lunar regolith, recognizable broad dark lunar maria, crisp fine crater relief, subtle ivory/silver light from upper left, charcoal shadow. Monochrome neutral silver-grey with only the slightest cool tint, no saturated blue. Centered circular moon occupying about 88% of a square image. Transparent background, retain the whole lunar disk and its dark side. No stars, no sky, no rings, no orbit lines, no text, no lens flare, no oversized glow, no stylized cartoon shading. Photographic telescopic lunar texture, high detail readable at 160-220 pixels.

## Scroll space and Evangelion moon animation
Main page uses ScrollSpace.jsx/CSS to fade from the blue console atmosphere into a fixed nebula/star field as scrolling progresses; scrolling up reverses the change. Scroll updates are scheduled through one animation frame and listeners are cleaned up. The generated moon appears as space comes into view. Mobile retains stars and omits the moon; reduced motion/pause disable parallax.

Added MoonBattle.jsx/CSS, a compact transparent 4-column by 2-row sprite animation beside the moon on both landing and scrolled main screens. Eight hand-drawn frames based on the user's Evangelion references: red Unit-02 versus white mass-production Eva. Includes attacks, block, counter, kick and recoil; no gore. Sprite plays a short exchange with a face-off pause. Ambience pause, reduced motion, hidden tab, inactive main screen, and unrevealed scroll moon suppress animation. Built-in imagegen created public/images/eva-moon-battle.png (1774x887), inspected for consistent frame layout. Build/lint pass, asset HTTP 200.

Sprite generation prompt:
Use case: stylized-concept. Asset type: transparent 2D anime combat sprite sheet for a SMALL decorative website animation next to a moon, rendered about 200px wide.
Input image 1: character reference for Evangelion Unit-02, the red/orange humanoid Eva with purple neck and green face details. Input image 2: character reference for the white mass-production Evangelion with long black wings, white elongated head, red mouth and white armored humanoid body. These are references only, not the sheet layout.
Generate ONE clean sprite sheet, exactly 4 equal columns by 2 equal rows (8 frames in row-major order). Use a wide 2:1 canvas, all eight square cells equal sized, no gutters. Transparent background throughout. No grid lines, no borders, no labels or text.
Every frame contains BOTH characters in the same miniature fight scene, consistent character scale and stationary camera. Red Eva remains on LEFT facing right; white winged Eva remains on RIGHT facing left. Both full bodies visible with a generous safe margin. Make both readable anime cel-shaded sprites, crisp contours, faithful colors, simplified details suitable at small size.
Frame 1: hovering facing off.
Frame 2: red Eva crouches in midair and winds up to attack, white raises claws.
Frame 3: red lunges right with a punch, white leans back.
Frame 4: white blocks, small pale amber slash at contact (no explosion).
Frame 5: white lunges left with a claw strike and outstretched black wings, red guards.
Frame 6: red evades and delivers a kick, white recoils.
Frame 7: both push away, drifting apart.
Frame 8: both return to hovering face-off, matching frame 1 for seamless repeat.
Constraints: consistent left/right positions, same character sizes, aligned baseline and camera in every frame, all wings/limbs within each cell; no background, moon, scenery, ground, blood, gore, dismemberment, subtitles, logos or watermark. Keep the scene compact and polished, not photorealistic.

## Moon battle scale and impacts
Fight now sits along the moon’s upper edge at 56% of moon width (max 108px), shared between landing and main scroll view. Removed old main-page positioning override. Added synchronized brief white silhouette impact frames and small starburst contact effects for block/kick frames. Pausing and reduced motion apply to both sprite and impact effects. Build and lint pass.


## Extended spear fight
- Replaced the moon fight with a 12-frame, 4-column / 3-row transparent sprite sheet: `public/images/eva-spear-battle.png` (1448 × 1086).
- 8.4-second loop: red Unit-02 faces two white Evas, parries, kicks, winds up and throws the forked red spear at the upper enemy; the hit receives a brief local silhouette impact frame and starburst before recoil.
- Remains above the moon, 66% moon width, capped at 128px. Pause, tab visibility and reduced-motion behavior retained.
- Generated with built-in image generation using the user's spear reference and earlier battle sheet.

Final generation prompt:
```text
Use case: illustration-story
Asset type: transparent animation sprite sheet for a tiny portfolio decoration, 4 columns by 3 rows, twelve equally sized SQUARE cells. Overall canvas aspect ratio 4:3. NO gutters, borders, text, numbers or background. True alpha transparency.
Reference 1: red forked Spear of Longinus weapon design, preserve distinctive double long tapered prongs and twisted shaft.
Reference 2: existing sprite sheet gives exact character designs and anime cel shaded style. Red Evangelion Unit-02 versus TWO white winged Mass Production Evangelions. Exactly one red and two white characters per frame, except the struck white character can move toward edge in final frames.
Create a NEW sequential fight sprite sheet, read left to right then top to bottom. Each cell contains the WHOLE miniature scene, fixed camera, consistent character scale, generous 8 percent inner padding so wings and spear never touch cell boundaries. Red on left, two white enemies on right (one nearer center, one upper right). Crisp silhouette, clear colors, no gore.
Frames 1-12: 
1 red holds long red forked spear facing both white enemies.
2 nearest white lunges, second hovers behind.
3 red parries using spear.
4 red kicks nearest white back while holding spear.
5 enemies regroup, red turns to second white enemy.
6 red draws spear over shoulder preparing throw.
7 red twists body, spear still in throwing hand.
8 red releases spear, its red forked silhouette visible flying across middle gap.
9 spear travels farther toward upper-right white enemy, red arm extended.
10 spear strikes upper-right white enemy with compact sharp white-yellow starburst, nearest white is still present.
11 struck white enemy recoils backward, spear lodged at chest armor, no gore, first white backs away.
12 red floats victorious in ready stance facing remaining white as struck one drifts back.
Keep all three recognizable and same sizes throughout, clean original Japanese anime ink outlines with flat cel shadows, transparent empty space, no moon or scenery.
```

- Timing update: spear fight loop accelerated to 4.8 seconds; sprite and impact timings remain synchronized through --battle-duration.


## AT Field and sprite edges
- Added seven concentric orange octagons, blooming from the center after the spear hit. Remaining white Eva lunges into the shield, causing a short bright strike and shield recoil. Full loop remains 4.8 seconds.
- Sprite rendering removes low-alpha matte fringes using a unique inline SVG alpha filter and a slight edge trim; the frame boundary is feathered to soften clipped wings. Kept the existing sprite sheet because generated cleanup variants did not improve it.
- Shield and impact animations inherit pause state and respect reduced motion.

- AT Field moved closer to Eva-02: left 29% of battle frame; shield strike shifted with it to left 46%.

## Horizontal navigation, profile entry, project previews, and scroll audio

- Work, About, Skills, and Contact now occupy horizontal, snapping viewport panels. Mouse wheel advances at panel edges, native horizontal scrolling and touch swipes work, and Left/Right or A/D navigate sections. Tall panels keep their own vertical scrolling. Header links and footer arrows/dots offer direct navigation; URL fragments still open the corresponding section. Project selectors and screenshot galleries retain their own arrow controls.
- The welcome portrait shrinks and travels into the top-right profile badge during entry. Reduced motion enters immediately. The badge links to About; the introduction no longer duplicates the portrait.
- Project tiles show a viewport-positioned detail popup on mouse hover or keyboard focus. The popup includes the summary, technologies, and feature details; Escape, scrolling, resizing, selection, and leaving dismiss it. A short exit delay allows moving the pointer onto the popup.
- Scrolling plays a faint glass clink synthesized with Web Audio: a clear high resonance, a delicate ring, and quickly fading upper tones. Audio initializes only after a user gesture, is rate limited, remains silent in hidden tabs, and has an independent mute control beside the ambience control.
- Space background progress and horizontal parallax follow the panel track.
- Validation: production build and lint pass. Mocked hook smoke checks pass for deep links, resize, navigation boundaries, reduced motion, arrow/A/D controls, editing and gallery priority, vertical overflow, wheel inertia, audio activation/volume/throttling/mute/hidden tabs, and listener cleanup. Browser visual and audible QA could not run because no browser is available in this session.

## Landing particle entrance

- Each fresh landing-screen mount starts the dust scattered across the viewport with immediate drift, then gathers it into the curved stream over roughly three seconds. After gathering, particles continuously travel along the curve at varying speeds with visible vertical drift. Particles recycle outside the viewport edges. Warmer, brighter dust makes the movement easier to see; click scattering remains.
- Pause/resume keeps the current particle positions. Resizing preserves positions and velocities relative to the viewport rather than restarting the entrance. Reduced motion shows the aligned stream immediately.
- Validation: lint and production build pass. Desktop (1440 × 900) and mobile (390 × 844) motion checks confirm initial scattering and gathering, roughly 70 pixels of continued movement over two seconds, finite positions through a minute of flow, recycling beyond the visible edges, and click scatter/return. Browser visual QA remains unavailable in this session.
