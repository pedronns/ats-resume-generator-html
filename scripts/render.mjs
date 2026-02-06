import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const templatePath = path.join(root, 'templates', 'ats.html')
const cssPath = path.join(root, 'templates', 'style.css')
const dataPath = path.join(root, 'data', 'resume.example.json')
const distDir = path.join(root, 'dist')

fs.mkdirSync(distDir, { recursive: true })

const tpl = fs.readFileSync(templatePath, 'utf8')
const css = fs.readFileSync(cssPath, 'utf8')
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function skillsHtml(skills) {
  return skills
    .map(
      (g) =>
        `<div class="item"><div class="item-title">${escapeHtml(g.group)}:</div> ${escapeHtml(
          g.items.join(', '),
        )}</div>`,
    )
    .join('\n')
}

function bulletsHtml(bullets, section) {
  return `<p class="${section}-bullets">${bullets
    .map((b) => `<li>${escapeHtml(b)}</li>`)
    .join('')}</p>`
}

function projectsHtml(projects) {
  return projects
    .map((p) => {
      const links = (p.links ?? [])
        .map(
          (l) =>
            `<li><strong>${escapeHtml(l.label)}</strong>: <a href="${l.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(
              l.url,
            )}</a></li>`,
        )
        .join('')
      return `
<div class="item">
  <div class="item-title">${escapeHtml(p.title)}</div>
  <strong class="tech-line">Stack: ${escapeHtml(p.stack)}</strong>
  ${bulletsHtml(p.bullets, 'projects')}
  ${links ? `<p class="project-bullets">${links}</p>` : ''}
</div>`
    })
    .join('\n')
}

function experienceHtml(exps) {
  return exps
    .map(
      (e) => `
<div class="item">
  <div class="item-header">
    <div>
      <div class="item-title">${escapeHtml(e.role)}</div>
      <div class="item-subtitle">${escapeHtml(e.company)}</div>
    </div>
    <div class="item-date">${escapeHtml(e.date)}</div>
  </div>
  ${bulletsHtml(e.bullets, 'experience')}
</div>`,
    )
    .join('\n')
}

function educationHtml(eds) {
  return eds
    .map(
      (e) => `
<div class="item">
  <div class="item-header">
    <div>
      <div class="item-title">${escapeHtml(e.title)}</div>
      <div class="item-subtitle">${escapeHtml(e.subtitle)}</div>
    </div>
    <div class="item-date">${escapeHtml(e.date)}</div>
  </div>
</div>`,
    )
    .join('\n')
}

function certificationsHtml(certs) {
  return certs
    .map(
      (c) => `
<div class="item">
  <div class="item-header">
    <div>
      <div class="item-title">${escapeHtml(c.title)}</div>
      <div class="item-subtitle">${escapeHtml(c.subtitle)}</div>
    </div>
    <div class="item-date">${escapeHtml(c.date)}</div>
  </div>
</div>`,
    )
    .join('\n')
}

function languagesHtml(langs) {
  return langs
    .map(
      (l) => `
<div class="item">
  <div class="item-header">
    <div class="item-title">${escapeHtml(l.name)} — ${escapeHtml(l.level)}</div>
    <div class="item-date">${escapeHtml(l.note)}</div>
  </div>
</div>`,
    )
    .join('\n')
}

const html = tpl
  .replace(
    `<link rel="stylesheet" href="./style.css" />`,
    `<style>${css}</style>`,
  )
  .replaceAll('{{NAME}}', escapeHtml(data.name))
  .replaceAll('{{TITLE}}', escapeHtml(data.title))
  .replaceAll('{{EMAIL}}', escapeHtml(data.email))
  .replaceAll('{{PHONE_E164}}', escapeHtml(data.phone_e164))
  .replaceAll('{{PHONE_DISPLAY}}', escapeHtml(data.phone_display))
  .replaceAll('{{LOCATION}}', escapeHtml(data.location))
  .replaceAll('{{LINKEDIN_URL}}', data.linkedin_url)
  .replaceAll('{{GITHUB_URL}}', data.github_url)
  .replaceAll('{{WEBSITE_URL}}', data.website_url)
  .replaceAll('{{LINKEDIN_TEXT}}', data.linkedin_url)
  .replaceAll('{{GITHUB_TEXT}}', data.github_url)
  .replaceAll('{{SUMMARY}}', escapeHtml(data.summary))
  .replaceAll('{{SKILLS_HTML}}', skillsHtml(data.skills))
  .replaceAll(
    '{{CERTIFICATIONS_HTML}}',
    certificationsHtml(data.certifications),
  )
  .replaceAll('{{PROJECTS_HTML}}', projectsHtml(data.projects))
  .replaceAll('{{EXPERIENCE_HTML}}', experienceHtml(data.experience))
  .replaceAll('{{EDUCATION_HTML}}', educationHtml(data.education))
  .replaceAll('{{LANGUAGES_HTML}}', languagesHtml(data.languages))

fs.writeFileSync(path.join(distDir, 'cv.html'), html, 'utf8')
console.log('Gerado: dist/cv.html')
