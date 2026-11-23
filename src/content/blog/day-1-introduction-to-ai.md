---
title: "Day 1: Introduction to AI — What It Is and How It Got Here"
description: "A beginner's guide to artificial intelligence: what AI is, how it differs from normal programming, the main types of AI, and its history from Alan Turing in 1950 to ChatGPT and today. With animated diagrams and comparison tables."
pubDate: 2026-11-23T10:00:00+06:00
tags: ["AI", "Machine Learning", "Beginners", "AI History"]
draft: false
---

This is **Day 1** of a series that starts AI from zero. You don't need any maths today, and there is only one small code example, which you can skip. By the end you should be able to:

* explain what AI is to a friend in one sentence,
* tell AI, machine learning, deep learning and generative AI apart,
* describe how a machine "learns",
* tell the story of AI from 1950 to ChatGPT.

Today has two parts:

1. [**What is artificial intelligence?**](#01--what-is-artificial-intelligence) A complete beginner's guide.
2. [**History of artificial intelligence**](#02--history-of-ai-from-1950-to-modern-ai) From 1950 to modern AI.

The diagrams are animated. If your device is set to reduce motion, they stay still and still make sense.

---

## 01 · What is artificial intelligence?

**Artificial intelligence (AI)** is the science of making computers do things that normally need human intelligence: understanding language, recognising faces and objects, making decisions, and learning from experience.

Two things to notice:

* AI is a **field**, not one machine. The word is like "medicine": it covers many methods, from simple rules to huge neural networks.
* "Intelligence" here means **doing the task well**, not thinking like a person. A chess program can play brilliant chess without knowing what a game is.

### A normal program vs a program that learns

A normal program follows rules that a programmer wrote, line by line. Most AI you use today works the other way round: you give it **examples with the right answers**, and it works out the rules itself. That is called **machine learning**.

<figure class="fig" style="--cycle: 8s">
<div class="fig-art">
<svg viewBox="0 0 640 318" role="img" aria-labelledby="f1-t f1-d">
<title id="f1-t">Traditional programming compared with machine learning</title>
<desc id="f1-d">In traditional programming, a person gives the computer rules and data, and it returns answers. In machine learning, a person gives the computer data and the right answers, and it works out the rules, called a model.</desc>
<defs><marker id="f1-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="s-head" d="M0 0L10 5L0 10z"/></marker></defs>
<text class="t-mono" x="24" y="30">TRADITIONAL PROGRAMMING · YOU WRITE THE RULES</text>
<rect class="s-box" x="24" y="46" width="130" height="40"/>
<text class="t-mid" x="89" y="71">Rules</text>
<rect class="s-box" x="24" y="98" width="130" height="40"/>
<text class="t-mid" x="89" y="123">Data</text>
<path class="s-line" d="M154 66C200 66 205 84 248 84" marker-end="url(#f1-h)"/>
<path class="s-line" d="M154 118C200 118 205 100 248 100" marker-end="url(#f1-h)"/>
<rect class="s-key a-glow" x="250" y="62" width="140" height="60" style="--at: 1.3s"/>
<text class="t-mid t-strong" x="320" y="97">Computer</text>
<path class="s-line" d="M390 92H484" marker-end="url(#f1-h)"/>
<rect class="s-box" x="486" y="72" width="130" height="40"/>
<text class="t-mid" x="551" y="97">Answers</text>
<path class="s-flow" pathLength="100" d="M154 66C200 66 205 84 248 84"/>
<path class="s-flow" pathLength="100" d="M154 118C200 118 205 100 248 100"/>
<path class="s-flow" pathLength="100" d="M390 92H484" style="--at: 2s"/>
<path class="s-faint s-dash" d="M24 160H616"/>
<text class="t-mono" x="24" y="190">MACHINE LEARNING · THE COMPUTER FINDS THE RULES</text>
<rect class="s-box" x="24" y="206" width="130" height="40"/>
<text class="t-mid" x="89" y="231">Data</text>
<rect class="s-box" x="24" y="258" width="130" height="40"/>
<text class="t-mid" x="89" y="283">Right answers</text>
<path class="s-line" d="M154 226C200 226 205 244 248 244" marker-end="url(#f1-h)"/>
<path class="s-line" d="M154 278C200 278 205 260 248 260" marker-end="url(#f1-h)"/>
<rect class="s-key a-glow" x="250" y="222" width="140" height="60" style="--at: 5.3s"/>
<text class="t-mid t-strong" x="320" y="257">Learning</text>
<path class="s-line" d="M390 252H484" marker-end="url(#f1-h)"/>
<rect class="s-out" x="486" y="232" width="130" height="40"/>
<text class="t-mid t-strong" x="551" y="257">Rules = a model</text>
<path class="s-flow" pathLength="100" d="M154 226C200 226 205 244 248 244" style="--at: 4s"/>
<path class="s-flow" pathLength="100" d="M154 278C200 278 205 260 248 260" style="--at: 4s"/>
<path class="s-flow" pathLength="100" d="M390 252H484" style="--at: 6s"/>
</svg>
</div>
<figcaption><b>Fig. 01</b> <span>Same computer, opposite direction. Machine learning takes the answers in and gives the rules out.</span></figcaption>
</figure>

| | Traditional programming | Machine learning |
|---|---|---|
| Who makes the rules? | A programmer writes them | The computer learns them from examples |
| What you give it | Rules + data | Data + the right answers |
| What you get back | Answers | A **model**: rules you can use on new data |
| When the world changes | A person rewrites the rules | You retrain it on newer examples |
| Good for | Clear, fixed logic: tax, billing, sorting | Fuzzy patterns: faces, speech, spam, prices |
| Can it explain itself? | Yes, read the code | Often not: the rules are millions of numbers |

**Example: a spam filter, built both ways.** The traditional way, a person writes the rule:

```python
def is_spam(subject: str) -> bool:
    return "win money" in subject.lower()
```

It works until spammers write "W1N M0NEY". Then someone has to add another rule, and another, forever.

The machine-learning way, we show examples and let the computer find the pattern. This uses scikit-learn, a popular Python library:

```python
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

subjects = ["Win money now", "Meeting at 10", "Claim your free prize", "Lunch tomorrow?"]
labels = [1, 0, 1, 0]  # 1 = spam, 0 = not spam

words = CountVectorizer()
model = MultinomialNB().fit(words.fit_transform(subjects), labels)

print(model.predict(words.transform(["Free money prize", "Lunch meeting at 1"])))  # [1 0]
```

Nobody told the model that "free" or "prize" means spam. It learned that from four examples. A real spam filter learns the same way, from millions of emails.

### AI, machine learning, deep learning and generative AI

People often use these words as if they mean the same thing. They don't: each one sits inside the one before it.

<figure class="fig" style="--cycle: 10s">
<div class="fig-art">
<svg viewBox="0 0 640 360" role="img" aria-labelledby="f2-t f2-d">
<title id="f2-t">AI contains machine learning, which contains deep learning, which contains generative AI</title>
<desc id="f2-d">Four nested circles. The outer circle is artificial intelligence. Inside it is machine learning, inside that is deep learning, and in the centre is generative AI.</desc>
<circle class="s-ring a-turn" cx="180" cy="180" r="166"/>
<circle class="s-ring a-turn" cx="180" cy="180" r="124" style="--at: 2.5s"/>
<circle class="s-ring a-turn" cx="180" cy="180" r="84" style="--at: 5s"/>
<circle class="s-ring a-turn" cx="180" cy="180" r="44" style="--at: 7.5s"/>
<text class="t-sign t-mid" x="180" y="44">AI</text>
<text class="t-sign t-mid" x="180" y="88">MACHINE LEARNING</text>
<text class="t-sign t-mid" x="180" y="127">DEEP LEARNING</text>
<text class="t-sign t-mid" x="180" y="186">GEN AI</text>
<text class="t-sign a-turn-text" x="384" y="58">AI · ARTIFICIAL INTELLIGENCE</text>
<text class="t-small" x="384" y="80">Any program that acts smart,</text>
<text class="t-small" x="384" y="97">rules included. Named in 1956.</text>
<text class="t-sign a-turn-text" x="384" y="136" style="--at: 2.5s">ML · MACHINE LEARNING</text>
<text class="t-small" x="384" y="158">Learns its rules from data</text>
<text class="t-small" x="384" y="175">instead of being told. 1959.</text>
<text class="t-sign a-turn-text" x="384" y="214" style="--at: 5s">DL · DEEP LEARNING</text>
<text class="t-small" x="384" y="236">Machine learning with many-layer</text>
<text class="t-small" x="384" y="253">neural networks. Took off in 2012.</text>
<text class="t-sign a-turn-text" x="384" y="292" style="--at: 7.5s">GEN AI · GENERATIVE AI</text>
<text class="t-small" x="384" y="314">Deep learning that makes new text,</text>
<text class="t-small" x="384" y="331">images, sound and code. 2022 on.</text>
</svg>
</div>
<figcaption><b>Fig. 02</b> <span>Each field sits inside the one before it. All deep learning is machine learning, and all machine learning is AI, but not the other way round.</span></figcaption>
</figure>

| Term | What it means | How it works | Everyday example |
|---|---|---|---|
| **Artificial intelligence** | Any machine doing tasks that need intelligence | Rules, search, logic, or learning | A chess engine, the route planner in Maps |
| **Machine learning** | AI that learns its rules from data | Finds patterns in examples | Spam filter, house price prediction |
| **Deep learning** | Machine learning with many-layer neural networks | Layers of artificial neurons find the useful features by themselves | Face unlock, voice typing, photo search |
| **Generative AI** | Deep learning that creates new content | Learns from huge amounts of data, then produces text, images, audio or code | ChatGPT, Claude, Gemini, image generators |

So every deep learning system is machine learning, and every machine learning system is AI. But not every AI learns: the chess computers of the 1990s followed rules and search methods written by people.

### How a machine learns

For a machine, learning is a loop of **guess, check, adjust**. It is close to how you learned to throw a ball into a basket: throw, see how far you missed, change your aim a little, throw again.

<figure class="fig" style="--cycle: 4s">
<div class="fig-art">
<svg viewBox="0 0 640 296" role="img" aria-labelledby="f3-t f3-d">
<title id="f3-t">The training loop</title>
<desc id="f3-d">A loop of four steps: data, guess, check and adjust. Each time round the loop, the error gets smaller. When it is small enough, the model is used to predict new cases.</desc>
<defs><marker id="f3-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="s-head" d="M0 0L10 5L0 10z"/></marker></defs>
<path class="s-line" d="M95 150A135 95 0 0 1 365 150A135 95 0 0 1 95 150Z"/>
<path class="s-orbit" pathLength="100" d="M95 150A135 95 0 0 1 365 150A135 95 0 0 1 95 150Z"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(134.5 82.8) rotate(-35)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(325.5 82.8) rotate(35)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(325.5 217.2) rotate(145)"/>
<path class="s-head" d="M-6 -5L5 0L-6 5z" transform="translate(134.5 217.2) rotate(215)"/>
<rect class="s-box a-glow" x="29" y="125" width="132" height="50"/>
<text class="t-mid t-strong" x="95" y="147">1 · Data</text>
<text class="t-mid t-small" x="95" y="164">examples + answers</text>
<rect class="s-box a-glow" x="164" y="30" width="132" height="50" style="--at: 1s"/>
<text class="t-mid t-strong" x="230" y="52">2 · Guess</text>
<text class="t-mid t-small" x="230" y="69">the model predicts</text>
<rect class="s-box a-glow" x="299" y="125" width="132" height="50" style="--at: 2s"/>
<text class="t-mid t-strong" x="365" y="147">3 · Check</text>
<text class="t-mid t-small" x="365" y="164">how wrong was it?</text>
<rect class="s-box a-glow" x="164" y="220" width="132" height="50" style="--at: 3s"/>
<text class="t-mid t-strong" x="230" y="242">4 · Adjust</text>
<text class="t-mid t-small" x="230" y="259">nudge the weights</text>
<text class="t-sign t-mid" x="230" y="150">TRAINING</text>
<text class="t-mid t-small" x="230" y="167">repeat many times</text>
<text class="t-mono" x="470" y="58">ERROR</text>
<rect class="s-bar a-shrink" x="470" y="68" width="150" height="16"/>
<rect class="s-track" x="470" y="68" width="150" height="16"/>
<text class="t-small" x="470" y="104">gets smaller each round</text>
<path class="s-line s-dash" d="M431 150C452 150 450 215 468 215" marker-end="url(#f3-h)"/>
<text class="t-mono" x="470" y="178">SMALL ENOUGH?</text>
<rect class="s-out" x="470" y="190" width="150" height="50"/>
<text class="t-mid t-strong" x="545" y="212">5 · Use it</text>
<text class="t-mid t-small" x="545" y="229">predict new cases</text>
</svg>
</div>
<figcaption><b>Fig. 03</b> <span>Training is the loop on the left. Using the finished model, step 5, is called inference.</span></figcaption>
</figure>

1. **Data.** The model sees an example, such as a photo labelled "cat".
2. **Guess.** It makes a prediction. At the start its guesses are random.
3. **Check.** It compares the guess with the right answer. The difference is the **error**, also called the *loss*.
4. **Adjust.** It changes its internal numbers, called **weights** or **parameters**, a tiny bit so the error gets smaller.

The loop runs thousands or millions of times. When the error is small enough, training stops and the model is ready to **use** on data it has never seen. Using a trained model is called **inference**.

| | Training | Inference |
|---|---|---|
| What happens | The model learns from examples | The model answers new questions |
| How often | Once, or now and then | Every time someone uses it |
| Cost | Slow and expensive: weeks or months on thousands of chips for the biggest models | Fast and cheap for each question |
| Example | Teaching a model with a million cat and dog photos | Your phone putting your new photo in the "cats" album |

### Inside deep learning: neural networks

Deep learning uses **artificial neural networks**, loosely inspired by brain cells. Each artificial neuron does something simple: it takes some numbers in, multiplies each one by a weight, adds them up, and passes the result on. One neuron is not smart. Millions of them in layers can recognise a face.

<figure class="fig" style="--cycle: 6s">
<div class="fig-art">
<svg viewBox="0 0 640 322" role="img" aria-labelledby="f4-t f4-d">
<title id="f4-t">A small neural network</title>
<desc id="f4-d">Three input neurons take in pixels. Signals pass through two hidden layers of four neurons each, then reach two output neurons. The output says cat 92 percent and dog 8 percent.</desc>
<text class="t-mono t-mid" x="100" y="34">INPUT</text>
<text class="t-mono t-mid" x="240" y="34">HIDDEN LAYER 1</text>
<text class="t-mono t-mid" x="380" y="34">HIDDEN LAYER 2</text>
<text class="t-mono t-mid" x="510" y="34">OUTPUT</text>
<g class="s-edges a-wave"><path d="M100 105L240 75M100 105L240 135M100 105L240 195M100 105L240 255M100 165L240 75M100 165L240 135M100 165L240 195M100 165L240 255M100 225L240 75M100 225L240 135M100 225L240 195M100 225L240 255"/></g>
<g class="s-edges a-wave" style="--at: 1.2s"><path d="M240 75L380 75M240 75L380 135M240 75L380 195M240 75L380 255M240 135L380 75M240 135L380 135M240 135L380 195M240 135L380 255M240 195L380 75M240 195L380 135M240 195L380 195M240 195L380 255M240 255L380 75M240 255L380 135M240 255L380 195M240 255L380 255"/></g>
<g class="s-edges a-wave" style="--at: 2.4s"><path d="M380 75L510 135M380 75L510 195M380 135L510 135M380 135L510 195M380 195L510 135M380 195L510 195M380 255L510 135M380 255L510 195"/></g>
<circle class="s-node s-node--lit" cx="100" cy="105" r="13"/>
<circle class="s-node s-node--lit" cx="100" cy="165" r="13"/>
<circle class="s-node s-node--lit" cx="100" cy="225" r="13"/>
<circle class="s-node a-node" cx="240" cy="75" r="13" style="--at: 0.8s"/>
<circle class="s-node a-node" cx="240" cy="135" r="13" style="--at: 0.8s"/>
<circle class="s-node a-node" cx="240" cy="195" r="13" style="--at: 0.8s"/>
<circle class="s-node a-node" cx="240" cy="255" r="13" style="--at: 0.8s"/>
<circle class="s-node a-node" cx="380" cy="75" r="13" style="--at: 2s"/>
<circle class="s-node a-node" cx="380" cy="135" r="13" style="--at: 2s"/>
<circle class="s-node a-node" cx="380" cy="195" r="13" style="--at: 2s"/>
<circle class="s-node a-node" cx="380" cy="255" r="13" style="--at: 2s"/>
<circle class="s-node s-node--lit a-node" cx="510" cy="135" r="13" style="--at: 3.2s"/>
<circle class="s-node" cx="510" cy="195" r="13"/>
<text class="t-small t-end" x="78" y="109">pixel 1</text>
<text class="t-small t-end" x="78" y="169">pixel 2</text>
<text class="t-small t-end" x="78" y="229">pixel 3</text>
<text class="t-strong a-node-text" x="532" y="140" style="--at: 3.2s">cat 92%</text>
<text class="t-small" x="532" y="200">dog 8%</text>
<path class="s-line" d="M226 280v8h168v-8"/>
<text class="t-mono t-mid" x="310" y="308">MORE HIDDEN LAYERS = DEEPER</text>
</svg>
</div>
<figcaption><b>Fig. 04</b> <span>A signal passes layer by layer from the pixels to the answer. Real networks have millions of neurons, but the idea is the same.</span></figcaption>
</figure>

* The **input layer** takes in the raw data, for example the pixels of a photo.
* The **hidden layers** find patterns. In an image model, early layers find edges and later layers find shapes like ears and eyes. Nobody programs these features: the network learns them.
* The **output layer** gives the answer, often as a probability: 92% cat, 8% dog.

"Deep" just means **many hidden layers**. Modern models have dozens or hundreds of layers and billions of weights.

### Three ways machines learn

| | Supervised learning | Unsupervised learning | Reinforcement learning |
|---|---|---|---|
| The data | Examples **with** answers (labels) | Examples **without** answers | No examples: a world to try things in |
| The goal | Predict the answer for new examples | Find groups and patterns by itself | Learn the actions that earn the most reward |
| Like a student who… | studies with an answer key | sorts a pile of photos into groups nobody named | learns a game by playing it and watching the score |
| Real examples | Spam filters, price prediction, reading medical scans | Customer groups for marketing, spotting unusual bank payments | AlphaGo, robots learning to walk |

Large language models such as the one behind ChatGPT mix these. First they read huge amounts of text and learn to predict the next word. This is called **self-supervised learning**, because the text supplies its own answers. Then people fine-tune them with examples and feedback.

### Types of AI by what they can do

| Type | What it means | Does it exist? |
|---|---|---|
| **Narrow AI** (ANI, "weak AI") | Good at one task or a group of related tasks | Yes. Every AI product you have used |
| **General AI** (AGI, "strong AI") | Can learn and do any thinking task a person can | Not yet, and experts disagree on how close we are |
| **Super AI** (ASI) | Better than the best humans at almost everything | No. For now it is an idea discussed by researchers and in science fiction |

Today's chatbots can write, translate, code and explain, which looks very general. But by the usual definition they are still narrow AI: they make mistakes no person would make, they don't keep learning from experience the way a person does, and they need people to check their work. Whether they are a step towards AGI is one of the biggest debates in the field.

### Types of AI by how they work

A second, older way to sort AI looks at memory and understanding:

| Type | What it can do | Example |
|---|---|---|
| **Reactive machines** | React to what is in front of them now. No memory of the past | IBM's Deep Blue chess computer (1997) |
| **Limited memory** | Use recent data and past examples to decide | Self-driving cars watching nearby traffic, chatbots that remember the conversation |
| **Theory of mind** | Understand that people have feelings, beliefs and intentions | Research only |
| **Self-aware** | Have their own consciousness and sense of self | Does not exist |

Almost all AI in use today is **limited memory** AI.

### AI vs human intelligence

| | Human intelligence | Artificial intelligence |
|---|---|---|
| Learning | Learns from a few examples | Usually needs thousands to millions |
| Speed | Slow at calculation | Billions of calculations per second |
| Memory | Forgets details but keeps what matters | Can store huge amounts exactly, yet chatbots can still mix up or invent facts |
| Common sense | Strong, from living in the world | Weak and patchy |
| Creativity | New ideas from experience and feeling | Recombines patterns from its training data |
| Emotions | Real feelings | None, though it can imitate them in words |
| Energy | The brain runs on about 20 watts | Large models run in data centres that use megawatts |
| Rest | Needs sleep | Works 24/7 |

### Where you already use AI

| Where | What the AI does |
|---|---|
| Your phone | Face unlock, autocorrect, voice typing, camera night mode |
| Email | Filters spam, suggests replies |
| Maps | Predicts traffic and your arrival time |
| YouTube, Netflix, online shops | Recommends what to watch or buy next |
| Banks | Flags unusual card payments as possible fraud |
| Translation | Google Translate and similar tools |
| Health | Helps doctors spot problems in X-rays and scans |
| Work and study | Chatbots and assistants that write, explain and code |

### What AI is good at, and where it fails

| AI is good at | AI struggles with |
|---|---|
| Finding patterns in huge amounts of data | Knowing when it is wrong: it can sound sure and still be wrong, which is called **hallucination** |
| Doing the same task fast, without getting tired | Situations very different from its training data |
| Seeing, hearing and reading at scale | Common sense and understanding the physical world |
| Translating, summarising and drafting | Fairness: it repeats the **bias** in its data |
| Games and problems with clear rules | Explaining why it made a decision |

A good rule of thumb: **use AI as a fast assistant, and check its work** when the answer matters.

### Myths and facts

| Myth | Fact |
|---|---|
| "AI thinks like a human." | AI finds statistical patterns. It does not think or feel the way people do. |
| "AI is always right because it's a computer." | AI learns from data made by people, mistakes and bias included, and it can invent answers. |
| "AI is new." | The field started in 1956. Part 02 tells the story. |
| "AI will replace every job." | It changes many jobs and automates some tasks. New jobs and tools appear too, but the change is real. |
| "AI and robots are the same thing." | A robot is a machine body; AI is software. Many robots have little AI, and most AI has no body. |

### Key words from Part 01

| Word | Meaning |
|---|---|
| **Algorithm** | A step-by-step recipe a computer follows |
| **Data set** | The collection of examples a model learns from |
| **Label** | The right answer attached to an example, like "spam" |
| **Model** | What you get after training: the learned rules, stored as numbers |
| **Weights (parameters)** | The numbers inside a model that change during training |
| **Training** | Showing the model examples so it can learn |
| **Inference** | Using a trained model on new data |
| **Neural network** | A model made of layers of simple, connected "neurons" |
| **LLM** | Large language model: a huge neural network trained on text, like the one behind ChatGPT |
| **Prompt** | The instruction or question you type to a generative AI |
| **Hallucination** | When an AI gives a confident answer that is false |

---

## 02 · History of AI: from 1950 to modern AI

The history of AI is not a straight line up. It is a story of big promises, disappointment and comebacks. Researchers call the bad times **AI winters**: years when results fell short of the hype and the money dried up.

<figure class="fig" style="--cycle: 10s">
<div class="fig-art">
<svg viewBox="0 0 640 284" role="img" aria-labelledby="f6-t f6-d">
<title id="f6-t">The seasons of AI, 1950 to today</title>
<desc id="f6-d">An illustrative line of interest and funding in AI. It rises after the 1956 Dartmouth workshop, falls in the first AI winter from 1974 to 1980, rises with expert systems in the 1980s, falls in the second AI winter from 1987 to 1993, then climbs with Deep Blue in 1997, AlexNet in 2012, AlphaGo in 2016 and ChatGPT in 2022.</desc>
<text class="t-mono" x="50" y="22">INTEREST AND FUNDING · AN ILLUSTRATION, NOT MEASURED DATA</text>
<rect class="s-winter" x="229.2" y="34" width="44.8" height="216"/>
<rect class="s-winter" x="326.3" y="34" width="44.8" height="216"/>
<text class="t-mono t-mid" transform="translate(255 120) rotate(-90)">1ST AI WINTER</text>
<text class="t-mono t-mid" transform="translate(352 110) rotate(-90)">2ND AI WINTER</text>
<path class="s-line" d="M50 250H616M50 250v5M124.7 250v5M199.3 250v5M274 250v5M348.7 250v5M423.3 250v5M498 250v5M572.7 250v5"/>
<text class="t-mono t-mid" x="50" y="272">1950</text>
<text class="t-mono t-mid" x="124.7" y="272">1960</text>
<text class="t-mono t-mid" x="199.3" y="272">1970</text>
<text class="t-mono t-mid" x="274" y="272">1980</text>
<text class="t-mono t-mid" x="348.7" y="272">1990</text>
<text class="t-mono t-mid" x="423.3" y="272">2000</text>
<text class="t-mono t-mid" x="498" y="272">2010</text>
<text class="t-mono t-mid" x="572.7" y="272">2020</text>
<path class="s-curve a-draw" pathLength="100" d="M50 218.5C58.1 210.9 74.6 193.5 94.8 176.5C115 159.5 143.2 134.2 162 124C180.8 113.8 187.2 108.5 199.3 119.8C211.4 131.1 215.8 173 229.2 187C242.6 201 260.6 206.9 274 197.5C287.4 188.1 294.5 147.7 303.9 134.5C313.3 121.3 318.2 114.5 326.3 124C334.3 133.4 340.6 173.8 348.7 187C356.7 200.2 361.7 200.5 371.1 197.5C380.5 194.5 383.5 176.6 400.9 170.2C418.4 163.8 448 170.1 468.1 161.8C488.3 153.5 499.5 135.3 512.9 124C526.4 112.7 532 106.4 542.8 98.8C553.6 91.2 564.6 89.6 572.7 82C580.7 74.4 580.9 63.6 587.6 56.8C594.3 50 606 46.5 610 44.2"/>
<g class="a-late"><circle class="s-mark" cx="94.8" cy="176.5" r="4"/><text class="t-small" x="102" y="198">Dartmouth 1956</text></g>
<g class="a-late" style="--at: 0.15s"><path class="s-faint" d="M303.9 56V128"/><circle class="s-mark" cx="303.9" cy="134.5" r="4"/><text class="t-small t-mid" x="303.9" y="50">Expert systems</text></g>
<g class="a-late" style="--at: 0.3s"><circle class="s-mark" cx="400.9" cy="170.2" r="4"/><text class="t-small t-mid" x="400.9" y="152">Deep Blue 1997</text></g>
<g class="a-late" style="--at: 0.45s"><circle class="s-mark" cx="512.9" cy="124" r="4"/><text class="t-small t-end" x="505" y="114">AlexNet 2012</text></g>
<g class="a-late" style="--at: 0.6s"><circle class="s-mark" cx="542.8" cy="98.8" r="4"/><text class="t-small t-end" x="535" y="88">AlphaGo 2016</text></g>
<g class="a-late" style="--at: 0.75s"><circle class="s-ping" cx="610" cy="44.2" r="4"/><circle class="s-mark" cx="587.6" cy="56.8" r="4"/><text class="t-small t-end" x="580" y="50">ChatGPT 2022</text></g>
</svg>
</div>
<figcaption><b>Fig. 05</b> <span>Two winters and three booms. The shape is drawn to tell the story; it is not a measurement.</span></figcaption>
</figure>

### Before 1950: the idea of an artificial brain

In 1943, Warren McCulloch and Walter Pitts described a simple mathematical model of a brain cell: the first **artificial neuron**. Computers barely existed yet, but the question had started. Could a machine built from simple parts think?

### 1950: Alan Turing asks "Can machines think?"

In 1950 the British mathematician **Alan Turing** published a paper called *Computing Machinery and Intelligence*. It opens with the question "Can machines think?" Because "think" is hard to define, Turing suggested a test instead. He called it the **imitation game**. Today we call it the **Turing test**.

<figure class="fig" style="--cycle: 6s">
<div class="fig-art">
<svg viewBox="0 0 640 236" role="img" aria-labelledby="f5-t f5-d">
<title id="f5-t">The Turing test</title>
<desc id="f5-d">A judge sends typed questions over a wall to two hidden rooms. One room holds a person, the other a computer. The judge reads the answers and tries to tell which is which.</desc>
<defs><pattern id="f5-wall" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="s-hatch" d="M0 0V8"/></pattern></defs>
<circle class="s-node s-node--lit" cx="90" cy="88" r="18"/>
<path class="s-node s-node--lit" d="M54 156C54 122 126 122 126 156Z"/>
<path class="s-line" d="M34 156H146"/>
<text class="t-mono t-mid" x="90" y="182">JUDGE</text>
<text class="t-small t-mid" x="90" y="200">types questions,</text>
<text class="t-small t-mid" x="90" y="216">reads the answers</text>
<path class="s-faint s-dash" d="M134 112C230 112 290 70 378 70"/>
<path class="s-faint s-dash" d="M134 132C230 132 290 190 378 190"/>
<path class="s-flow" pathLength="100" d="M134 112C230 112 290 70 378 70"/>
<path class="s-flow" pathLength="100" d="M134 132C230 132 290 190 378 190" style="--at: 0.3s"/>
<path class="s-flow s-flow--back" pathLength="100" d="M378 70C290 70 230 112 134 112" style="--at: 2.6s"/>
<path class="s-flow s-flow--back" pathLength="100" d="M378 190C290 190 230 132 134 132" style="--at: 2.9s"/>
<rect class="s-wall" x="292" y="24" width="16" height="206" fill="url(#f5-wall)"/>
<text class="t-mono t-mid" x="300" y="16">WALL</text>
<rect class="s-box a-glow" x="380" y="30" width="230" height="80" style="--at: 1s"/>
<text class="t-mono" x="394" y="50">ROOM A</text>
<text class="t-big t-mid" x="495" y="86">?</text>
<text class="t-mono t-end" x="598" y="100">HIDDEN: A PERSON</text>
<rect class="s-box a-glow" x="380" y="150" width="230" height="80" style="--at: 1.3s"/>
<text class="t-mono" x="394" y="170">ROOM B</text>
<text class="t-big t-mid" x="495" y="206">?</text>
<text class="t-mono t-end" x="598" y="220">HIDDEN: A COMPUTER</text>
</svg>
</div>
<figcaption><b>Fig. 06</b> <span>Questions go out (orange dots) and answers come back (teal dots). If the judge can't reliably tell which room holds the computer, the computer passes.</span></figcaption>
</figure>

The Turing test is still argued about today, since fooling a judge is not the same as understanding. But it gave the new field its first clear goal.

### 1956: the Dartmouth workshop names the field

In the summer of 1956, **John McCarthy**, **Marvin Minsky**, **Nathaniel Rochester** and **Claude Shannon** brought a small group of researchers together at Dartmouth College in the USA. Their proposal, written in 1955, is where the name **"artificial intelligence"** first appeared. It was built on a bold idea:

> "…every aspect of learning or any other feature of intelligence can in principle be so precisely described that a machine can be made to simulate it."

Most people date the birth of AI as a field to this workshop.

### 1956–1974: the golden years

Early results looked amazing for the time:

* **Logic Theorist** (1956), by Allen Newell, Herbert Simon and Cliff Shaw, proved mathematical theorems. It is often called the first AI program.
* **The Perceptron** (1958), by Frank Rosenblatt, was a machine that learned to recognise simple shapes: an early neural network. *The New York Times* reported that the US Navy expected it one day to "walk, talk, see, write, reproduce itself and be conscious of its existence".
* **Machine learning** got its name in 1959 from Arthur Samuel, whose checkers program learned to beat him.
* **ELIZA** (1966), by Joseph Weizenbaum, was the first famous chatbot. It imitated a therapist by turning your words back into questions. It understood nothing, yet some people poured their hearts out to it.
* **Shakey** (1966–1972), built at SRI, was the first mobile robot that could plan its own actions.

The optimism was huge. In 1965 Herbert Simon predicted that "machines will be capable, within twenty years, of doing any work a man can do."

### 1974–1980: the first AI winter

The promises did not come true. Computers were far too slow and had tiny memories, and problems that worked in the lab grew impossibly large in the real world. In 1969, Minsky and Seymour Papert's book *Perceptrons* showed hard limits of simple neural networks, and interest in them faded. In 1973 the **Lighthill Report** told the British government that AI had not delivered what it promised. Funding was cut in the UK and the US.

### 1980–1987: the expert systems boom

AI came back with a practical idea: **expert systems**. Engineers interviewed human experts and wrote their knowledge down as hundreds or thousands of *if–then* rules. XCON, used from 1980 at Digital Equipment Corporation, checked and configured computer orders and saved the company millions of dollars a year. Businesses spent heavily on AI, and in 1982 Japan launched its ambitious Fifth Generation computer project.

In 1986, David Rumelhart, Geoffrey Hinton and Ronald Williams made **backpropagation** popular: a way to train neural networks with several layers. Neural networks still learn this way today.

### 1987–1993: the second AI winter

Expert systems turned out to be brittle. They could not learn, broke on cases their rules did not cover, and were expensive to keep up to date. The market for special AI computers, called LISP machines, collapsed in 1987, and "AI" became a word companies avoided.

### 1993–2011: quiet progress with machine learning

Researchers turned to statistics and learning from data, often without calling it AI. The internet produced more data than ever, and computers kept getting faster.

* **1997:** IBM's **Deep Blue** beat the world chess champion, Garry Kasparov.
* **1998:** Yann LeCun's **LeNet** neural network read handwritten digits, and banks used this kind of system to read cheques.
* **2006:** Geoffrey Hinton and his colleagues showed new ways to train deep networks, and "deep learning" became the name.
* **2009:** Fei-Fei Li's team released **ImageNet**, millions of labelled photos for training and testing vision systems.
* **2011:** IBM's **Watson** won the quiz show *Jeopardy!*, and Apple launched **Siri**.

### 2012–2017: the deep learning revolution

In 2012 a neural network called **AlexNet**, by Alex Krizhevsky, Ilya Sutskever and Geoffrey Hinton, won the ImageNet image-recognition challenge by a huge margin: its error rate was about 15%, against 26% for the next best. It was trained on **GPUs**, the graphics chips made for video games. Almost overnight, deep learning became the main way to do AI.

* **2014:** Ian Goodfellow introduced **GANs**, networks that could generate realistic images.
* **2016:** DeepMind's **AlphaGo** beat Lee Sedol, one of the world's best Go players, 4–1. Go has more possible positions than there are atoms in the universe, so a computer cannot win it by brute force.
* **2017:** Google researchers published *Attention Is All You Need*, which introduced the **Transformer**. Almost every modern language model is built on it, and it is the "T" in GPT.

### 2018–today: the age of generative AI

* **2018:** OpenAI's first **GPT** and Google's **BERT** showed that a model pre-trained on lots of text could be adapted to many language tasks.
* **2020:** **GPT-3**, with 175 billion parameters, could write convincing text from a short prompt. DeepMind's **AlphaFold 2** predicted the 3D shapes of proteins, a problem biologists had worked on for 50 years.
* **2022:** Image generators such as DALL·E 2, Midjourney and Stable Diffusion turned text into pictures. On **30 November 2022**, OpenAI released **ChatGPT**. It reached an estimated 100 million users in about two months, at the time the fastest growth of any consumer app.
* **2023:** **GPT-4**, Anthropic's **Claude**, Meta's **Llama** and Google's **Gemini** arrived, and models began to understand images as well as text.
* **2024:** The Nobel Prize in Physics went to John Hopfield and Geoffrey Hinton for their work on neural networks, and half of the Chemistry prize went to Demis Hassabis and John Jumper for AlphaFold. The EU's **AI Act**, the first broad law for AI, came into force. "Reasoning" models appeared that work through a problem step by step before they answer.
* **2025 to today:** AI **agents** use tools. They can search the web, write and run code, and finish multi-step tasks with less help from people.

### Milestones at a glance

| Year | Milestone | Why it mattered |
|---|---|---|
| 1943 | McCulloch and Pitts' artificial neuron | The first maths model of a brain cell |
| 1950 | Turing asks "Can machines think?" | Gave AI its first test |
| 1956 | Dartmouth workshop | AI gets its name and becomes a field |
| 1958 | Rosenblatt's Perceptron | An early machine that learned |
| 1959 | Samuel names "machine learning" | Learning from experience, not only rules |
| 1966 | ELIZA | The first famous chatbot |
| 1973 | Lighthill Report | Helped start the first AI winter |
| 1980 | XCON expert system | AI makes money for business |
| 1986 | Backpropagation made popular | How neural networks still learn today |
| 1987 | LISP machine market collapses | Start of the second AI winter |
| 1997 | Deep Blue beats Kasparov | A machine beats the chess world champion |
| 2009 | ImageNet | Big labelled data for training vision models |
| 2011 | Watson wins *Jeopardy!*, Siri launches | AI enters everyday life |
| 2012 | AlexNet | Deep learning on GPUs takes over |
| 2016 | AlphaGo beats Lee Sedol | Masters a game too big for brute force |
| 2017 | The Transformer | The design behind modern language models |
| 2020 | GPT-3, AlphaFold 2 | Bigger models work better; AI helps science |
| 2022 | ChatGPT | Generative AI goes mainstream |
| 2024 | Nobel Prizes for AI work | Science recognises what AI has done |

### How AI changed: the eras compared

| Era | Years | Main idea | Where the knowledge came from | Weakness |
|---|---|---|---|---|
| Symbolic AI | 1956–1974 | Intelligence is logic and symbols | Rules written by researchers | Too slow; broke on real-world problems |
| Expert systems | 1980–1987 | Copy an expert's knowledge into rules | Interviews with experts | Brittle, costly to update, could not learn |
| Machine learning | 1990s–2011 | Learn patterns from data with statistics | Data sets, with features picked by people | People had to decide what to look at |
| Deep learning | 2012–2017 | Learn the features too, with many-layer networks | Large labelled data sets and GPUs | Needs lots of labelled data; hard to explain |
| Generative AI | 2018–today | Pre-train huge models, then create | Huge amounts of text, images and code, plus human feedback | Hallucination, bias, cost, copyright questions |

### Old AI vs modern AI

| | Old AI (rule-based, 1950s–1980s) | Modern AI (learning-based, 2010s–today) |
|---|---|---|
| How it gets smart | People write the rules | It learns patterns from data |
| Data needed | Little | Huge amounts |
| Computing power | One computer | Thousands of GPUs for the biggest models |
| Handles messy real life? | Badly | Much better |
| Can you see why it decided? | Yes, follow the rules | Often not |
| Typical example | Expert systems, chess programs | ChatGPT, face unlock, recommendations |

### Why AI works now: three ingredients

The core ideas are old. Neural networks date from the 1940s and 50s, and backpropagation from the 1980s. They finally worked in the 2010s because three things came together:

| Ingredient | Then | Now |
|---|---|---|
| **Data** | Small, hand-made data sets | The internet, phones and sensors create data nonstop |
| **Computing power** | Slow processors | GPUs and AI chips doing trillions of calculations per second |
| **Better methods** | Shallow networks that were hard to train | Deep networks, Transformers and better training tricks |

### What the history teaches us

* **Hype comes in cycles.** Every era promised human-level AI within about 20 years. Be careful with big predictions, including today's.
* **Old ideas come back.** Neural networks were written off twice before they took over.
* **Progress needs all three ingredients.** Good ideas fail without enough data and computing power.
* **Even the winters left useful tools.** The "failed" eras gave us search methods, programming languages like LISP, and rule engines that are still in use.

---

## Day 1 in one minute

* **AI** is making computers do tasks that need human intelligence.
* **Machine learning** is AI that learns its rules from examples instead of being told. **Deep learning** does it with many-layer neural networks. **Generative AI** uses deep learning to create new content.
* Machines learn in a loop: **guess, check the error, adjust**, repeated many times.
* All AI in use today is **narrow AI**. General AI does not exist yet.
* AI's history is **booms and winters**: born in 1956, two winters, then machine learning, deep learning from 2012, and generative AI since 2022.

## Test yourself

Click a question to see the answer.

<details>
<summary>1. What is the main difference between traditional programming and machine learning?</summary>
<p>In traditional programming, a person writes the rules. In machine learning, the computer learns the rules from examples and their right answers.</p>
</details>
<details>
<summary>2. Is every AI system machine learning?</summary>
<p>No. Machine learning is one part of AI. Deep Blue, for example, beat Kasparov with rules and search methods written by people.</p>
</details>
<details>
<summary>3. What happens in the "check" step of training?</summary>
<p>The model compares its guess with the right answer and measures how wrong it was. That difference is the error, or loss.</p>
</details>
<details>
<summary>4. Where did the name "artificial intelligence" come from?</summary>
<p>From John McCarthy and his colleagues, in their 1955 proposal for the Dartmouth workshop held in 1956.</p>
</details>
<details>
<summary>5. Backpropagation was popular in 1986. Why did deep learning only take off in 2012?</summary>
<p>Because three things finally came together: enough labelled data (ImageNet), fast GPUs, and better ways to train deep networks.</p>
</details>
