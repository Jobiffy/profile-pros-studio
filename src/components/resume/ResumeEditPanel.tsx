import { motion, AnimatePresence } from "framer-motion";
import { ResumeData } from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Briefcase, GraduationCap, Wrench, FolderOpen, Award, Users, FileText, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  data: ResumeData;
  onUpdateHeader: (key: keyof ResumeData["header"], value: string) => void;
  onUpdateSummary: (value: string) => void;
  onUpdateExperience: (index: number, field: string, value: any) => void;
  onUpdateEducation: (index: number, field: string, value: any) => void;
  onUpdateField: (field: string, value: any) => void;
}

const sectionVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" as const, transition: { duration: 0.3, ease: "easeOut" as const } },
};

function SectionToggle({ icon: Icon, label, children, defaultOpen = false }: { icon: any; label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
        <Icon size={16} className="text-primary shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial="hidden" animate="visible" exit="hidden" variants={sectionVariants} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="h-8 text-sm bg-background border-border/60 focus:border-primary" />
    </div>
  );
}

export function ResumeEditPanel({ data, onUpdateHeader, onUpdateSummary, onUpdateExperience, onUpdateEducation, onUpdateField }: Props) {
  return (
    <ScrollArea className="h-full">
      <div className="pb-8">
        <SectionToggle icon={User} label="Personal Info" defaultOpen>
          <FieldInput label="Full Name" value={data.header.name} onChange={v => onUpdateHeader("name", v)} />
          <FieldInput label="Title / Headline" value={data.header.title} onChange={v => onUpdateHeader("title", v)} />
          <div className="grid grid-cols-2 gap-2">
            <FieldInput label="Email" value={data.header.email} onChange={v => onUpdateHeader("email", v)} />
            <FieldInput label="Phone" value={data.header.phone} onChange={v => onUpdateHeader("phone", v)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FieldInput label="Location" value={data.header.location || ""} onChange={v => onUpdateHeader("location", v)} />
            <FieldInput label="LinkedIn" value={data.header.linkedin || ""} onChange={v => onUpdateHeader("linkedin", v)} />
          </div>
        </SectionToggle>

        <SectionToggle icon={FileText} label="Summary">
          <Textarea value={data.summary} onChange={e => onUpdateSummary(e.target.value)} rows={4} className="text-sm bg-background border-border/60 focus:border-primary resize-none" />
        </SectionToggle>

        <SectionToggle icon={Briefcase} label="Work Experience">
          {data.experience.map((exp, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2">
              <FieldInput label="Job Title" value={exp.title} onChange={v => onUpdateExperience(i, "title", v)} />
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="Company" value={exp.company} onChange={v => onUpdateExperience(i, "company", v)} />
                <FieldInput label="Location" value={exp.location} onChange={v => onUpdateExperience(i, "location", v)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="Start Date" value={exp.startDate} onChange={v => onUpdateExperience(i, "startDate", v)} />
                <FieldInput label="End Date" value={exp.endDate} onChange={v => onUpdateExperience(i, "endDate", v)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Bullet Points</Label>
                {exp.bullets.map((b, bi) => (
                  <div key={bi} className="flex gap-1">
                    <span className="text-primary mt-2 text-xs">•</span>
                    <Textarea value={b} onChange={e => {
                      const bullets = [...exp.bullets];
                      bullets[bi] = e.target.value;
                      onUpdateExperience(i, "bullets", bullets);
                    }} rows={2} className="text-xs bg-background border-border/60 resize-none flex-1" />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </SectionToggle>

        <SectionToggle icon={GraduationCap} label="Education">
          {data.education.map((edu, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2">
              <FieldInput label="Degree" value={edu.degree} onChange={v => onUpdateEducation(i, "degree", v)} />
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="School" value={edu.school} onChange={v => onUpdateEducation(i, "school", v)} />
                <FieldInput label="Location" value={edu.location} onChange={v => onUpdateEducation(i, "location", v)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FieldInput label="Start" value={edu.startDate} onChange={v => onUpdateEducation(i, "startDate", v)} />
                <FieldInput label="End" value={edu.endDate} onChange={v => onUpdateEducation(i, "endDate", v)} />
              </div>
              {edu.gpa !== undefined && <FieldInput label="GPA" value={edu.gpa || ""} onChange={v => onUpdateEducation(i, "gpa", v)} />}
            </motion.div>
          ))}
        </SectionToggle>

        <SectionToggle icon={Wrench} label="Skills">
          {data.skills.map((skill, i) => (
            <div key={i} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{skill.category}</Label>
              <Input value={skill.items.join(", ")} onChange={e => {
                const skills = [...data.skills];
                skills[i] = { ...skills[i], items: e.target.value.split(",").map(s => s.trim()) };
                onUpdateField("skills", skills);
              }} className="h-8 text-sm bg-background border-border/60" />
            </div>
          ))}
        </SectionToggle>

        {data.certifications && (
          <SectionToggle icon={Award} label="Certifications">
            {data.certifications.map((cert, i) => (
              <Input key={i} value={cert} onChange={e => {
                const certs = [...(data.certifications || [])];
                certs[i] = e.target.value;
                onUpdateField("certifications", certs);
              }} className="h-8 text-sm bg-background border-border/60" />
            ))}
          </SectionToggle>
        )}
      </div>
    </ScrollArea>
  );
}
