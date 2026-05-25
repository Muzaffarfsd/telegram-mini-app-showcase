# AI MEDIA PROMPT MASTERY — Higgsfield (image) + Seedance (video)
> Canonical reference. May 2026 / Hollywood-grade. Built from a 4-agent deep web
> dive: official Higgsfield Nano-Banana-Pro & Soul guides + Higgsfield Head of
> Prompt Engineering, Google Cloud Nano Banana guide, official ByteDance Seedance
> 2.0 6-step guide, fal.ai Seedance API, cinematography glossaries, 2026 AI-media
> quality-bar analyses. READ THIS FILE before generating ANY image or video.

## 0. THE 9 LAWS
1. Image-first ALWAYS. Generate + perfect the hero STILL, then animate it
   (image-to-video). Text-to-video direct = amateur; it morphs and flickers.
2. Match the model to the job (see 1) — Nano Banana Pro vs Soul are prompted in
   OPPOSITE ways. Using one style for both is the #1 cause of mediocre output.
3. Command syntax, comma clauses. No "please/create an image of/I want". No
   adjective spam ("epic, stunning, masterpiece") — it carries zero information.
4. Every clause is a real decision: name the material+finish, the light source +
   direction, the lens, the grade. Concrete physical descriptors only.
5. Front-load by priority — the engine reads the prompt as an instruction stack.
6. One subject · one coherent light logic · one accent colour (with a hex).
7. Lock the seed once a result wins; iterate by changing ONE variable at a time.
8. Raw model output is a RAW file, not a finished print. Post is non-optional:
   upscale -> de-artifact -> grade -> grain/dither -> composite real type.
9. Never let AI render real brand text/logos — composite live vector type in post.

## 1. WHICH MODEL
- nano_banana_pro (Gemini 3 Pro Image): a REASONING engine, strict instruction-
  follower. Best for hero layouts, precise composition, OLED-black scenes, exact
  colour placement, anything with text/UI. Rewards long, STRUCTURED prompts —
  even JSON. Render hero assets at 4K.
- nano_banana_2: faster/cheaper sibling — scene variants, volume.
- soul / soul_2: aesthetics-first ("taste built in"), editorial/fashion/portrait,
  human subjects. Rewards a CONCISE creative brief (cap ~75 words — overloading
  dilutes the "Soul signal"). soul_id locks a recurring brand face/character.
- Pipeline: Soul for the human/emotional base -> Nano Banana Pro for precise
  scene variants. For our dark-tech brand, Nano Banana Pro is the workhorse.

## 2. HIGGSFIELD IMAGE PROMPTS
### Nano Banana Pro — clause order (official 6-variable blueprint)
SUBJECT -> COMPOSITION -> ACTION -> LOCATION/ENVIRONMENT -> STYLE, then
CAMERA/LIGHTING and CONSTRAINTS. Google's text-to-image formula:
[Subject] + [Action] + [Location] + [Composition] + [Style].
Short comma clauses, not one sprawling sentence. For layout-heavy hero/marketing
assets use a JSON prompt — Pro parses keys (subject, environment, lighting,
color_palette, camera, composition, render, aspect_ratio, constraints) and binds
them to semantic regions. JSON = highest control.

### Soul — clause order (creative brief)
identity/subject -> wardrobe/styling -> pose/expression -> setting -> camera/lens
-> lighting/mood -> aspect ratio. ~50-75 words. Use presets. Don't over-explain a
vibe — Soul knows subcultural shorthand.

### Reusable Nano Banana Pro template (prose)
"[Subject — exact material + finish + ONE signature detail], [environment /
surface], [shot scale + camera angle], [light: source + direction + quality, e.g.
low-key chiaroscuro, single soft key + emerald rim light, negative fill], shot on
[real cinema body] [focal length] at [aperture], [colour grade — name the black
'OLED-black, crushed blacks, near-zero black point' + ONE accent with hex],
[mood], [render: ultra-detailed photoreal micro-texture, crisp speculars, fine
grain, 4K], aspect ratio [X:Y]. No text, no logos, no clutter, no lens flare,
no banding, no plastic CGI sheen."

### Knobs
- Aspect ratio: state numerically IN-prompt AND in the control. Native 1K/2K/4K.
- Text: enclose exact words in "double quotes" + name the font; better — never
  let AI render brand type, composite vectors in post.
- Exclusions: prefer positive framing ("empty surface" > "no clutter") but Pro
  does respect a short negative clause for known failure modes.
- References: up to 14 images, weight per image. Don't mix contradictory refs.
- Consistency: soul_id for a face; seed-lock + 80-90% identical prompt for series.
- CFG/guidance 5-8 (NOT >10) — high CFG = the plastic over-smoothed look.

