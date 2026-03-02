import { ResumeData } from "@/types/resume";

export const sampleResume: ResumeData = {
  header: {
    name: "Samyak Kumar",
    title: "Data Science Analyst | AI Product Management | Project Management | Consulting",
    email: "samyakkumar2000@gmail.com",
    phone: "+91 9870558842",
    linkedin: "linkedin.com/in/samyakkumar",
    location: "India",
  },
  summary:
    "Aspiring Product Manager with 2.5 years of experience in analytics, AI-driven solutions, and user-focused digital products. Improved operational efficiency by 90%+ through automation, strengthened decisioning accuracy by 20%, and contributed to product initiatives impacting 2,000+ users and improving conversions by 10–15%. Combines technical skills with business insight to turn data, user patterns, and cross-functional inputs into smarter product decisions.",
  experience: [
    {
      title: "Risk Analyst (Credit Fraud Risk)",
      company: "American Express",
      location: "Gurgaon, India",
      startDate: "01/2025",
      endDate: "Present",
      bullets: [
        "Automated monthly MIS reporting by optimizing SQL queries and integrating LUMI with a Power BI dashboard for SBS FRR, resulting in a 95% reduction in manual effort and real-time report TAT",
        "Evaluated 84K canceled SBS accounts ($352M) across Q4 '19–24, analyzing risk metrics and SPIN performance to identify the most effective cancellation strategy across customer age brackets",
        "Identified 6,300 additional H1'24 fee-only accounts for cancellation and analyzed accounts spend patterns, cancellation paths, write-off rates, and profiling metrics to improve portfolio risk decisions",
      ],
    },
    {
      title: "Product Manager",
      company: "Smart Station",
      location: "Remote",
      startDate: "06/2024",
      endDate: "09/2024",
      bullets: [
        "Revitalized outbound sales operations through the creation of the 'Smart Station' platform, enabling 2,000+ reps to trigger 1,000+ SMS campaigns monthly and shortening sales cycle by 15%",
        "Led a cross-functional team of 15+ to deliver five internal products, achieving 85% adoption across key business units and a 4.6/5 product feedback score",
        "Architected an AI-driven resume intelligence engine integrating OpenAI API, S3, & n8n automation; reduced HR screening effort by 30% and enhanced candidate evaluation precision by 35%",
      ],
    },
    {
      title: "Project Manager",
      company: "TaggLab",
      location: "Gurgaon, India",
      startDate: "04/2024",
      endDate: "06/2024",
      bullets: [
        "Transformed TaggLab into an AI innovation hub by setting up the AI Center of Excellence at Karnavati University, coordinating 50+ project tasks in 2 months",
        "Directed comprehensive budget-performance tracking, securing a 15% reduction in Human+ project costs by implementing rigorous risk-based spend planning",
      ],
    },
    {
      title: "CTO",
      company: "xKart",
      location: "Jaipur, India",
      startDate: "09/2021",
      endDate: "09/2022",
      bullets: [
        "Innovated and launched www.xkart.in from scratch, utilizing Node.js, HTML, CSS, JavaScript, PHP, and MySQL to create a robust & user-friendly mobile-first product",
        "Designed Figma prototypes, using user input to address the top 3 navigation pain points and improve user experience",
      ],
    },
  ],
  education: [
    {
      degree: "MBA – Business Analytics & Project Management",
      school: "Karnavati University",
      location: "Gandhinagar, India",
      startDate: "2022",
      endDate: "2024",
      gpa: "3.7/4.0",
    },
    {
      degree: "BCA – Computer Applications",
      school: "Manipal University",
      location: "Jaipur, India",
      startDate: "2018",
      endDate: "2021",
    },
  ],
  skills: [
    { category: "Technical", items: ["Python", "SQL", "Power BI", "Tableau", "Excel", "Jira", "Figma"] },
    { category: "Product", items: ["A/B Testing", "User Research", "PRDs", "Wireframing", "Agile/Scrum"] },
    { category: "Analytics", items: ["Data Modeling", "Statistical Analysis", "Risk Assessment", "KPI Tracking"] },
  ],
  projects: [
    {
      name: "AI Resume Intelligence Engine",
      description: "Built an AI-powered resume screening system",
      tech: "OpenAI API, S3, n8n",
      bullets: [
        "Reduced HR screening effort by 30% and enhanced candidate evaluation precision by 35%",
        "Integrated with existing ATS workflow for seamless adoption",
      ],
    },
    {
      name: "Smart Station Platform",
      description: "Sales automation platform for outbound operations",
      tech: "React, Node.js, PostgreSQL",
      bullets: [
        "Enabled 2,000+ reps to manage 1,000+ SMS campaigns monthly",
        "Shortened sales cycle by 15% through process automation",
      ],
    },
  ],
  certifications: [
    "Google Data Analytics Professional Certificate",
    "AWS Cloud Practitioner",
    "Scrum Master Certified (CSM)",
    "Tableau Desktop Specialist",
  ],
  leadership: [
    {
      role: "Vice President",
      org: "Analytics Club, Karnavati University",
      date: "2023–2024",
      bullets: [
        "Organized 10+ data-driven workshops with 200+ participants",
        "Mentored 15 junior members in analytics projects",
      ],
    },
  ],
};
