// Generic Template 5: Elegant Refined - Subtle borders, refined typography
import { ResumeData } from "@/types/resume";

export const ElegantRefined = ({ data }: { data: ResumeData }) => (
  <div className="font-crimson p-9 text-[11px]" style={{ color: '#2c2c2c' }}>
    <div className="text-center mb-6 pb-5" style={{ borderBottom: '1px solid #d4af37' }}>
      <h1 className="font-playfair text-2xl font-semibold tracking-wide">{data.header.name}</h1>
      <p className="text-[10px] mt-1.5 tracking-widest uppercase" style={{ color: '#d4af37' }}>{data.header.title}</p>
      <div className="flex justify-center gap-4 mt-2 text-[10px]" style={{ color: '#888' }}>
        <span>{data.header.email}</span>
        <span>✦</span>
        <span>{data.header.phone}</span>
        {data.header.linkedin && <><span>✦</span><span>{data.header.linkedin}</span></>}
      </div>
    </div>

    <p className="text-center italic mb-6 max-w-[90%] mx-auto leading-relaxed" style={{ color: '#555' }}>{data.summary}</p>

    <EH>Experience</EH>
    {data.experience.map((exp, i) => (
      <div key={i} className="mb-5">
        <div className="flex justify-between items-baseline">
          <h3 className="font-playfair font-semibold text-xs">{exp.title}</h3>
          <span className="text-[10px] italic" style={{ color: '#d4af37' }}>{exp.startDate} – {exp.endDate}</span>
        </div>
        <p className="text-[10px] italic mb-1.5" style={{ color: '#888' }}>{exp.company} · {exp.location}</p>
        <ul className="space-y-0.5">
          {exp.bullets.map((b, j) => (
            <li key={j} className="flex gap-2">
              <span style={{ color: '#d4af37' }}>—</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}

    <EH>Education</EH>
    {data.education.map((edu, i) => (
      <div key={i} className="mb-3 flex justify-between">
        <div>
          <span className="font-playfair font-semibold">{edu.degree}</span>
          <span className="italic"> · {edu.school}</span>
          {edu.gpa && <span className="text-[10px] ml-2" style={{ color: '#d4af37' }}>({edu.gpa})</span>}
        </div>
        <span className="text-[10px] italic" style={{ color: '#aaa' }}>{edu.endDate}</span>
      </div>
    ))}

    <EH>Skills & Expertise</EH>
    <div className="flex flex-wrap gap-2">
      {data.skills.flatMap(s => s.items).map((item, i) => (
        <span key={i} className="px-3 py-1 text-[10px]" style={{ border: '1px solid #d4af37', color: '#555' }}>{item}</span>
      ))}
    </div>

    {data.certifications && (
      <>
        <EH>Certifications</EH>
        <div className="flex flex-wrap gap-3">
          {data.certifications.map((c, i) => (
            <span key={i} className="text-[10px] italic" style={{ color: '#666' }}>✦ {c}</span>
          ))}
        </div>
      </>
    )}
  </div>
);

const EH = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-playfair text-sm font-semibold mb-3 mt-6 text-center tracking-wider">
    <span className="px-4 relative">
      <span className="absolute left-0 top-1/2 w-full h-px" style={{ background: '#e5e5e5' }} />
      <span className="relative px-3" style={{ background: '#fff' }}>{children}</span>
    </span>
  </h2>
);