## 3. SEEDANCE VIDEO PROMPTS
Director language in a FIXED clause order, ~60-100 words. Officially 6 steps:
SUBJECT -> ACTION -> ENVIRONMENT -> CAMERA -> STYLE/LIGHTING -> CONSTRAINTS.
For Seedance 2.0 declare shot count + total duration + aspect ratio at the TOP.
Front-loading the shot type is the highest-impact single change.

### THE core rule — separate the two motions
Subject motion and camera motion go in SEPARATE sentences. Fusing them
("camera spinning around a dancing person") is the #1 cause of jitter/morph.
Right: "The dancer spins slowly. The camera holds a fixed frame."

### Camera vocabulary (use ONE primary move + a pacing word)
push-in / slow dolly-in (intimacy) · pull-out / dolly-back (reveal) · truck / pan
(lateral scan) · tilt up/down · orbit / arc (product; hard to loop) · crane/jib ·
tracking / steadicam · handheld micro-shake (avoid for premium bg) · locked-off /
static (safest, cleanest) · optical zoom. Pacing words: slow, gentle, gradual,
imperceptible, smooth, continuous. NEVER use "fast" (highest jitter risk). No
photo specs (f/2.8, ISO, mm) — Seedance does not parse them.

### Seamless loop
Use image-to-video with the SAME still as start_image AND end_image -> perfect
loop. Or state "the final frame matches the composition, lighting and camera of
the first frame for a seamless loop" + cyclical motion (drift, slow rotation,
light pulse). Static bg = "locked-off tripod, no shake".

### Image-to-video
Do NOT re-describe the still — describe ONLY motion, camera, mood, then add
"preserve composition, colours and lighting; no identity change, no new objects,
no text". start_image = first frame, end_image = last frame.

### Constraints / anti-artifact
Always end: "avoid jitter, warping, morphing, temporal flicker, identity drift,
fast movement, cuts, text". One subject, one action, one move, one light. Add
"no 3D, no cartoon, no VFX" for realism. Artifacts accumulate LINEARLY with
length -> a crisp 5s loop beats a stretched 10s. Hero loop: 5-8s, 1080p+, render
16:9 desktop and a SEPARATE 9:16 for mobile (don't crop).

## 4. CINEMATOGRAPHY VOCABULARY BANKS
LIGHTING: low-key / chiaroscuro (core "premium on black"); rim/edge/kicker light
(name it "emerald rim light" to drive the accent); three-point; soft key /
softbox / diffused; hard light; negative fill (deepens shadow — the moody-
contrast secret); practical / motivated light (in-frame source — lets emerald
read as diegetic); volumetric light / god rays through haze; cameo (subject lit,
bg falls to black); Rembrandt/butterfly/loop/split (faces only).
LENS/CAMERA: 24-35mm (wide, environmental) · 50mm (neutral) · 85mm (hero/portrait
compression + separation) · 100mm macro (texture/edges) · shallow DoF f/1.4-f/2.8
+ creamy bokeh · anamorphic (oval bokeh + horizontal flare — strongest "cinema"
cue) · name a real body: "ARRI Alexa 35", "Sony Venice" · "full-frame look".
COLOR/FILM: for our brand use "emerald-and-black grade" (cool emerald highlights
vs crushed black shadows) instead of teal-orange · crushed blacks (OLED-true) ·
colour temperature in Kelvin (3200K warm / 5600K neutral) · film stocks (Kodak
Vision3 500T, Portra, Fuji Eterna — don't mix) · fine grain · halation (warm
bloom around bright highlights — great around emerald practicals).
COMPOSITION: negative space (= luxury, room for copy) · rule of thirds vs centered
symmetry (product authority) · leading lines · explicit fg/mg/bg depth layering
(defeats the flat "sticker" look) · state aspect ratio.
TEXTURE/ATMOSPHERE: atmospheric haze (separates depth, makes beams visible) ·
floating dust/particles · controlled specular highlights (no blown hotspots) ·
NAME the finish — matte, anodized aluminium, brushed metal, frosted glass,
polished obsidian, soft-touch plastic (strongest texture lever) · subsurface
scattering · gradient light falloff (the automotive-ad curve-revealer).
REFERENCE shorthand: use genre/era TECHNIQUE looks ("film-noir lighting",
"Blade Runner 2049 fog-diffused practicals + bold mono colour wash", "high-end
automotive ad lighting", "Apple product lighting"). Camera bodies + film stocks =
safe + high impact. Do NOT name living artists or reproduce brands/logos (ToS +
litigation). Describe the technique, not the name.

## 5. THE AMATEUR TELLS -> FIXES (2026 quality bar)
- Plastic / waxy CGI sheen -> CFG 5-8, prompt "natural micro-texture, fine grain,
  matte finish, subsurface scatter", add real grain in post 2-5%.
- Lighting incoherence (puddles of light, impossible shadows) -> physics-first:
  ONE light source, state position+direction+falloff+one colour temp; never
  contradict it.
- Over-busy centered composition -> explicit comp direction + deliberate negative
  space; one subject per frame.
- Banding on OLED-black + emerald gradients -> generate higher bit depth + a
  noise/dither/grain layer over EVERY dark gradient (5-10% scale, 2-5% opacity).
- Flat depth / sticker look -> fg/mg/bg layering + real lens + shallow DoF + haze.
- Generic "AI slop" (indigo-violet wash, floating 3D blobs, glassy sameness) ->
  art-direct AGAINST the statistical default; reject anything that could belong
  to any other brand.
- Temporal jitter/morph -> image-first anchor, simple scene, one motion, short clip.
- AI-rendered text/logos -> composite real vector type in post.

## 6. WORKFLOW (every asset)
1. Write the IMAGE prompt (sec 2 template) -> generate the hero still, 4K.
2. Review; regenerate changing ONE variable until elite; lock the seed.
3. Feed that still into Seedance image-to-video (sec 3 template, motion only) for
   the hero loop — 5-8s, 16:9 + a separate 9:16.
4. Post: upscale (Topaz = fidelity/realism; Magnific = creative detail, slider
   3-5) -> de-artifact -> colour grade/LUT -> real grain + dither on darks ->
   composite real typography. Never ship raw output.
5. SET CONSISTENCY: lock and reuse ONE each across all assets — light logic,
   palette (hexes), grain structure, lens character. Fixed prompt template where
   only the subject changes. Expect ~85% from the model; close the rest by hand.

## 7. HERO ART DIRECTION — WEB4TG (OLED black + emerald accent)
HALLMARKS: one focal point + one message; extreme contrast, true OLED black with
ONE bright element; colour discipline — emerald is an ACCENT (90%+ of frame near-
black; green only as rim-light / glow core / single CTA moment, NEVER a flat
green wash); generous negative space; subtle grain (kills banding, "not-AI" cue);
motivated single-source light; depth via shallow DoF. Restraint signals premium
(Linear / Stripe / Vercel — fewer, intentional choices).
RANKED HERO CONCEPTS: 1) glowing phone in a void, the screen itself the only
light source (Apple playbook); 2) volumetric emerald god-rays through dark haze
(green a whisper at edges, white-hot core); 3) abstract dark-chrome / black-glass
liquid light-form, emerald rim + refraction; 4) type-driven kinetic (composite
REAL vector type); 5) sparse slow particle field; 6) macro product-edge detail.
ANTI-PATTERNS: plastic CGI sheen; over-busy scenes; generic tech clichés (glowing
circuit boards, holo globes, binary rain, hexagon grids); AI-rendered text;
inconsistent lighting; flat green wash; un-dithered dark gradients.
MOTION: slow, singular, seamless. ONE camera move OR locked-off with internal-
only motion (light sweep / particle drift / screen-glow breathing). 5-8s,
barely-perceptible — a breath, not a swing. Start frame = end frame.

