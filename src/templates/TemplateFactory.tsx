import React from "react";
import { ResumeData } from "@/types/resume";

export interface TemplateStyleConfig {
  layout: "single" | "sidebar" | "banner" | "minimal";
  fontBody: string;
  fontHeading: string;
  defaultAccent: string;
  headerAlign: "center" | "left";
  sectionStyle: "line" | "accent" | "bold" | "minimal" | "dot";
  bulletStyle: "disc" | "dash" | "arrow" | "square";
  sidebarSide?: "left" | "right";
  sidebarBg?: string;
  compact?: boolean;
}

const accent = (fallback: string) => `var(--resume-accent, ${fallback})`;
const accentLight = (fallback: string) => `var(--resume-accent-light, ${fallback}22)`;

// ── Section Title ──
function STitle({ title, style, color }: { title: string; style: string; color: string }) {
  if (style === "accent") return (
    <div className="mb-2 mt-4">
      <span className="text-xs font-bold uppercase tracking-[0.2em] px-2 py-0.5" style={{ background: accentLight(color), color: accent(color) }}>{title}</span>
    </div>
  );
  if (style === "bold") return (
    <h2 className="text-sm font-bold uppercase tracking-[0.15em] mb-2 mt-4 pb-1" style={{ borderBottom: `2px solid ${accent(color)}`, color: accent(color) }}>{title}</h2>
  );
  if (style === "dot") return (
    <div className="flex items-center gap-2 mb-2 mt-4">
      <div className="w-2 h-2 rounded-full" style={{ background: accent(color) }} />
      <h2 className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: accent(color) }}>{title}</h2>
      <div className="flex-1 h-px" style={{ background: accent(color), opacity: 0.2 }} />
    </div>
  );
  if (style === "minimal") return (
    <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500 mb-2 mt-4">{title}</h2>
  );
  // "line" default
  return (
    <h2 className="text-xs font-bold uppercase tracking-[0.12em] mb-2 mt-4 pb-1" style={{ borderBottom: `1px solid ${accent(color)}` }}>{title}</h2>
  );
}

