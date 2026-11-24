---
title: "Day 3: Machine Learning — How Machines Learn, and Supervised vs Unsupervised vs Reinforcement Learning"
description: "What machine learning is and how a machine actually learns: Mitchell's definition, features and labels, two learners worked through by hand, and how to tell whether a model really learned. Then the three types, supervised, unsupervised and reinforcement learning, with real Python examples, animated diagrams and comparison tables."
pubDate: 2026-11-24T11:00:00+06:00
tags: ["AI", "Machine Learning", "Beginners", "Supervised Learning", "Reinforcement Learning"]
draft: false
---

This is **Day 3** of the series. [Day 1](/blog/day-1-introduction-to-ai/) introduced AI, and [Day 2](/blog/day-2-understanding-ai/) showed how a model learns by turning its knobs with gradient descent. Today is all about **machine learning**, the part of AI behind almost every AI product you use:

1. [**What is machine learning?**](#05--what-is-machine-learning-understanding-ais-learning-process) What "learning" means for a computer, the words you need, and how to tell whether a model really learned.
2. [**Types of machine learning**](#06--types-of-machine-learning-supervised-unsupervised-and-reinforcement-learning) Supervised, unsupervised and reinforcement learning: how each one learns, where it's used, and how to choose.

There are five short Python examples. Each one runs as it is, and every output shown is real. Three of them need scikit-learn (`pip install scikit-learn`). You can skip all the code and still follow the whole day.

---

## 05 · What is machine learning? Understanding AI's learning process

**Machine learning (ML)** is the part of AI where a computer learns how to do a task from data, instead of following rules that a person wrote.

Two classic definitions are worth knowing:

| Who | Definition | In plain words |
|---|---|---|
| **Arthur Samuel**, who named the field in 1959 | His idea is usually summed up as "the ability to learn without being explicitly programmed" | Nobody writes the rules |
| **Tom Mitchell**, in his 1997 textbook | "A computer program is said to learn from experience E with respect to some class of tasks T and performance measure P, if its performance at tasks in T, as measured by P, improves with experience E." | It gets better at a job with practice |

Mitchell's definition is the useful one, because it gives you a checklist. To call something machine learning, you should be able to name three things:

* **T, the task:** what the program has to do.
* **E, the experience:** the data it learns from.
* **P, the performance measure:** the number that tells you it is getting better.

<figure class="fig" style="--cycle: 8s">
<div class="fig-art">
<svg viewBox="0 0 640 248" role="img" aria-labelledby="m1-t m1-d">
<title id="m1-t">Learning means getting better with experience</title>
<desc id="m1-d">Left: a curve of performance against the number of examples seen. It rises quickly at first, then more slowly, then levels off. Right: Tom Mitchell's three parts of learning, for a spam filter. The task is sorting email into spam or not, the experience is emails people have marked, and the performance is the share of emails sorted correctly.</desc>
<path class="s-line" d="M50 24V214H372"/>
<text class="t-mono" x="58" y="34">PERFORMANCE ↑</text>
<text class="t-mono t-end" x="372" y="236">EXPERIENCE: EXAMPLES SEEN →</text>
<path class="s-curve a-draw" pathLength="100" d="M56 204C100 130 150 98 230 82S330 66 366 64"/>
<path class="s-orbit" pathLength="100" d="M56 204C100 130 150 98 230 82S330 66 366 64"/>
<text class="t-small" x="120" y="192">fast gains early</text>
<text class="t-small" x="250" y="108">slower gains later</text>
<rect class="s-box a-glow" x="404" y="24" width="216" height="58"/>
<text class="t-mono" x="416" y="46">T · TASK</text>
<text x="416" y="68">Sort email: spam or not</text>
<rect class="s-box a-glow" x="404" y="90" width="216" height="58" style="--at: 1.2s"/>
<text class="t-mono" x="416" y="112">E · EXPERIENCE</text>
<text x="416" y="134">Emails people marked</text>
<rect class="s-key a-glow" x="404" y="156" width="216" height="58" style="--at: 2.4s"/>
<text class="t-mono" x="416" y="178">P · PERFORMANCE</text>
<text x="416" y="200">Share sorted correctly</text>
</svg>
</div>
<figcaption><b>Fig. 01</b> <span>Learning in Mitchell's terms: performance at a task improves with experience. The curve is an illustration of a typical shape: the first examples help most, and later ones add less.</span></figcaption>
</figure>

| System | T · Task | E · Experience | P · Performance |
|---|---|---|---|
| Spam filter | Mark each email spam or not | Emails people have marked as spam | Share of emails sorted correctly |
| Samuel's checkers program | Play checkers | Thousands of games, many against itself | Share of games won |
| House price model | Predict a sale price | Past sales with their prices | How far off the predictions are, on average |
| Voice typing | Turn speech into text | Hours of recordings with their transcripts | Share of words written correctly |
| Video recommendations | Suggest what to watch next | What people watched, skipped and finished | How often a suggestion gets watched |

A useful test: if you can't name T, E and P for a problem, it isn't ready for machine learning yet.

### The words you need

Today's running example is small enough to check by hand. We know how ten past students did in an exam, and want to predict how a new student will do:

| Hours studied | Hours slept | Result |
|---|---|---|
| 1 | 5 | fail |
| 2 | 8 | fail |
| 3 | 4 | fail |
| 2 | 3 | fail |
| 6 | 4 | fail |
| 4 | 7 | pass |
| 6 | 6 | pass |
| 7 | 8 | pass |
| 8 | 5 | pass |
| 5 | 6 | pass |

Every machine learning project uses the same handful of words:

| Word | Meaning | In the table above |
|---|---|---|
| **Example** (also *sample* or *row*) | One case to learn from | One student |
| **Feature** | A measured input | Hours studied, hours slept |
| **Label** | The right answer for an example | pass or fail |
| **Data set** | All the examples together | The ten students |
| **Model** | The learned rules that turn features into a prediction | "Studied more than 3.5 h and slept more than 4.5 h → pass", as we'll see |
| **Parameters** | Numbers the model learns from the data | The 3.5 and the 4.5 in that rule |
| **Hyperparameters** | Settings a person chooses before training | How many neighbours to ask, how deep a tree may grow, the learning rate |
| **Prediction** | The model's answer for a new example | A new student → pass |

Day 2's straight line also fits this picture: its features were hours studied, its label was the exam score, and `w` and `b` were its two parameters.

### What happens when a machine learns

[Day 2's Fig. 01](/blog/day-2-understanding-ai/#the-big-picture-how-an-ai-system-gets-built) showed the eight steps of building an AI system. Here we zoom in on the step called "train". In 2012 the researcher Pedro Domingos summed up every learning algorithm in one line: **learning = representation + evaluation + optimisation**.

| Part | The question it answers | Examples |
|---|---|---|
| **Representation** | What kind of rules can the model learn at all? | A straight line, a tree of yes/no questions, "copy the most similar examples", a neural network |
| **Evaluation** | How do we score a set of rules? | Accuracy, average error, the loss from Day 2 |
| **Optimisation** | How do we search for the best-scoring rules? | Gradient descent, trying every possible split, simply storing the examples |

Change any one of the three and you get a different learner. To see what that means, let's give the same ten students to two very different learners.

### Learner 1: ask the neighbours

**k-nearest neighbours (k-NN)** may be the simplest learner there is. Its "training" is just remembering every example. To predict, it finds the *k* past students most similar to the new one and lets them vote. Similar here means close together, if you plot hours studied against hours slept.

```python
from collections import Counter
from math import dist

# Past students: (hours studied, hours slept) and how they did
students = [
    ((1, 5), "fail"), ((2, 8), "fail"), ((3, 4), "fail"), ((2, 3), "fail"), ((6, 4), "fail"),
    ((4, 7), "pass"), ((6, 6), "pass"), ((7, 8), "pass"), ((8, 5), "pass"), ((5, 6), "pass"),
]

def predict(new, k=3):
    # "Learning" is just remembering the students. Predicting: find the k most similar ones and let them vote.
    nearest = sorted(students, key=lambda s: dist(s[0], new))[:k]
    votes = Counter(result for _, result in nearest)
    return votes.most_common(1)[0][0], nearest

answer, nearest = predict((5, 5))
for hours, result in nearest:
    print(f"{hours} -> {result}, distance {dist(hours, (5, 5)):.2f}")
print("Prediction for (5, 5):", answer)
```

```text
(5, 6) -> pass, distance 1.00
(6, 4) -> fail, distance 1.41
(6, 6) -> pass, distance 1.41
Prediction for (5, 5): pass
```

<figure class="fig" style="--cycle: 8s">
<div class="fig-art">
<svg viewBox="0 0 640 296" role="img" aria-labelledby="m2-t m2-d">
<title id="m2-t">k-nearest neighbours predicts by asking the closest examples</title>
<desc id="m2-d">Ten past students are plotted by hours studied and hours slept. Filled dots passed and rings failed. A new student who studied 5 hours and slept 5 hours is marked in the middle. A dashed circle takes in the three nearest students: two passed and one failed, so the prediction is pass.</desc>
<path class="s-line" d="M56 18V262H300"/>
<text class="t-mono" x="64" y="28">HOURS SLEPT ↑</text>
<text class="t-mono t-end" x="300" y="284">HOURS STUDIED →</text>
<circle class="s-mark" cx="82" cy="132" r="5"/>
<circle class="s-mark" cx="108" cy="54" r="5"/>
<circle class="s-mark" cx="134" cy="158" r="5"/>
<circle class="s-mark" cx="108" cy="184" r="5"/>
<circle class="s-mark" cx="212" cy="158" r="5"/>
<path class="s-pts" d="M160 80h0M212 106h0M238 54h0M264 132h0M186 106h0"/>
<circle class="s-line s-dash a-late" cx="186" cy="132" r="46"/>
<g class="a-late"><path class="s-err" d="M186 132V106M186 132L212 158M186 132L212 106"/></g>
<circle class="s-ping" cx="186" cy="132" r="6"/>
<circle class="s-test" cx="186" cy="132" r="6"/>
<circle class="s-point" cx="344" cy="32" r="5"/>
<text class="t-small" x="354" y="36">passed</text>
<circle class="s-mark" cx="420" cy="32" r="5"/>
<text class="t-small" x="430" y="36">failed</text>
<circle class="s-test" cx="494" cy="32" r="6"/>
<text class="t-small" x="506" y="36">new student</text>
<rect class="s-box a-glow" x="330" y="54" width="290" height="50" style="--at: 0.4s"/>
<text class="t-strong" x="344" y="75">1 · Measure the distance</text>
<text class="t-small" x="344" y="93">from the new student to all ten others</text>
<rect class="s-box a-glow" x="330" y="114" width="290" height="50" style="--at: 1.6s"/>
<text class="t-strong" x="344" y="135">2 · Keep the 3 nearest</text>
<text class="t-small" x="344" y="153">k = 3 is a setting a person picks</text>
<rect class="s-key a-glow" x="330" y="174" width="290" height="50" style="--at: 2.8s"/>
<text class="t-strong" x="344" y="195">3 · Let them vote</text>
<text class="t-small" x="344" y="213">2 passed, 1 failed</text>
<rect class="s-out a-glow" x="330" y="234" width="290" height="44" style="--at: 4s"/>
<text class="t-strong" x="344" y="261">Prediction: pass</text>
<text class="t-mono t-end" x="608" y="260">MAJORITY WINS</text>
</svg>
</div>
<figcaption><b>Fig. 02</b> <span>The new student (the orange ring) sits closest to two students who passed and one who failed, so k-NN predicts pass.</span></figcaption>
</figure>

**Tip: features need similar scales.** Both features here are in hours, so distances are fair. If one feature were weight in grams (around 150) and the other a score from 1 to 10, the grams would swamp the distance and the score would barely count. That's why data is usually *scaled* before k-NN, for example to the range 0 to 1.

### Learner 2: write the rules down

A **decision tree** learns a chain of yes/no questions. During training it tries every possible question, such as "studied more than 2.5 h?", "more than 3.5 h?" and so on for every feature, and keeps the one that best separates pass from fail. Then it repeats on each side until the groups are pure. scikit-learn can print the rules it found:

```python
from sklearn.tree import DecisionTreeClassifier, export_text

X = [[1, 5], [2, 8], [3, 4], [2, 3], [6, 4], [4, 7], [6, 6], [7, 8], [8, 5], [5, 6]]
y = ["fail", "fail", "fail", "fail", "fail", "pass", "pass", "pass", "pass", "pass"]

tree = DecisionTreeClassifier(random_state=0).fit(X, y)
print(export_text(tree, feature_names=["studied", "slept"]))
print(tree.predict([[5, 5], [2, 9]]))
```

```text
|--- studied <= 3.50
|   |--- class: fail
|--- studied >  3.50
|   |--- slept <= 4.50
|   |   |--- class: fail
|   |--- slept >  4.50
|   |   |--- class: pass

['pass' 'fail']
```

<figure class="fig" style="--cycle: 6s">
<div class="fig-art">
<svg viewBox="0 0 640 256" role="img" aria-labelledby="m3-t m3-d">
<title id="m3-t">The decision tree learned from the ten students</title>
<desc id="m3-d">The first question is: studied more than 3.5 hours? If no, the answer is fail. If yes, the next question is: slept more than 4.5 hours? If no, fail; if yes, pass. A dot follows the new student, who studied 5 hours and slept 5 hours, down the yes branches to pass.</desc>
<defs><marker id="m3-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="s-head" d="M0 0L10 5L0 10z"/></marker></defs>
<text class="t-mono" x="24" y="30">LEARNED RULES</text>
<rect class="s-box a-glow" x="220" y="20" width="200" height="48"/>
<text class="t-strong t-mid" x="320" y="49">Studied more than 3.5 h?</text>
<path class="s-line" d="M250 68C250 92 130 88 130 108" marker-end="url(#m3-h)"/>
<text class="t-mono t-end" x="182" y="82">NO</text>
<path class="s-line" d="M390 68C390 92 480 88 480 108" marker-end="url(#m3-h)"/>
<text class="t-mono" x="444" y="82">YES</text>
<rect class="s-box" x="60" y="110" width="140" height="44"/>
<text class="t-strong t-mid" x="130" y="137">Fail</text>
<rect class="s-box a-glow" x="380" y="110" width="200" height="48" style="--at: 1.2s"/>
<text class="t-strong t-mid" x="480" y="139">Slept more than 4.5 h?</text>
<path class="s-line" d="M440 158C440 178 385 176 385 194" marker-end="url(#m3-h)"/>
<text class="t-mono t-end" x="400" y="174">NO</text>
<path class="s-line" d="M520 158C520 178 545 176 545 194" marker-end="url(#m3-h)"/>
<text class="t-mono" x="540" y="174">YES</text>
<rect class="s-box" x="330" y="196" width="110" height="40"/>
<text class="t-strong t-mid" x="385" y="221">Fail</text>
<rect class="s-out a-glow" x="490" y="196" width="110" height="40" style="--at: 2.4s"/>
<text class="t-strong t-mid" x="545" y="221">Pass</text>
<path class="s-flow" pathLength="100" d="M390 68C390 92 480 88 480 108"/>
<path class="s-flow" pathLength="100" d="M520 158C520 178 545 176 545 194" style="--at: 1.3s"/>
<text class="t-mono" x="24" y="222">NEW STUDENT · STUDIED 5 H, SLEPT 5 H</text>
<text class="t-small" x="24" y="242">The dot shows their path to the answer.</text>
</svg>
</div>
<figcaption><b>Fig. 03</b> <span>Nobody wrote these rules. The tree chose both questions, and the numbers 3.5 and 4.5, from the ten students: they are its learned parameters.</span></figcaption>
</figure>

| | k-nearest neighbours | Decision tree |
|---|---|---|
| Representation | "Copy the closest examples" | A tree of yes/no questions |
| What training does | Stores the examples, nothing more | Searches for the best questions |
| Predicting | Slow on big data: compares with every example | Fast: a few questions |
| Can you see why? | Yes: you can list the neighbours that voted | Yes: the rules are written out |
| Prediction for 5 h study, 5 h sleep | pass | pass |

Two very different learners, the same data, the same answer. That's reassuring, but it isn't proof that either one learned anything real.

### Learning means generalising

Remembering ten students is easy. The real goal is **generalisation**: doing well on *new* examples the model has never seen. A model that only works on its training data has memorised, not learned. Day 2 called that [overfitting](/blog/day-2-understanding-ai/#step-5-test-it-on-data-it-has-never-seen), and it's why every model is scored on a **test set** held back from training.

Ten students is far too few to trust either model. With so little data, one unusual student can move a rule completely. Real projects use thousands to millions of examples.

### How do you know it learned?

The simplest score is **accuracy**: the share of predictions that were right. But accuracy can fool you.

Say 1,000 people take a test for a rare disease, and 10 of them have it. A lazy model that *always* says "healthy" is right 990 times out of 1,000: **99% accuracy**, while finding none of the sick people. To see what's really happening, count the four kinds of answer in a **confusion matrix**. Here is a better model:

| | Actually sick | Actually healthy |
|---|---|---|
| **Model says sick** | 8 (found) | 20 (false alarms) |
| **Model says healthy** | 2 (missed) | 970 (correctly cleared) |

| Measure | The question it answers | Calculation | Result |
|---|---|---|---|
| **Accuracy** | How many answers were right? | (8 + 970) ÷ 1,000 | 97.8% |
| **Precision** | When it says "sick", how often is it right? | 8 ÷ (8 + 20) | 29% |
| **Recall** | Of the people who are sick, how many did it find? | 8 ÷ (8 + 2) | 80% |

This model has *lower* accuracy than the lazy one, yet it's far more useful: it finds 8 of the 10 sick people. Which measure matters most depends on the cost of each mistake:

| Situation | The costly mistake | Focus on |
|---|---|---|
| Screening for a serious disease | Missing a sick person | **Recall**: find them all, and let a second test sort out the false alarms |
| Spam filter | Hiding an important real email | **Precision**: only flag what is surely spam |
| Predicting a number, like a price | Being far off | **Average error**: "on average, off by 3%" |

### What makes learning go wrong

A learning algorithm does exactly what the data teaches it. Most failures in real projects are data problems, not algorithm problems:

| Problem | What it means | Example | What helps |
|---|---|---|---|
| **Too little data** | Not enough examples to see the real pattern | Ten students, as above | Collect more; use a simpler model |
| **Wrong labels** | Some of the "right answers" are wrong | Tired people mislabel a few thousand photos | Check labels, have two people label hard cases |
| **Biased data** | The examples don't represent everyone the model will meet | A face model trained mostly on one skin tone works worse on others | Collect data from every group; test each group separately |
| **Data leakage** | Training data accidentally contains the answer | A disease model learns from a "treatment started" column that is only filled in after diagnosis | Use only information available at the moment of prediction |
| **Data drift** | The world changes after training | A shopping model trained before a festival season | Monitor the model and retrain on new data |
| **Unhelpful features** | The inputs don't relate to the answer | Predicting exam results from shoe size | Choose features with people who know the problem |

There is also good news in that table. In 2001 Michele Banko and Eric Brill showed that, on a language task, simple algorithms given far more data caught up with and overtook cleverer ones. Google researchers later called this "the unreasonable effectiveness of data". Better data usually beats a fancier algorithm.

### When to use machine learning, and when not to

| Machine learning is a good fit when… | Plain code is better when… |
|---|---|
| The pattern is too fuzzy to write as rules: faces, speech, spam | The rules are clear and fixed: tax, billing, sorting a list |
| The rules keep changing, and the data can keep up | There is little or no data |
| There are plenty of examples with good labels | Every single answer must be correct and fully explained |
| An occasional mistake is acceptable, or a person checks the result | A wrong answer is dangerous and nobody can check it |

Many real systems mix both: plain rules for what is certain, and a model for the fuzzy part.

---

## 06 · Types of machine learning: supervised, unsupervised and reinforcement learning

Day 1 introduced the three types in one table. Today we look at each one properly. What separates them is the **feedback** the learner gets:

* **Supervised learning** is told the right answer for every example.
* **Unsupervised learning** is told nothing, and has to find structure by itself.
* **Reinforcement learning** acts, and is only told how well it did, as a reward.

<figure class="fig" style="--cycle: 9s">
<div class="fig-art">
<svg viewBox="0 0 640 284" role="img" aria-labelledby="m4-t m4-d">
<title id="m4-t">The three types of machine learning</title>
<desc id="m4-d">Three panels. Supervised: two kinds of labelled points, filled dots and rings, and a line the model learns to draw between them. Unsupervised: plain points with no labels, which the model sorts into two groups, circled with dashed lines. Reinforcement: an agent takes an action in an environment and gets back the new state and a reward, in a loop.</desc>
<defs><marker id="m4-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="s-head" d="M0 0L10 5L0 10z"/></marker></defs>
<text class="t-sign t-mid" x="112" y="28">SUPERVISED</text>
<text class="t-sign t-mid" x="320" y="28">UNSUPERVISED</text>
<text class="t-sign t-mid" x="528" y="28">REINFORCEMENT</text>
<rect class="s-faint" x="16" y="40" width="192" height="200"/>
<rect class="s-faint" x="224" y="40" width="192" height="200"/>
<rect class="s-faint" x="432" y="40" width="192" height="200"/>
<path class="s-curve a-draw" pathLength="100" d="M40 60L200 230"/>
<path class="s-pts" d="M110 60h0M130 70h0M170 100h0M150 130h0M185 150h0"/>
<circle class="s-mark" cx="50" cy="140" r="5"/>
<circle class="s-mark" cx="70" cy="190" r="5"/>
<circle class="s-mark" cx="90" cy="150" r="5"/>
<circle class="s-mark" cx="100" cy="215" r="5"/>
<circle class="s-mark" cx="130" cy="225" r="5"/>
<circle class="s-mark" cx="262" cy="82" r="5"/>
<circle class="s-mark" cx="282" cy="96" r="5"/>
<circle class="s-mark" cx="268" cy="108" r="5"/>
<circle class="s-mark" cx="288" cy="76" r="5"/>
<circle class="s-mark" cx="254" cy="100" r="5"/>
<circle class="s-mark" cx="276" cy="86" r="5"/>
<circle class="s-mark" cx="362" cy="182" r="5"/>
<circle class="s-mark" cx="382" cy="196" r="5"/>
<circle class="s-mark" cx="368" cy="208" r="5"/>
<circle class="s-mark" cx="388" cy="176" r="5"/>
<circle class="s-mark" cx="354" cy="200" r="5"/>
<circle class="s-mark" cx="374" cy="186" r="5"/>
<g class="a-late">
<ellipse class="s-line s-dash" cx="271" cy="92" rx="30" ry="26"/>
<ellipse class="s-line s-dash" cx="371" cy="192" rx="30" ry="26"/>
<text class="t-small" x="306" y="74">group 1</text>
<text class="t-small t-end" x="336" y="186">group 2</text>
</g>
<rect class="s-key a-glow" x="470" y="60" width="116" height="40"/>
<text class="t-strong t-mid" x="528" y="85">Agent</text>
<rect class="s-box a-glow" x="470" y="180" width="116" height="40" style="--at: 1.8s"/>
<text class="t-strong t-mid" x="528" y="205">Environment</text>
<path class="s-line" d="M566 100V178" marker-end="url(#m4-h)"/>
<path class="s-line" d="M490 180V102" marker-end="url(#m4-h)"/>
<text class="t-small" x="572" y="144">action</text>
<text class="t-small t-end" x="484" y="136">state +</text>
<text class="t-small t-end" x="484" y="152">reward</text>
<path class="s-flow" pathLength="100" d="M566 100V178"/>
<path class="s-flow s-flow--back" pathLength="100" d="M490 180V102" style="--at: 1.8s"/>
<text class="t-small t-mid" x="112" y="262">learns from labelled examples</text>
<text class="t-small t-mid" x="320" y="262">finds groups by itself</text>
<text class="t-small t-mid" x="528" y="262">learns by trial and reward</text>
</svg>
</div>
<figcaption><b>Fig. 04</b> <span>Same idea, different feedback. Supervised learning gets the answers, unsupervised learning gets none, and reinforcement learning gets a score for what it does.</span></figcaption>
</figure>

### The three at a glance

| | Supervised | Unsupervised | Reinforcement |
|---|---|---|---|
| The data | Examples **with** labels | Examples **without** labels | No fixed data set: the agent makes its own experience by acting |
| The feedback | The right answer for every example | None | A reward, sometimes long after the action that earned it |
| The goal | Predict the label for new examples | Find structure: groups, patterns, oddities | Learn which action to take in each situation |
| Main tasks | Classification, regression | Clustering, dimensionality reduction, anomaly detection | Control, games, planning, robotics |
| Common algorithms | Linear and logistic regression, decision trees, random forests, neural networks | k-means, hierarchical clustering, PCA, isolation forest | Q-learning, policy gradients, deep Q-networks |
| Main difficulty | Labels are slow and expensive to get | No right answer to check against | Needs a huge number of tries, and rewards are hard to design |
| Like learning to… | do sums with an answer key | sort a box of photos nobody labelled | ride a bike |

### Supervised learning: learning with an answer key

In **supervised learning** every training example comes with its label, the right answer. The labels "supervise" the learner, like a teacher marking homework: every guess can be checked, so every mistake can be corrected. Both learners in part 05 were supervised, and so was Day 2's exam-score line.

Supervised learning comes in two kinds, depending on what you predict:

| | Classification | Regression |
|---|---|---|
| Predicts | A **category** | A **number** |
| The question | "Which one?" | "How much?" or "How many?" |
| Examples | Spam or not, which digit, which disease, will this customer leave | House price, tomorrow's temperature, delivery time |
| The answer looks like | "spam", often with a probability, such as 97% | 42,500 |
| In this series | Pass or fail (today) | Exam score from hours studied (Day 2) |

Here is a real classification task. scikit-learn comes with **1,797 small pictures of handwritten digits**, 8 × 8 pixels each, and each one labelled with the right digit. As in Day 2, each picture is just 64 numbers. We train k-NN on three quarters of them and test it on the quarter it has never seen:

```python
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

digits = load_digits()  # 1,797 handwritten digits, 8 x 8 pixels each, with the right answers
X_train, X_test, y_train, y_test = train_test_split(
    digits.data, digits.target, test_size=0.25, random_state=0
)

model = KNeighborsClassifier(n_neighbors=3).fit(X_train, y_train)

print(f"Learned from {len(X_train)} digits, tested on {len(X_test)} it never saw")
print(f"Accuracy: {model.score(X_test, y_test):.1%}")
print("Predicted:", model.predict(X_test[:12]))
print("Correct:  ", y_test[:12])
```

```text
Learned from 1347 digits, tested on 450 it never saw
Accuracy: 98.7%
Predicted: [2 8 2 6 6 7 1 9 8 5 2 8]
Correct:   [2 8 2 6 6 7 1 9 8 5 2 8]
```

The same "ask the neighbours" idea that judged our students reads handwriting correctly 98.7% of the time, and nobody wrote a single rule about loops or strokes. The digits here are much cleaner than real handwriting, so don't expect quite that score in the wild.

| Supervised learning is good at… | But… |
|---|---|
| Problems with a clear right answer | Labels cost time and money: a doctor may spend minutes on each scan |
| Measuring progress: you can always check against the labels | It copies any mistakes and bias in the labels |
| Usually giving the most accurate results, when labels are good | It only learns what you labelled, and won't find patterns you didn't ask about |

Where you meet it: spam filters, face unlock, reading cheques and number plates, translation, credit scoring, house prices, weather forecasts and medical image checks.

### Unsupervised learning: finding patterns with no answers

In **unsupervised learning** the data has no labels. Nobody says what the right answer is, because often nobody knows. The algorithm looks for structure by itself: which examples are similar, what is typical, and what is strange.

| Task | What it does | Example | Common methods |
|---|---|---|---|
| **Clustering** | Puts similar examples into groups | Customer groups for marketing, grouping news stories by topic | k-means, hierarchical clustering, DBSCAN |
| **Dimensionality reduction** | Squeezes many features into a few, keeping what matters most | Turning 100 survey answers into 2 scores you can plot | PCA, t-SNE, UMAP |
| **Anomaly detection** | Finds examples that don't fit the usual pattern | Unusual card payments, a machine starting to fail | Isolation forest, one-class SVM |
| **Association rules** | Finds things that tend to happen together | "People who buy pasta often buy pasta sauce" | Apriori |

The best-known clustering method is **k-means**. You choose how many groups you want (that's *k*), and it repeats two simple steps:

1. Put *k* centres somewhere, at random at first, and give each point to its **nearest centre**.
2. Move each centre to the **middle** of its points. Then go back to step 1, until nothing changes any more.

<figure class="fig" style="--cycle: 12s">
<div class="fig-art">
<svg viewBox="0 0 640 270" role="img" aria-labelledby="m5-t m5-d">
<title id="m5-t">k-means finds three groups of customers</title>
<desc id="m5-d">Shop customers are plotted by visits a month and items per visit. First they are plain points with no labels. Then three centres are dropped at random and each point joins its nearest centre, which gives messy groups. Finally the centres move to the middle of their points, and three clear groups appear: a big monthly shop, people in between, and people who pop in often for a few things.</desc>
<path class="s-line" d="M50 24V240H372"/>
<text class="t-mono" x="58" y="34">ITEMS PER VISIT ↑</text>
<text class="t-mono t-end" x="372" y="260">VISITS A MONTH →</text>
<g class="a-phase s-phase">
<circle class="s-mark" cx="74" cy="75" r="5"/>
<circle class="s-mark" cx="90" cy="105" r="5"/>
<circle class="s-mark" cx="106" cy="85" r="5"/>
<circle class="s-mark" cx="82" cy="120" r="5"/>
<circle class="s-mark" cx="98" cy="65" r="5"/>
<circle class="s-mark" cx="110" cy="110" r="5"/>
<circle class="s-mark" cx="70" cy="95" r="5"/>
<circle class="s-mark" cx="94" cy="87.5" r="5"/>
<circle class="s-mark" cx="150" cy="160" r="5"/>
<circle class="s-mark" cx="170" cy="180" r="5"/>
<circle class="s-mark" cx="190" cy="165" r="5"/>
<circle class="s-mark" cx="162" cy="190" r="5"/>
<circle class="s-mark" cx="182" cy="150" r="5"/>
<circle class="s-mark" cx="198" cy="182.5" r="5"/>
<circle class="s-mark" cx="146" cy="175" r="5"/>
<circle class="s-mark" cx="174" cy="167.5" r="5"/>
<circle class="s-mark" cx="270" cy="215" r="5"/>
<circle class="s-mark" cx="290" cy="225" r="5"/>
<circle class="s-mark" cx="310" cy="210" r="5"/>
<circle class="s-mark" cx="282" cy="230" r="5"/>
<circle class="s-mark" cx="306" cy="217.5" r="5"/>
<circle class="s-mark" cx="330" cy="222.5" r="5"/>
<circle class="s-mark" cx="262" cy="225" r="5"/>
<circle class="s-mark" cx="298" cy="205" r="5"/>
</g>
<g class="a-phase s-phase" style="--at: 4s">
<circle class="s-point" cx="74" cy="75" r="5"/>
<circle class="s-point" cx="90" cy="105" r="5"/>
<circle class="s-point" cx="106" cy="85" r="5"/>
<rect class="s-fill" x="77.5" y="115.5" width="9" height="9"/>
<circle class="s-point" cx="98" cy="65" r="5"/>
<circle class="s-point" cx="110" cy="110" r="5"/>
<circle class="s-point" cx="70" cy="95" r="5"/>
<circle class="s-point" cx="94" cy="87.5" r="5"/>
<rect class="s-fill" x="145.5" y="155.5" width="9" height="9"/>
<rect class="s-fill" x="165.5" y="175.5" width="9" height="9"/>
<path class="s-dot" d="M190 159L195.5 169H184.5Z"/>
<rect class="s-fill" x="157.5" y="185.5" width="9" height="9"/>
<rect class="s-fill" x="177.5" y="145.5" width="9" height="9"/>
<path class="s-dot" d="M198 176.5L203.5 186.5H192.5Z"/>
<rect class="s-fill" x="141.5" y="170.5" width="9" height="9"/>
<rect class="s-fill" x="169.5" y="163" width="9" height="9"/>
<path class="s-dot" d="M270 209L275.5 219H264.5Z"/>
<path class="s-dot" d="M290 219L295.5 229H284.5Z"/>
<path class="s-dot" d="M310 204L315.5 214H304.5Z"/>
<path class="s-dot" d="M282 224L287.5 234H276.5Z"/>
<path class="s-dot" d="M306 211.5L311.5 221.5H300.5Z"/>
<path class="s-dot" d="M330 216.5L335.5 226.5H324.5Z"/>
<path class="s-dot" d="M262 219L267.5 229H256.5Z"/>
<path class="s-dot" d="M298 199L303.5 209H292.5Z"/>
<circle class="s-test" cx="130" cy="70" r="9"/><path class="s-line" d="M124 70H136M130 64V76"/>
<circle class="s-test" cx="150" cy="130" r="9"/><path class="s-line" d="M144 130H156M150 124V136"/>
<circle class="s-test" cx="230" cy="160" r="9"/><path class="s-line" d="M224 160H236M230 154V166"/>
</g>
<g class="a-phase" style="--at: 8s">
<circle class="s-point" cx="74" cy="75" r="5"/>
<circle class="s-point" cx="90" cy="105" r="5"/>
<circle class="s-point" cx="106" cy="85" r="5"/>
<circle class="s-point" cx="82" cy="120" r="5"/>
<circle class="s-point" cx="98" cy="65" r="5"/>
<circle class="s-point" cx="110" cy="110" r="5"/>
<circle class="s-point" cx="70" cy="95" r="5"/>
<circle class="s-point" cx="94" cy="87.5" r="5"/>
<rect class="s-fill" x="145.5" y="155.5" width="9" height="9"/>
<rect class="s-fill" x="165.5" y="175.5" width="9" height="9"/>
<rect class="s-fill" x="185.5" y="160.5" width="9" height="9"/>
<rect class="s-fill" x="157.5" y="185.5" width="9" height="9"/>
<rect class="s-fill" x="177.5" y="145.5" width="9" height="9"/>
<rect class="s-fill" x="193.5" y="178" width="9" height="9"/>
<rect class="s-fill" x="141.5" y="170.5" width="9" height="9"/>
<rect class="s-fill" x="169.5" y="163" width="9" height="9"/>
<path class="s-dot" d="M270 209L275.5 219H264.5Z"/>
<path class="s-dot" d="M290 219L295.5 229H284.5Z"/>
<path class="s-dot" d="M310 204L315.5 214H304.5Z"/>
<path class="s-dot" d="M282 224L287.5 234H276.5Z"/>
<path class="s-dot" d="M306 211.5L311.5 221.5H300.5Z"/>
<path class="s-dot" d="M330 216.5L335.5 226.5H324.5Z"/>
<path class="s-dot" d="M262 219L267.5 229H256.5Z"/>
<path class="s-dot" d="M298 199L303.5 209H292.5Z"/>
<circle class="s-test" cx="90.5" cy="92.8" r="9"/><path class="s-line" d="M84.5 92.8H96.5M90.5 86.8V98.8"/>
<circle class="s-test" cx="171.5" cy="171.2" r="9"/><path class="s-line" d="M165.5 171.2H177.5M171.5 165.2V177.2"/>
<circle class="s-test" cx="293.5" cy="218.8" r="9"/><path class="s-line" d="M287.5 218.8H299.5M293.5 212.8V224.8"/>
<text class="t-small" x="118" y="72">big monthly shop</text>
<text class="t-small" x="206" y="150">in between</text>
<text class="t-small" x="258" y="196">pops in often</text>
</g>
<rect class="s-box a-glow" x="404" y="30" width="216" height="64"/>
<text class="t-mono" x="416" y="50">STEP 1</text>
<text class="t-strong" x="416" y="70">Customers, no labels</text>
<text class="t-small" x="416" y="87">nobody says who is who</text>
<rect class="s-box a-glow" x="404" y="104" width="216" height="64" style="--at: 4s"/>
<text class="t-mono" x="416" y="124">STEP 2</text>
<text class="t-strong" x="416" y="144">Drop 3 centres at random</text>
<text class="t-small" x="416" y="161">each point joins the nearest</text>
<rect class="s-key a-glow" x="404" y="178" width="216" height="64" style="--at: 8s"/>
<text class="t-mono" x="416" y="198">STEP 3</text>
<text class="t-strong" x="416" y="218">Move the centres</text>
<text class="t-small" x="416" y="235">to the middle, then repeat</text>
</svg>
</div>
<figcaption><b>Fig. 05</b> <span>k-means on 24 customers. The random first centres give messy groups; after moving the centres (+) to the middle twice, the groups settle and stop changing. With reduced motion you see the final result.</span></figcaption>
</figure>

Here it is in code, on 300 made-up customers. We hide three kinds of shopper in the data, but the algorithm is only given the numbers:

```python
import numpy as np
from sklearn.cluster import KMeans

rng = np.random.default_rng(7)
# 300 shop customers: [visits per month, items per visit]. Nobody has labelled them.
customers = np.vstack([
    rng.normal([2, 30], [1, 4], size=(100, 2)),    # (hidden) big monthly shop
    rng.normal([12, 4], [2, 1.5], size=(100, 2)),  # (hidden) pops in often for a few things
    rng.normal([6, 14], [1.5, 3], size=(100, 2)),  # (hidden) somewhere in between
])

kmeans = KMeans(n_clusters=3, n_init=10, random_state=0).fit(customers)

for k, centre in enumerate(kmeans.cluster_centers_):
    size = (kmeans.labels_ == k).sum()
    print(f"Group {k}: {size} customers, about {centre[0]:.0f} visits a month, {centre[1]:.0f} items a visit")
```

```text
Group 0: 100 customers, about 2 visits a month, 30 items a visit
Group 1: 99 customers, about 6 visits a month, 13 items a visit
Group 2: 101 customers, about 12 visits a month, 4 items a visit
```

It found all three kinds of shopper, and put 299 of the 300 customers in the right group. (One "in between" customer happened to look more like a frequent visitor.) Notice two things a person still had to do:

* **Choose k.** We told it to find 3 groups. Ask for 5 and it will happily find 5.
* **Name the groups.** The algorithm only says "group 0, 1, 2". Deciding that group 0 is "the big monthly shop", and what to do about it, is a human job.

| Unsupervised learning is good at… | But… |
|---|---|
| Using data nobody has labelled, which is most data | There is no right answer to check against, so it's hard to say how well it did |
| Finding patterns nobody thought to look for | The groups it finds may be real, or may be meaningless |
| Spotting new kinds of fraud or failure that no label covers | A person has to interpret every result |

### Reinforcement learning: learning by trial and error

**Reinforcement learning (RL)** is closest to how animals and people learn many skills. An **agent** acts in an **environment**. After each action it sees the new situation and gets a **reward**: a number that is high when things go well and low when they go badly. Nobody ever tells it the right move. Its goal is to collect as much reward as possible over time.

| Word | Meaning | In a video game |
|---|---|---|
| **Agent** | The learner that takes actions | The player controlled by the AI |
| **Environment** | The world the agent acts in | The game |
| **State** | What the situation is right now | The current screen |
| **Action** | A move the agent can make | Left, right, jump |
| **Reward** | A score for what just happened | +10 for a coin, −100 for losing a life |
| **Policy** | The agent's strategy: which action to take in each state | What it has learned so far |
| **Episode** | One full run, from start to finish | One game |

Here is a small but complete example. A robot stands at one end of a corridor of six cells, and its charger is at the other end. Every step costs −1 and reaching the charger earns +10. At first the robot knows nothing. It keeps a table of notes, one number per cell and move, saying how good it thinks that move is. This simple and famous method is called **Q-learning**:

```python
import random

random.seed(3)
CELLS = 6                     # a corridor: the robot starts in cell 0, the charger is in cell 5
MOVES = [-1, +1]              # step left, step right
Q = [[0.0, 0.0] for _ in range(CELLS)]  # the robot's notes: how good is each move in each cell?
alpha, gamma, epsilon = 0.5, 0.9, 0.2   # learning rate, how much the future counts, how often to explore

def best(cell):
    return max(range(2), key=lambda m: Q[cell][m])

for episode in range(1, 201):
    cell, steps = 0, 0
    while cell != CELLS - 1:
        move = random.randrange(2) if random.random() < epsilon else best(cell)  # explore or exploit
        nxt = min(max(cell + MOVES[move], 0), CELLS - 1)
        reward = 10 if nxt == CELLS - 1 else -1                # charger: +10, every other step: -1
        future = 0 if nxt == CELLS - 1 else max(Q[nxt])
        Q[cell][move] += alpha * (reward + gamma * future - Q[cell][move])  # learn from what happened
        cell, steps = nxt, steps + 1
    if episode in (1, 2, 10, 200):
        print(f"Episode {episode:>3}: reached the charger in {steps} steps")

print("Learned move in each cell:", " ".join("←→"[best(c)] for c in range(CELLS - 1)))
```

```text
Episode   1: reached the charger in 17 steps
Episode   2: reached the charger in 12 steps
Episode  10: reached the charger in 5 steps
Episode 200: reached the charger in 6 steps
Learned move in each cell: → → → → →
```

<figure class="fig" style="--cycle: 6s">
<div class="fig-art">
<svg viewBox="0 0 640 262" role="img" aria-labelledby="m6-t m6-d">
<title id="m6-t">Reinforcement learning in a corridor</title>
<desc id="m6-d">Left: the reinforcement learning loop. The agent sends an action to the environment, and the environment sends back the new state and a reward. Right: the corridor of six cells, from the start to the charger worth plus 10. After 200 episodes the robot has learned to step right in every cell. The learned value of stepping right grows towards the charger: 3.1, 4.6, 6.2, 8.0 and 10.0. Below, bars show the steps needed to reach the charger: 17 in episode 1, 12 in episode 2 and 5 in episode 10.</desc>
<defs><marker id="m6-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="s-head" d="M0 0L10 5L0 10z"/></marker></defs>
<rect class="s-key a-glow" x="100" y="30" width="140" height="46"/>
<text class="t-strong t-mid" x="170" y="52">Agent</text>
<text class="t-small t-mid" x="170" y="68">the robot</text>
<rect class="s-box a-glow" x="100" y="170" width="140" height="46" style="--at: 1.5s"/>
<text class="t-strong t-mid" x="170" y="192">Environment</text>
<text class="t-small t-mid" x="170" y="208">the corridor</text>
<path class="s-line" d="M240 53C280 53 280 193 242 193" marker-end="url(#m6-h)"/>
<path class="s-line" d="M100 193C60 193 60 53 98 53" marker-end="url(#m6-h)"/>
<text class="t-mono" x="278" y="128">ACTION</text>
<text class="t-mono t-end" x="62" y="116">STATE +</text>
<text class="t-mono t-end" x="62" y="130">REWARD</text>
<text class="t-mono t-mid" x="170" y="127">TRIAL AND ERROR</text>
<path class="s-flow" pathLength="100" d="M240 53C280 53 280 193 242 193"/>
<path class="s-flow s-flow--back" pathLength="100" d="M100 193C60 193 60 53 98 53" style="--at: 1.5s"/>
<text class="t-mono t-mid" x="170" y="246">ONE LOOP = ONE STEP</text>
<text class="t-mono" x="344" y="26">THE CORRIDOR · AFTER 200 EPISODES</text>
<text class="t-mono t-mid" x="367" y="52">START</text>
<text class="t-mono t-mid" x="597" y="52">CHARGER</text>
<rect class="s-box" x="344" y="60" width="46" height="46"/>
<rect class="s-box" x="390" y="60" width="46" height="46"/>
<rect class="s-box" x="436" y="60" width="46" height="46"/>
<rect class="s-box" x="482" y="60" width="46" height="46"/>
<rect class="s-box" x="528" y="60" width="46" height="46"/>
<rect class="s-out" x="574" y="60" width="46" height="46"/>
<text class="t-strong t-mid" y="89"><tspan x="367">→</tspan><tspan x="413">→</tspan><tspan x="459">→</tspan><tspan x="505">→</tspan><tspan x="551">→</tspan></text>
<text class="t-strong t-key t-mid" x="597" y="89">+10</text>
<path class="s-orbit" pathLength="100" d="M367 100H597"/>
<text class="t-small t-mid" y="124"><tspan x="367">3.1</tspan><tspan x="413">4.6</tspan><tspan x="459">6.2</tspan><tspan x="505">8.0</tspan><tspan x="551">10.0</tspan></text>
<text class="t-mono" x="344" y="142">↑ LEARNED VALUE OF STEPPING RIGHT</text>
<text class="t-mono" x="344" y="172">STEPS TO REACH THE CHARGER</text>
<text class="t-small" x="344" y="198">Episode 1</text>
<rect class="s-fill a-grow" x="430" y="188" width="170" height="12" style="--at: 0.2s"/>
<text class="t-small" x="606" y="198">17</text>
<text class="t-small" x="344" y="222">Episode 2</text>
<rect class="s-fill a-grow" x="430" y="212" width="120" height="12" style="--at: 0.4s"/>
<text class="t-small" x="556" y="222">12</text>
<text class="t-small" x="344" y="246">Episode 10</text>
<rect class="s-fill a-grow" x="430" y="236" width="50" height="12" style="--at: 0.6s"/>
<text class="t-small" x="486" y="246">5</text>
</svg>
</div>
<figcaption><b>Fig. 06</b> <span>Left: the loop every reinforcement learner runs. Right: what the robot learned. The value of stepping right grows as the charger gets closer, so "right" wins in every cell, and the trips get shorter. All numbers come from the code above.</span></figcaption>
</figure>

What the robot did:

* **Episode 1** took 17 steps. With no notes yet, it wandered back and forth.
* By **episode 10** it went straight to the charger in 5 steps, the shortest possible.
* In **episode 200** it took 6 steps. That isn't forgetting: 20% of the time (`epsilon = 0.2`) it still tries a random move on purpose.

The learning line says: *new note = old note + learning rate × (reward + the best value of the next cell − old note)*. The value of reaching the charger flows backwards, one cell at a time. That's why the notes read 10.0, 8.0, 6.2, 4.6 and 3.1 as you move away from it.

**Explore or exploit?** That random 20% is the central dilemma of reinforcement learning. Think of choosing where to eat. *Exploiting* means going back to your favourite restaurant, which you know is good. *Exploring* means trying a new one, which might be worse, or might become your new favourite. Explore too little and you never find the best option; explore too much and you waste time on bad ones. Every RL agent has to balance the two.

**Rewards often come late.** In chess the only real reward is winning or losing, maybe 40 moves later. Which of those moves deserves the credit? This is called the **credit assignment problem**, and it's a big reason RL needs so many tries.

Some famous results:

| Year | System | What it learned |
|---|---|---|
| 1992 | TD-Gammon, by Gerald Tesauro at IBM | Backgammon, close to the level of the best human players, by playing against itself |
| 2015 | DeepMind's DQN | 49 Atari video games from just the screen pixels and the score, many at human level |
| 2016 | AlphaGo | Beat Lee Sedol at Go. It learned first from human games (supervised), then improved by playing itself (RL) |
| 2017 | AlphaGo Zero and AlphaZero | Go, then chess and shogi, from self-play alone, without any human games |
| 2019 | OpenAI's robot hand | Solved a Rubik's Cube with one hand, after training in simulation |
| 2022 | ChatGPT | Was tuned with reinforcement learning from human feedback (see below) |

| Reinforcement learning is good at… | But… |
|---|---|
| Problems where you can judge results but can't give the right move | It needs a huge number of tries, often millions |
| Sequences of decisions, where each choice changes what comes next | Trial and error is risky in the real world, so robots and cars train in simulation first |
| Finding strategies people never thought of, like some of AlphaGo's moves | Rewards are hard to design. In 2016 OpenAI showed an agent in a boat-racing game that scored more points by circling to hit the same targets again and again than by finishing the race |

That last problem has a name: **reward hacking**. The agent does exactly what the reward pays for, not what you meant.

### Beyond the big three

The three types are the classic picture, but many modern systems sit between them:

| Type | Idea | Example |
|---|---|---|
| **Semi-supervised learning** | A few labelled examples plus many unlabelled ones | Name a person in a few photos, and a photo app finds them in the rest |
| **Self-supervised learning** | The data makes its own labels: hide part of it and learn to predict the hidden part | Language models predicting the next word; the text itself is the answer key |
| **Reinforcement learning from human feedback (RLHF)** | People compare answers, and their preferences become the reward | Tuning chatbots to be helpful and polite |

### How ChatGPT-style models combine them

A modern chatbot is a good example of the types working together:

| Stage | Type of learning | What happens |
|---|---|---|
| 1 · Pre-training | Self-supervised | The model reads a huge amount of text and learns to predict the next token, as in [Day 2](/blog/day-2-understanding-ai/#how-chatgpt-style-models-work) |
| 2 · Fine-tuning | Supervised | People write example questions with good answers, and the model learns to imitate them |
| 3 · Human feedback | Supervised, then reinforcement | People rank several answers. A second model learns to predict their rankings, and then the chatbot is tuned with RL to earn high scores from it |

### Which type should you use?

<figure class="fig" style="--cycle: 8s">
<div class="fig-art">
<svg viewBox="0 0 640 296" role="img" aria-labelledby="m7-t m7-d">
<title id="m7-t">Choosing a type of machine learning</title>
<desc id="m7-d">A decision chart. First question: do you have labelled examples, that is, examples with the right answers? If yes, ask whether the answer is a number: if yes, use regression; if no, use classification. Both are supervised learning. If you don't have labelled examples, ask whether the system learns by acting and getting rewards: if yes, use reinforcement learning; if no, use unsupervised learning to find clusters and patterns.</desc>
<defs><marker id="m7-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="s-head" d="M0 0L10 5L0 10z"/></marker></defs>
<rect class="s-box" x="200" y="16" width="240" height="54"/>
<text class="t-strong t-mid" x="320" y="40">Labelled examples?</text>
<text class="t-small t-mid" x="320" y="58">examples with the right answers</text>
<path class="s-line" d="M260 70C260 95 145 95 145 118" marker-end="url(#m7-h)"/>
<text class="t-mono t-end" x="190" y="86">YES</text>
<path class="s-line" d="M380 70C380 95 495 95 495 118" marker-end="url(#m7-h)"/>
<text class="t-mono" x="446" y="86">NO</text>
<rect class="s-box" x="30" y="120" width="230" height="54"/>
<text class="t-strong t-mid" x="145" y="144">Is the answer a number?</text>
<text class="t-small t-mid" x="145" y="162">a price, a temperature, a score</text>
<rect class="s-box" x="380" y="120" width="230" height="54"/>
<text class="t-strong t-mid" x="495" y="144">Learning by doing?</text>
<text class="t-small t-mid" x="495" y="162">acting and getting rewards</text>
<path class="s-line" d="M100 174C100 200 78 200 78 224" marker-end="url(#m7-h)"/>
<text class="t-mono t-end" x="82" y="202">YES</text>
<path class="s-line" d="M190 174C190 200 212 200 212 224" marker-end="url(#m7-h)"/>
<text class="t-mono" x="210" y="202">NO</text>
<path class="s-line" d="M450 174C450 200 428 200 428 224" marker-end="url(#m7-h)"/>
<text class="t-mono t-end" x="432" y="202">YES</text>
<path class="s-line" d="M540 174C540 200 562 200 562 224" marker-end="url(#m7-h)"/>
<text class="t-mono" x="557" y="202">NO</text>
<rect class="s-key a-glow" x="16" y="226" width="124" height="56"/>
<text class="t-strong t-mid" x="78" y="250">Regression</text>
<text class="t-mono t-mid" x="78" y="268">SUPERVISED</text>
<rect class="s-key a-glow" x="150" y="226" width="124" height="56" style="--at: 1.2s"/>
<text class="t-strong t-mid" x="212" y="250">Classification</text>
<text class="t-mono t-mid" x="212" y="268">SUPERVISED</text>
<rect class="s-out a-glow" x="366" y="226" width="124" height="56" style="--at: 2.4s"/>
<text class="t-strong t-mid" x="428" y="250">Reinforcement</text>
<text class="t-mono t-mid" x="428" y="268">TRIAL + REWARD</text>
<rect class="s-box a-glow" x="500" y="226" width="124" height="56" style="--at: 3.6s"/>
<text class="t-strong t-mid" x="562" y="250">Unsupervised</text>
<text class="t-mono t-mid" x="562" y="268">FIND PATTERNS</text>
</svg>
</div>
<figcaption><b>Fig. 07</b> <span>Two questions are usually enough to pick a type. Real projects often combine them, as the chatbot table above shows.</span></figcaption>
</figure>

| Problem | Type | Why |
|---|---|---|
| Predict a flat's rent from its size and area | Supervised: regression | You have past rents, the answers, and the answer is a number |
| Sort support emails into "billing", "technical" and "other" | Supervised: classification | Past emails can be labelled with their category |
| Find groups among your customers | Unsupervised: clustering | Nobody knows the groups in advance |
| Flag strange logins to a bank account | Unsupervised: anomaly detection | Attacks are rare and keep changing, so there are few labels to learn from |
| Teach a robot arm to pick up objects | Reinforcement | It can try, and success is easy to score, but nobody can label the right muscle movement |
| Decide which of two page designs to show more often | Reinforcement, in a simple form called a *bandit* | Each click is a reward, and it must balance exploring and exploiting |

### Common mix-ups

| Mix-up | Actually |
|---|---|
| "Unsupervised means no people are involved." | People still choose the data and the features, pick the number of groups, and decide what the groups mean. |
| "Reinforcement learning is supervised learning with rewards." | No answer key: the agent is never told the right action, only how well things went, often much later. |
| "A more complex algorithm is always better." | On small tables of data, simple models often do as well. Better data usually beats a fancier algorithm. |
| "99% accuracy means a great model." | Not if 99% of the cases are the same. Check precision and recall too. |
| "Machine learning finds the truth in data." | It finds patterns, including the mistakes and bias in the data. |

---

## Day 3 in one minute

* **Machine learning** means a program gets better at a **task (T)**, measured by a **performance score (P)**, with **experience (E)**.
* Data has **examples**, **features** and **labels**. A model learns **parameters**; people choose **hyperparameters**.
* Every learner is **representation + evaluation + optimisation**. k-NN remembers examples and asks the nearest ones; a decision tree writes its own yes/no rules.
* The goal is to **generalise** to new data. Check with a test set, and don't trust accuracy alone: look at **precision and recall**.
* **Supervised** learning learns from labelled examples: **classification** for categories, **regression** for numbers.
* **Unsupervised** learning finds structure with no labels: **clustering**, anomalies and patterns. People still interpret the results.
* **Reinforcement** learning learns by **trial and reward**, balancing **exploring** and **exploiting**.
* Modern systems such as chatbots **combine** all of these.

## Test yourself

Click a question to see the answer.

<details>
<summary>1. For a model that predicts tomorrow's temperature, name T, E and P.</summary>
<p>T: predict tomorrow's temperature. E: past weather records with the temperature that followed. P: how many degrees off the predictions are, on average.</p>
</details>
<details>
<summary>2. In the decision tree, are 3.5 and 4.5 parameters or hyperparameters?</summary>
<p>Parameters. The tree learned them from the data. A hyperparameter would be a setting a person chose before training, such as how deep the tree may grow, or k in k-NN.</p>
</details>
<details>
<summary>3. A fraud model is 99.5% accurate, but only 0.5% of payments are fraud. Is it good?</summary>
<p>You can't tell from accuracy. A model that never flags anything would also score 99.5%. Look at recall (how much of the fraud it catches) and precision (how many of its alarms are real).</p>
</details>
<details>
<summary>4. Predicting a house price: classification or regression? And sorting news stories into topics nobody defined?</summary>
<p>A house price is a number, so it's regression, which is supervised. Sorting stories into topics nobody defined is clustering, which is unsupervised.</p>
</details>
<details>
<summary>5. Why did the robot still take 6 steps in episode 200, when it knew the 5-step route?</summary>
<p>Because it still explores: 20% of the time it tries a random move on purpose, in case there is something better. That is the explore-or-exploit balance.</p>
</details>
<details>
<summary>6. What is reward hacking?</summary>
<p>When a reinforcement learning agent finds a way to earn a high reward without doing what its designers wanted, like the boat that circled to hit the same targets instead of finishing the race.</p>
</details>