## 8. EXAMPLE ELITE PROMPTS
IMAGE — Nano Banana Pro hero (JSON, 4K, 9:16):
{"subject":"a single matte-black flagship smartphone floating upright, screen
displaying a minimal Telegram mini-app interface with emerald-green UI accents,
the screen the only light source","environment":"infinite OLED-black void","
composition":"centered, medium product shot, generous negative space","lighting":
["the glowing screen as the key practical","a soft emerald rim light tracing the
chassis edge","deep negative fill","subtle volumetric haze"],"camera":{"body":
"ARRI Alexa 35","lens":"100mm macro","aperture":"f/4"},"color_palette":["OLED
black #050505","emerald #34d399","pure white"],"grade":"crushed blacks, cool
emerald highlights, fine film grain, subtle halation","render":"hyper-real
product render, crisp speculars, anodized metal micro-texture, 4K","aspect_ratio"
:"9:16","constraints":["no text","no logos","no banding","no plastic CGI sheen"]}

VIDEO — Seedance image-to-video hero loop (seamless):
"Single continuous seamless looping shot, 6s, 9:16, 1080p. Animate this image.
The smartphone holds still; only a soft emerald glow breathes slowly across its
screen and faint dust particles drift upward through the haze. The camera holds a
locked-off static frame, no shake. Low-key chiaroscuro, single emerald rim light,
deep falloff into absolute black. Cinematic 35mm film tone, ARRI ALEXA aesthetic,
fine grain, shallow depth of field. Preserve composition, colours and lighting
exactly; no identity change, no new objects, no text. The final frame matches the
first frame for a seamless loop. Avoid jitter, warping, morphing, flicker, fast
movement, cuts. NO MUSIC."