// ── Bullet rendering ──
function Bullets({ items, style }: { items: string[]; style: string }) {
  const marker = style === "dash" ? "–" : style === "arrow" ? "›" : style === "square" ? "▪" : "•";
  return (
    <ul className="space-y-0.5 mt-1">
      {items.filter(Boolean).map((b, i) => (
        <li key={i} className="text-[10.5px] leading-[1.5] flex gap-1.5">
          <span className="shrink-0 mt-0.5">{marker}</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Common Sections ──
function ContactLine({ h }: { h: ResumeData["header"] }) {
  const items = [h.email, h.phone, h.location, h.linkedin, h.website].filter(Boolean);
  return <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[9.5px] text-gray-500">{items.map((x, i) => <span key={i}>{x}</span>)}</div>;
}

function ContactLineLeft({ h }: { h: ResumeData["header"] }) {
  const items = [h.email, h.phone, h.location, h.linkedin, h.website].filter(Boolean);
  return <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9.5px] text-gray-500">{items.map((x, i) => <span key={i}>{x}</span>)}</div>;
}

function ExpBlock({ exp, config }: { exp: ResumeData["experience"][0]; config: TemplateStyleConfig }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline">
        <div><span className="font-semibold text-[11px]">{exp.title}</span><span className="text-gray-500 text-[10.5px]"> | {exp.company}, {exp.location}</span></div>
        <span className="text-[9.5px] text-gray-400 shrink-0">{exp.startDate} – {exp.endDate}</span>
      </div>
      <Bullets items={exp.bullets} style={config.bulletStyle} />
    </div>
  );
}

function EduBlock({ edu }: { edu: ResumeData["education"][0] }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between items-baseline">
        <div><span className="font-semibold text-[11px]">{edu.degree}</span><span className="text-gray-500 text-[10.5px]"> – {edu.school}, {edu.location}</span>{edu.gpa && <span className="text-gray-400 text-[10px]"> (GPA: {edu.gpa})</span>}</div>
        <span className="text-[9.5px] text-gray-400 shrink-0">{edu.startDate} – {edu.endDate}</span>
      </div>
    </div>
  );
}

function SkillsBlock({ skills, layout }: { skills: ResumeData["skills"]; layout: "grid" | "list" | "inline" }) {
  if (layout === "inline") return (
    <div className="space-y-1">{skills.map((s, i) => <div key={i} className="text-[10.5px]"><span className="font-semibold">{s.category}: </span>{s.items.join(", ")}</div>)}</div>
  );
  if (layout === "list") return (
    <div className="space-y-2">{skills.map((s, i) => <div key={i}><p className="font-semibold text-[10px] uppercase tracking-wider mb-0.5">{s.category}</p><div className="flex flex-wrap gap-1">{s.items.map((item, j) => <span key={j} className="text-[9.5px] px-1.5 py-0.5 rounded bg-gray-100">{item}</span>)}</div></div>)}</div>
  );
  return (
    <div className="grid grid-cols-3 gap-2">{skills.map((s, i) => <div key={i} className="text-[10.5px]"><span className="font-semibold">{s.category}: </span>{s.items.join(", ")}</div>)}</div>
  );
}

function ProjectsBlock({ projects, config }: { projects: ResumeData["projects"]; config: TemplateStyleConfig }) {
  if (!projects?.length) return null;
  return <>{projects.map((p, i) => (
    <div key={i} className="mb-2">
      <div><span className="font-semibold text-[11px]">{p.name}</span>{p.tech && <span className="text-gray-400 text-[10px]"> ({p.tech})</span>}</div>
      <p className="text-[10.5px] text-gray-600">{p.description}</p>
      <Bullets items={p.bullets} style={config.bulletStyle} />
    </div>
  ))}</>;
}

function CertsBlock({ certs }: { certs?: string[] }) {
  if (!certs?.length) return null;
  return <ul className="space-y-0.5">{certs.map((c, i) => <li key={i} className="text-[10.5px]">• {c}</li>)}</ul>;
}

function LeadershipBlock({ items, config }: { items?: ResumeData["leadership"]; config: TemplateStyleConfig }) {
  if (!items?.length) return null;
  return <>{items.map((l, i) => (
    <div key={i} className="mb-2">
      <div className="flex justify-between"><span className="font-semibold text-[11px]">{l.role}, {l.org}</span><span className="text-[9.5px] text-gray-400">{l.date}</span></div>
      <Bullets items={l.bullets} style={config.bulletStyle} />
    </div>
  ))}</>;
}

function CustomSectionsBlock({ sections, config }: { sections?: ResumeData["customSections"]; config: TemplateStyleConfig }) {
  if (!sections?.length) return null;
  return <>{sections.map((sec, i) => (
    <div key={i}>
      <STitle title={sec.title} style={config.sectionStyle} color={config.defaultAccent} />
      {sec.items.map((item, j) => (
        <div key={j} className="mb-2">
          {item.subtitle && <p className="font-semibold text-[11px]">{item.subtitle}</p>}
          {item.description && <p className="text-[10.5px] text-gray-600">{item.description}</p>}
          {item.bullets && <Bullets items={item.bullets} style={config.bulletStyle} />}
        </div>
      ))}
    </div>
  ))}</>;
}

// ══════════════════════════════════════════
// LAYOUT 1: Single Column
// ══════════════════════════════════════════
function SingleColumnLayout({ data, config }: { data: ResumeData; config: TemplateStyleConfig }) {
  const c = config.defaultAccent;
  return (
    <div className="p-8 text-[11px] leading-relaxed" style={{ fontFamily: config.fontBody, color: "#1a1a1a" }}>
      <div className={config.headerAlign === "center" ? "text-center mb-4" : "mb-4"}>
        <h1 className="text-xl font-bold tracking-wide" style={{ fontFamily: config.fontHeading, color: accent(c) }}>{data.header.name}</h1>
        <p className="text-xs text-gray-500 mt-0.5">{data.header.title}</p>
        {config.headerAlign === "center" ? <ContactLine h={data.header} /> : <ContactLineLeft h={data.header} />}
      </div>
      {data.summary && <><STitle title="Summary" style={config.sectionStyle} color={c} /><p className="text-[10.5px] text-gray-700 leading-[1.6]">{data.summary}</p></>}
      <STitle title="Experience" style={config.sectionStyle} color={c} />
      {data.experience.map((exp, i) => <ExpBlock key={i} exp={exp} config={config} />)}
      <STitle title="Education" style={config.sectionStyle} color={c} />
      {data.education.map((edu, i) => <EduBlock key={i} edu={edu} />)}
      <STitle title="Skills" style={config.sectionStyle} color={c} />
      <SkillsBlock skills={data.skills} layout="grid" />
      {data.projects?.length! > 0 && <><STitle title="Projects" style={config.sectionStyle} color={c} /><ProjectsBlock projects={data.projects} config={config} /></>}
      {data.certifications?.length! > 0 && <><STitle title="Certifications" style={config.sectionStyle} color={c} /><CertsBlock certs={data.certifications} /></>}
      {data.leadership?.length! > 0 && <><STitle title="Leadership" style={config.sectionStyle} color={c} /><LeadershipBlock items={data.leadership} config={config} /></>}
      <CustomSectionsBlock sections={data.customSections} config={config} />
    </div>
  );
}

// ══════════════════════════════════════════
// LAYOUT 2: Sidebar (Left or Right)
// ══════════════════════════════════════════
function SidebarLayout({ data, config }: { data: ResumeData; config: TemplateStyleConfig }) {
  const c = config.defaultAccent;
  const isLeft = config.sidebarSide !== "right";
  const sidebarBg = config.sidebarBg || accent(c);

  const sidebar = (
    <div className="p-5 text-white min-h-full" style={{ background: sidebarBg, width: "35%" }}>
      <h1 className="text-lg font-bold mb-0.5" style={{ fontFamily: config.fontHeading }}>{data.header.name}</h1>
      <p className="text-[10px] opacity-80 mb-4">{data.header.title}</p>
      <div className="space-y-3">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Contact</p>
          {[data.header.email, data.header.phone, data.header.location, data.header.linkedin, data.header.website].filter(Boolean).map((x, i) => (
            <p key={i} className="text-[9.5px] opacity-90">{x}</p>
          ))}
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Skills</p>
          {data.skills.map((s, i) => (
            <div key={i} className="mb-2">
              <p className="text-[9px] font-semibold opacity-70">{s.category}</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {s.items.map((item, j) => <span key={j} className="text-[8.5px] px-1.5 py-0.5 rounded bg-white/15">{item}</span>)}
              </div>
            </div>
          ))}
        </div>
        {data.certifications?.length! > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Certifications</p>
            {data.certifications!.map((c, i) => <p key={i} className="text-[9.5px] opacity-90">• {c}</p>)}
          </div>
        )}
        {data.education.length > 0 && (
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Education</p>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-1.5">
                <p className="text-[9.5px] font-semibold opacity-90">{edu.degree}</p>
                <p className="text-[9px] opacity-70">{edu.school}</p>
                <p className="text-[8.5px] opacity-50">{edu.startDate} – {edu.endDate}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const main = (
    <div className="p-6 flex-1" style={{ fontFamily: config.fontBody }}>
      {data.summary && <><STitle title="Profile" style={config.sectionStyle} color={c} /><p className="text-[10.5px] text-gray-700 leading-[1.6]">{data.summary}</p></>}
      <STitle title="Experience" style={config.sectionStyle} color={c} />
      {data.experience.map((exp, i) => <ExpBlock key={i} exp={exp} config={config} />)}
      {data.projects?.length! > 0 && <><STitle title="Projects" style={config.sectionStyle} color={c} /><ProjectsBlock projects={data.projects} config={config} /></>}
      {data.leadership?.length! > 0 && <><STitle title="Leadership" style={config.sectionStyle} color={c} /><LeadershipBlock items={data.leadership} config={config} /></>}
      <CustomSectionsBlock sections={data.customSections} config={config} />
    </div>
  );

  return (
    <div className="flex min-h-[1123px]" style={{ fontFamily: config.fontBody, color: "#1a1a1a" }}>
      {isLeft ? <>{sidebar}{main}</> : <>{main}{sidebar}</>}
    </div>
  );
}

// ══════════════════════════════════════════
// LAYOUT 3: Banner Header
// ══════════════════════════════════════════
function BannerLayout({ data, config }: { data: ResumeData; config: TemplateStyleConfig }) {
  const c = config.defaultAccent;
  return (
    <div style={{ fontFamily: config.fontBody, color: "#1a1a1a" }}>
      <div className="px-8 py-6 text-white" style={{ background: `linear-gradient(135deg, ${accent(c)}, ${accent(c)}dd)` }}>
        <h1 className="text-2xl font-bold" style={{ fontFamily: config.fontHeading }}>{data.header.name}</h1>
        <p className="text-sm opacity-80 mt-0.5">{data.header.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-[9.5px] opacity-75">
          {[data.header.email, data.header.phone, data.header.location, data.header.linkedin].filter(Boolean).map((x, i) => <span key={i}>{x}</span>)}
        </div>
      </div>
      <div className="px-8 py-5 text-[11px] leading-relaxed">
        {data.summary && <><STitle title="Summary" style={config.sectionStyle} color={c} /><p className="text-[10.5px] text-gray-700 leading-[1.6]">{data.summary}</p></>}
        <STitle title="Experience" style={config.sectionStyle} color={c} />
        {data.experience.map((exp, i) => <ExpBlock key={i} exp={exp} config={config} />)}
        <STitle title="Education" style={config.sectionStyle} color={c} />
        {data.education.map((edu, i) => <EduBlock key={i} edu={edu} />)}
        <STitle title="Skills" style={config.sectionStyle} color={c} />
        <SkillsBlock skills={data.skills} layout="inline" />
        {data.projects?.length! > 0 && <><STitle title="Projects" style={config.sectionStyle} color={c} /><ProjectsBlock projects={data.projects} config={config} /></>}
        {data.certifications?.length! > 0 && <><STitle title="Certifications" style={config.sectionStyle} color={c} /><CertsBlock certs={data.certifications} /></>}
        {data.leadership?.length! > 0 && <><STitle title="Leadership" style={config.sectionStyle} color={c} /><LeadershipBlock items={data.leadership} config={config} /></>}
        <CustomSectionsBlock sections={data.customSections} config={config} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// LAYOUT 4: Minimal
// ══════════════════════════════════════════
function MinimalLayout({ data, config }: { data: ResumeData; config: TemplateStyleConfig }) {
  const c = config.defaultAccent;
  return (
    <div className="px-10 py-8 text-[11px] leading-relaxed" style={{ fontFamily: config.fontBody, color: "#2a2a2a" }}>
      <div className="mb-6">
        <h1 className="text-2xl font-light tracking-wide" style={{ fontFamily: config.fontHeading, color: accent(c) }}>{data.header.name}</h1>
        <p className="text-xs text-gray-400 mt-1 tracking-wider">{data.header.title}</p>
        <div className="flex gap-4 mt-2 text-[9px] text-gray-400 tracking-wide">
          {[data.header.email, data.header.phone, data.header.location, data.header.linkedin].filter(Boolean).map((x, i) => <span key={i}>{x}</span>)}
        </div>
        <div className="w-12 h-0.5 mt-4" style={{ background: accent(c) }} />
      </div>
      {data.summary && <><p className="text-[10.5px] text-gray-600 leading-[1.7] mb-4 italic">{data.summary}</p></>}
      <STitle title="Experience" style="minimal" color={c} />
      {data.experience.map((exp, i) => <ExpBlock key={i} exp={exp} config={config} />)}
      <STitle title="Education" style="minimal" color={c} />
      {data.education.map((edu, i) => <EduBlock key={i} edu={edu} />)}
      <STitle title="Skills" style="minimal" color={c} />
      <SkillsBlock skills={data.skills} layout="inline" />
      {data.projects?.length! > 0 && <><STitle title="Projects" style="minimal" color={c} /><ProjectsBlock projects={data.projects} config={config} /></>}
      {data.certifications?.length! > 0 && <><STitle title="Certifications" style="minimal" color={c} /><CertsBlock certs={data.certifications} /></>}
      {data.leadership?.length! > 0 && <><STitle title="Leadership" style="minimal" color={c} /><LeadershipBlock items={data.leadership} config={config} /></>}
      <CustomSectionsBlock sections={data.customSections} config={config} />
    </div>
  );
}

// ══════════════════════════════════════════
// Factory
// ══════════════════════════════════════════
// ── Highlight wrapper ──
function HighlightWrap({ sectionId, changedFields, showChanges, children }: {
  sectionId: string; changedFields?: Map<string, string>; showChanges?: boolean; children: React.ReactNode;
}) {
  const isChanged = showChanges && changedFields?.has(sectionId);
  if (!isChanged) return <>{children}</>;
  
  const changeType = changedFields?.get(sectionId) || "content";
  const colorMap: Record<string, { border: string; bg: string; badge: string; badgeText: string; label: string }> = {
    grammar: { border: "border-blue-400/60", bg: "bg-blue-400/5", badge: "bg-blue-400", badgeText: "text-blue-900", label: "GRAMMAR FIX" },
    content: { border: "border-amber-400/60", bg: "bg-amber-400/5", badge: "bg-amber-400", badgeText: "text-amber-900", label: "CONTENT UPDATED" },
    keyword: { border: "border-emerald-400/60", bg: "bg-emerald-400/5", badge: "bg-emerald-400", badgeText: "text-emerald-900", label: "KEYWORD OPTIMIZED" },
    formatting: { border: "border-violet-400/60", bg: "bg-violet-400/5", badge: "bg-violet-400", badgeText: "text-violet-900", label: "REFORMATTED" },
  };
  const colors = colorMap[changeType] || colorMap.content;
  
  return (
    <div className="relative">
      <div className={`absolute -inset-1 rounded-md border-2 ${colors.border} ${colors.bg} pointer-events-none`} />
      <div className={`absolute -top-2.5 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold ${colors.badge} ${colors.badgeText} pointer-events-none z-10`}>
        {colors.label}
      </div>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════
// Ordered section renderer
// ══════════════════════════════════════════
interface SectionOrder {
  id: string;
  visible: boolean;
}

function renderSections(
  data: ResumeData,
  config: TemplateStyleConfig,
  sectionOrder?: SectionOrder[],
  changedFields?: Map<string, string>,
  showChanges?: boolean,
  layoutVariant?: "single" | "sidebar-main" | "sidebar-side"
) {
  const c = config.defaultAccent;
  const order = sectionOrder || [
    { id: "summary", visible: true }, { id: "experience", visible: true },
    { id: "education", visible: true }, { id: "skills", visible: true },
    { id: "projects", visible: true }, { id: "certifications", visible: true },
    { id: "leadership", visible: true },
    ...(data.customSections || []).map((_, i) => ({ id: `custom_${i}`, visible: true })),
  ];

  // For sidebar layouts, some sections go in sidebar vs main
  const sidebarSections = new Set(["skills", "certifications", "education"]);
  const filterFn = layoutVariant === "sidebar-side"
    ? (s: SectionOrder) => sidebarSections.has(s.id)
    : layoutVariant === "sidebar-main"
    ? (s: SectionOrder) => !sidebarSections.has(s.id)
    : () => true;

  return order.filter(s => s.visible).filter(filterFn).map(s => {
    const key = s.id;
    if (key === "summary" && data.summary) return (
      <HighlightWrap key={key} sectionId="summary" changedFields={changedFields} showChanges={showChanges}>
        <STitle title="Summary" style={config.sectionStyle} color={c} />
        <p className="text-[10.5px] text-gray-700 leading-[1.6]">{data.summary}</p>
      </HighlightWrap>
    );
    if (key === "experience") return (
      <HighlightWrap key={key} sectionId="experience" changedFields={changedFields} showChanges={showChanges}>
        <STitle title="Experience" style={config.sectionStyle} color={c} />
        {data.experience.map((exp, i) => <ExpBlock key={i} exp={exp} config={config} />)}
      </HighlightWrap>
    );
    if (key === "education") return (
      <HighlightWrap key={key} sectionId="education" changedFields={changedFields} showChanges={showChanges}>
        <STitle title="Education" style={config.sectionStyle} color={c} />
        {data.education.map((edu, i) => <EduBlock key={i} edu={edu} />)}
      </HighlightWrap>
    );
    if (key === "skills") return (
      <HighlightWrap key={key} sectionId="skills" changedFields={changedFields} showChanges={showChanges}>
        <STitle title="Skills" style={config.sectionStyle} color={c} />
        <SkillsBlock skills={data.skills} layout={layoutVariant === "sidebar-side" ? "list" : "grid"} />
      </HighlightWrap>
    );
    if (key === "projects" && data.projects?.length) return (
      <HighlightWrap key={key} sectionId="projects" changedFields={changedFields} showChanges={showChanges}>
        <STitle title="Projects" style={config.sectionStyle} color={c} />
        <ProjectsBlock projects={data.projects} config={config} />
      </HighlightWrap>
    );
    if (key === "certifications" && data.certifications?.length) return (
      <HighlightWrap key={key} sectionId="certifications" changedFields={changedFields} showChanges={showChanges}>
        <STitle title="Certifications" style={config.sectionStyle} color={c} />
        <CertsBlock certs={data.certifications} />
      </HighlightWrap>
    );
    if (key === "leadership" && data.leadership?.length) return (
      <HighlightWrap key={key} sectionId="leadership" changedFields={changedFields} showChanges={showChanges}>
        <STitle title="Leadership" style={config.sectionStyle} color={c} />
        <LeadershipBlock items={data.leadership} config={config} />
      </HighlightWrap>
    );
    // Custom sections
    if (key.startsWith("custom_")) {
      const idx = parseInt(key.split("_")[1]);
      const sec = data.customSections?.[idx];
      if (!sec) return null;
      return (
        <HighlightWrap key={key} sectionId={key} changedFields={changedFields} showChanges={showChanges}>
          <STitle title={sec.title} style={config.sectionStyle} color={c} />
          {sec.items.map((item, j) => (
            <div key={j} className="mb-2">
              {item.subtitle && <p className="font-semibold text-[11px]">{item.subtitle}</p>}
              {item.description && <p className="text-[10.5px] text-gray-600">{item.description}</p>}
              {item.bullets && <Bullets items={item.bullets} style={config.bulletStyle} />}
            </div>
          ))}
        </HighlightWrap>
      );
    }
    return null;
  });
}

export interface TemplateExtraProps {
  sectionOrder?: SectionOrder[];
  changedFields?: Map<string, string>;
  showChanges?: boolean;
}

export function createTemplate(config: TemplateStyleConfig): React.FC<{ data: ResumeData } & TemplateExtraProps> {
  const Component: React.FC<{ data: ResumeData } & TemplateExtraProps> = ({ data, sectionOrder, changedFields, showChanges }) => {
    // Enhanced layouts that use sectionOrder + highlighting
    const c = config.defaultAccent;
    switch (config.layout) {
      case "sidebar": {
        const isLeft = config.sidebarSide !== "right";
        const sidebarBg = config.sidebarBg || accent(c);
        const sidebar = (
          <div className="p-5 text-white min-h-full" style={{ background: sidebarBg, width: "35%" }}>
            <h1 className="text-lg font-bold mb-0.5" style={{ fontFamily: config.fontHeading }}>{data.header.name}</h1>
            <p className="text-[10px] opacity-80 mb-4">{data.header.title}</p>
            <div className="space-y-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Contact</p>
                {[data.header.email, data.header.phone, data.header.location, data.header.linkedin, data.header.website].filter(Boolean).map((x, i) => (
                  <p key={i} className="text-[9.5px] opacity-90">{x}</p>
                ))}
              </div>
              {renderSections(data, config, sectionOrder, changedFields, showChanges, "sidebar-side")}
            </div>
          </div>
        );
        const main = (
          <div className="p-6 flex-1" style={{ fontFamily: config.fontBody }}>
            {renderSections(data, config, sectionOrder, changedFields, showChanges, "sidebar-main")}
          </div>
        );
        return (
          <div className="flex min-h-[1123px]" style={{ fontFamily: config.fontBody, color: "#1a1a1a" }}>
            {isLeft ? <>{sidebar}{main}</> : <>{main}{sidebar}</>}
          </div>
        );
      }
      case "banner":
        return (
          <div style={{ fontFamily: config.fontBody, color: "#1a1a1a" }}>
            <div className="px-8 py-6 text-white" style={{ background: `linear-gradient(135deg, ${accent(c)}, ${accent(c)}dd)` }}>
              <h1 className="text-2xl font-bold" style={{ fontFamily: config.fontHeading }}>{data.header.name}</h1>
              <p className="text-sm opacity-80 mt-0.5">{data.header.title}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-[9.5px] opacity-75">
                {[data.header.email, data.header.phone, data.header.location, data.header.linkedin].filter(Boolean).map((x, i) => <span key={i}>{x}</span>)}
              </div>
            </div>
            <div className="px-8 py-5 text-[11px] leading-relaxed">
              {renderSections(data, config, sectionOrder, changedFields, showChanges)}
            </div>
          </div>
        );
      case "minimal":
        return (
          <div className="px-10 py-8 text-[11px] leading-relaxed" style={{ fontFamily: config.fontBody, color: "#2a2a2a" }}>
            <div className="mb-6">
              <h1 className="text-2xl font-light tracking-wide" style={{ fontFamily: config.fontHeading, color: accent(c) }}>{data.header.name}</h1>
              <p className="text-xs text-gray-400 mt-1 tracking-wider">{data.header.title}</p>
              <div className="flex gap-4 mt-2 text-[9px] text-gray-400 tracking-wide">
                {[data.header.email, data.header.phone, data.header.location, data.header.linkedin].filter(Boolean).map((x, i) => <span key={i}>{x}</span>)}
              </div>
              <div className="w-12 h-0.5 mt-4" style={{ background: accent(c) }} />
            </div>
            {renderSections(data, config, sectionOrder, changedFields, showChanges)}
          </div>
        );
      default:
        return (
          <div className="p-8 text-[11px] leading-relaxed" style={{ fontFamily: config.fontBody, color: "#1a1a1a" }}>
            <div className={config.headerAlign === "center" ? "text-center mb-4" : "mb-4"}>
              <h1 className="text-xl font-bold tracking-wide" style={{ fontFamily: config.fontHeading, color: accent(c) }}>{data.header.name}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{data.header.title}</p>
              {config.headerAlign === "center" ? <ContactLine h={data.header} /> : <ContactLineLeft h={data.header} />}
            </div>
            {renderSections(data, config, sectionOrder, changedFields, showChanges)}
          </div>
        );
    }
  };
  Component.displayName = `Template`;
  return Component;
}
