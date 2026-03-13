import React, { useState, useMemo } from "react";
import { 
  Building2, Settings, Shield, Server, Monitor, Wifi, HardDrive, 
  Network, Clock, Users, Lock, Database, Headphones, FileText, 
  AlertTriangle, CheckCircle2, XCircle, Package, Clipboard, Phone, 
  Mail, MapPin, Calendar, User, Zap, Eye, Layers, Activity,
  Info, ArrowRight, ArrowLeft, Printer, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome, 1-4 = assessment steps, 5 = results

  const [formData, setFormData] = useState({
    hospitalName: "",
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
    firewall: "",
    firewallBrand: "",
    managedSwitches: "",
    internetRedundancy: "",
    downtime: "",
    
    backupSystem: "",
    backupType: "",
    serverMonitoring: "",
    endpointSecurity: "",
    passwordPolicy: "",
    dataSecurity: "",
    
    cctvIntegrated: "",
    wifiQuality: "",
    cablingQuality: "",
    rackManagement: "",
    ups: "",
    
    nas: "",
    itSupport: "",
    criticalIssues: "",
    remarks: "",
  });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // RISK SCORE LOGIC
  const { riskScore, riskGrade, riskColor, maxPossible, actions, breakdown } = useMemo(() => {
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
      itSupport: { "No proper support": 10, "Vendor on call": 4, "In-house": 0 }
    };

    let breakdownScores = {
      network: 0,
      backup: 0,
      infrastructure: 0,
      support: 0,
      data: 0
    };

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
    // Total max: 20+18+15+20+10+10+8+8+5+5+4+8+10 = 141
    if (score > 100) {
       normalizedScore = Math.round((score / 141) * 100);
    }

    let grade = "Low Risk";
    let color = "#22C55E";
    if (normalizedScore > 25) { grade = "Moderate Risk"; color = "#F59E0B"; }
    if (normalizedScore > 50) { grade = "High Risk"; color = "#F97316"; }
    if (normalizedScore > 75) { grade = "Critical Risk"; color = "#DC2626"; }

    // RECOMMENDED ACTIONS
    const generatedActions: any[] = [];
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
      maxPossible: 141,
      actions: generatedActions.slice(0, 10),
      breakdown: breakdownScores
    };
  }, [formData]);

  const recommendedPackage = useMemo(() => {
    if (riskScore <= 25) return "Monitoring Package";
    if (riskScore <= 50) return "Support Package";
    return "Security Package";
  }, [riskScore]);

  const startAssessment = () => {
    setStarted(true);
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const startNew = () => {
    setStarted(false);
    setCurrentStep(0);
    window.scrollTo(0, 0);
  };

  const RadioGroup = ({ label, icon: Icon, options, value, onChange }: any) => (
    <div className="space-y-3">
      <Label className="flex items-center text-sm font-semibold text-gray-700">
        <Icon className="w-4 h-4 mr-2 text-primary" /> {label}
      </Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map((opt: string) => (
          <div
            key={opt}
            onClick={() => onChange(opt)}
            className={`cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 text-center
              ${value === opt 
                ? 'border-primary bg-orange-50 text-primary shadow-sm' 
                : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/50'}`}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );

  const getObservations = () => {
    const obs = [];
    if (formData.firewall === "No") obs.push("⚠ Network perimeter protection is not currently in place — a firewall would significantly reduce external threat exposure.");
    if (formData.backupSystem === "No") obs.push("⚠ Centralized backup system is not currently configured — this creates risk of data loss in the event of hardware failure.");
    if (formData.serverMonitoring === "No") obs.push("⚠ Server and network monitoring could improve operational visibility and enable proactive incident response.");
    if (formData.internetRedundancy === "Single ISP") obs.push("⚠ Internet redundancy would strengthen system reliability and reduce the impact of ISP outages.");
    if (formData.endpointSecurity === "No") obs.push("⚠ Endpoint protection across workstations would reduce the risk of malware and ransomware incidents.");
    if (formData.passwordPolicy === "Not managed") obs.push("⚠ A structured user access and password policy would reduce the risk of unauthorized access.");
    if (formData.dataSecurity === "Weak") obs.push("⚠ Improving data security awareness among staff would reduce human-error related incidents.");
    if (formData.ups === "Not available") obs.push("⚠ UPS/power backup systems are not in place — critical IT equipment is vulnerable to power disruptions.");
    if (formData.itSupport === "No proper support") obs.push("⚠ A structured IT support model would ensure timely response to incidents and reduce unplanned downtime.");
    return obs;
  };

  const observations = getObservations();

  const steps = [
    { num: 1, title: "Hospital Info" },
    { num: 2, title: "Network & Connectivity" },
    { num: 3, title: "Security & Backup" },
    { num: 4, title: "Infrastructure & Operations" },
    { num: 5, title: "Results" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20 flex flex-col">
      {/* HEADER */}
      <header className="w-full bg-[#111111] relative overflow-hidden print:bg-white shrink-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #F97316 0px, #F97316 1px, transparent 1px, transparent 12px)`
        }} />
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-primary/8 to-transparent pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-0">
          <div className="h-[3px] w-full bg-gradient-to-r from-transparent via-primary to-transparent mb-0 absolute top-0 left-0 right-0 opacity-60" />
          
          <div className="flex items-center justify-between gap-6 py-5">
            <div className="flex items-center gap-5 shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md" />
                <div className="relative border border-white/10 rounded-2xl overflow-hidden w-[52px] h-[52px] flex items-center justify-center">
                  <img src="/zenyx-icon.png" alt="ZENYX" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              </div>
              <div className="hidden md:block">
                <img 
                  src="/zenyx-logo-nobg.png" 
                  alt="ZENYX IT Infra Solutions" 
                  className="h-8 object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <p className="hidden text-white font-black text-2xl tracking-widest">ZENYX</p>
                <p className="text-[10px] font-bold tracking-[0.35em] uppercase mt-1" style={{ color: '#F97316', opacity: 0.8 }}>IT Infra Solutions</p>
              </div>
              <span className="md:hidden text-white font-black text-2xl tracking-widest">ZENYX</span>
            </div>

            <div className="flex-1 flex flex-col items-center text-center px-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="hidden sm:block h-px w-12 bg-gradient-to-r from-transparent to-primary/40" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/60">Enterprise IT Assessment Platform</span>
                <div className="hidden sm:block h-px w-12 bg-gradient-to-l from-transparent to-primary/40" />
              </div>
              <h1 className="text-xl md:text-2xl lg:text-[1.65rem] font-black text-white tracking-tight leading-tight">
                ZENYX Care IT Check
              </h1>
              <p className="text-gray-500 text-[11px] mt-1.5 tracking-wide hidden sm:block uppercase">
                Healthcare Infrastructure Reliability & Technology Assessment
              </p>
            </div>

            <div className="hidden lg:flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-xl px-4 py-2.5">
                <div className="w-2 h-2 rounded-full bg-primary" style={{ boxShadow: '0 0 6px #F97316', animation: 'pulse 2s infinite' }} />
                <span className="text-primary text-[11px] font-black tracking-[0.15em] uppercase">Live Scoring</span>
              </div>
              <p className="text-gray-600 text-[10px] tracking-wide text-right">Real-time risk computation</p>
            </div>
          </div>
        </div>
        <div className="h-[3px] w-full bg-gradient-to-r from-primary/40 via-primary to-orange-300/60" />
      </header>

      {/* STEP PROGRESS INDICATOR */}
      {started && currentStep > 0 && currentStep <= 5 && (
        <div className="bg-white border-b print:hidden shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Step {currentStep} of 5 — {Math.round((currentStep / 5) * 100)}% Complete
              </span>
            </div>
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-200" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-500 ease-in-out" 
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} 
              />
              
              {steps.map((step, idx) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                  <div key={idx} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                      ${isActive ? 'bg-primary text-white shadow-md shadow-primary/30' : 
                        isCompleted ? 'bg-gray-200 text-gray-600' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.num}
                    </div>
                    <span className={`text-[10px] font-semibold hidden md:block uppercase tracking-wider
                      ${isActive ? 'text-primary' : isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 w-full transition-all duration-500">
        
        {/* SECTION 1: WELCOME SCREEN */}
        {!started && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col lg:flex-row bg-white max-w-4xl mx-auto">
              <div className="lg:w-2/5 bg-[#111111] p-10 flex flex-col justify-center text-white relative">
                <div className="absolute top-0 right-0 w-64 h-full opacity-10 bg-gradient-to-l from-primary to-transparent" />
                <div className="relative z-10">
                  <img src="/zenyx-icon.png" alt="ZENYX" className="w-16 h-16 mb-6 rounded-xl border border-white/10 shadow-lg shadow-primary/20" />
                  <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight">ZENYX Care<br/><span className="text-primary">IT Check</span></h2>
                  <p className="text-sm font-medium text-gray-300 uppercase tracking-widest leading-relaxed mb-6">
                    Healthcare Infrastructure Reliability & Technology Assessment
                  </p>
                  <p className="text-gray-400 text-sm mb-12">
                    A professional IT assessment tool for healthcare facilities
                  </p>
                  
                  <div className="mt-auto border-t border-white/10 pt-6">
                    <p className="text-xs text-gray-500 font-medium tracking-wider">POWERED BY</p>
                    <p className="text-sm font-bold text-white mt-1">ZENYX IT Infra Solutions</p>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-3/5 p-10 flex flex-col justify-center bg-white">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ensure continuous healthcare operations</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Hospitals rely heavily on technology for patient records, diagnostics, billing systems, and communication. ZENYX Care IT Check helps healthcare organizations evaluate their IT infrastructure readiness, reliability, and operational continuity.
                </p>
                
                <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-semibold text-sm mb-8 self-start border border-orange-100">
                  <Clock className="w-4 h-4" />
                  Estimated time: 3–5 minutes
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                  <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-gray-50">
                    <div className="bg-primary/10 p-3 rounded-full text-primary"><Settings className="w-5 h-5" /></div>
                    <span className="text-xs font-bold text-gray-700 uppercase">22 Assessment<br/>Points</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-gray-50">
                    <div className="bg-primary/10 p-3 rounded-full text-primary"><Activity className="w-5 h-5" /></div>
                    <span className="text-xs font-bold text-gray-700 uppercase">Live Risk<br/>Scoring</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-3 p-4 rounded-xl bg-gray-50">
                    <div className="bg-primary/10 p-3 rounded-full text-primary"><Clipboard className="w-5 h-5" /></div>
                    <span className="text-xs font-bold text-gray-700 uppercase">Action<br/>Recommendations</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-auto">
                  <Button onClick={startAssessment} size="lg" className="w-full sm:w-auto self-start text-base h-14 px-8 rounded-xl font-bold hover:shadow-lg transition-all group">
                    Start Assessment <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <p className="text-xs text-gray-500 font-medium ml-2">No registration required · Free assessment</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SECTION 3: STEP 1 — Hospital Information */}
        {started && currentStep === 1 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <Card className="shadow-md border-none rounded-xl bg-white overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b bg-gray-50/50 pb-6 px-8 pt-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-xl text-primary">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">Step 1 of 5</span>
                    </div>
                    <CardTitle className="text-2xl text-gray-900 font-black">Hospital Information</CardTitle>
                    <CardDescription className="text-base mt-1">Tell us about the healthcare facility being assessed</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><Building2 className="w-4 h-4 mr-2 text-primary"/> Hospital Name</Label>
                    <Input value={formData.hospitalName} onChange={e => updateForm("hospitalName", e.target.value)} placeholder="e.g. City General Hospital" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><User className="w-4 h-4 mr-2 text-primary"/> Contact Person</Label>
                    <Input value={formData.contactPerson} onChange={e => updateForm("contactPerson", e.target.value)} placeholder="Name of IT Head/Admin" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><Layers className="w-4 h-4 mr-2 text-primary"/> Designation</Label>
                    <Input value={formData.designation} onChange={e => updateForm("designation", e.target.value)} placeholder="e.g. IT Manager" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><Phone className="w-4 h-4 mr-2 text-primary"/> Mobile Number</Label>
                    <Input type="tel" value={formData.mobileNumber} onChange={e => updateForm("mobileNumber", e.target.value)} placeholder="+1 (555) 000-0000" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><Mail className="w-4 h-4 mr-2 text-primary"/> Email Address</Label>
                    <Input type="email" value={formData.email} onChange={e => updateForm("email", e.target.value)} placeholder="admin@hospital.com" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><Network className="w-4 h-4 mr-2 text-primary"/> Number of Branches</Label>
                    <Input type="number" value={formData.branches} onChange={e => updateForm("branches", e.target.value)} placeholder="e.g. 3" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><MapPin className="w-4 h-4 mr-2 text-primary"/> Location</Label>
                    <Input value={formData.location} onChange={e => updateForm("location", e.target.value)} placeholder="City, State" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><Calendar className="w-4 h-4 mr-2 text-primary"/> Assessment Date</Label>
                    <Input type="date" value={formData.assessmentDate} onChange={e => updateForm("assessmentDate", e.target.value)} className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><User className="w-4 h-4 mr-2 text-primary"/> Assessed By</Label>
                    <Input value={formData.assessedBy} onChange={e => updateForm("assessedBy", e.target.value)} placeholder="ZENYX Consultant Name" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                </div>
                
                <div className="mt-10 flex justify-end pt-6 border-t border-gray-100">
                  <Button onClick={nextStep} size="lg" className="h-12 px-8 rounded-xl font-bold hover:shadow-lg transition-all group">
                    Next: Network & Connectivity <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 4: STEP 2 — Network & Connectivity */}
        {started && currentStep === 2 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <Card className="shadow-md border-none rounded-xl bg-white overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b bg-gray-50/50 pb-6 px-8 pt-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-xl text-primary">
                    <Network className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">Step 2 of 5</span>
                    </div>
                    <CardTitle className="text-2xl text-gray-900 font-black">Network & Connectivity</CardTitle>
                    <CardDescription className="text-base mt-1">Evaluate your network infrastructure and connectivity setup</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="flex items-center font-semibold text-gray-700 text-base"><Monitor className="w-4 h-4 mr-2 text-primary" /> Number of Computers</Label>
                      <Input type="number" value={formData.computers} onChange={e => updateForm("computers", e.target.value)} placeholder="Total endpoints" className="bg-gray-50 h-11" />
                    </div>
                    <div className="space-y-3">
                      <Label className="flex items-center font-semibold text-gray-700 text-base"><Server className="w-4 h-4 mr-2 text-primary" /> Number of Servers</Label>
                      <Input type="number" value={formData.servers} onChange={e => updateForm("servers", e.target.value)} placeholder="Total physical/virtual" className="bg-gray-50 h-11" />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Firewall available?" icon={Shield} options={["Yes", "No", "Don't Know"]} value={formData.firewall} onChange={(v: string) => updateForm("firewall", v)} />
                    </div>
                    {formData.firewall === "Yes" && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <Label className="flex items-center font-semibold text-gray-700"><Package className="w-4 h-4 mr-2 text-primary" /> Firewall Brand</Label>
                        <Input value={formData.firewallBrand} onChange={e => updateForm("firewallBrand", e.target.value)} placeholder="e.g. Fortinet, Sophos, SonicWall" className="bg-white" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-8">
                    <RadioGroup label="Managed Switches?" icon={Network} options={["Yes", "No", "Partial"]} value={formData.managedSwitches} onChange={(v: string) => updateForm("managedSwitches", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Internet Redundancy" icon={Wifi} options={["Single ISP", "Dual ISP", "No clarity"]} value={formData.internetRedundancy} onChange={(v: string) => updateForm("internetRedundancy", v)} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Average Network Downtime Frequency" icon={Clock} options={["Rare", "Monthly", "Weekly", "Frequently"]} value={formData.downtime} onChange={(v: string) => updateForm("downtime", v)} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-100">
                  <Button onClick={prevStep} variant="ghost" size="lg" className="h-12 px-6 rounded-xl font-semibold">
                    <ArrowLeft className="mr-2 w-5 h-5" /> Back
                  </Button>
                  <Button onClick={nextStep} size="lg" className="h-12 px-8 rounded-xl font-bold hover:shadow-lg transition-all group">
                    Next: Security & Backup <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 5: STEP 3 — Security & Backup */}
        {started && currentStep === 3 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <Card className="shadow-md border-none rounded-xl bg-white overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b bg-gray-50/50 pb-6 px-8 pt-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-xl text-primary">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">Step 3 of 5</span>
                    </div>
                    <CardTitle className="text-2xl text-gray-900 font-black">Security & Backup</CardTitle>
                    <CardDescription className="text-base mt-1">Assess data protection, security controls, and backup readiness</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-8">
                    <RadioGroup label="Backup System Available?" icon={HardDrive} options={["Yes", "No", "Partial"]} value={formData.backupSystem} onChange={(v: string) => updateForm("backupSystem", v)} />
                    
                    <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <Label className="flex items-center font-semibold text-gray-700"><Database className="w-4 h-4 mr-2 text-primary" /> Backup Type</Label>
                      <select 
                        value={formData.backupType} 
                        onChange={(e) => updateForm("backupType", e.target.value)}
                        className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
                      >
                        <option value="">Select Backup Type...</option>
                        <option value="NAS">NAS</option>
                        <option value="External HDD">External HDD</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Local Server">Local Server</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Server Monitoring?" icon={Activity} options={["Yes", "No", "Don't Know"]} value={formData.serverMonitoring} onChange={(v: string) => updateForm("serverMonitoring", v)} />
                    </div>
                  </div>
                  <div className="space-y-8">
                    <RadioGroup label="Endpoint Antivirus/Security?" icon={Shield} options={["Yes", "No", "Partial"]} value={formData.endpointSecurity} onChange={(v: string) => updateForm("endpointSecurity", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="User Access/Password Policy" icon={Lock} options={["Properly managed", "Partially managed", "Not managed"]} value={formData.passwordPolicy} onChange={(v: string) => updateForm("passwordPolicy", v)} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Data Security Awareness" icon={Users} options={["Strong", "Average", "Weak"]} value={formData.dataSecurity} onChange={(v: string) => updateForm("dataSecurity", v)} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-100">
                  <Button onClick={prevStep} variant="ghost" size="lg" className="h-12 px-6 rounded-xl font-semibold">
                    <ArrowLeft className="mr-2 w-5 h-5" /> Back
                  </Button>
                  <Button onClick={nextStep} size="lg" className="h-12 px-8 rounded-xl font-bold hover:shadow-lg transition-all group">
                    Next: Infrastructure & Ops <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 6: STEP 4 — Infrastructure & Operations */}
        {started && currentStep === 4 && (
          <div className="animate-in slide-in-from-right-8 fade-in duration-300">
            <Card className="shadow-md border-none rounded-xl bg-white overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b bg-gray-50/50 pb-6 px-8 pt-8">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-4 rounded-xl text-primary">
                    <Settings className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">Step 4 of 5</span>
                    </div>
                    <CardTitle className="text-2xl text-gray-900 font-black">Infrastructure & Operations</CardTitle>
                    <CardDescription className="text-base mt-1">Review physical infrastructure, power, storage, and support model</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-8">
                    <RadioGroup label="CCTV Integrated with Network?" icon={Eye} options={["Yes", "No"]} value={formData.cctvIntegrated} onChange={(v: string) => updateForm("cctvIntegrated", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Wi-Fi Coverage Quality" icon={Wifi} options={["Good", "Average", "Poor"]} value={formData.wifiQuality} onChange={(v: string) => updateForm("wifiQuality", v)} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Structured LAN Cabling Quality" icon={Network} options={["Good", "Average", "Poor"]} value={formData.cablingQuality} onChange={(v: string) => updateForm("cablingQuality", v)} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Rack and Patch Management" icon={Server} options={["Proper", "Average", "Poor"]} value={formData.rackManagement} onChange={(v: string) => updateForm("rackManagement", v)} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="UPS / Power Backup" icon={Zap} options={["Available", "Partial", "Not available"]} value={formData.ups} onChange={(v: string) => updateForm("ups", v)} />
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <RadioGroup label="NAS / Central Storage" icon={HardDrive} options={["Yes", "No", "Planned"]} value={formData.nas} onChange={(v: string) => updateForm("nas", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Existing IT Support Model" icon={Users} options={["In-house", "Vendor on call", "No proper support"]} value={formData.itSupport} onChange={(v: string) => updateForm("itSupport", v)} />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 space-y-6">
                      <div className="space-y-3">
                        <Label className="flex items-center font-semibold text-gray-700 text-base"><AlertTriangle className="w-4 h-4 mr-2 text-primary" /> Critical Issues Observed</Label>
                        <Textarea value={formData.criticalIssues} onChange={e => updateForm("criticalIssues", e.target.value)} placeholder="List any major issues noticed during walkthrough..." className="bg-gray-50 min-h-[100px] border-gray-200" />
                      </div>
                      <div className="space-y-3">
                        <Label className="flex items-center font-semibold text-gray-700 text-base"><FileText className="w-4 h-4 mr-2 text-primary" /> Additional Remarks</Label>
                        <Textarea value={formData.remarks} onChange={e => updateForm("remarks", e.target.value)} placeholder="Any other observations..." className="bg-gray-50 border-gray-200" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-100">
                  <Button onClick={prevStep} variant="ghost" size="lg" className="h-12 px-6 rounded-xl font-semibold">
                    <ArrowLeft className="mr-2 w-5 h-5" /> Back
                  </Button>
                  <Button onClick={nextStep} size="lg" className="h-12 px-8 rounded-xl font-bold hover:shadow-lg transition-all group shadow-primary/20">
                    View Results <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 7: RESULTS PAGE */}
        {started && currentStep === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-12 w-full max-w-full">
            
            {/* 7A. Infrastructure Health Score Card */}
            <Card className="shadow-2xl border-none overflow-hidden rounded-2xl bg-[#111111] text-white print-section">
              <CardHeader className="border-b border-white/10 pb-6 pt-8 px-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 bg-gradient-to-b from-primary to-orange-600 h-full" />
                <div className="absolute top-0 right-0 w-96 h-full opacity-5 bg-gradient-to-l from-primary to-transparent" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/20 p-3.5 rounded-xl text-primary border border-primary/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-[#111] bg-primary px-2.5 py-1 rounded uppercase tracking-widest">Results</span>
                      </div>
                      <CardTitle className="text-3xl text-white font-black tracking-tight">Infrastructure Health Score</CardTitle>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-gray-400 text-sm">{formData.hospitalName || "Hospital Assessment"}</p>
                    <p className="text-gray-500 text-xs mt-1">{formData.assessmentDate}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                  
                  {/* Gauge Area */}
                  <div className="flex flex-col items-center justify-center lg:border-r border-white/10 lg:pr-12">
                    <div className="relative w-64 h-64 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full opacity-10" style={{ boxShadow: `0 0 50px 15px ${riskColor}` }} />
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#1f2937" strokeWidth="2.5" />
                        <circle
                          cx="18" cy="18" r="15.9155"
                          fill="none"
                          stroke={riskColor}
                          strokeWidth="2.8"
                          strokeDasharray={`${riskScore} 100`}
                          strokeLinecap="round"
                          className="transition-all duration-1500 ease-out"
                          style={{ filter: `drop-shadow(0 0 6px ${riskColor})` }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-7xl font-black tabular-nums leading-none tracking-tighter" style={{ color: riskColor }}>{riskScore}</span>
                        <span className="text-xs text-gray-500 font-bold tracking-[0.2em] mt-3 uppercase">Score</span>
                        <span className="text-xs text-gray-600 mt-1">out of 100</span>
                      </div>
                    </div>
                    
                    <div 
                      className="mt-8 px-10 py-3 rounded-full font-black text-sm tracking-widest border-2 uppercase shadow-lg text-center"
                      style={{ borderColor: riskColor, color: riskColor, backgroundColor: `${riskColor}15`, boxShadow: `0 4px 20px -5px ${riskColor}40` }}
                    >
                      {riskGrade}
                    </div>
                    
                    <p className="text-base text-center text-gray-300 mt-6 max-w-[280px] leading-relaxed font-medium">
                      {riskGrade === "Low Risk" && "Your hospital has a strong IT foundation. A few proactive improvements in monitoring and preventive maintenance can further strengthen operational reliability."}
                      {riskGrade === "Moderate Risk" && "Your hospital has a functional IT environment, but improvements in backup systems and monitoring will significantly enhance reliability and operational continuity."}
                      {riskGrade === "High Risk" && "Your hospital's IT infrastructure shows significant gaps in security and reliability. Immediate action is required to prevent operational disruptions."}
                      {riskGrade === "Critical Risk" && "Your hospital's IT systems are at high risk of downtime, data loss, and security incidents. Urgent intervention by a qualified IT partner is strongly recommended."}
                    </p>
                  </div>

                  {/* Breakdown Bars */}
                  <div className="lg:col-span-2 flex flex-col justify-center space-y-8">
                    <div>
                      <h4 className="text-sm font-black text-gray-300 uppercase tracking-[0.15em] border-b border-white/10 pb-3 mb-6">Risk Category Breakdown</h4>
                      <div className="space-y-7">
                        {[
                          { label: "Network Security", val: breakdown.network, max: 45 },
                          { label: "Backup & Recovery", val: breakdown.backup, max: 18 },
                          { label: "Data Security", val: breakdown.data, max: 26 },
                          { label: "Infrastructure", val: breakdown.infrastructure, max: 22 },
                          { label: "Support & Monitoring", val: breakdown.support, max: 20 },
                        ].map((item) => {
                          const pct = Math.min(100, Math.round((item.val / item.max) * 100)) || 0;
                          const barColor = pct > 70 ? '#DC2626' : pct > 40 ? '#F97316' : '#F59E0B';
                          return (
                            <div key={item.label} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-200 font-bold">{item.label}</span>
                                <span className="text-gray-400 font-mono font-medium">{pct}%</span>
                              </div>
                              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full transition-all duration-1000 ease-out relative" 
                                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                                >
                                  <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)', backgroundSize: '1rem 1rem' }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                </div>
              </CardContent>
            </Card>

            {/* 7B. Key Infrastructure Observations Card */}
            <Card className="shadow-lg border-none rounded-2xl bg-white overflow-hidden print-section">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <Info className="w-6 h-6 text-primary" /> Key Infrastructure Observations
                </CardTitle>
                <CardDescription className="text-base text-gray-600 mt-1">
                  Based on your assessment responses, here are our key findings:
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {observations.length > 0 ? (
                  <div className="space-y-4">
                    {observations.map((obs, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100 transition-colors hover:bg-orange-50">
                        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-gray-800 font-medium leading-relaxed">{obs}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-6 rounded-xl bg-green-50 border border-green-100">
                    <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
                    <p className="text-green-800 font-medium text-lg">No critical observations at this time. Your environment shows a solid IT foundation.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 7C. Recommended Actions Card */}
            {actions.length > 0 && (
              <Card className="shadow-lg border-none rounded-2xl bg-white overflow-hidden print-section">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <Clipboard className="w-6 h-6 text-primary" /> Recommended Actions
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 mt-1">
                    Prioritized steps to mitigate identified risks
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {actions.map((action, idx) => (
                      <div key={idx} className="border border-gray-200 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                          action.priority === 'CRITICAL' ? 'bg-red-600' : 
                          action.priority === 'HIGH' ? 'bg-orange-500' : 
                          action.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                        }`} />
                        <div className="flex justify-between items-start mb-3 pl-3">
                          <h4 className="font-bold text-gray-900 pr-4">{action.title}</h4>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${
                            action.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                            action.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 
                            action.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {action.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 pl-3 leading-relaxed">{action.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 7D. MSP Package Recommendation Card */}
            <Card className="shadow-lg border-none rounded-2xl bg-white overflow-hidden print-section">
              <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-8 py-6 text-center">
                <CardTitle className="text-2xl font-black text-gray-900">Recommended Support Model for This Hospital</CardTitle>
                <CardDescription className="text-base text-gray-600 mt-2 max-w-2xl mx-auto">
                  Based on the ZENYX Care IT Check results, the following support model is recommended to ensure reliable IT operations and security.
                </CardDescription>
                {formData.hospitalName && (
                  <div className="mt-4 inline-block bg-primary/10 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg text-primary border border-primary/20">
                    Based on assessment score of <span className="font-black">{riskScore}/100</span>, ZENYX recommends the <span className="font-black">{recommendedPackage}</span> for {formData.hospitalName}.
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Package 1 */}
                  <div className={`rounded-xl border-2 p-6 flex flex-col h-full transition-all duration-300 ${recommendedPackage === 'Monitoring Package' ? 'border-primary bg-orange-50/30 shadow-md transform scale-[1.02]' : 'border-gray-200 bg-white opacity-60 hover:opacity-100'}`}>
                    {recommendedPackage === 'Monitoring Package' && (
                      <div className="bg-primary text-white text-xs font-bold uppercase tracking-wider text-center py-1 -mt-6 -mx-6 mb-6 rounded-t-lg">Recommended</div>
                    )}
                    <h3 className="text-lg font-black text-gray-900 mb-2">Monitoring Package</h3>
                    <p className="text-sm text-gray-500 mb-6 flex-grow">Essential proactive monitoring for stable environments.</p>
                    <ul className="space-y-3 mb-8 text-sm text-gray-700">
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> 24/7 Network Monitoring</li>
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> Server Health Checks</li>
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> Basic Remote Support</li>
                    </ul>
                  </div>

                  {/* Package 2 */}
                  <div className={`rounded-xl border-2 p-6 flex flex-col h-full transition-all duration-300 ${recommendedPackage === 'Support Package' ? 'border-primary bg-orange-50/30 shadow-md transform scale-[1.02]' : 'border-gray-200 bg-white opacity-60 hover:opacity-100'}`}>
                    {recommendedPackage === 'Support Package' && (
                      <div className="bg-primary text-white text-xs font-bold uppercase tracking-wider text-center py-1 -mt-6 -mx-6 mb-6 rounded-t-lg">Recommended</div>
                    )}
                    <h3 className="text-lg font-black text-gray-900 mb-2">Support Package</h3>
                    <p className="text-sm text-gray-500 mb-6 flex-grow">Comprehensive IT support with monitoring and proactive maintenance.</p>
                    <ul className="space-y-3 mb-8 text-sm text-gray-700">
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> Everything in Monitoring</li>
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> Unlimited Remote Support</li>
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> Patch Management</li>
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> Scheduled On-site Visits</li>
                    </ul>
                  </div>

                  {/* Package 3 */}
                  <div className={`rounded-xl border-2 p-6 flex flex-col h-full transition-all duration-300 ${recommendedPackage === 'Security Package' ? 'border-primary bg-orange-50/30 shadow-md transform scale-[1.02]' : 'border-gray-200 bg-white opacity-60 hover:opacity-100'}`}>
                    {recommendedPackage === 'Security Package' && (
                      <div className="bg-primary text-white text-xs font-bold uppercase tracking-wider text-center py-1 -mt-6 -mx-6 mb-6 rounded-t-lg">Recommended</div>
                    )}
                    <h3 className="text-lg font-black text-gray-900 mb-2">Security Package</h3>
                    <p className="text-sm text-gray-500 mb-6 flex-grow">Maximum protection and compliance for critical healthcare setups.</p>
                    <ul className="space-y-3 mb-8 text-sm text-gray-700">
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> Everything in Support</li>
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> Advanced Endpoint Security</li>
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> Managed Backup & DR</li>
                      <li className="flex items-start"><CheckCircle2 className="w-4 h-4 text-primary mr-2 shrink-0 mt-0.5" /> IT Strategy & VCIO</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7E. What Happens Next? Section */}
            <Card className="shadow-lg border-none rounded-2xl overflow-hidden print-section print:hidden">
              <CardHeader className="bg-[#111111] text-white px-8 py-8 border-b border-white/10">
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <ArrowRight className="w-6 h-6 text-primary" /> What Happens Next?
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2 text-base">
                  Partner with ZENYX IT Infra Solutions for a structured implementation journey
                </CardDescription>
              </CardHeader>
              <CardContent className="bg-white p-8">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-2">
                  {[
                    { icon: "🔍", title: "Detailed Audit", desc: "On-site evaluation of all IT systems and processes." },
                    { icon: "⚙️", title: "Stabilization", desc: "Address critical gaps and optimize core systems." },
                    { icon: "📡", title: "Monitoring", desc: "Deploy real-time visibility across all layers." },
                    { icon: "🛡", title: "Maintenance", desc: "Scheduled visits and proactive health checks." },
                    { icon: "🔐", title: "Governance", desc: "Implement security policies and backup routines." },
                  ].map((step, i, arr) => (
                    <React.Fragment key={i}>
                      <div className="flex flex-col items-center text-center max-w-[160px] group">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                          {step.icon}
                        </div>
                        <h5 className="font-bold text-gray-900 text-sm mb-2">{i + 1}. {step.title}</h5>
                        <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="hidden lg:block text-primary/40">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                      )}
                      {i < arr.length - 1 && (
                        <div className="block lg:hidden text-primary/40 my-2 transform rotate-90">
                          <ArrowRight className="w-6 h-6" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                
                <div className="mt-12 bg-orange-50 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between border border-orange-100">
                  <div>
                    <h4 className="text-lg font-black text-gray-900 mb-1">Ready to take the next step?</h4>
                    <p className="text-sm text-gray-600">Secure your hospital's IT infrastructure today.</p>
                  </div>
                  <Button size="lg" className="mt-4 md:mt-0 font-bold px-8 h-12 rounded-xl hover:shadow-lg transition-all group">
                    Contact ZENYX IT Infra Solutions <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 7F. Executive Summary Report (Print Only / Optional viewing) */}
            {formData.hospitalName && (
              <Card className="shadow-sm border-2 border-gray-200 rounded-xl bg-white overflow-hidden print:block hidden print-section break-before-page">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl">ZENYX Care IT Check — Executive Summary</CardTitle>
                      <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                    </div>
                    <img src="/zenyx-logo-nobg.png" alt="ZENYX" className="h-8" style={{ filter: 'brightness(0)' }} />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div><span className="font-semibold text-gray-500">Hospital:</span> {formData.hospitalName}</div>
                    <div><span className="font-semibold text-gray-500">Contact:</span> {formData.contactPerson} ({formData.designation})</div>
                    <div><span className="font-semibold text-gray-500">Location:</span> {formData.location}</div>
                    <div><span className="font-semibold text-gray-500">Assessor:</span> {formData.assessedBy}</div>
                  </div>
                  
                  <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: `${riskColor}15`, border: `1px solid ${riskColor}40` }}>
                    <h3 className="font-bold text-lg mb-2" style={{ color: riskColor }}>Overall Risk: {riskGrade} (Score: {riskScore}/100)</h3>
                    <p className="text-sm text-gray-700">
                      Based on the assessment, the recommended action path is the <strong>{recommendedPackage}</strong> to stabilize and secure operations.
                    </p>
                  </div>

                  <h3 className="font-bold text-md border-b pb-2 mb-3">Key Responses</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6">
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

            {/* 7G. Action Buttons Row */}
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

      {/* FOOTER */}
      <footer className="mt-auto py-8 bg-[#111111] text-center print:hidden shrink-0 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-gray-400 font-bold tracking-widest text-sm mb-3">ZENYX IT Infra Solutions</p>
          <p className="text-primary text-xs uppercase tracking-widest font-semibold mb-6">Reliable IT Infrastructure for Critical Healthcare Environments</p>
          <div className="h-px w-24 bg-white/10 mx-auto mb-6" />
          <p className="text-xs text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Disclaimer: This assessment provides a preliminary overview of healthcare IT infrastructure readiness and improvement opportunities. It is not a substitute for a comprehensive technical audit.
          </p>
        </div>
      </footer>
    </div>
  );
}
