import React, { useState, useMemo } from "react";
import {
  Building2, Settings, Shield, Server, Monitor, Wifi, HardDrive,
  Network, Clock, Users, Lock, Database, FileText,
  AlertTriangle, CheckCircle2, Package, Clipboard, Phone,
  Mail, MapPin, Calendar, User, Zap, Eye, Layers, Activity,
  Info, ArrowRight, ArrowLeft, Printer, Download, Target,
  MessageSquare, TrendingUp, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    hospitalName: "",
    hospitalType: "",
    contactPerson: "",
    designation: "",
    mobileNumber: "",
    email: "",
    branches: "",
    location: "",
    assessmentDate: new Date().toISOString().split("T")[0],
    assessedBy: "",
    computers: "",
    servers: "",

    managedSwitches: "",
    internetRedundancy: "",
    wifiQuality: "",
    downtime: "",
    networkUsers: "",
    networkObservations: "",

    firewall: "",
    firewallBrand: "",
    backupSystem: "",
    backupType: "",
    serverMonitoring: "",
    endpointSecurity: "",
    passwordPolicy: "",
    dataSecurity: "",
    securityObservations: "",

    cctvIntegrated: "",
    cablingQuality: "",
    rackManagement: "",
    ups: "",
    nas: "",
    itSupport: "",
    infrastructureObservations: "",

    itChallenges: "",
    futureGoals: "",
  });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const { riskScore, riskGrade, riskColor, actions, breakdown } = useMemo(() => {
    let score = 0;
    const rules = {
      firewall: { "No": 20, "Don't Know": 12, "Yes": 0 },
      backupSystem: { "No": 18, "Partial": 8, "Yes": 0 },
      internetRedundancy: { "Single ISP": 10, "No clarity": 15, "Dual ISP": 0 },
      downtime: { "Frequently": 20, "Weekly": 12, "Monthly": 6, "Rare": 0 },
      serverMonitoring: { "No": 10, "Don't Know": 6, "Yes": 0 },
      endpointSecurity: { "No": 10, "Partial": 5, "Yes": 0 },
      passwordPolicy: { "Not managed": 8, "Partially managed": 4, "Properly managed": 0 },
      dataSecurity: { "Weak": 8, "Average": 4, "Strong": 0 },
      wifiQuality: { "Poor": 5, "Average": 2, "Good": 0 },
      cablingQuality: { "Poor": 5, "Average": 2, "Good": 0 },
      rackManagement: { "Poor": 4, "Average": 2, "Proper": 0 },
      ups: { "Not available": 8, "Partial": 4, "Available": 0 },
      itSupport: { "No proper support": 10, "Vendor on call": 4, "In-house": 0 },
    };

    let breakdownScores = { network: 0, backup: 0, infrastructure: 0, support: 0, data: 0 };

    const addScore = (field: keyof typeof rules, category: keyof typeof breakdownScores) => {
      const val = formData[field] as string;
      if (val && rules[field][val as keyof typeof rules[typeof field]] !== undefined) {
        const s = rules[field][val as keyof typeof rules[typeof field]];
        score += s;
        breakdownScores[category] += s;
      }
    };

    addScore("firewall", "network");
    addScore("internetRedundancy", "network");
    addScore("downtime", "network");
    addScore("backupSystem", "backup");
    addScore("serverMonitoring", "support");
    addScore("itSupport", "support");
    addScore("endpointSecurity", "data");
    addScore("passwordPolicy", "data");
    addScore("dataSecurity", "data");
    addScore("wifiQuality", "infrastructure");
    addScore("cablingQuality", "infrastructure");
    addScore("rackManagement", "infrastructure");
    addScore("ups", "infrastructure");

    let normalizedScore = Math.min(100, score);
    if (score > 100) normalizedScore = Math.round((score / 141) * 100);

    let grade = "Stable Infrastructure";
    let color = "#22C55E";
    if (normalizedScore > 25) { grade = "Needs Optimization"; color = "#F59E0B"; }
    if (normalizedScore > 50) { grade = "Operational Risk Areas"; color = "#F97316"; }
    if (normalizedScore > 75) { grade = "Critical Infrastructure Gaps"; color = "#DC2626"; }

    const generatedActions: { title: string; priority: string; desc: string }[] = [];
    if (formData.firewall === "No") generatedActions.push({ title: "Deploy Enterprise Firewall", priority: "CRITICAL", desc: "Immediate need to protect network perimeter from external threats." });
    if (formData.backupSystem === "No") generatedActions.push({ title: "Implement Central Backup System", priority: "CRITICAL", desc: "Deploy reliable backup to prevent complete data loss." });
    if (formData.internetRedundancy === "Single ISP" || formData.internetRedundancy === "No clarity") generatedActions.push({ title: "Configure Dual ISP Redundancy", priority: "HIGH", desc: "Ensure continuous connectivity for critical hospital operations." });
    if (formData.downtime === "Frequently") generatedActions.push({ title: "Implement Network Monitoring & Alerting", priority: "HIGH", desc: "Proactive monitoring required to address frequent outages." });
    if (formData.serverMonitoring === "No") generatedActions.push({ title: "Deploy Server & Network Monitoring", priority: "HIGH", desc: "Gain visibility into server health and performance." });
    if (formData.endpointSecurity === "No") generatedActions.push({ title: "Deploy Endpoint Protection Suite", priority: "HIGH", desc: "Protect all computers from malware and ransomware." });
    if (formData.dataSecurity === "Weak") generatedActions.push({ title: "Conduct Security Awareness Training", priority: "MEDIUM", desc: "Train staff on best practices for data privacy and security." });
    if (formData.cablingQuality === "Poor") generatedActions.push({ title: "Audit & Restructure Network Cabling", priority: "MEDIUM", desc: "Fix unstructured cabling to reduce physical network faults." });
    if (formData.ups === "Not available") generatedActions.push({ title: "Install UPS & Power Backup Systems", priority: "HIGH", desc: "Protect critical IT hardware from power fluctuations." });
    if (formData.itSupport === "No proper support") generatedActions.push({ title: "Engage Managed IT Support (MSP)", priority: "CRITICAL", desc: "Partner with an MSP for reliable technical support." });
    if (formData.wifiQuality === "Poor") generatedActions.push({ title: "Redesign Wi-Fi Coverage & Access Points", priority: "MEDIUM", desc: "Improve wireless connectivity for staff and medical devices." });
    if (formData.rackManagement === "Poor") generatedActions.push({ title: "Organize Racks & Patch Panel Documentation", priority: "LOW", desc: "Clean up server racks for better maintenance and cooling." });

    return {
      riskScore: normalizedScore,
      riskGrade: grade,
      riskColor: color,
      actions: generatedActions.slice(0, 10),
      breakdown: breakdownScores,
    };
  }, [formData]);

  const recommendedPackage = useMemo(() => {
    if (riskScore <= 25) return "Monitoring Package";
    if (riskScore <= 50) return "Support Package";
    return "Security Package";
  }, [riskScore]);

  const getObservations = () => {
    const obs: string[] = [];
    if (formData.firewall === "No") obs.push("Network perimeter protection is not currently in place — a firewall would significantly reduce external threat exposure.");
    if (formData.backupSystem === "No") obs.push("Centralized backup system is not currently configured — this creates risk of data loss in the event of hardware failure.");
    if (formData.serverMonitoring === "No") obs.push("Server and network monitoring could improve operational visibility and enable proactive incident response.");
    if (formData.internetRedundancy === "Single ISP") obs.push("Internet redundancy would strengthen infrastructure reliability and reduce the impact of ISP outages.");
    if (formData.internetRedundancy === "No clarity") obs.push("Internet connectivity setup is unclear — documenting ISP configuration would improve planning and redundancy strategy.");
    if (formData.endpointSecurity === "No") obs.push("Endpoint protection across workstations would reduce the risk of malware and ransomware incidents.");
    if (formData.passwordPolicy === "Not managed") obs.push("A structured user access and password policy would reduce the risk of unauthorized access.");
    if (formData.dataSecurity === "Weak") obs.push("Improving data security awareness among staff would reduce human-error related incidents.");
    if (formData.ups === "Not available") obs.push("UPS and power backup systems are not in place — critical IT equipment is vulnerable to power disruptions.");
    if (formData.itSupport === "No proper support") obs.push("A structured IT support model would ensure timely incident response and reduce unplanned downtime.");
    if (formData.wifiQuality === "Poor") obs.push("Wi-Fi coverage quality is limited — improved wireless infrastructure would support staff productivity and medical device connectivity.");
    if (formData.cablingQuality === "Poor") obs.push("Network cabling could benefit from structured organization to reduce physical faults and improve maintainability.");
    if (formData.downtime === "Frequently" || formData.downtime === "Weekly") obs.push("Frequent network downtime suggests the need for proactive monitoring and redundant connectivity solutions.");
    return obs;
  };

  const TOTAL_STEPS = 7;

  const steps = [
    { num: 1, title: "Hospital Info" },
    { num: 2, title: "Network" },
    { num: 3, title: "Security" },
    { num: 4, title: "Infrastructure" },
    { num: 5, title: "IT Challenges" },
    { num: 6, title: "Future Goals" },
    { num: 7, title: "Results" },
  ];

  const startAssessment = () => { setStarted(true); setCurrentStep(1); window.scrollTo(0, 0); };
  const nextStep = () => { if (currentStep < TOTAL_STEPS) setCurrentStep(p => p + 1); window.scrollTo(0, 0); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(p => p - 1); window.scrollTo(0, 0); };
  const startNew = () => { setStarted(false); setCurrentStep(0); window.scrollTo(0, 0); };

  const RadioGroup = ({ label, icon: Icon, options, value, onChange }: { label: string; icon: React.ElementType; options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-3">
      <Label className="flex items-center text-sm font-semibold text-gray-700">
        <Icon className="w-4 h-4 mr-2 text-primary" /> {label}
      </Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((opt) => (
          <div
            key={opt}
            onClick={() => onChange(opt)}
            className={`cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 text-center select-none
              ${value === opt
                ? "border-primary bg-orange-50 text-primary shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/50"}`}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );

  const SectionNav = ({ onBack, onNext, nextLabel, isFirst = false }: { onBack?: () => void; onNext: () => void; nextLabel: string; isFirst?: boolean }) => (
    <div className="mt-10 flex items-center justify-between pt-6 border-t border-gray-100">
      {!isFirst ? (
        <Button onClick={onBack} variant="ghost" size="lg" className="h-12 px-6 rounded-xl font-semibold">
          <ArrowLeft className="mr-2 w-5 h-5" /> Back
        </Button>
      ) : <div />}
      <Button onClick={onNext} size="lg" className="h-12 px-8 rounded-xl font-bold hover:shadow-lg transition-all group shadow-primary/10">
        {nextLabel} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );

  const CardShell = ({ icon: Icon, stepNum, title, desc, children }: { icon: React.ElementType; stepNum: number; title: string; desc: string; children: React.ReactNode }) => (
    <div className="animate-in slide-in-from-right-8 fade-in duration-300">
      <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
        <CardHeader className="border-b border-gray-100 pb-6 px-8 pt-7">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3.5 rounded-xl text-primary shrink-0"><Icon className="w-6 h-6" /></div>
            <div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
                Step {stepNum} of {TOTAL_STEPS}
              </span>
              <CardTitle className="text-xl text-gray-900 font-black mt-1">{title}</CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-0.5">{desc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">{children}</CardContent>
      </Card>
    </div>
  );

  const observations = getObservations();

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20 flex flex-col">

      {/* HEADER */}
      <header className="w-full bg-[#111111] relative overflow-hidden print:bg-white shrink-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `repeating-linear-gradient(45deg, #F97316 0px, #F97316 1px, transparent 1px, transparent 12px)` }} />
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-primary/8 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-0">
          <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-primary to-transparent mb-0 absolute top-0 left-0 right-0 opacity-60" />
          <div className="flex items-center justify-between gap-6 py-5">
            <div className="flex items-center gap-5 shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md" />
                <div className="relative border border-white/10 rounded-2xl overflow-hidden w-[52px] h-[52px] flex items-center justify-center">
                  <img src="/zenyx-icon.png" alt="ZENYX" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
              </div>
              <div className="hidden md:block">
                <img src="/zenyx-logo-nobg.png" alt="ZENYX IT Infra Solutions" className="h-8 object-contain" style={{ filter: "brightness(0) invert(1)" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; const fb = e.currentTarget.nextElementSibling as HTMLElement; if (fb) fb.style.display = "block"; }} />
                <p className="hidden text-white font-black text-2xl tracking-widest">ZENYX</p>
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase mt-1" style={{ color: "#F97316", opacity: 0.8 }}>IT Infra Solutions</p>
              </div>
              <span className="md:hidden text-white font-black text-2xl tracking-widest">ZENYX</span>
            </div>
            <div className="flex-1 flex flex-col items-center text-center px-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="hidden sm:block h-px w-12 bg-gradient-to-r from-transparent to-primary/40" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/60">Enterprise IT Assessment Platform</span>
                <div className="hidden sm:block h-px w-12 bg-gradient-to-l from-transparent to-primary/40" />
              </div>
              <h1 className="text-xl md:text-2xl lg:text-[1.65rem] font-black text-white tracking-tight leading-tight">ZENYX Care IT Check</h1>
              <p className="text-gray-500 text-[11px] mt-1.5 tracking-wide hidden sm:block uppercase">Healthcare Infrastructure Reliability & Technology Assessment</p>
            </div>
            <div className="hidden lg:flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-xl px-4 py-2.5">
                <div className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: "0 0 6px #F97316", animation: "pulse 2s infinite" }} />
                <span className="text-primary text-[11px] font-black tracking-[0.15em] uppercase">Live Scoring</span>
              </div>
              <p className="text-gray-600 text-[10px] tracking-wide text-right">Real-time risk computation</p>
            </div>
          </div>
        </div>
        <div className="h-[3px] w-full bg-gradient-to-r from-primary/40 via-primary to-orange-300/60" />
      </header>

      {/* STEP PROGRESS INDICATOR */}
      {started && currentStep >= 1 && currentStep <= TOTAL_STEPS && (
        <div className="bg-white border-b print:hidden shadow-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Step {currentStep} of {TOTAL_STEPS} — {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
              </span>
              <span className="text-xs text-primary font-bold">{steps[currentStep - 1]?.title}</span>
            </div>
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-200" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }} />
              {steps.map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                  <div key={step.num} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                      ${isActive ? "bg-primary text-white shadow-md shadow-primary/30" : isCompleted ? "bg-gray-300 text-gray-600" : "bg-white border-2 border-gray-200 text-gray-400"}`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                    </div>
                    <span className={`text-[9px] font-semibold hidden md:block uppercase tracking-wider
                      ${isActive ? "text-primary" : isCompleted ? "text-gray-500" : "text-gray-400"}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 w-full">

        {/* WELCOME SCREEN */}
        {!started && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col lg:flex-row bg-white max-w-4xl mx-auto">
              <div className="lg:w-2/5 bg-[#111111] p-10 flex flex-col justify-between text-white relative">
                <div className="absolute top-0 right-0 w-64 h-full opacity-10 bg-gradient-to-l from-primary to-transparent" />
                <div className="relative z-10 flex flex-col h-full">
                  <img src="/zenyx-icon.png" alt="ZENYX" className="w-16 h-16 mb-6 rounded-xl border border-white/10 shadow-lg shadow-primary/20"
                    onError={(e) => (e.currentTarget.style.display = "none")} />
                  <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight">ZENYX Care<br /><span className="text-primary">IT Check</span></h2>
                  <p className="text-sm font-medium text-gray-300 uppercase tracking-widest leading-relaxed mb-4">
                    Healthcare Infrastructure Reliability & Technology Assessment
                  </p>
                  <p className="text-gray-400 text-sm mb-6">A professional IT assessment tool for healthcare facilities</p>
                  <div className="mt-auto border-t border-white/10 pt-6">
                    <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Powered by</p>
                    <p className="text-sm font-bold text-white mt-1">ZENYX IT Infra Solutions</p>
                  </div>
                </div>
              </div>
              <div className="lg:w-3/5 p-10 flex flex-col justify-center bg-white">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ensure continuous healthcare operations</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  Hospitals rely heavily on technology for patient records, diagnostics, billing systems, and communication. ZENYX Care IT Check helps healthcare organizations evaluate their IT infrastructure readiness, reliability, and operational continuity.
                </p>
                <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-semibold text-sm mb-8 self-start border border-orange-100">
                  <Clock className="w-4 h-4" /> Estimated time: 3–5 minutes
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: Settings, label: "22 Assessment\nPoints" },
                    { icon: Activity, label: "Live Risk\nScoring" },
                    { icon: Clipboard, label: "Action\nRecommendations" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-gray-50">
                      <div className="bg-primary/10 p-3 rounded-full text-primary"><Icon className="w-5 h-5" /></div>
                      <span className="text-[10px] font-bold text-gray-700 uppercase leading-tight whitespace-pre-line">{label}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={startAssessment} size="lg" className="w-full sm:w-auto self-start text-base h-14 px-8 rounded-xl font-bold hover:shadow-lg transition-all group">
                  Start Assessment <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-gray-400 font-medium mt-3">No registration required · Free assessment</p>
              </div>
            </Card>
          </div>
        )}

        {/* STEP 1 — Hospital Information */}
        {started && currentStep === 1 && (
          <CardShell icon={Building2} stepNum={1} title="Hospital Information" desc="Tell us about the healthcare facility being assessed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><Building2 className="w-4 h-4 mr-2 text-primary" /> Hospital Name</Label>
                <Input value={formData.hospitalName} onChange={e => updateForm("hospitalName", e.target.value)} placeholder="e.g. City General Hospital" className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
              <div className="space-y-2.5 col-span-1 md:col-span-2 lg:col-span-1">
                <Label className="flex items-center text-gray-700 font-semibold"><Layers className="w-4 h-4 mr-2 text-primary" /> Hospital Type</Label>
                <select value={formData.hospitalType} onChange={e => updateForm("hospitalType", e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-input bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm">
                  <option value="">Select hospital type...</option>
                  <option value="Single clinic">Single Clinic</option>
                  <option value="Multi-specialty hospital">Multi-Specialty Hospital</option>
                  <option value="Hospital chain">Hospital Chain</option>
                </select>
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><Network className="w-4 h-4 mr-2 text-primary" /> Number of Branches</Label>
                <Input type="number" value={formData.branches} onChange={e => updateForm("branches", e.target.value)} placeholder="e.g. 3" className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><MapPin className="w-4 h-4 mr-2 text-primary" /> Location</Label>
                <Input value={formData.location} onChange={e => updateForm("location", e.target.value)} placeholder="City, State" className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><User className="w-4 h-4 mr-2 text-primary" /> Contact Person</Label>
                <Input value={formData.contactPerson} onChange={e => updateForm("contactPerson", e.target.value)} placeholder="Name of IT Head/Admin" className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><Layers className="w-4 h-4 mr-2 text-primary" /> Designation</Label>
                <Input value={formData.designation} onChange={e => updateForm("designation", e.target.value)} placeholder="e.g. IT Manager" className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><Phone className="w-4 h-4 mr-2 text-primary" /> Mobile Number</Label>
                <Input type="tel" value={formData.mobileNumber} onChange={e => updateForm("mobileNumber", e.target.value)} placeholder="+91 98765 43210" className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><Mail className="w-4 h-4 mr-2 text-primary" /> Email Address</Label>
                <Input type="email" value={formData.email} onChange={e => updateForm("email", e.target.value)} placeholder="admin@hospital.com" className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><Monitor className="w-4 h-4 mr-2 text-primary" /> Number of Computers</Label>
                <Input type="number" value={formData.computers} onChange={e => updateForm("computers", e.target.value)} placeholder="Total endpoints" className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><Server className="w-4 h-4 mr-2 text-primary" /> Number of Servers</Label>
                <Input type="number" value={formData.servers} onChange={e => updateForm("servers", e.target.value)} placeholder="Physical/virtual" className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><Calendar className="w-4 h-4 mr-2 text-primary" /> Assessment Date</Label>
                <Input type="date" value={formData.assessmentDate} onChange={e => updateForm("assessmentDate", e.target.value)} className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
              <div className="space-y-2.5">
                <Label className="flex items-center text-gray-700 font-semibold"><User className="w-4 h-4 mr-2 text-primary" /> Assessed By</Label>
                <Input value={formData.assessedBy} onChange={e => updateForm("assessedBy", e.target.value)} placeholder="ZENYX Consultant Name" className="bg-gray-50 focus-visible:ring-primary h-11" />
              </div>
            </div>
            <SectionNav onNext={nextStep} nextLabel="Next: Network & Connectivity" isFirst />
          </CardShell>
        )}

        {/* STEP 2 — Network & Connectivity */}
        {started && currentStep === 2 && (
          <CardShell icon={Network} stepNum={2} title="Network & Connectivity" desc="Evaluate your network infrastructure, connectivity, and coverage">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-8">
                <RadioGroup label="Managed Switches Available?" icon={Network} options={["Yes", "No", "Partial"]} value={formData.managedSwitches} onChange={v => updateForm("managedSwitches", v)} />
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Internet Redundancy" icon={Wifi} options={["Single ISP", "Dual ISP", "No clarity"]} value={formData.internetRedundancy} onChange={v => updateForm("internetRedundancy", v)} />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Wi-Fi Coverage Quality" icon={Wifi} options={["Good", "Average", "Poor"]} value={formData.wifiQuality} onChange={v => updateForm("wifiQuality", v)} />
                </div>
              </div>
              <div className="space-y-8">
                <RadioGroup label="Network Downtime Frequency" icon={Clock} options={["Rare", "Monthly", "Weekly", "Frequently"]} value={formData.downtime} onChange={v => updateForm("downtime", v)} />
                <div className="pt-2 border-t border-gray-100 space-y-2.5">
                  <Label className="flex items-center font-semibold text-gray-700"><Users className="w-4 h-4 mr-2 text-primary" /> Number of Network Users</Label>
                  <Input type="number" value={formData.networkUsers} onChange={e => updateForm("networkUsers", e.target.value)} placeholder="Approx. total users on network" className="bg-gray-50 h-11" />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
              <Label className="flex items-center font-semibold text-gray-700 text-base"><MessageSquare className="w-4 h-4 mr-2 text-primary" /> Additional Network Observations</Label>
              <Textarea value={formData.networkObservations} onChange={e => updateForm("networkObservations", e.target.value)}
                placeholder="Example: Internet downtime during peak hours, weak Wi-Fi in ICU, switch overload, etc."
                className="bg-gray-50 border-gray-200 min-h-[100px]" />
            </div>
            <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="Next: Security & Backup" />
          </CardShell>
        )}

        {/* STEP 3 — Security & Backup */}
        {started && currentStep === 3 && (
          <CardShell icon={Shield} stepNum={3} title="Security & Backup" desc="Assess data protection, security controls, and backup readiness">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-8">
                <RadioGroup label="Firewall Protection" icon={Shield} options={["Yes", "No", "Don't Know"]} value={formData.firewall} onChange={v => updateForm("firewall", v)} />
                {formData.firewall === "Yes" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <Label className="flex items-center font-semibold text-gray-700"><Package className="w-4 h-4 mr-2 text-primary" /> Firewall Brand</Label>
                    <Input value={formData.firewallBrand} onChange={e => updateForm("firewallBrand", e.target.value)} placeholder="e.g. Fortinet, Sophos, SonicWall" className="bg-white h-11" />
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Endpoint Antivirus / Security" icon={Shield} options={["Yes", "No", "Partial"]} value={formData.endpointSecurity} onChange={v => updateForm("endpointSecurity", v)} />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Backup System Available?" icon={HardDrive} options={["Yes", "No", "Partial"]} value={formData.backupSystem} onChange={v => updateForm("backupSystem", v)} />
                </div>
                <div className="space-y-2.5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <Label className="flex items-center font-semibold text-gray-700"><Database className="w-4 h-4 mr-2 text-primary" /> Backup Type</Label>
                  <select value={formData.backupType} onChange={e => updateForm("backupType", e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <option value="">Select backup type...</option>
                    <option value="NAS">NAS</option>
                    <option value="External HDD">External HDD</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Local Server">Local Server</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </div>
              <div className="space-y-8">
                <RadioGroup label="Server Monitoring" icon={Activity} options={["Yes", "No", "Don't Know"]} value={formData.serverMonitoring} onChange={v => updateForm("serverMonitoring", v)} />
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="User Access / Password Policy" icon={Lock} options={["Properly managed", "Partially managed", "Not managed"]} value={formData.passwordPolicy} onChange={v => updateForm("passwordPolicy", v)} />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Data Security Awareness" icon={Users} options={["Strong", "Average", "Weak"]} value={formData.dataSecurity} onChange={v => updateForm("dataSecurity", v)} />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
              <Label className="flex items-center font-semibold text-gray-700 text-base"><MessageSquare className="w-4 h-4 mr-2 text-primary" /> Security Observations</Label>
              <Textarea value={formData.securityObservations} onChange={e => updateForm("securityObservations", e.target.value)}
                placeholder="Example: No centralized backup, antivirus not updated, no monitoring tools, etc."
                className="bg-gray-50 border-gray-200 min-h-[100px]" />
            </div>
            <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="Next: Infrastructure & Operations" />
          </CardShell>
        )}

        {/* STEP 4 — Infrastructure & Operations */}
        {started && currentStep === 4 && (
          <CardShell icon={Settings} stepNum={4} title="Infrastructure & Operations" desc="Review physical infrastructure, power setup, and IT support model">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-8">
                <RadioGroup label="CCTV Integration with Network" icon={Eye} options={["Yes", "No"]} value={formData.cctvIntegrated} onChange={v => updateForm("cctvIntegrated", v)} />
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Rack and Patch Management" icon={Server} options={["Proper", "Average", "Poor"]} value={formData.rackManagement} onChange={v => updateForm("rackManagement", v)} />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="UPS / Power Backup" icon={Zap} options={["Available", "Partial", "Not available"]} value={formData.ups} onChange={v => updateForm("ups", v)} />
                </div>
              </div>
              <div className="space-y-8">
                <RadioGroup label="Structured LAN Cabling Quality" icon={Network} options={["Good", "Average", "Poor"]} value={formData.cablingQuality} onChange={v => updateForm("cablingQuality", v)} />
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="NAS / Central Storage" icon={HardDrive} options={["Yes", "No", "Planned"]} value={formData.nas} onChange={v => updateForm("nas", v)} />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Existing IT Support Model" icon={Users} options={["In-house", "Vendor on call", "No proper support"]} value={formData.itSupport} onChange={v => updateForm("itSupport", v)} />
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
              <Label className="flex items-center font-semibold text-gray-700 text-base"><MessageSquare className="w-4 h-4 mr-2 text-primary" /> Infrastructure Observations</Label>
              <Textarea value={formData.infrastructureObservations} onChange={e => updateForm("infrastructureObservations", e.target.value)}
                placeholder="Example: Server room not air-conditioned, cables unorganized, no UPS for billing computers, etc."
                className="bg-gray-50 border-gray-200 min-h-[100px]" />
            </div>
            <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="Next: IT Challenges" />
          </CardShell>
        )}

        {/* STEP 5 — Operational IT Challenges */}
        {started && currentStep === 5 && (
          <CardShell icon={AlertTriangle} stepNum={5} title="Operational IT Challenges" desc="Help us understand the real-world IT problems affecting your hospital">
            <div className="space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed bg-orange-50 border border-orange-100 rounded-xl p-4">
                <strong className="text-gray-800">Why this matters:</strong> Understanding day-to-day IT pain points helps ZENYX prioritize the most impactful improvements for your hospital's operations.
              </p>
              <div className="space-y-3">
                <Label className="flex items-center font-semibold text-gray-700 text-base">
                  <Target className="w-5 h-5 mr-2 text-primary" /> What IT challenges currently affect hospital operations?
                </Label>
                <Textarea
                  value={formData.itChallenges}
                  onChange={e => updateForm("itChallenges", e.target.value)}
                  placeholder="Example: Lab reports are slow to load, billing system hangs during peak hours, Wi-Fi is weak in certain departments, server goes down unexpectedly, HIS software crashes, etc."
                  className="bg-gray-50 border-gray-200 min-h-[200px] text-base leading-relaxed"
                />
                <p className="text-xs text-gray-400">Be as specific as possible — this helps generate the most accurate recommendations.</p>
              </div>
            </div>
            <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="Next: Future IT Goals" />
          </CardShell>
        )}

        {/* STEP 6 — Future IT Goals */}
        {started && currentStep === 6 && (
          <CardShell icon={TrendingUp} stepNum={6} title="Future IT Goals" desc="Share your vision for your hospital's IT infrastructure">
            <div className="space-y-4">
              <p className="text-gray-600 text-sm leading-relaxed bg-orange-50 border border-orange-100 rounded-xl p-4">
                <strong className="text-gray-800">Shaping your roadmap:</strong> Your goals help ZENYX tailor a support model and implementation plan that aligns with your hospital's growth strategy.
              </p>
              <div className="space-y-3">
                <Label className="flex items-center font-semibold text-gray-700 text-base">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" /> What improvements would you like to see in your hospital IT infrastructure?
                </Label>
                <Textarea
                  value={formData.futureGoals}
                  onChange={e => updateForm("futureGoals", e.target.value)}
                  placeholder="Example: Faster network speeds, stronger data security, centralized server monitoring, zero downtime for critical systems, cloud backup, structured cabling, Wi-Fi across all departments, etc."
                  className="bg-gray-50 border-gray-200 min-h-[200px] text-base leading-relaxed"
                />
                <p className="text-xs text-gray-400">Your input will be used to personalize recommendations in the results section.</p>
              </div>
            </div>
            <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="View Results" />
          </CardShell>
        )}

        {/* STEP 7 — RESULTS */}
        {started && currentStep === 7 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-12 w-full">

            {/* Infrastructure Health Score */}
            <Card className="shadow-sm border border-gray-200 overflow-hidden rounded-2xl bg-white print-section">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b border-gray-100 pb-5 pt-7 px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">Results</span>
                      <CardTitle className="text-2xl text-gray-900 font-black tracking-tight mt-1">Infrastructure Health Score</CardTitle>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-gray-700 text-sm font-semibold">{formData.hospitalName || "Hospital Assessment"}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{formData.assessmentDate}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  {/* Gauge */}
                  <div className="flex flex-col items-center justify-start lg:border-r border-gray-100 lg:pr-8">
                    <div className="relative w-52 h-52 flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F3F4F6" strokeWidth="2.8" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke={riskColor} strokeWidth="2.8"
                          strokeDasharray={`${riskScore} 100`} strokeLinecap="round"
                          className="transition-all duration-1000 ease-out" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black tabular-nums leading-none" style={{ color: riskColor }}>{riskScore}</span>
                        <span className="text-[10px] text-gray-400 font-semibold tracking-widest mt-2 uppercase">out of 100</span>
                      </div>
                    </div>

                    <div className="mt-4 px-6 py-2 rounded-full font-bold text-sm border uppercase tracking-wider text-center"
                      style={{ borderColor: riskColor, color: riskColor, backgroundColor: `${riskColor}10` }}>
                      {riskGrade}
                    </div>

                    <p className="text-sm text-center text-gray-500 mt-4 leading-relaxed">
                      {riskGrade === "Stable Infrastructure" && "Your hospital has a strong IT foundation. Proactive improvements in monitoring and maintenance can further strengthen reliability."}
                      {riskGrade === "Needs Optimization" && "Your hospital has a functional IT environment. Improvements in backup and monitoring would significantly enhance reliability."}
                      {riskGrade === "Operational Risk Areas" && "Your hospital's IT infrastructure has significant gaps. Structured intervention is recommended to prevent operational disruptions."}
                      {riskGrade === "Critical Infrastructure Gaps" && "Your hospital's IT systems are at high risk. Urgent intervention by a qualified IT partner is strongly recommended."}
                    </p>

                    <div className="mt-5 w-full space-y-2 bg-gray-50 rounded-xl p-4">
                      {[
                        { label: "0–25", name: "Stable Infrastructure", color: "#22C55E" },
                        { label: "26–50", name: "Needs Optimization", color: "#F59E0B" },
                        { label: "51–75", name: "Operational Risk Areas", color: "#F97316" },
                        { label: "76–100", name: "Critical Infrastructure Gaps", color: "#DC2626" },
                      ].map(item => (
                        <div key={item.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-400 font-mono w-10">{item.label}</span>
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Breakdown + Summary */}
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pb-3 mb-5 border-b border-gray-100">Category Breakdown</h4>
                      <div className="space-y-5">
                        {[
                          { label: "Network Security", val: breakdown.network, max: 45 },
                          { label: "Backup & Recovery", val: breakdown.backup, max: 18 },
                          { label: "Data Security", val: breakdown.data, max: 26 },
                          { label: "Infrastructure", val: breakdown.infrastructure, max: 22 },
                          { label: "Support & Monitoring", val: breakdown.support, max: 20 },
                        ].map((item) => {
                          const pct = Math.min(100, Math.round((item.val / item.max) * 100)) || 0;
                          const barColor = pct > 70 ? "#DC2626" : pct > 40 ? "#F97316" : pct > 15 ? "#F59E0B" : "#22C55E";
                          return (
                            <div key={item.label} className="space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700 font-semibold">{item.label}</span>
                                <span className="text-gray-400 font-mono text-xs font-medium">{pct}%</span>
                              </div>
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Assessment Summary</h5>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                        {formData.hospitalType && <div className="text-gray-500">Type: <span className="text-gray-800 font-semibold">{formData.hospitalType}</span></div>}
                        {formData.computers && <div className="text-gray-500">Computers: <span className="text-gray-800 font-semibold">{formData.computers}</span></div>}
                        {formData.servers && <div className="text-gray-500">Servers: <span className="text-gray-800 font-semibold">{formData.servers}</span></div>}
                        {formData.networkUsers && <div className="text-gray-500">Network Users: <span className="text-gray-800 font-semibold">{formData.networkUsers}</span></div>}
                        {formData.branches && <div className="text-gray-500">Branches: <span className="text-gray-800 font-semibold">{formData.branches}</span></div>}
                        <div className="text-gray-500">Recommended: <span className="font-bold" style={{ color: "#F97316" }}>{recommendedPackage}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consulting Observations */}
            <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden print-section">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b border-gray-100 px-8 py-6">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0"><Info className="w-5 h-5" /></div>
                  Key Infrastructure Observations
                </CardTitle>
                <CardDescription className="text-base text-gray-500 mt-1">
                  Based on your assessment responses, here are our consulting observations:
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {observations.length > 0 ? (
                  <div className="space-y-3">
                    {observations.map((obs, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-100 hover:bg-amber-50 transition-colors">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-gray-800 font-medium leading-relaxed text-sm">{obs}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-6 rounded-xl bg-green-50 border border-green-100">
                    <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                    <p className="text-green-800 font-medium">No critical observations at this time. Your environment shows a solid IT foundation.</p>
                  </div>
                )}

                {/* Show free-text observations if entered */}
                {(formData.networkObservations || formData.securityObservations || formData.infrastructureObservations) && (
                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Consultant Field Notes</h4>
                    {formData.networkObservations && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Network</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{formData.networkObservations}</p>
                      </div>
                    )}
                    {formData.securityObservations && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Security</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{formData.securityObservations}</p>
                      </div>
                    )}
                    {formData.infrastructureObservations && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Infrastructure</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{formData.infrastructureObservations}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Actions */}
            {actions.length > 0 && (
              <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden print-section">
                <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
                <CardHeader className="border-b border-gray-100 px-8 py-6">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0"><Clipboard className="w-5 h-5" /></div>
                    Recommended Actions
                  </CardTitle>
                  <CardDescription className="text-base text-gray-500 mt-1">Prioritized steps to improve infrastructure reliability and security</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {actions.map((action, idx) => (
                      <div key={idx} className="border border-gray-200 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${
                          action.priority === "CRITICAL" ? "bg-red-600" : action.priority === "HIGH" ? "bg-orange-500" : action.priority === "MEDIUM" ? "bg-yellow-500" : "bg-green-500"}`} />
                        <div className="flex justify-between items-start mb-2 pl-3">
                          <h4 className="font-bold text-gray-900 pr-4 text-sm">{action.title}</h4>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shrink-0 ${
                            action.priority === "CRITICAL" ? "bg-red-100 text-red-700" : action.priority === "HIGH" ? "bg-orange-100 text-orange-700" : action.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                            {action.priority}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 pl-3 leading-relaxed">{action.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Future Goals display */}
            {formData.futureGoals && (
              <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden print-section">
                <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
                <CardHeader className="border-b border-gray-100 px-8 py-6">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0"><TrendingUp className="w-5 h-5" /></div>
                    Hospital IT Vision
                  </CardTitle>
                  <CardDescription className="text-base text-gray-500 mt-1">
                    Goals captured from the assessment — to be incorporated into the implementation roadmap
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="p-5 bg-orange-50/50 border border-orange-100 rounded-xl">
                    <p className="text-gray-700 leading-relaxed text-sm italic">"{formData.futureGoals}"</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Support Model */}
            <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden print-section">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b border-gray-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-gray-900">Recommended Support Model for This Hospital</CardTitle>
                <CardDescription className="text-base text-gray-500 mt-1 max-w-2xl">
                  Based on the ZENYX Care IT Check results, the following support model is recommended to ensure reliable IT operations and security.
                </CardDescription>
                {formData.hospitalName && (
                  <div className="mt-4 inline-block bg-primary/10 text-sm font-semibold px-4 py-2 rounded-lg text-primary border border-primary/20">
                    Based on assessment score of <span className="font-black">{riskScore}/100</span>, ZENYX recommends the <span className="font-black">{recommendedPackage}</span> for {formData.hospitalName}.
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                  {[
                    {
                      name: "Monitoring Package",
                      desc: "Essential proactive monitoring for stable environments.",
                      features: ["24/7 Network Monitoring", "Server Health Checks", "Monthly Reports", "Basic Remote Support"],
                    },
                    {
                      name: "Support Package",
                      desc: "Comprehensive IT support with monitoring and proactive maintenance.",
                      features: ["Everything in Monitoring", "Unlimited Remote Support", "Patch Management", "Scheduled On-site Visits", "Incident Response SLA"],
                    },
                    {
                      name: "Security Package",
                      desc: "Maximum protection and compliance for critical healthcare setups.",
                      features: ["Everything in Support", "Advanced Endpoint Security", "Managed Backup & DR", "Security Awareness Training", "IT Strategy & VCIO"],
                    },
                  ].map((pkg) => {
                    const isRecommended = recommendedPackage === pkg.name;
                    return (
                      <div key={pkg.name} className={`rounded-xl border flex flex-col transition-all duration-200 bg-white hover:shadow-md ${isRecommended ? "border-primary/50 shadow-sm ring-1 ring-primary/20" : "border-gray-200"}`}>
                        <div className={`px-5 py-3 rounded-t-xl flex items-center gap-2 ${isRecommended ? "bg-orange-50 border-b border-primary/15" : "bg-gray-50 border-b border-gray-100"}`}>
                          {isRecommended && <Star className="w-3.5 h-3.5 fill-primary text-primary shrink-0" />}
                          <span className={`text-xs font-bold uppercase tracking-wider ${isRecommended ? "text-primary" : "text-gray-400"}`}>
                            {isRecommended ? "Most Suitable for This Hospital" : pkg.name}
                          </span>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="text-base font-black text-gray-900 mb-1">{pkg.name}</h3>
                          <p className="text-sm text-gray-500 mb-4 leading-relaxed">{pkg.desc}</p>
                          <ul className="space-y-2 text-sm text-gray-600 mt-auto">
                            {pkg.features.map(f => (
                              <li key={f} className="flex items-start gap-2">
                                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isRecommended ? "text-primary" : "text-gray-300"}`} />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* What Happens Next */}
            <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden print-section print:hidden bg-white">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="px-8 py-6 border-b border-gray-100">
                <CardTitle className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg text-primary"><ArrowRight className="w-5 h-5" /></div>
                  What Happens Next?
                </CardTitle>
                <CardDescription className="text-base text-gray-500 mt-1">
                  Partner with ZENYX IT Infra Solutions for a structured implementation journey
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-2">
                  {[
                    { icon: "🔍", title: "Detailed IT Infrastructure Audit", desc: "Comprehensive on-site evaluation of all IT systems, documentation, and processes." },
                    { icon: "⚙️", title: "Infrastructure Stabilization", desc: "Address critical gaps, upgrade, configure, and optimize core systems." },
                    { icon: "📡", title: "Monitoring Deployment", desc: "Deploy real-time visibility across network, server, and endpoint layers." },
                    { icon: "🛡", title: "Preventive Maintenance Program", desc: "Scheduled visits, patch management, and proactive health checks." },
                    { icon: "🔐", title: "Security & Backup Governance", desc: "Implement security policies, backup verification, and IT risk governance." },
                  ].map((step, i, arr) => (
                    <React.Fragment key={i}>
                      <div className="flex flex-col items-center text-center max-w-[150px] mx-auto group">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 group-hover:shadow-md group-hover:border-primary/30 transition-all duration-200">
                          {step.icon}
                        </div>
                        <h5 className="font-bold text-gray-900 text-xs mb-1.5 leading-tight">{i + 1}. {step.title}</h5>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{step.desc}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <>
                          <div className="hidden lg:flex items-center text-primary/30"><ArrowRight className="w-5 h-5" /></div>
                          <div className="flex lg:hidden items-center justify-center text-primary/30 w-full"><div className="h-6 w-px bg-primary/20" /></div>
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mt-10 bg-gray-50 rounded-xl p-7 flex flex-col md:flex-row items-center justify-between border border-gray-200 gap-4">
                  <div>
                    <h4 className="text-base font-bold text-gray-900 mb-1">Ready to take the next step?</h4>
                    <p className="text-sm text-gray-500">Secure your hospital's IT infrastructure with ZENYX's proven implementation framework.</p>
                  </div>
                  <Button size="lg" className="mt-2 md:mt-0 font-bold px-8 h-11 rounded-xl hover:shadow-md transition-all group shrink-0">
                    Contact ZENYX IT Infra Solutions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary (print only) */}
            {formData.hospitalName && (
              <Card className="shadow-sm border-2 border-gray-200 rounded-xl bg-white overflow-hidden print:block hidden print-section break-before-page">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl">ZENYX Care IT Check — Executive Summary</CardTitle>
                      <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                    </div>
                    <img src="/zenyx-logo-nobg.png" alt="ZENYX" className="h-8" style={{ filter: "brightness(0)" }} onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div><span className="font-semibold text-gray-500">Hospital:</span> {formData.hospitalName}</div>
                    <div><span className="font-semibold text-gray-500">Type:</span> {formData.hospitalType}</div>
                    <div><span className="font-semibold text-gray-500">Contact:</span> {formData.contactPerson} ({formData.designation})</div>
                    <div><span className="font-semibold text-gray-500">Location:</span> {formData.location}</div>
                    <div><span className="font-semibold text-gray-500">Assessor:</span> {formData.assessedBy}</div>
                    <div><span className="font-semibold text-gray-500">Date:</span> {formData.assessmentDate}</div>
                  </div>
                  <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${riskColor}15`, border: `1px solid ${riskColor}40` }}>
                    <h3 className="font-bold text-lg mb-2" style={{ color: riskColor }}>{riskGrade} (Score: {riskScore}/100)</h3>
                    <p className="text-sm text-gray-700">Recommended support model: <strong>{recommendedPackage}</strong></p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Firewall:</span> <span className="font-medium">{formData.firewall}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Backup System:</span> <span className="font-medium">{formData.backupSystem}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Endpoint Security:</span> <span className="font-medium">{formData.endpointSecurity}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-500">Internet Redundancy:</span> <span className="font-medium">{formData.internetRedundancy}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-500">UPS Status:</span> <span className="font-medium">{formData.ups}</span></div>
                    <div className="flex justify-between border-b pb-1"><span className="text-gray-500">IT Support:</span> <span className="font-medium">{formData.itSupport}</span></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 print:hidden">
              <Button onClick={() => window.print()} variant="outline" size="lg" className="h-12 px-8 rounded-xl font-bold border-2 bg-white">
                <Printer className="mr-2 w-5 h-5" /> Print Report
              </Button>
              <Button onClick={() => window.print()} variant="outline" size="lg" className="h-12 px-8 rounded-xl font-bold border-2 bg-white">
                <Download className="mr-2 w-5 h-5" /> Export as PDF
              </Button>
              <Button onClick={startNew} variant="ghost" size="lg" className="h-12 px-8 rounded-xl font-bold text-gray-500 hover:text-gray-900">
                <ArrowLeft className="mr-2 w-5 h-5" /> Start New Assessment
              </Button>
            </div>

          </div>
        )}

      </main>

      <footer className="mt-16 py-10 bg-white text-center print:hidden shrink-0 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <img src="/zenyx-logo-nobg.png" alt="ZENYX" className="h-7 mx-auto mb-3 opacity-60 object-contain" style={{ filter: "brightness(0)" }}
            onError={(e) => (e.currentTarget.style.display = "none")} />
          <p className="text-gray-700 font-bold tracking-widest text-sm mb-1">ZENYX IT Infra Solutions</p>
          <p className="text-primary text-xs uppercase tracking-widest font-semibold mb-5">Reliable IT Infrastructure for Critical Healthcare Environments</p>
          <div className="h-px w-16 bg-gray-200 mx-auto mb-5" />
          <p className="text-xs text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Disclaimer: This assessment provides a preliminary overview of healthcare IT infrastructure readiness and improvement opportunities. It is not a substitute for a comprehensive technical audit.
          </p>
        </div>
      </footer>
    </div>
  );
}
