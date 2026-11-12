"""
Color Matching Question Generator — Pure Python Game Engine.

Generates unlimited procedurally crafted color matching questions across:
- Primary & Secondary Color Recognition & Mixing
- Complementary, Analogous & Triadic Harmonies
- Digital Color Space (RGB channels, Hexadecimal encoding, HSL angles)
- Subtractive (CMYK) vs Additive (RGB) Physics
- Visible Light Spectrum (Wavelengths in nanometers)
- Advanced Perception: CIE L*a*b*, Luminance, Delta-E difference
"""

import random
from typing import Optional

from generators.base import BaseGenerator
from models.question import QuestionModel, Difficulty, QuestionType, GameMode
from utils.helpers import generate_id, calculate_xp, calculate_coins, calculate_time_limit, shuffle_options_with_answer


class ColorGenerator(BaseGenerator):
    """Procedural color battle generator with beginner to grandmaster progression."""

    @property
    def mode(self) -> str:
        return GameMode.COLOR.value

    TOPICS: list[str] = [
        "mixing",
        "complementary",
        "rgb_hex",
        "cmyk",
        "harmonies",
        "wavelengths",
        "hsl",
        "color_science",
    ]

    def generate(
        self,
        difficulty: Difficulty,
        count: int = 10,
        topic: str | None = None,
        exclude_ids: set[str] | None = None,
    ) -> list[QuestionModel]:
        exclude = set(exclude_ids) if exclude_ids else set()
        questions: list[QuestionModel] = []
        attempts = 0

        while len(questions) < count and attempts < count * 6:
            attempts += 1
            t = topic if topic and topic in self.TOPICS else random.choice(self.TOPICS)
            q = self._dispatch(t, difficulty)
            if q and q.id not in exclude:
                exclude.add(q.id)
                questions.append(q)

        return questions

    def _dispatch(self, topic: str, difficulty: Difficulty) -> Optional[QuestionModel]:
        generators = {
            "mixing": self._gen_color_mixing,
            "complementary": self._gen_complementary,
            "rgb_hex": self._gen_rgb_hex,
            "cmyk": self._gen_cmyk,
            "harmonies": self._gen_harmonies,
            "wavelengths": self._gen_wavelengths,
            "hsl": self._gen_hsl,
            "color_science": self._gen_color_science,
        }
        fn = generators.get(topic)
        return fn(difficulty) if fn else None

    # ── 1. Color Mixing (Additive & Subtractive) ──────────────────────────────
    def _gen_color_mixing(self, difficulty: Difficulty) -> QuestionModel:
        if difficulty == Difficulty.BEGINNER:
            mixes = [
                ("Red", "Blue", "Purple (Violet)", ["Green", "Orange", "Brown"]),
                ("Blue", "Yellow", "Green", ["Purple", "Orange", "Cyan"]),
                ("Red", "Yellow", "Orange", ["Brown", "Purple", "Pink"]),
                ("White", "Red", "Pink", ["Orange", "Grey", "Yellow"]),
                ("Black", "White", "Grey", ["Brown", "Blue", "Purple"]),
            ]
            c1, c2, correct, distractors = random.choice(mixes)
            q_text = f"🎨 Color Mixing: Which color is formed by mixing {c1} and {c2}?"
            explanation = f"In traditional pigment color theory, {c1} mixed with {c2} yields {correct}."
            hint = f"Combine the two base colors {c1} and {c2} on a standard artist palette."
            options, _ = shuffle_options_with_answer([correct] + distractors, correct)
            return self._build(q_text, correct, explanation, hint, difficulty, "mixing", ["pigment", "primary"], options)

        elif difficulty == Difficulty.INTERMEDIATE:
            rgb_mixes = [
                ("Red", "Green", "Yellow", ["Cyan", "Magenta", "White"]),
                ("Green", "Blue", "Cyan", ["Yellow", "Magenta", "White"]),
                ("Red", "Blue", "Magenta", ["Cyan", "Yellow", "White"]),
                ("Red, Green, and Blue at full intensity", "None", "White", ["Black", "Yellow", "Cyan"]),
            ]
            c1, c2, correct, distractors = random.choice(rgb_mixes)
            if c2 == "None":
                q_text = f"💡 Additive Light Physics: What color is produced by combining {c1}?"
            else:
                q_text = f"💡 Additive RGB Lighting: What secondary light color is created by overlapping {c1} light and {c2} light?"
            explanation = f"In the additive RGB color model (used in digital screens and stage lighting), {c1} + {c2} equals {correct}."
            hint = "Recall the additive RGB primary overlap model where Red + Green = Yellow, Green + Blue = Cyan, Red + Blue = Magenta."
            options, _ = shuffle_options_with_answer([correct] + distractors, correct)
            return self._build(q_text, correct, explanation, hint, difficulty, "mixing", ["additive", "rgb-light"], options)

        else: # ADVANCED / EXPERT
            cmyk_mixes = [
                ("Cyan", "Magenta", "Blue", ["Green", "Red", "Yellow"]),
                ("Yellow", "Cyan", "Green", ["Red", "Blue", "Black"]),
                ("Magenta", "Yellow", "Red", ["Blue", "Green", "Purple"]),
                ("Cyan, Magenta, and Yellow pigments", "None", "Dark Muddy Brown / Composite Black", ["Pure White", "Bright Grey", "Neon Blue"]),
            ]
            c1, c2, correct, distractors = random.choice(cmyk_mixes)
            q_text = f"🖨️ Subtractive Color Synthesis: In high-precision 4-color process printing (CMYK), combining {c1} with {c2} absorbs other wavelengths to produce:"
            explanation = f"CMYK is subtractive: Cyan absorbs Red light, Magenta absorbs Green light. Mixing them leaves only Blue reflected."
            hint = "Think of ink filtering light: Cyan absorbs Red, Magenta absorbs Green."
            options, _ = shuffle_options_with_answer([correct] + distractors, correct)
            return self._build(q_text, correct, explanation, hint, difficulty, "mixing", ["cmyk", "subtractive"], options)

    # ── 2. Complementary Colors ───────────────────────────────────────────────
    def _gen_complementary(self, difficulty: Difficulty) -> QuestionModel:
        if difficulty == Difficulty.BEGINNER:
            pairs = [
                ("Red", "Green", ["Blue", "Yellow", "Purple"]),
                ("Blue", "Orange", ["Green", "Yellow", "Red"]),
                ("Yellow", "Purple (Violet)", ["Green", "Orange", "Red"]),
            ]
            base, comp, distractors = random.choice(pairs)
            q_text = f"🎯 Direct Complement: What is the exact opposite (complementary color) of {base} on the artist color wheel?"
            explanation = f"{base} and {comp} sit opposite to each other on the color wheel, creating the strongest visual contrast."
            hint = f"Look directly across from {base} on the standard 12-hue color wheel."
            options, _ = shuffle_options_with_answer([comp] + distractors, comp)
            return self._build(q_text, comp, explanation, hint, difficulty, "complementary", ["contrast", "harmony"], options)

        else: # INTERMEDIATE / ADVANCED
            digital_pairs = [
                ("Pure Red (#FF0000)", "Cyan (#00FFFF)", ["Yellow (#FFFF00)", "Magenta (#FF00FF)", "Green (#00FF00)"]),
                ("Pure Green (#00FF00)", "Magenta (#FF00FF)", ["Cyan (#00FFFF)", "Yellow (#FFFF00)", "Blue (#0000FF)"]),
                ("Pure Blue (#0000FF)", "Yellow (#FFFF00)", ["Cyan (#00FFFF)", "Magenta (#FF00FF)", "Red (#FF0000)"]),
                ("Warm Orange (#FFA500)", "Cool Azure (#005AFF)", ["Lime (#5AFF00)", "Violet (#A500FF)", "Teal (#00A5FF)"]),
            ]
            base, comp, distractors = random.choice(digital_pairs)
            q_text = f"⚡ Digital Complement: In RGB 24-bit space, which chromatic value represents the exact optical inversion / complement of {base}?"
            explanation = f"Optical inversion is calculated as (255 - R, 255 - G, 255 - B). For {base}, this produces {comp}."
            hint = "Invert each 8-bit hex channel (255 minus current channel value)."
            options, _ = shuffle_options_with_answer([comp] + distractors, comp)
            return self._build(q_text, comp, explanation, hint, difficulty, "complementary", ["hex", "inversion"], options)

    # ── 3. RGB Channels & Hex Codes ───────────────────────────────────────────
    def _gen_rgb_hex(self, difficulty: Difficulty) -> QuestionModel:
        if difficulty == Difficulty.BEGINNER:
            basic_hex = [
                ("#FF0000", "Red", ["Green", "Blue", "Yellow"]),
                ("#00FF00", "Green", ["Red", "Blue", "Black"]),
                ("#0000FF", "Blue", ["Yellow", "Cyan", "Magenta"]),
                ("#FFFFFF", "White", ["Black", "Grey", "Silver"]),
                ("#000000", "Black", ["White", "Charcoal", "Navy"]),
            ]
            hex_code, name, distractors = random.choice(basic_hex)
            q_text = f"💻 Web Color Code: What standard color does the hexadecimal code {hex_code} represent?"
            explanation = f"{hex_code} uses 2 hex digits each for Red, Green, and Blue channels (RRGGBB). Hence, it maps to {name}."
            hint = "The format is #RRGGBB where 'FF' represents maximum intensity (255) and '00' is zero."
            options, _ = shuffle_options_with_answer([name] + distractors, name)
            return self._build(q_text, name, explanation, hint, difficulty, "rgb_hex", ["hex", "web-color"], options)

        elif difficulty == Difficulty.INTERMEDIATE:
            intermediate_hex = [
                ("rgb(255, 255, 0)", "#FFFF00 (Yellow)", ["#00FFFF (Cyan)", "#FF00FF (Magenta)", "#FFA500 (Orange)"]),
                ("rgb(0, 255, 255)", "#00FFFF (Cyan)", ["#FFFF00 (Yellow)", "#FF00FF (Magenta)", "#00FF00 (Green)"]),
                ("rgb(255, 0, 255)", "#FF00FF (Magenta)", ["#00FFFF (Cyan)", "#FFFF00 (Yellow)", "#800080 (Purple)"]),
                ("rgb(128, 128, 128)", "#808080 (Medium Grey)", ["#FFFFFF (White)", "#333333 (Charcoal)", "#C0C0C0 (Silver)"]),
            ]
            rgb_val, correct, distractors = random.choice(intermediate_hex)
            q_text = f"🔢 Code Conversion: Convert {rgb_val} into its standard 6-character hexadecimal notation:"
            explanation = f"Converting base-10 values to hex: 255 = FF, 128 = 80, 0 = 00. Thus {rgb_val} converts to {correct}."
            hint = "Divide the 0-255 decimal channel values into hex pairs."
            options, _ = shuffle_options_with_answer([correct] + distractors, correct)
            return self._build(q_text, correct, explanation, hint, difficulty, "rgb_hex", ["conversion", "rgb"], options)

        else: # ADVANCED / EXPERT
            adv_hex = [
                ("#800080", "Purple / Dark Magenta", ["Teal", "Olive", "Maroon"]),
                ("#008080", "Teal", ["Navy", "Olive", "Purple"]),
                ("#808000", "Olive", ["Maroon", "Teal", "Navy"]),
                ("#800000", "Maroon", ["Purple", "Olive", "Teal"]),
                ("#FFA500", "Orange", ["Gold", "Coral", "Amber"]),
            ]
            hex_code, name, distractors = random.choice(adv_hex)
            q_text = f"🧪 CSS & UI Design: Which standard web-safe color is designated by the 8-bit hex code {hex_code}?"
            explanation = f"In CSS Color Module Level 4, {hex_code} maps to the named color '{name}'."
            hint = f"Analyze the relative intensity of R, G, and B in {hex_code}."
            options, _ = shuffle_options_with_answer([name] + distractors, name)
            return self._build(q_text, name, explanation, hint, difficulty, "rgb_hex", ["css", "ui-color"], options)

    # ── 4. CMYK Printing System ───────────────────────────────────────────────
    def _gen_cmyk(self, difficulty: Difficulty) -> QuestionModel:
        cmyk_q = [
            ("What does the letter 'K' stand for in the CMYK color space?", "Key (Black)", ["Krypton", "Kelvin", "Kernel"]),
            ("Why is 'K' (Key black) used in printing alongside Cyan, Magenta, and Yellow?", "Because 100% CMY mix creates muddy brown rather than crisp, rich black", ["To decrease printing resolution", "To eliminate paper static", "Because Yellow ink is too acidic"]),
            ("In CMYK, what percentage values produce pure White on standard uncoated paper?", "C:0% M:0% Y:0% K:0%", ["C:100% M:100% Y:100% K:100%", "C:50% M:50% Y:50% K:0%", "C:0% M:0% Y:0% K:100%"]),
            ("Which color model has a broader color gamut (range of reproducible colors)?", "sRGB / Display P3 (RGB)", ["Standard CMYK (SWOP/FOGRA)", "Monochrome Grayscale", "Duotone Pantone"]),
        ]
        q_text, correct, distractors = random.choice(cmyk_q)
        explanation = f"In graphic prepress and print publishing, {correct} represents the industry printing standard."
        hint = "Remember that printing inks are subtractive layers that absorb incident light."
        options, _ = shuffle_options_with_answer([correct] + distractors, correct)
        return self._build(q_text, correct, explanation, hint, difficulty, "cmyk", ["printing", "gamut"], options)

    # ── 5. Color Harmonies ────────────────────────────────────────────────────
    def _gen_harmonies(self, difficulty: Difficulty) -> QuestionModel:
        harmonies = [
            ("Analogous Harmony", "Three or more colors positioned immediately adjacent to each other on the color wheel (e.g. Red, Red-Orange, Orange)", ["Colors positioned in an equilateral triangle on the wheel", "Colors positioned directly opposite at 180 degrees", "Two colors separated by exactly 90 degrees"]),
            ("Triadic Harmony", "Three colors evenly spaced at 120-degree intervals around the color wheel (e.g. Red, Yellow, Blue)", ["Colors right next to each other", "One color paired with its opposite", "Four colors in a rectangle"]),
            ("Monochromatic Harmony", "Variations of a single hue utilizing different tints, shades, and tones", ["Mixing all three primary colors", "Using purely black and white pigments", "Using complimentary opposites"]),
            ("Split-Complementary Harmony", "A base color paired with the two colors adjacent to its direct complement", ["Two primary colors plus one secondary color", "Four colors forming an X shape", "Three adjacent warm colors"]),
        ]
        term, correct, distractors = random.choice(harmonies)
        q_text = f"🎨 Palette Composition: In professional graphic and UI design, what defines an '{term}'?"
        explanation = f"{term} is defined as: {correct}."
        hint = "Recall geometric relationships on the 360-degree color wheel."
        options, _ = shuffle_options_with_answer([correct] + distractors, correct)
        return self._build(q_text, correct, explanation, hint, difficulty, "harmonies", ["design", "harmony"], options)

    # ── 6. Visible Light Spectrum & Wavelengths ───────────────────────────────
    def _gen_wavelengths(self, difficulty: Difficulty) -> QuestionModel:
        wavelength_data = [
            ("Violet light", "380 – 450 nm", ["620 – 750 nm", "495 – 570 nm", "590 – 620 nm"]),
            ("Blue light", "450 – 495 nm", ["620 – 750 nm", "570 – 590 nm", "300 – 350 nm"]),
            ("Green light", "495 – 570 nm", ["380 – 450 nm", "620 – 750 nm", "750 – 900 nm"]),
            ("Yellow light", "570 – 590 nm", ["450 – 495 nm", "380 – 430 nm", "650 – 700 nm"]),
            ("Red light", "620 – 750 nm", ["380 – 450 nm", "495 – 570 nm", "450 – 495 nm"]),
        ]
        color_name, correct_range, distractors = random.choice(wavelength_data)
        q_text = f"🔬 Optical Physics: Within the human visible electromagnetic spectrum, which wavelength range corresponds to {color_name}?"
        explanation = f"Visible light spans roughly 380 nm to 750 nm. {color_name} occupies the band around {correct_range}."
        hint = "Remember: Violet has the shortest wavelength (~400 nm) and highest energy; Red has the longest (~700 nm)."
        options, _ = shuffle_options_with_answer([correct_range] + distractors, correct_range)
        return self._build(q_text, correct_range, explanation, hint, difficulty, "wavelengths", ["physics", "optics"], options)

    # ── 7. HSL / HSV Color System ─────────────────────────────────────────────
    def _gen_hsl(self, difficulty: Difficulty) -> QuestionModel:
        angles = [
            ("Pure Red (0° / 360°)", "0° (or 360°)", ["60°", "120°", "240°"]),
            ("Pure Yellow", "60°", ["0°", "180°", "300°"]),
            ("Pure Green", "120°", ["60°", "180°", "240°"]),
            ("Pure Cyan", "180°", ["120°", "240°", "300°"]),
            ("Pure Blue", "240°", ["120°", "180°", "300°"]),
            ("Pure Magenta", "300°", ["240°", "180°", "60°"]),
        ]
        target, correct, distractors = random.choice(angles)
        q_text = f"📐 Cylindrical HSL Coordinates: On the standard 360° Hue wheel in CSS `hsl(H, S, L)`, what angle represents {target}?"
        explanation = f"In HSL/HSV, Hue starts at 0° (Red), moves through 60° (Yellow), 120° (Green), 180° (Cyan), 240° (Blue), to 300° (Magenta)."
        hint = "The wheel is divided into 6 equal 60-degree sectors corresponding to Red, Yellow, Green, Cyan, Blue, Magenta."
        options, _ = shuffle_options_with_answer([correct] + distractors, correct)
        return self._build(q_text, correct, explanation, hint, difficulty, "hsl", ["css", "coordinates"], options)

    # ── 8. Color Perception & Advanced Colorimetry ───────────────────────────
    def _gen_color_science(self, difficulty: Difficulty) -> QuestionModel:
        science_q = [
            (
                "In digital video standard ITU-R BT.709, which color channel contributes the largest weight to human perceived luminance (Y)?",
                "Green (~71.5%)",
                ["Red (~21.3%)", "Blue (~7.2%)", "Yellow (~50%)"]
            ),
            (
                "What does a Delta-E (ΔE) value of less than 1.0 signify in industrial color matching?",
                "The color difference is imperceptible to the average human eye",
                ["A catastrophic mismatch", "An inverted color phase", "Double the saturation"]
            ),
            (
                "What is the optical phenomenon where two colors appear identical under one light source but noticeably differ under another?",
                "Metamerism",
                ["Chromatic Aberration", "Polarization", "Bioluminescence"]
            ),
            (
                "In CIE L*a*b* 3D color space, what do the three axes measure?",
                "L* = Lightness, a* = Green to Red, b* = Blue to Yellow",
                ["L* = Lumens, a* = Alpha, b* = Blue", "L* = Latency, a* = Angle, b* = Brightness", "L* = Linear, a* = Analog, b* = Binary"]
            ),
        ]
        q_text, correct, distractors = random.choice(science_q)
        explanation = f"Colorimetry establishes that: {correct}."
        hint = "Consider human retinal cone distribution (L, M, and S cones) and spectrophotometer measurement."
        options, _ = shuffle_options_with_answer([correct] + distractors, correct)
        return self._build(q_text, correct, explanation, hint, difficulty, "color_science", ["colorimetry", "cie"], options)

    # ── Helper Builder ────────────────────────────────────────────────────────
    def _build(
        self,
        question: str,
        correct: str,
        explanation: str,
        hint: str,
        difficulty: Difficulty,
        topic: str,
        tags: list[str],
        options: list[str],
    ) -> QuestionModel:
        qid = generate_id("clr", question)
        diff_str = difficulty.value if hasattr(difficulty, "value") else str(difficulty)
        return QuestionModel(
            id=qid,
            mode=GameMode.COLOR,
            difficulty=difficulty,
            topic=topic,
            question=question,
            question_type=QuestionType.MCQ,
            options=options,
            correct_answer=correct,
            explanation=explanation,
            hint=hint,
            time_limit=calculate_time_limit(diff_str),
            xp=calculate_xp(diff_str),
            coins=calculate_coins(diff_str),
            tags=["color", "chroma", "visual-engine"] + tags,
        )
