---
title: "Day 2: Understanding AI — How It Actually Works, and ANI vs AGI vs ASI"
description: "How artificial intelligence really works, step by step: data as numbers, models, loss, gradient descent, testing, and how ChatGPT predicts the next word. Then the three types of AI, ANI, AGI and ASI, explained and compared. With animated diagrams and tables."
pubDate: 2026-11-23T16:00:00+06:00
tags: ["AI", "Machine Learning", "Beginners", "AGI"]
draft: false
---

This is **Day 2** of the series. [Day 1](/blog/day-1-introduction-to-ai/) covered what AI is and where it came from. Today we open the box:

1. [**How does AI actually work?**](#03--how-does-artificial-intelligence-actually-work) Data, models, training and testing, step by step, plus how ChatGPT writes its answers.
2. [**Types of AI: ANI, AGI and ASI**](#04--types-of-ai-ani-agi-and-asi-explained) What each one means, what exists today, and what might come next.

You still don't need maths. There is a little arithmetic and one short Python example, and you can skip both.

---

## 03 · How does artificial intelligence actually work?

Most AI today is machine learning, so "how does AI work?" really means "how does a machine learn from data?". Day 1 gave the short answer: **guess, check, adjust**. Here is the long one.

### The four ingredients

| Ingredient | What it is | In a kitchen |
|---|---|---|
| **Data** | Examples to learn from: photos, text, numbers, sound | The ingredients |
| **Model** | A maths function with adjustable numbers inside, called weights | A recipe with the amounts still to be decided |
| **Training method** | The way the weights get tuned, usually *gradient descent* | Tasting and adjusting until it's right |
| **Compute** | The chips that do the billions of calculations, usually GPUs | The stove |

Take away any one of them and nothing works. Most of AI's progress since 2012 came from having more of all four.

### The big picture: how an AI system gets built

<figure class="fig" style="--cycle: 8s">
<div class="fig-art">
<svg viewBox="0 0 640 236" role="img" aria-labelledby="g1-t g1-d">
<title id="g1-t">The steps of building an AI system</title>
<desc id="g1-d">Eight steps in order: define the problem, collect data, prepare data, pick a model, train, test, deploy and monitor. An arrow from monitor leads back to collect data, because a deployed model is improved with new data.</desc>
<defs><marker id="g1-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="s-head" d="M0 0L10 5L0 10z"/></marker></defs>
<path class="s-line" d="M87 73H549V193H87"/>
<path class="s-orbit" pathLength="100" d="M87 73H549V193H87"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(164 73)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(318 73)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(472 73)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(549 133) rotate(90)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(472 193) rotate(180)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(318 193) rotate(180)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(164 193) rotate(180)"/>
<path class="s-line s-dash" d="M87 165V133H241V103" marker-end="url(#g1-h)"/>
<text class="t-mono" x="100" y="152">NEW DATA → IMPROVE</text>
<rect class="s-box a-glow" x="22" y="45" width="130" height="56"/>
<text class="t-mono" x="34" y="66">STEP 1</text>
<text class="t-strong" x="34" y="88">The problem</text>
<rect class="s-box a-glow" x="176" y="45" width="130" height="56" style="--at: 0.88s"/>
<text class="t-mono" x="188" y="66">STEP 2</text>
<text class="t-strong" x="188" y="88">Collect data</text>
<rect class="s-box a-glow" x="330" y="45" width="130" height="56" style="--at: 2.06s"/>
<text class="t-mono" x="342" y="66">STEP 3</text>
<text class="t-strong" x="342" y="88">Prepare data</text>
<rect class="s-box a-glow" x="484" y="45" width="130" height="56" style="--at: 3.24s"/>
<text class="t-mono" x="496" y="66">STEP 4</text>
<text class="t-strong" x="496" y="88">Pick a model</text>
<rect class="s-key a-glow" x="484" y="165" width="130" height="56" style="--at: 4.16s"/>
<text class="t-mono" x="496" y="186">STEP 5</text>
<text class="t-strong" x="496" y="208">Train</text>
<rect class="s-box a-glow" x="330" y="165" width="130" height="56" style="--at: 5.34s"/>
<text class="t-mono" x="342" y="186">STEP 6</text>
<text class="t-strong" x="342" y="208">Test</text>
<rect class="s-box a-glow" x="176" y="165" width="130" height="56" style="--at: 6.52s"/>
<text class="t-mono" x="188" y="186">STEP 7</text>
<text class="t-strong" x="188" y="208">Deploy</text>
<rect class="s-box a-glow" x="22" y="165" width="130" height="56" style="--at: 7.7s"/>
<text class="t-mono" x="34" y="186">STEP 8</text>
<text class="t-strong" x="34" y="208">Monitor</text>
</svg>
</div>
<figcaption><b>Fig. 01</b> <span>Training is only one step of eight. A real AI system keeps going round: new data comes in and the model gets better.</span></figcaption>
</figure>

| Step | What happens | Spam filter example |
|---|---|---|
| 1. The problem | Decide exactly what the AI should predict | "Is this email spam: yes or no?" |
| 2. Collect data | Gather lots of examples | A million old emails |
| 3. Prepare data | Clean them, label them and turn them into numbers | Remove duplicates, mark each email spam or not, count the words |
| 4. Pick a model | Choose a kind of model that suits the problem | A text classifier |
| 5. Train | The model learns from most of the data | It learns which words and senders point to spam |
| 6. Test | Check it on examples it has never seen | Say it catches 98% of the spam in the test emails |
| 7. Deploy | Put it into a real product | It checks every incoming email |
| 8. Monitor | Watch how it does, and retrain with new data | Spammers change their tricks, so it learns again |

In real projects, steps 2 and 3 often take more time than everything else put together. A model is only as good as its data.

### Step 1: everything becomes numbers

A computer can only do maths, so every kind of data has to become numbers first.

<figure class="fig" style="--cycle: 6s">
<div class="fig-art">
<svg viewBox="0 0 640 256" role="img" aria-labelledby="g2-t g2-d">
<title id="g2-t">How images and text become numbers</title>
<desc id="g2-d">Left: a small picture of a smiling face drawn on a 7 by 7 grid. Each square holds a number from 0 for no ink to 255 for full ink. Right: the sentence "I love learning AI" is split into four tokens, each token gets an ID number, and each ID then becomes a list of numbers called an embedding.</desc>
<defs><marker id="g2-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="s-head" d="M0 0L10 5L0 10z"/></marker></defs>
<text class="t-mono" x="24" y="28">AN IMAGE → PIXEL NUMBERS</text>
<rect class="s-cell" x="24" y="44" width="182" height="182"/>
<rect class="s-cell s-cell--ink" x="76" y="70" width="26" height="26"/>
<rect class="s-cell s-cell--ink" x="128" y="70" width="26" height="26"/>
<rect class="s-cell s-cell--ink" x="76" y="96" width="26" height="26"/>
<rect class="s-cell s-cell--ink" x="128" y="96" width="26" height="26"/>
<rect class="s-cell s-cell--ink" x="50" y="148" width="26" height="26"/>
<rect class="s-cell s-cell--ink" x="154" y="148" width="26" height="26"/>
<rect class="s-cell s-cell--mid" x="50" y="174" width="26" height="26"/>
<rect class="s-cell s-cell--ink" x="76" y="174" width="26" height="26"/>
<rect class="s-cell s-cell--ink" x="102" y="174" width="26" height="26"/>
<rect class="s-cell s-cell--ink" x="128" y="174" width="26" height="26"/>
<rect class="s-cell s-cell--mid" x="154" y="174" width="26" height="26"/>
<path class="s-faint" d="M50 44V226M76 44V226M102 44V226M128 44V226M154 44V226M180 44V226M24 70H206M24 96H206M24 122H206M24 148H206M24 174H206M24 200H206"/>
<text class="t-tiny t-mid" y="60.5"><tspan x="37">0</tspan><tspan x="63">0</tspan><tspan x="89">0</tspan><tspan x="115">0</tspan><tspan x="141">0</tspan><tspan x="167">0</tspan><tspan x="193">0</tspan></text>
<text class="t-tiny t-mid" y="86.5"><tspan x="37">0</tspan><tspan x="63">0</tspan><tspan class="t-on-ink" x="89">255</tspan><tspan x="115">0</tspan><tspan class="t-on-ink" x="141">255</tspan><tspan x="167">0</tspan><tspan x="193">0</tspan></text>
<text class="t-tiny t-mid" y="112.5"><tspan x="37">0</tspan><tspan x="63">0</tspan><tspan class="t-on-ink" x="89">255</tspan><tspan x="115">0</tspan><tspan class="t-on-ink" x="141">255</tspan><tspan x="167">0</tspan><tspan x="193">0</tspan></text>
<text class="t-tiny t-mid" y="138.5"><tspan x="37">0</tspan><tspan x="63">0</tspan><tspan x="89">0</tspan><tspan x="115">0</tspan><tspan x="141">0</tspan><tspan x="167">0</tspan><tspan x="193">0</tspan></text>
<text class="t-tiny t-mid" y="164.5"><tspan x="37">0</tspan><tspan class="t-on-ink" x="63">255</tspan><tspan x="89">0</tspan><tspan x="115">0</tspan><tspan x="141">0</tspan><tspan class="t-on-ink" x="167">255</tspan><tspan x="193">0</tspan></text>
<text class="t-tiny t-mid" y="190.5"><tspan x="37">0</tspan><tspan class="t-on-ink" x="63">120</tspan><tspan class="t-on-ink" x="89">255</tspan><tspan class="t-on-ink" x="115">255</tspan><tspan class="t-on-ink" x="141">255</tspan><tspan class="t-on-ink" x="167">120</tspan><tspan x="193">0</tspan></text>
<text class="t-tiny t-mid" y="216.5"><tspan x="37">0</tspan><tspan x="63">0</tspan><tspan x="89">0</tspan><tspan x="115">0</tspan><tspan x="141">0</tspan><tspan x="167">0</tspan><tspan x="193">0</tspan></text>
<g class="a-scan-y" style="--span: 182px"><g class="a-scan-x" style="--span: 182px"><rect class="s-scan" x="24" y="44" width="26" height="26"/></g></g>
<text class="t-small" x="24" y="246">0 = no ink, 255 = full ink</text>
<text class="t-mono" x="262" y="28">TEXT → TOKENS → NUMBERS</text>
<text class="t-serif" x="262" y="66">I love learning AI</text>
<rect class="s-box a-glow" x="262" y="96" width="44" height="30"/>
<text class="t-mid" x="284" y="116">I</text>
<rect class="s-box a-glow" x="316" y="96" width="70" height="30" style="--at: 0.4s"/>
<text class="t-mid" x="351" y="116">love</text>
<rect class="s-box a-glow" x="396" y="96" width="96" height="30" style="--at: 0.8s"/>
<text class="t-mid" x="444" y="116">learning</text>
<rect class="s-box a-glow" x="502" y="96" width="52" height="30" style="--at: 1.2s"/>
<text class="t-mid" x="528" y="116">AI</text>
<text class="t-mono" x="566" y="115">TOKENS</text>
<path class="s-line" d="M284 126V152" marker-end="url(#g2-h)"/>
<path class="s-line" d="M351 126V152" marker-end="url(#g2-h)"/>
<path class="s-line" d="M444 126V152" marker-end="url(#g2-h)"/>
<path class="s-line" d="M528 126V152" marker-end="url(#g2-h)"/>
<path class="s-flow" pathLength="100" d="M284 126V152" style="--at: 0.3s"/>
<path class="s-flow" pathLength="100" d="M351 126V152" style="--at: 0.7s"/>
<path class="s-flow" pathLength="100" d="M444 126V152" style="--at: 1.1s"/>
<path class="s-flow" pathLength="100" d="M528 126V152" style="--at: 1.5s"/>
<rect class="s-key a-glow" x="262" y="156" width="44" height="30" style="--at: 1.4s"/>
<text class="t-mid" x="284" y="176">40</text>
<rect class="s-key a-glow" x="316" y="156" width="70" height="30" style="--at: 1.8s"/>
<text class="t-mid" x="351" y="176">3021</text>
<rect class="s-key a-glow" x="396" y="156" width="96" height="30" style="--at: 2.2s"/>
<text class="t-mid" x="444" y="176">6975</text>
<rect class="s-key a-glow" x="502" y="156" width="52" height="30" style="--at: 2.6s"/>
<text class="t-mid" x="528" y="176">15592</text>
<text class="t-mono" x="566" y="175">IDS</text>
<text class="t-small" x="262" y="214">Then each ID becomes a list of numbers, an embedding:</text>
<text class="t-mono" x="262" y="238">LEARNING → [0.12, −0.80, 0.33, 0.05, …]</text>
</svg>
</div>
<figcaption><b>Fig. 02</b> <span>Left: a tiny picture is just a grid of numbers, read square by square. Right: text is split into tokens, and every token becomes numbers too. (The IDs and values here are made up.)</span></figcaption>
</figure>

| Data | How it becomes numbers | Example |
|---|---|---|
| Image | Each pixel stores its colour as three numbers from 0 to 255: red, green and blue | A 1,000 × 1,000 photo is 3 million numbers |
| Text | It is split into **tokens**: words or pieces of words. Each token gets an ID, then an **embedding**, a list of numbers that captures its meaning | "learning" → ID → [0.12, −0.80, 0.33, …] |
| Sound | The loudness of the sound wave is measured thousands of times a second | Speech is often recorded 16,000 times a second |
| Tables | Many columns are numbers already. Categories are turned into numbers too | Colour red / green / blue → 1, 2, 3, or three yes/no columns |

Embeddings have a neat property: words with similar meanings get similar numbers. "King" and "queen" end up close together, while "king" and "banana" end up far apart. That is how a model can know that "car" and "vehicle" are related without anyone telling it.

The numbers a model looks at are called **features**. In older machine learning, people chose the features by hand. Deep learning finds its own.

### Step 2: a model is a function with knobs

Let's take the simplest model there is. We want to predict a student's exam score from the hours they studied, and we guess the relationship is a straight line:

```text
score = w × hours + b
```

`w` and `b` are the model's two **weights**, its knobs. `w` sets how steep the line is: how many marks each extra hour is worth. `b` sets where the line starts: the score with no study at all. Training means finding the `w` and `b` that make the line fit the data best.

<figure class="fig" style="--cycle: 10s">
<div class="fig-art">
<svg viewBox="0 0 640 286" role="img" aria-labelledby="g3-t g3-d">
<title id="g3-t">Fitting a line to data</title>
<desc id="g3-d">Dots show students' study hours and exam scores. The first guess is a flat line. After training, the line slopes upwards through the middle of the dots, and the error is much smaller. Short dashed lines show each dot's distance from the line: the errors.</desc>
<path class="s-line" d="M60 28V250H420"/>
<text class="t-mono" x="68" y="36">EXAM SCORE ↑</text>
<text class="t-mono t-end" x="420" y="272">HOURS STUDIED →</text>
<path class="s-faint s-dash" d="M90 154.8H390"/>
<text class="t-small" x="92" y="146">first guess</text>
<g class="a-late"><path class="s-err" d="M100 193.7V217.7M130 216.2V204.2M160 174.7V190.7M190 203.2V177.2M220 143.7V163.7M250 160.3V150.3M280 110.8V136.8M310 141.3V123.3M340 97.8V109.8M370 118.3V96.3"/></g>
<path class="s-curve a-fit" d="M90 222.2L390 87.4" style="--from: 24.2deg; transform-origin: 240px 154.8px"/>
<path class="s-pts" d="M100 193.7h0M130 216.2h0M160 174.7h0M190 203.2h0M220 143.7h0M250 160.3h0M280 110.8h0M310 141.3h0M340 97.8h0M370 118.3h0"/>
<text class="t-small t-end" x="386" y="76">after training</text>
<text class="t-mono" x="452" y="52">THE MODEL</text>
<text class="t-strong" x="452" y="76">score = w × hours + b</text>
<text class="t-small" x="452" y="98">w: how steep the line is</text>
<text class="t-small" x="452" y="116">b: where the line starts</text>
<text class="t-mono" x="452" y="160">ERROR</text>
<rect class="s-bar a-err" x="452" y="170" width="150" height="16"/>
<rect class="s-track" x="452" y="170" width="150" height="16"/>
<text class="t-small" x="452" y="210">Training turns w and b</text>
<text class="t-small" x="452" y="228">until the error is smallest.</text>
</svg>
</div>
<figcaption><b>Fig. 03</b> <span>Each dot is a student. The dashed lines from the dots to the line are the errors. Training swings the line until those errors are as small as possible overall.</span></figcaption>
</figure>

The same idea scales up. A model like ChatGPT is still a function with knobs, just with billions of knobs instead of two.

| | Our line | A large language model |
|---|---|---|
| Input | Hours studied | The text so far |
| Output | A predicted score | A chance for every possible next token |
| Weights | 2 | Billions; hundreds of billions for the largest |
| Training data | A few students | Trillions of tokens of text |
| Training time | Less than a second | Weeks to months on thousands of GPUs |

### Step 3: learning means turning the knobs

To improve, the model needs a number that says how wrong it is. That number is the **loss**, or error. For our line a common choice is the **mean squared error**: take each prediction's mistake, square it so that negative and positive mistakes don't cancel out, and average them.

Then comes the clever part: **gradient descent**. Imagine you are on a hillside in thick fog and want to reach the valley. You can't see the bottom, but you can feel which way the ground slopes under your feet. So you take a step downhill, feel again, and take another step. The hill is the loss, and where you stand is the value of the weights.

<figure class="fig" style="--cycle: 10s">
<div class="fig-art">
<svg viewBox="0 0 640 290" role="img" aria-labelledby="g4-t g4-d">
<title id="g4-t">Gradient descent</title>
<desc id="g4-d">A U-shaped curve shows the error for each value of a weight. Starting high on the left, the model takes steps downhill. The steps get smaller as the curve flattens, until they reach the lowest point.</desc>
<path class="s-line" d="M40 20V262H600"/>
<text class="t-mono" x="48" y="30">ERROR ↑</text>
<text class="t-mono t-end" x="600" y="282">VALUE OF A WEIGHT →</text>
<path class="s-line" d="M60 40Q320 420 580 40"/>
<text class="t-small" x="160" y="46">Each step goes downhill.</text>
<text class="t-small" x="160" y="64">Steps shrink as the slope flattens.</text>
<circle class="s-test" cx="320" cy="230" r="7"/>
<text class="t-small t-mid" x="320" y="252">lowest error</text>
<g class="a-step"><circle class="s-dot" cx="90" cy="81.3" r="5"/><text class="t-small" x="102" y="78">start</text></g>
<g class="a-step" style="--at: 0.5s"><circle class="s-dot" cx="182" cy="176.5" r="5"/></g>
<g class="a-step" style="--at: 1s"><circle class="s-dot" cx="237" cy="210.6" r="5"/></g>
<g class="a-step" style="--at: 1.5s"><circle class="s-dot" cx="270" cy="223" r="5"/></g>
<g class="a-step" style="--at: 2s"><circle class="s-dot" cx="290" cy="227.5" r="5"/></g>
<g class="a-step" style="--at: 2.5s"><circle class="s-dot" cx="302" cy="229.1" r="5"/></g>
</svg>
</div>
<figcaption><b>Fig. 04</b> <span>Gradient descent with one weight. Real models do the same in millions of dimensions at once, which is impossible to draw but works the same way.</span></figcaption>
</figure>

The **gradient** is the slope: which way the loss changes, and how steeply, when you nudge each weight. The size of each step is the **learning rate**, and choosing it matters:

| Learning rate | What happens | Like… |
|---|---|---|
| Too small | Learns correctly, but extremely slowly | Walking downhill in baby steps |
| Just right | Reaches the low point in reasonable time | Confident, careful steps |
| Too big | Overshoots the valley, bounces around, and may never settle | Jumping so far you land on the opposite hill |

Here is the whole thing in plain Python, without any library. It learns `w` and `b` from five students:

```python
hours = [1, 2, 3, 4, 5]
scores = [52, 59, 68, 74, 83]

w, b = 0.0, 0.0  # the model: score = w * hours + b, starting from a bad guess
lr = 0.02        # learning rate: how big each step is

for step in range(2001):
    # Guess and check: how far off is each prediction?
    errors = [(w * h + b) - s for h, s in zip(hours, scores)]
    loss = sum(e * e for e in errors) / len(errors)  # mean squared error
    if step in (0, 10, 100, 2000):
        print(f"step {step:>4}: w = {w:5.2f}, b = {b:5.2f}, error = {loss:7.1f}")
    # Adjust: nudge w and b a little downhill
    w -= lr * 2 * sum(e * h for e, h in zip(errors, hours)) / len(hours)
    b -= lr * 2 * sum(errors) / len(hours)

print(f"Predicted score for 6 hours of study: {w * 6 + b:.0f}")
```

```text
step    0: w =  0.00, b =  0.00, error =  4634.8
step   10: w = 17.76, b =  7.67, error =   241.8
step  100: w = 13.18, b = 24.32, error =    71.6
step 2000: w =  7.70, b = 44.10, error =     0.4
Predicted score for 6 hours of study: 90
```

The model started knowing nothing (`w = 0`, `b = 0`). Notice that `w` first overshoots to 17.76, then settles. In the end it found by itself that each hour is worth about 7.7 marks, starting from about 44. Nobody gave it that rule. Libraries like PyTorch and TensorFlow do exactly this with millions of weights, and work out the slopes for you.

### Step 4: from one line to a neural network

A straight line can only learn straight-line patterns. Real problems, like telling a cat from a dog, are far more tangled. Neural networks handle them by joining many small units, called **neurons**, in layers.

Every neuron does the same small sum. Here is one, worked through:

| Step | Calculation | Result |
|---|---|---|
| Inputs arrive | x₁ = 2, x₂ = 3 | |
| Multiply each by its weight | 2 × 0.5 and 3 × −1 | 1 and −3 |
| Add them up, plus a bias | 1 + (−3) + 1 | −1 |
| Activation function (ReLU turns negatives into 0) | max(0, −1) | **0**: this neuron stays quiet |

The **activation function** is what lets a network learn curves and not only straight lines. Put thousands of neurons in many layers, train all their weights with gradient descent, and you have deep learning. Day 1's [neural network diagram](/blog/day-1-introduction-to-ai/#inside-deep-learning-neural-networks) shows a small one in action.

To train a network, you need the slope for every weight in every layer. The method that works them out is **backpropagation**, which you met in Day 1's history: it passes the error backwards from the output, layer by layer.

### Step 5: test it on data it has never seen

A model that only works on its training data is useless. It's like a student who memorised last year's exam answers: perfect at home, lost in the real exam. So the data is split before training starts:

| Part | Typical share | Used for |
|---|---|---|
| **Training set** | About 70–80% | Learning the weights |
| **Validation set** | About 10–15% | Choosing settings, such as the learning rate, and deciding when to stop |
| **Test set** | About 10–15% | One final, honest score. The model never learns from it |

<figure class="fig" style="--cycle: 10s">
<div class="fig-art">
<svg viewBox="0 0 640 246" role="img" aria-labelledby="g5-t g5-d">
<title id="g5-t">Underfitting, a good fit and overfitting</title>
<desc id="g5-d">The same dots in three panels. A flat line misses the arch-shaped pattern: underfitting. A smooth arch follows it: a good fit. A wiggly line passes through every dot but swings wildly between them: overfitting. A ring marks a new example; only the good fit predicts it well.</desc>
<text class="t-sign t-mid" x="105" y="26">UNDERFITTING</text>
<text class="t-sign t-mid" x="315" y="26">GOOD FIT</text>
<text class="t-sign t-mid" x="525" y="26">OVERFITTING</text>
<g transform="translate(20 36)">
<rect class="s-faint" width="170" height="170"/>
<path class="s-curve a-draw" pathLength="100" d="M8 92H164"/>
<path class="s-pts" d="M15 136h0M35 104h0M55 74h0M75 66h0M95 56h0M115 80h0M135 92h0M155 132h0"/>
<circle class="s-test" cx="65" cy="64" r="5"/>
</g>
<g transform="translate(230 36)">
<rect class="s-faint" width="170" height="170"/>
<path class="s-curve a-draw" pathLength="100" d="M10 150Q85 -34 160 150" style="--at: 0.4s"/>
<path class="s-pts" d="M15 136h0M35 104h0M55 74h0M75 66h0M95 56h0M115 80h0M135 92h0M155 132h0"/>
<circle class="s-test" cx="65" cy="64" r="5"/>
</g>
<g transform="translate(440 36)">
<rect class="s-faint" width="170" height="170"/>
<path class="s-curve a-draw" pathLength="100" d="M8 158Q11 120 15 136Q25 150 35 104Q45 40 55 74Q65 100 75 66Q85 20 95 56Q105 110 115 80Q125 40 135 92Q145 150 155 132Q160 110 164 150" style="--at: 0.8s"/>
<path class="s-pts" d="M15 136h0M35 104h0M55 74h0M75 66h0M95 56h0M115 80h0M135 92h0M155 132h0"/>
<circle class="s-test" cx="65" cy="64" r="5"/>
</g>
<text class="t-small t-mid" x="105" y="230">too simple</text>
<text class="t-small t-mid" x="315" y="230">just right</text>
<text class="t-small t-mid" x="525" y="230">memorised the noise</text>
</svg>
</div>
<figcaption><b>Fig. 05</b> <span>The dots are training data; the ring is a new example the model never saw. Only the good fit lands close to it.</span></figcaption>
</figure>

| | Underfitting | Good fit | Overfitting |
|---|---|---|---|
| What happened | The model is too simple for the pattern | It learned the real pattern | It memorised the training data, noise and all |
| Error on training data | High | Low | Very low |
| Error on new data | High | Low | High |
| Like a student who… | didn't study enough | understood the subject | memorised answers without understanding them |
| How to fix it | Use a bigger model, train longer, add better features | Keep it | Get more data, use a simpler model, stop training earlier |

### Common kinds of models

| Model | What it does | Typical use |
|---|---|---|
| **Linear regression** | Fits a straight line (or flat surface) to predict a number | House prices, sales forecasts |
| **Logistic regression** | Predicts the chance of yes or no | Will this customer leave? |
| **Decision tree** | Learns a chain of yes/no questions | Loan decisions, sorting patients by urgency |
| **Random forest** | Many decision trees vote together | Fraud detection, data in tables |
| **k-means clustering** | Puts similar examples into groups, without labels | Customer groups |
| **Convolutional neural network (CNN)** | Scans images for patterns, from edges up to whole objects | Face unlock, medical scans |
| **Transformer** | Uses *attention* to relate every part of the input to every other part | ChatGPT, Claude, Gemini, translation |
| **Diffusion model** | Learns to turn random noise into a picture, step by step | Image generators such as Midjourney and Stable Diffusion |

### How ChatGPT-style models work

Large language models (LLMs) do one thing, over and over: **predict the next token**.

<figure class="fig" style="--cycle: 8s">
<div class="fig-art">
<svg viewBox="0 0 640 296" role="img" aria-labelledby="g6-t g6-d">
<title id="g6-t">How a language model picks the next word</title>
<desc id="g6-d">The text "The cat sat on the" goes in. The model gives each possible next word a chance: mat 42 percent, floor 18 percent, sofa 11 percent, roof 7 percent, bed 6 percent. It picks mat, adds it to the text and repeats. On the right are the steps inside the model: tokens, embeddings, transformer layers, next-word chances, then pick, add and repeat.</desc>
<text class="t-mono" x="24" y="30">THE TEXT SO FAR</text>
<text class="t-serif" x="24" y="66">The cat sat on the <tspan class="t-key a-step" style="--at: 3.4s">mat</tspan></text>
<text class="t-mono" x="24" y="104">CHANCE OF EACH NEXT WORD</text>
<text class="t-end" x="110" y="131">mat</text>
<rect class="s-fill--key a-grow" x="124" y="117" width="176" height="20" style="--at: 1.6s"/>
<text class="t-small" x="308" y="131">42%</text>
<text class="t-mono t-key a-step" x="350" y="131" style="--at: 3.2s">← PICKED</text>
<text class="t-end" x="110" y="161">floor</text>
<rect class="s-fill a-grow" x="124" y="147" width="76" height="20" style="--at: 1.75s"/>
<text class="t-small" x="208" y="161">18%</text>
<text class="t-end" x="110" y="191">sofa</text>
<rect class="s-fill a-grow" x="124" y="177" width="46" height="20" style="--at: 1.9s"/>
<text class="t-small" x="178" y="191">11%</text>
<text class="t-end" x="110" y="221">roof</text>
<rect class="s-fill a-grow" x="124" y="207" width="29" height="20" style="--at: 2.05s"/>
<text class="t-small" x="161" y="221">7%</text>
<text class="t-end" x="110" y="251">bed</text>
<rect class="s-fill a-grow" x="124" y="237" width="25" height="20" style="--at: 2.2s"/>
<text class="t-small" x="157" y="251">6%</text>
<text class="t-small" x="24" y="284">…and every other word in its vocabulary gets a small chance too.</text>
<text class="t-mono" x="430" y="30">INSIDE THE MODEL</text>
<rect class="s-box a-glow" x="430" y="44" width="186" height="30"/>
<text x="442" y="64">1 · Tokens</text>
<rect class="s-box a-glow" x="430" y="86" width="186" height="30" style="--at: 0.3s"/>
<text x="442" y="106">2 · Embeddings</text>
<rect class="s-key a-glow" x="430" y="128" width="186" height="30" style="--at: 0.6s"/>
<text x="442" y="148">3 · Transformer layers</text>
<rect class="s-box a-glow" x="430" y="170" width="186" height="30" style="--at: 0.9s"/>
<text x="442" y="190">4 · Next-word chances</text>
<rect class="s-out a-glow" x="430" y="212" width="186" height="30" style="--at: 1.2s"/>
<text x="442" y="232">5 · Pick, add, repeat</text>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(523 80) rotate(90)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(523 122) rotate(90)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(523 164) rotate(90)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(523 206) rotate(90)"/>
</svg>
</div>
<figcaption><b>Fig. 06</b> <span>One step of writing. The model repeats it for every token of its answer. The chances here are made up to show the idea.</span></figcaption>
</figure>

1. **Tokens.** Your text is split into tokens, and each token gets an ID.
2. **Embeddings.** Each ID becomes a list of numbers that captures its meaning.
3. **Transformer layers.** Dozens of layers use **attention**: every token looks at every other token to work out what it means here. In "the bank of the river", attention lets "bank" look at "river" and understand that it isn't a money bank.
4. **Next-word chances.** The last layer gives a probability to every token in the vocabulary.
5. **Pick, add, repeat.** The model picks a likely token, adds it to the text, and starts again with the longer text.

The whole answer is written this way, one token at a time. The model learned to make these guesses well by training on huge amounts of text. Then it was fine-tuned with examples and human feedback so that it answers helpfully and follows instructions.

This also explains **hallucinations**. The model is built to produce *likely-sounding* text, not to look facts up. When it doesn't know something, the most likely-sounding answer can be confidently wrong.

| Setting | What it changes | Result |
|---|---|---|
| **Low temperature** | It almost always picks the top token | Focused, predictable answers. Good for facts and code |
| **High temperature** | It often picks less likely tokens | More varied and creative, with more mistakes |

---

## 04 · Types of AI: ANI, AGI and ASI explained

Day 1 introduced these three in one table. Here they are in depth. They sort AI by two things: **how wide** its abilities are, and **how good** it is compared with people.

<figure class="fig" style="--cycle: 12s">
<div class="fig-art">
<svg viewBox="0 0 640 286" role="img" aria-labelledby="g7-t g7-d">
<title id="g7-t">Narrow, general and super AI compared with human level</title>
<desc id="g7-d">Bars show skill at eight tasks, chess, translation, images, driving, cooking, science, caring for people and learning a new job, against a dashed human-level line. Narrow AI today: very high at chess, around human level at translation and images, low at the rest. General AI: about human level at everything. Super AI: far above human level at everything.</desc>
<text class="t-sign a-phase" x="50" y="30">NARROW AI (ANI) · TODAY</text>
<text class="t-sign a-phase s-phase" x="50" y="30" style="--at: 4s">GENERAL AI (AGI) · THE GOAL</text>
<text class="t-sign a-phase s-phase" x="50" y="30" style="--at: 8s">SUPER AI (ASI) · A HYPOTHESIS</text>
<rect class="s-fill a-morph" x="62.5" y="50" width="38" height="200" style="--a: 0.95; --b: 0.95; --c: 1"/>
<rect class="s-fill a-morph" x="125.5" y="50" width="38" height="200" style="--a: 0.55; --b: 0.55; --c: 0.92"/>
<rect class="s-fill a-morph" x="188.5" y="50" width="38" height="200" style="--a: 0.6; --b: 0.6; --c: 0.9"/>
<rect class="s-fill a-morph" x="251.5" y="50" width="38" height="200" style="--a: 0.35; --b: 0.5; --c: 0.9"/>
<rect class="s-fill a-morph" x="314.5" y="50" width="38" height="200" style="--a: 0.04; --b: 0.5; --c: 0.88"/>
<rect class="s-fill a-morph" x="377.5" y="50" width="38" height="200" style="--a: 0.25; --b: 0.5; --c: 0.95"/>
<rect class="s-fill a-morph" x="440.5" y="50" width="38" height="200" style="--a: 0.04; --b: 0.5; --c: 0.85"/>
<rect class="s-fill a-morph" x="503.5" y="50" width="38" height="200" style="--a: 0.1; --b: 0.5; --c: 0.9"/>
<path class="s-line" d="M50 250H560"/>
<path class="s-line s-dash" d="M50 150H560"/>
<text class="t-mono" x="566" y="147">HUMAN</text>
<text class="t-mono" x="566" y="160">LEVEL</text>
<text class="t-small t-mid" x="81.5" y="268">Chess</text>
<text class="t-small t-mid" x="144.5" y="268">Translate</text>
<text class="t-small t-mid" x="207.5" y="268">Images</text>
<text class="t-small t-mid" x="270.5" y="268">Driving</text>
<text class="t-small t-mid" x="333.5" y="268">Cooking</text>
<text class="t-small t-mid" x="396.5" y="268">Science</text>
<text class="t-small t-mid" x="459.5" y="268">Caring</text>
<text class="t-small t-mid" x="522.5" y="268">New job</text>
</svg>
</div>
<figcaption><b>Fig. 07</b> <span>The three types as skill at different tasks, against the dashed human level. The animation steps from narrow to general to super AI. The heights are an illustration, not measurements.</span></figcaption>
</figure>

### The three at a glance

| | ANI | AGI | ASI |
|---|---|---|---|
| Full name | Artificial narrow intelligence | Artificial general intelligence | Artificial superintelligence |
| Also called | Narrow AI, weak AI | General AI, strong AI, human-level AI | Super AI, superintelligence |
| Range | One task, or a group of related tasks | Any thinking task a person can do | Almost every task |
| Skill | Can beat people at its own task | About human level across the board | Far beyond the best people at almost everything |
| Learns new kinds of task by itself? | No: it has to be built or trained again | Yes, the way a person learns a new job | Yes, and faster than any person |
| Exists today? | **Yes**: every AI product | **Not yet**, and how close we are is hotly debated | **No**: it is a hypothesis |
| Examples | Face unlock, spam filters, AlphaGo, ChatGPT | None yet | None |
| Main worries | Bias, mistakes, misuse, privacy, jobs | Huge job changes, power in a few hands, losing control | Whether people could stay in control at all |

### ANI: narrow AI, the only kind we have

Narrow AI is built for a specific job. It can be superhuman at that job and helpless at everything else: AlphaGo can beat the world's best Go players, but it can't play tic-tac-toe unless someone builds and trains it again.

| Area | Narrow AI at work |
|---|---|
| Games | Chess engines, AlphaGo |
| Vision | Face unlock, reading number plates, spotting tumours in scans |
| Language | Translation, spam filters, voice assistants, chatbots |
| Recommendations | YouTube, Netflix, online shops |
| Science | AlphaFold predicting the shapes of proteins |
| Transport | Route planning, driver assistance, self-driving taxis in some cities |

**So where do ChatGPT and other chatbots fit?** This is one of the most interesting questions in the field right now. One model can write essays, translate, write code, explain physics and pass many exams, which sounds very general. That's why some people call them "general-purpose AI", and in 2023 a team at Microsoft Research titled a paper about GPT-4 *Sparks of Artificial General Intelligence*. But these models still make mistakes a child wouldn't, struggle with long-term plans, stop learning when training ends, and can't act in the physical world. Most researchers say they are not AGI yet. Whether they are on the road to it is an open question.

### AGI: general AI, the goal

AGI would be an AI that can learn and do any thinking task a person can, and carry what it learns from one area into another, the way you can use school maths to plan a budget. There is no single agreed definition:

| Source | How it defines AGI |
|---|---|
| The classic definition | A machine that can understand, learn and do any intellectual task a human can |
| OpenAI's charter (2018) | "Highly autonomous systems that outperform humans at most economically valuable work" |
| Google DeepMind (2023) | Not one finish line but levels, measured by how **good** and how **general** a system is (see below) |

In their 2023 paper *Levels of AGI*, Google DeepMind researchers sorted AI systems like this:

| Level | Performance | Narrow AI example | General AI example |
|---|---|---|---|
| 0 · No AI | — | A calculator | People doing tasks through a website, like Amazon Mechanical Turk |
| 1 · Emerging | Equal to or a bit better than an unskilled person | Simple rule-based systems | ChatGPT, Bard, Llama 2 |
| 2 · Competent | Better than at least half of skilled adults | Smart speakers such as Siri and Alexa | Not reached yet |
| 3 · Expert | Better than 90% of skilled adults | Grammar checkers such as Grammarly, image generators such as DALL·E 2 | Not reached yet |
| 4 · Virtuoso | Better than 99% of skilled adults | Deep Blue, AlphaGo | Not reached yet |
| 5 · Superhuman | Better than every human | AlphaFold, AlphaZero, Stockfish | Not reached yet; this would be ASI |

That was the picture in 2023. Models have improved a lot since, and where today's systems sit is argued about.

**How would we know AGI had arrived?** People have proposed tests:

| Test | Proposed by | The AI passes if it can… |
|---|---|---|
| Turing test | Alan Turing, 1950 | Chat so well that a judge can't tell it from a person |
| Coffee test | Steve Wozniak | Walk into an ordinary home, find the kitchen and make a cup of coffee |
| Robot college student test | Ben Goertzel | Enrol at a university, take the classes and earn a degree |
| Employment test | Nils Nilsson | Do most ordinary jobs as well as the people who do them |
| ARC-AGI | François Chollet, 2019 | Solve new visual puzzles from a few examples, a kind of problem it hasn't trained on |

Today's best chatbots can fool many people in short Turing-test chats. No AI can pass the coffee test yet, which shows how far "smart at text" is from "smart in the world".

**What is still missing?**

| People can… | Today's AI… |
|---|---|
| Keep learning from every experience | Mostly stops learning when training ends |
| Learn a new skill from a few examples | Usually needs many examples or more training |
| Plan and carry out goals over weeks and months | Struggles with long, many-step tasks, though AI agents are improving |
| Understand the physical world through a body | Learns mostly from text, images and video |
| Know when they don't know | Often answers confidently when it shouldn't |

**When will AGI arrive?** Nobody knows. In a large 2023 survey of AI researchers, the combined answer gave a 50% chance that by 2047 machines could do every task better than people without help. Some leaders of AI companies expect it much sooner. Some researchers think it is many decades away, or that today's methods won't get there at all. Treat any confident date with care.

### ASI: super AI, the hypothesis

The philosopher Nick Bostrom defines superintelligence as "any intellect that greatly exceeds the cognitive performance of humans in virtually all domains of interest". He describes three ways an AI could get there:

| Kind | What it means | Imagine… |
|---|---|---|
| **Speed** | Thinks like a person, but much faster | A year of expert work done in a few minutes |
| **Collective** | Many minds working together perfectly | Millions of top scientists sharing one brain |
| **Quality** | Thinks *better*, not just faster | Seeing solutions no person could ever come up with |

How could it happen? In 1965 the mathematician I. J. Good described an **intelligence explosion**. Once a machine is better than people at designing machines, it could design a better one, which designs a better one still. He wrote that "the first ultraintelligent machine is the last invention that man need ever make, provided that the machine is docile enough to tell us how to keep it under control."

Many researchers doubt such a sudden take-off. Real progress needs data, energy, chips and experiments in the physical world, and all of those take time. ASI remains an idea, not a plan.

| Hopes | Fears |
|---|---|
| Cures for diseases and much faster science | AI goals that don't match human values |
| Clean energy and answers to climate problems | People losing control of the most powerful systems |
| An end to boring and dangerous work | Power concentrated in very few hands |
| Plenty for everyone | Weapons and misuse on a huge scale |

### Safety and alignment

The more capable AI becomes, the more it matters that it does what we actually intend. Building AI whose goals and behaviour match human values and instructions is called **AI alignment**.

| Type | Main risks people worry about | What helps |
|---|---|---|
| ANI (today) | Unfair decisions, mistakes, deepfakes and scams, privacy, job changes | Testing, human checks, laws such as the EU AI Act |
| AGI (future) | Mass job disruption, power in a few hands, systems acting on their own in harmful ways | Alignment research, safety testing before release, international rules |
| ASI (hypothetical) | Losing control entirely | Solving alignment *before* such systems exist |

Opinions differ sharply. In 2023 hundreds of AI researchers and company leaders signed a one-sentence statement: "Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war." Others, such as the AI pioneer Yann LeCun, argue that such fears are greatly overblown. Both views are worth knowing.

### "Weak AI" and "strong AI"

You will also meet these older terms. They come from the philosopher John Searle in 1980. For him, **weak AI** only *simulates* thinking, while **strong AI** would truly *have* a mind and understand. Today people often use "weak AI" to mean narrow AI and "strong AI" to mean AGI.

### Myths and facts

| Myth | Fact |
|---|---|
| "ChatGPT is AGI." | Most researchers say no. It is very broad, but unreliable in ways a general intelligence wouldn't be. |
| "AGI is just a bigger chatbot." | Maybe, maybe not. Many researchers think new ideas are needed, such as learning continuously and understanding the physical world. |
| "Superintelligence is coming next year." | Nobody knows when, or whether, it will happen. Expert guesses range from a few years to never. |
| "Narrow AI is weak AI, so it isn't impressive." | Narrow AI beats the best humans at chess, Go and predicting protein shapes. "Narrow" means focused, not weak. |
| "A smart enough AI will have feelings and wants." | Intelligence and consciousness are different questions. Being good at tasks doesn't mean having feelings. |

---

## Day 2 in one minute

* An AI system needs **data, a model, a training method and compute**.
* Everything becomes **numbers**: pixels, tokens and embeddings, sound samples.
* A model is a **function with knobs**, called weights. Training turns the knobs to make the **loss** smaller, using **gradient descent**.
* A model is judged on **test data** it has never seen, and must not **overfit**.
* ChatGPT-style models **predict the next token**, again and again.
* **ANI** is all we have today. **AGI** is the goal, with no agreed date. **ASI** is a hypothesis, and the reason **AI safety** gets so much attention.

## Test yourself

Click a question to see the answer.

<details>
<summary>1. Why do images and text have to be turned into numbers?</summary>
<p>Because a model is a maths function: it can only calculate with numbers.</p>
</details>
<details>
<summary>2. In score = w × hours + b, what do w and b mean?</summary>
<p>w is how many marks each extra hour adds: how steep the line is. b is the score with no study: where the line starts. Training finds both.</p>
</details>
<details>
<summary>3. What goes wrong if the learning rate is too big?</summary>
<p>The steps overshoot the lowest point, so the loss bounces around and may never settle.</p>
</details>
<details>
<summary>4. A model scores 99% on its training data but 60% on new data. What is the problem?</summary>
<p>Overfitting. It memorised the training data instead of learning the real pattern.</p>
</details>
<details>
<summary>5. Is ChatGPT ANI, AGI or ASI?</summary>
<p>By the usual definition, ANI. It is very broad, but it isn't reliably human-level at everything and it doesn't keep learning. Some researchers see early signs of general intelligence in it, so this is debated.</p>
</details>

---

**Next:** [Day 3: machine learning, and supervised vs unsupervised vs reinforcement learning](/blog/day-3-machine-learning/).
