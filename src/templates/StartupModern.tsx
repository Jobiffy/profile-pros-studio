// Tech Template 2: Startup Modern - Modern, colorful with skill tags
import { ResumeData } from "@/types/resume";

export const StartupModern = ({ data }: { data: ResumeData }) => (
  <div className="font-space p-8 text-[11px]" style={{ color: '#222' }}>
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{data.header.name}</h1>
      <p className="text-xs mt-1" style={{ color: '#666' }}>{data.header.title}</p>
      <div className="flex gap-3 mt-2">
        {[data.header.email, data.header.phone, data.header.linkedin].filter(Boolean).map((c, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: 'var(--resume-accent-light, #eef4ff)', color: 'var(--resume-accent, #3b63f7)' }}>{c}</span>
        ))}
      </div>
    </div>

    <div className="rounded-lg p-4 mb-5" style={{ background: 'var(--resume-accent-light, #eef4ff)' }}>
      <p className="text-[10.5px] leading-relaxed">{data.summary}</p>
    </div>

    <SH>🚀 Experience</SH>
    {data.experience.map((exp, i) => (
      <div key={i} className="mb-4 p-3 rounded-lg" style={{ background: i === 0 ? 'var(--resume-accent-light, #fafbff)' : 'transparent' }}>
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs">{exp.title} <span className="font-normal" style={{ color: '#888' }}>@ {exp.company}</span></h3>
          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: '#f0f0f0' }}>{exp.startDate} → {exp.endDate}</span>
        </div>
        <ul className="mt-1.5 space-y-0.5">
          {exp.bullets.map((b, j) => <li key={j} className="pl-3" style={{ borderLeft: `2px solid var(--resume-accent, #3b63f7)` }}>{b}</li>)}
        </ul>
      </div>
    ))}

    <div className="grid grid-cols-2 gap-6 mt-4">
      <div>
        <SH>🎓 Education</SH>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <p className="font-bold text-[10.5px]">{edu.degree}</p>
            <p className="text-[10px]" style={{ color: '#888' }}>{edu.school} • {edu.endDate}{edu.gpa && ` • ${edu.gpa}`}</p>
          </div>
        ))}
      </div>
      <div>
        <SH>🏆 Certifications</SH>
        {data.certifications?.map((c, i) => (
          <p key={i} className="mb-0.5 text-[10px]">✅ {c}</p>
        ))}
      </div>
    </div>

    <SH>💡 Skills</SH>
    <div className="flex flex-wrap gap-1.5">
      {data.skills.flatMap(s => s.items).map((item, i) => (
        <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: `hsl(${(i * 40) % 360} 70% 95%)`, color: `hsl(${(i * 40) % 360} 60% 35%)` }}>{item}</span>
      ))}
    </div>

    {data.projects && (
      <>
        <SH>📦 Projects</SH>
        {data.projects.map((p, i) => (
          <div key={i} className="mb-2 p-2 rounded" style={{ background: '#f8f9fa' }}>
            <p className="font-bold text-[10.5px]">{p.name}{p.tech && <span className="font-normal" style={{ color: '#999' }}> · {p.tech}</span>}</p>
            {p.bullets.map((b, j) => <p key={j} className="text-[10px] pl-2">• {b}</p>)}
          </div>
        ))}
      </>
    )}

    {(data.customSections || []).map((sec, i) => (
      <div key={i}>
        <SH>📋 {sec.title}</SH>
        {sec.items.map((item, j) => (
          <div key={j} className="mb-2 p-2 rounded" style={{ background: '#f8f9fa' }}>
            {item.subtitle && <p className="font-bold text-[10.5px]">{item.subtitle}</p>}
            {item.description && <p className="text-[10px]">{item.description}</p>}
            {item.bullets?.map((b, k) => <p key={k} className="text-[10px] pl-2">• {b}</p>)}
          </div>
        ))}
      </div>
    ))}
  </div>
);

const SH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-bold mb-2 mt-4">{children}</h2>
);
