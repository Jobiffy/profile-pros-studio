// Generic Template 2: Creative Color - Asymmetric layout with color accents
import { ResumeData } from "@/types/resume";

export const CreativeColor = ({ data }: { data: ResumeData }) => (
  <div className="flex text-[11px]" style={{ color: '#222' }}>
    {/* Left accent bar */}
    <div className="w-2 shrink-0" style={{ background: 'linear-gradient(180deg, #f97316, #ec4899, #8b5cf6)' }} />

    <div className="flex-1 p-7">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-space">{data.header.name}</h1>
        <p className="font-space text-xs mt-1" style={{ color: '#f97316' }}>{data.header.title}</p>
        <div className="flex gap-3 mt-2 text-[10px]" style={{ color: '#888' }}>
          <span>{data.header.email}</span><span>{data.header.phone}</span>
          {data.header.linkedin && <span>{data.header.linkedin}</span>}
        </div>
      </div>

      <p className="mb-5 text-[10.5px] leading-relaxed p-3 rounded-lg" style={{ background: '#fff7ed' }}>{data.summary}</p>

      <CH color="#f97316">Experience</CH>
      {data.experience.map((exp, i) => (
        <div key={i} className="mb-4 ml-3 pl-3" style={{ borderLeft: `2px solid hsl(${i * 30 + 20} 80% 60%)` }}>
          <div className="flex justify-between">
            <h3 className="font-bold text-xs font-space">{exp.title}</h3>
            <span className="text-[9px]" style={{ color: '#aaa' }}>{exp.startDate} – {exp.endDate}</span>
          </div>
          <p className="text-[10px] mb-1" style={{ color: '#888' }}>{exp.company}</p>
          <ul className="space-y-0.5">{exp.bullets.map((b, j) => <li key={j}>• {b}</li>)}</ul>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-6 mt-4">
        <div>
          <CH color="#ec4899">Education</CH>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <p className="font-bold text-[10.5px] font-space">{edu.degree}</p>
              <p className="text-[10px]" style={{ color: '#888' }}>{edu.school} · {edu.endDate}</p>
            </div>
          ))}
        </div>
        <div>
          <CH color="#8b5cf6">Skills</CH>
          <div className="flex flex-wrap gap-1">
            {data.skills.flatMap(s => s.items).map((item, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ background: `hsl(${(i * 25 + 20)} 80% 94%)`, color: `hsl(${(i * 25 + 20)} 60% 40%)` }}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {data.certifications && (
        <>
          <CH color="#f97316">Certifications</CH>
          <div className="flex flex-wrap gap-2">
            {data.certifications.map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded text-[10px]" style={{ background: '#fef3c7' }}>🏅 {c}</span>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
);

const CH = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <h2 className="text-xs font-bold font-space uppercase tracking-wider mb-2 mt-4" style={{ color }}>{children}</h2>
);
