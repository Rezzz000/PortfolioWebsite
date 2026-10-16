# Reyski Azka — Portfolio

A minimalist, responsive personal portfolio built with plain HTML, CSS, and JavaScript. No frameworks, no build step.

**Live site:** [reyskiazka.netlify.app](https://reyskiazka.netlify.app)

---

## About

This is the personal portfolio of **Raden Reyski Azka Rakhmadya**, a Computer Science student at BINUS University specializing in Software Engineering. The site presents my projects, skills, education, and contact details in a clean, single-page layout.

## Features

- **Dark / light theme** with a toggle; the choice is saved in `localStorage` and applied before first paint to avoid a flash.
- **Scroll-squish hero:** the intro section shrinks from full-screen to a compact size as you scroll down.
- **Vertical dot navigation** that tracks the active section and supports click or drag to jump between sections.
- **Active section highlighting** in the top navigation bar.
- **One-click email copy** with a clipboard fallback for restricted browsers.
- **CV download** button in the header and in the contact section.
- **Fully responsive** layout using CSS custom properties for theming.

## Sections

| Section | Content |
| --- | --- |
| Intro | Greeting and quick links to projects and contact |
| About | Short background and current focus (full-stack web, mobile, cloud, ML) |
| Projects | Selected work with tech tags and GitHub links |
| Skills | Frontend, backend, databases, programming languages, tools and DevOps |
| Education | B.Sc. Computer Science (Software Engineering), BINUS University, 2024 – present |
| Contact | Email, LinkedIn, GitHub, CV |

## Featured Projects

- **Fake News Detection:** classifies news articles as real or fake using NLP and supervised learning (Python, HTML, Docker).
- **eNVision Web:** an accessible web platform built around usability principles for a Human-Computer Interaction course (HTML, CSS, JavaScript).
- **Wuthering Waves Rating Prediction:** predicts character ratings from in-game statistics with regression models (Python, Jupyter Notebook, scikit-learn, pandas).

More on [GitHub](https://github.com/Rezzz000?tab=repositories).

## Tech Stack

- **HTML5:** semantic markup
- **CSS3:** custom properties, grid/flexbox, theme variables
- **Vanilla JavaScript:** scroll logic, navigation, theme toggle, clipboard
- **Hosting:** [Netlify](https://www.netlify.com/)

## Project Structure

```
.
├── index.html     # Page markup and content
├── style.css      # Styles, dark/light theme variables, layout
├── script.js      # Scroll effects, dot navigation, theme toggle, copy email
└── assets/
    └── cv.docx    # CV file linked from the site (add your own)
```

## Getting Started

No dependencies or build tools are required.

```bash
# Clone the repository
git clone https://github.com/Rezzz000/<repo-name>.git
cd <repo-name>

# Option 1: open directly
open index.html

# Option 2: serve locally
npx serve .
# or
python -m http.server 8000
```

Then visit `http://localhost:8000` (or the port shown by your server).

## Customization

- **Content:** edit the text, projects, skills, and links in `index.html`.
- **Colors and fonts:** change the CSS variables at the top of `style.css` (`:root` for dark, the light theme block below it).
- **CV:** place your file at `assets/cv.docx`, or update the `href` in `index.html`.

## Deployment

The site is deployed on Netlify. To deploy your own copy:

1. Push the repository to GitHub.
2. In Netlify, choose **Add new site → Import an existing project** and select the repo.
3. Leave the build command empty and set the publish directory to `/` (the root).

## Contact

- Email: [reyskiazka@gmail.com](mailto:reyskiazka@gmail.com)
- LinkedIn: [Raden Reyski Azka Rakhmadya](https://www.linkedin.com/in/raden-reyski-azka-rakhmadya-a6a37a325/)
- GitHub: [@Rezzz000](https://github.com/Rezzz000)

I'm currently looking for an internship opportunity, so feel free to reach out.
