# AESA - Notes For Myself (Plain English)

## 1. The Big Picture

AESA has two halves:
- **Backend** (built so far) - the "brain." Runs on your computer, holds the
  logic, talks to the database and the AI. Nobody sees it directly.
- **Frontend** (not built yet) - the "face." The website you click buttons on.
  It talks to the backend behind the scenes.

## 2. Terminal Basics

The terminal is just a text box for typing commands instead of clicking icons.

| Command | What it does |
|---|---|
| `cd foldername` | Move into a folder |
| `cd ..` | Move up one folder |
| `dir` | List what's in the current folder |
| `mkdir name` | Create a new folder |
| `python file.py` | Run a Python file |
| `pip install x` | Download and install a Python package |
| `git ...` | Talk to Git (explained below) |

## 3. Python & Virtual Environments (venv)

**Python** = the programming language the backend is written in.

**venv** = a private, isolated toolbox just for this one project. Without it,
every Python project on your computer would share the same tools, and
different projects needing different versions of the same tool would break
each other. `venv\` is a folder holding a clean, separate copy of Python
just for AESA.

- `python -m venv venv` = creates that private toolbox (a new folder called venv)
- `.\venv\Scripts\Activate.ps1` = "step into" that toolbox for this terminal
- You know it worked when you see `(venv)` at the start of your prompt

## 4. pip & requirements.txt

A **package** (or library) is code someone else already wrote, that you
install instead of writing yourself - e.g. `fastapi`, `crewai`.

**pip** is the tool that downloads packages. `pip install fastapi` = "go get
this package and put it in my venv toolbox."

**requirements.txt** is a shopping list - every package this project needs,
with the exact version that's known to work. Anyone (including future you,
or a buyer) can run `pip install -r requirements.txt` and get the exact
same setup, instead of guessing what to install.

## 5. Git & GitHub

**Git** = a save-point system for code. Instead of one "final_v2_REAL.zip",
Git lets you save named checkpoints you can always go back to.

| Command | Meaning |
|---|---|
| `git status` | "What's changed since my last checkpoint?" |
| `git add .` | "Get these changes ready to save" |
| `git commit -m "message"` | "Save a checkpoint, with a note about what changed" |
| `git push` | "Upload my checkpoints to GitHub" |

**GitHub** is just a website that stores a copy of your Git checkpoints online
- so your code isn't only on one laptop, and others (or a buyer) can access it.

**.gitignore** = a list of files Git should never save a checkpoint of.
We use it for secrets and huge auto-generated folders (`venv/`, `node_modules/`)
that don't need saving.

## 6. Secrets & .env

A **secret** = any password, key, or code that proves "this is really me" -
your database password, your Groq API key, etc.

**Why secrets never go directly in code:** code gets saved to Git, and Git
gets uploaded to GitHub, which can be public. A secret sitting in code is a
secret anyone can read.

**.env** = a single file, sitting only on your computer, holding all your
real secrets as `NAME=value` pairs. Code reads values *from* this file at
runtime instead of having them typed into it directly. `.gitignore` makes
sure `.env` itself is never saved to Git.

## 7. The Database (MongoDB Atlas)

A **database** = a filing cabinet for data (users, past analyses, etc.),
instead of everything disappearing when the app restarts.

**MongoDB** = the specific style of filing cabinet we're using.
**Atlas** = MongoDB's own hosting service - they run the actual server,
you just connect to it. No need to run a database on your own machine.

- **Database user** = a login *for the app*, separate from your own Atlas
  account login. If it ever leaked, someone could only touch the database,
  not your whole Atlas account.
- **Connection string** = one line combining "where's the cabinet" +
  "who's asking" + "prove it" (username + password) - this is what goes in `.env`.
- **IP Access List** = the cabinet's bouncer - only lets in requests from
  addresses you've approved (your current internet connection).

## 8. Security Core (auth.py)

- **Password hashing (bcrypt)**: your real password is never stored anywhere,
  not even by us. It goes through a one-way shredder (bcrypt) that turns it
  into scrambled text. Logging in re-shreds what you type and compares the
  scrambled versions - the original password is never kept or looked at again.
- **JWT (JSON Web Token)**: think of it like a wristband at a concert. Once
  you log in, you get a wristband (a token) proving you belong. You show
  the wristband on every request instead of re-typing your password every time.
  It expires on its own (15 minutes) so an old, leaked wristband stops working.
- **Login lockout**: if 5 wrong passwords get tried for the same account
  within 15 minutes, further attempts get blocked for a while. Slows down
  anyone trying to guess a password by brute force.

## 9. The AI Brain (CrewAI)

- **LLM (Large Language Model)**: the actual AI (we're using Groq, running
  Llama 3.3) that reads text and generates a response.
- **Agent**: a "character" you give the LLM - a role, a personality, and a
  goal, so its answers stay focused. We have two: Investigator (classifies
  the threat) and Admin (writes the fix commands).
- **Task**: one specific job for an Agent to do, with instructions and a
  description of what a good answer looks like.
- **Crew**: the two Agents + their Tasks, run together as a team.
- **output_pydantic**: forces the AI to answer in a strict fill-in-the-blank
  form (exact fields: threat_type, severity, etc.) instead of a free-form
  paragraph we'd have to guess-parse afterward. This is what fixed the bug
  from the original guide where both result panels showed identical text.

## 10. What We Actually Built, In Order

| File | Plain-English job |
|---|---|
| `.gitignore` | List of stuff Git should never save (secrets, junk folders) |
| `requirements.txt` | Shopping list of Python packages this project needs |
| `.env` | Your real secrets - lives only on your computer |
| `utils/db.py` | Connects to the MongoDB Atlas filing cabinet, sets it up |
| `utils/auth.py` | Password hashing, login wristbands (JWT), login lockout |
| `models/schemas.py` | Defines the exact shape of data flowing in/out of the API |
| `agents/investigator.py` | The AI "detective" - classifies the threat |
| `agents/admin.py` | The AI "engineer" - writes the fix commands |

## 11. Project Structure Right Now