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
  const [step1Error, setStep1Error] = useState(false);
  const [leadData, setLeadData] = useState({ name: "", mobile: "", email: "" });

  const [formData, setFormData] = useState({
    hospitalName: "",
    hospitalType: "",
    designation: "",
    designationOther: "",
    mobileNumber: "",
    email: "",
    computers: "",
    beds: "",
    branches: "",
    location: "",
    servers: "",
    internetRedundancy: "",
    downtime: "",
    wifiQuality: "",
    downtimeAreas: "",
    wifiAcrossDepts: "",
    connectivityImpact: "",
    imagingReliability: "",
    fileTransfer: "",
    reportDelay: "",
    systemSlowdown: "",
    staffDelays: "",
    systemAvailability: "",
    departmentComplaints: "",
    itDelaysPatientCare: "",
    recordsAccess: "",
    endpointSecurity: "",
    firewall: "",
    accessControl: "",
    backupSystem: "",
    backupTesting: "",
    serverMonitoring: "",
    backupPriority: "",
    monitoringWanted: "",
    downtimeImpact: "",
    itVisibility: "",
    dataConfidence: "",
    serverMonitoringDepth: "",
    firewallMonitoring: "",
    patchManagement: "",
    recoveryTesting: "",
    upgradeRoadmap: "",
    deviceTracking: "",
    maintenanceCoverage: "",
    ups: "",
    cablingQuality: "",
    rackManagement: "",
    nas: "",
    itSupport: "",
    cctvIntegrated: "",
    centralMonitoring: "",
    criticalDevicePower: "",
    medicalDeviceIssues: "",
    biomedicITCoordination: "",
    recurringIssues: "",
    itChallenges: "",
    futureGoals: "",
    networkObservations: "",
    securityObservations: "",
    infrastructureObservations: "",
    assessmentDate: new Date().toISOString().split("T")[0],
  });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fd = formData as Record<string, string>;

  const LARGE_HOSPITAL_TYPES = ["Multi-speciality Hospital", "Super Speciality Hospital", "Medical College Hospital"];
  const isLargeHospital = LARGE_HOSPITAL_TYPES.includes(formData.hospitalType);
  const isDiagnostic = formData.hospitalType === "Diagnostic Centre";
  const isClinic = ["Clinic", "Daycare / Small Hospital", "Nursing Home", "IVF / Fertility Centre", "Dental Hospital / Clinic", "Eye Hospital / Clinic"].includes(formData.hospitalType);

  const isOwner = formData.designation === "Hospital Owner / Director";
  const isITHead = ["IT Head / IT Manager", "System Administrator"].includes(formData.designation);
  const isOperations = formData.designation === "Operations Manager";
  const isDoctor = formData.designation === "Doctor / Department Head";
  const isProcurement = formData.designation === "Purchase / Procurement";
  const isBiomedical = formData.designation === "Biomedical Engineer";

  const showFrequentDowntimeFollowUp = ["Frequently", "Weekly"].includes(formData.downtime);
  const showBackupPriority = ["No", "Not sure"].includes(formData.backupSystem);
  const showMonitoringWanted = formData.serverMonitoring === "No";

  const step1Valid = !!(
    formData.hospitalName.trim() &&
    formData.hospitalType &&
    formData.designation &&
    formData.mobileNumber.trim() &&
    formData.email.trim() &&
    formData.computers.trim()
  );

  const { riskScore, riskGrade, riskColor, riskBadge, riskMessage, actions, breakdown } = useMemo(() => {
    let score = 0;
    const rules: Record<string, Record<string, number>> = {
      firewall: { "No": 20, "Don't know": 12, "Yes": 0 },
      backupSystem: { "No": 18, "Partial / selected systems": 8, "Daily automatic": 0, "Not sure": 10 },
      internetRedundancy: { "Single ISP": 10, "No backup internet": 15, "Dual ISP": 0, "Don't know": 12 },
      downtime: { "Frequently": 20, "Weekly": 12, "Monthly": 6, "Rarely": 2, "Never": 0 },
      serverMonitoring: { "No": 10, "Don't know": 6, "Partial alerts": 4, "Yes": 0 },
      endpointSecurity: { "No": 10, "Partial": 5, "Yes": 0, "Not sure": 6 },
      accessControl: { "No": 8, "Partial": 4, "Yes": 0, "Not sure": 5 },
      backupTesting: { "Never tested": 10, "Rarely tested": 5, "Regularly tested": 0, "Not sure": 7 },
      wifiQuality: { "Frequently unstable": 5, "Stable in some areas": 2, "Stable everywhere": 0 },
      cablingQuality: { "Poor": 5, "Average": 2, "Good": 0, "Don't know": 3 },
      rackManagement: { "Poor": 4, "Average": 2, "Well organised": 0, "Don't know": 3 },
      ups: { "No": 8, "Partial": 4, "Yes": 0 },
      itSupport: { "No proper support": 10, "Vendor on call": 4, "In-house IT team": 0 },
    };

    const breakdownScores = { network: 0, backup: 0, infrastructure: 0, support: 0, data: 0 };

    const addScore = (field: string, category: keyof typeof breakdownScores) => {
      const val = fd[field];
      if (val && rules[field]?.[val] !== undefined) {
        const s = rules[field][val];
        score += s;
        breakdownScores[category] += s;
      }
    };

    addScore("firewall", "network");
    addScore("internetRedundancy", "network");
    addScore("downtime", "network");
    addScore("wifiQuality", "network");
    addScore("backupSystem", "backup");
    addScore("backupTesting", "backup");
    addScore("serverMonitoring", "support");
    addScore("itSupport", "support");
    addScore("endpointSecurity", "data");
    addScore("accessControl", "data");
    addScore("cablingQuality", "infrastructure");
    addScore("rackManagement", "infrastructure");
    addScore("ups", "infrastructure");

    const maxScore = 140;
    const normalizedScore = Math.min(100, Math.round((score / maxScore) * 100));

    let grade = "Optimised Infrastructure";
    let color = "#22C55E";
    let badge = "Low Risk";
    let message = "Your hospital IT environment is well-managed. Continue with proactive monitoring and governance to maintain this standard.";

    if (normalizedScore > 25) {
      grade = "Needs Optimisation"; color = "#F59E0B"; badge = "Moderate Risk";
      message = "Core systems are functional, but gaps in backup, monitoring, or security may quietly increase risk over time.";
    }
    if (normalizedScore > 50) {
      grade = "Operational Risk Areas"; color = "#F97316"; badge = "High Risk";
      message = "Multiple infrastructure and process gaps are raising the risk of downtime, data loss, and disrupted patient workflows.";
    }
    if (normalizedScore > 75) {
      grade = "Critical Infrastructure Gaps"; color = "#DC2626"; badge = "Critical Risk";
      message = "Immediate action is required. Your hospital is exposed to significant risk of downtime, data loss, and operational disruption.";
    }

    const generatedActions: { title: string; priority: string; desc: string }[] = [];

    if (formData.firewall === "No") generatedActions.push({ title: "Deploy an Enterprise-Grade Firewall", priority: "CRITICAL", desc: "Your hospital network is currently unprotected from external threats. A managed firewall is the first line of defence for patient data, billing systems, and clinical applications." });
    if (formData.backupSystem === "No") generatedActions.push({ title: "Implement a Centralised Backup System", priority: "CRITICAL", desc: "Without a reliable backup, a single hardware failure or ransomware incident could result in permanent loss of patient records and operational data." });
    if (formData.itSupport === "No proper support") generatedActions.push({ title: "Engage a Structured Managed IT Support Partner", priority: "CRITICAL", desc: "Without defined support, IT issues accumulate and downtime extends. A structured MSP partnership ensures predictable response times and proactive maintenance." });
    if (["Single ISP", "No backup internet", "Don't know"].includes(formData.internetRedundancy)) generatedActions.push({ title: "Add a Secondary Internet Connection", priority: "HIGH", desc: "Single-ISP environments are a single point of failure. A secondary link ensures billing, labs, and administrative systems stay connected when the primary fails." });
    if (["Frequently", "Weekly"].includes(formData.downtime)) generatedActions.push({ title: "Deploy 24/7 Network Monitoring & Alerting", priority: "HIGH", desc: "Frequent downtime indicates your infrastructure needs active monitoring. Real-time alerts allow issues to be resolved before they impact clinical and administrative workflows." });
    if (["No", "Don't know"].includes(formData.serverMonitoring)) generatedActions.push({ title: "Enable Proactive Server & Network Monitoring", priority: "HIGH", desc: "Your servers and network devices are operating without visibility. Proactive monitoring allows issues to be identified and addressed before they escalate into outages." });
    if (["No", "Not sure"].includes(formData.endpointSecurity)) generatedActions.push({ title: "Roll Out Managed Endpoint Protection", priority: "HIGH", desc: "Every unprotected workstation is a potential entry point for malware and ransomware. Managed endpoint security ensures all computers are consistently protected." });
    if (formData.ups === "No") generatedActions.push({ title: "Install UPS and Power Backup for Critical Systems", priority: "HIGH", desc: "Power-related failures can corrupt data and damage servers. UPS coverage for core IT systems is a foundational investment in operational continuity." });
    if (["No", "Not sure"].includes(formData.accessControl)) generatedActions.push({ title: "Establish Role-Based Access Control", priority: "MEDIUM", desc: "Unmanaged access increases the risk of internal data exposure and makes incident investigation far more difficult." });
    if (["Never tested", "Not sure"].includes(formData.backupTesting)) generatedActions.push({ title: "Implement Regular Backup Recovery Testing", priority: "MEDIUM", desc: "Untested backups frequently fail when needed most. A regular recovery testing schedule ensures your backup investment is actually reliable." });
    if (formData.cablingQuality === "Poor") generatedActions.push({ title: "Carry Out a Structured Cabling Audit & Remediation", priority: "MEDIUM", desc: "Poor cabling contributes to intermittent network faults and slows troubleshooting. Structured remediation improves network stability and positions the facility for future upgrades." });
    if (formData.wifiQuality === "Frequently unstable") generatedActions.push({ title: "Redesign Wi-Fi Coverage Across All Departments", priority: "MEDIUM", desc: "Reliable wireless connectivity is essential for clinical mobility, device integration, and staff productivity across wards, OPD, and labs." });
    if (["Poor", "Don't know"].includes(formData.rackManagement)) generatedActions.push({ title: "Organise Server Room, Racks & Patch Documentation", priority: "LOW", desc: "Disorganised racks slow every maintenance task and increase the risk of accidental disconnections. Proper organisation and labelling are foundational housekeeping." });

    return { riskScore: normalizedScore, riskGrade: grade, riskColor: color, riskBadge: badge, riskMessage: message, actions: generatedActions.slice(0, 10), breakdown: breakdownScores };
  }, [formData]);

  const recommendedPackage = useMemo(() => {
    if (riskScore <= 25) return "Monitoring Package";
    if (riskScore <= 55) return "Support Package";
    return "Security Package";
  }, [riskScore]);

  const getObservations = () => {
    const obs: string[] = [];
    if (formData.firewall === "No") obs.push("No firewall is protecting your hospital's internet connection. This exposes all connected systems — including patient data, billing, and clinical networks — to external threats. This is a high-priority gap.");
    if (formData.backupSystem === "No") obs.push("No centralised backup system is in place. In the event of server failure, ransomware, or accidental deletion, your hospital data may not be recoverable. Backup readiness is a foundational requirement for any healthcare facility.");
    if (["No", "Don't know"].includes(formData.serverMonitoring)) obs.push("Servers and network devices are not being proactively monitored. Issues are likely being discovered after they have already impacted operations. Proactive monitoring is the difference between a 5-minute alert and a 2-hour outage.");
    if (formData.internetRedundancy === "Single ISP") obs.push("Your facility is operating on a single internet connection with no redundancy. A single ISP failure can immediately halt billing, lab systems, and patient record access. A secondary connection provides continuity when the primary fails.");
    if (["No backup internet", "Don't know"].includes(formData.internetRedundancy)) obs.push("Internet connectivity setup and redundancy status are unclear. Without documented connectivity architecture, planning for reliability or failover becomes difficult. A connectivity audit is recommended.");
    if (["No", "Not sure"].includes(formData.endpointSecurity)) obs.push("Workstations do not have reliable endpoint protection. Unprotected computers in a hospital environment are a common entry point for ransomware and data theft — both of which can be operationally catastrophic.");
    if (["No", "Not sure"].includes(formData.accessControl)) obs.push("User access and system permissions are not structured by role or department. Unmanaged access increases the risk of internal data exposure and complicates incident response.");
    if (["Never tested", "Not sure"].includes(formData.backupTesting)) obs.push("Backups have not been tested for successful recovery. Untested backups frequently fail when needed most — making the backup investment unreliable in a real incident.");
    if (formData.ups === "No") obs.push("Critical IT systems are not protected by UPS or power backup. A power fluctuation or outage can damage servers, corrupt databases, and immediately halt hospital operations. Power resilience is a basic infrastructure requirement.");
    if (formData.itSupport === "No proper support") obs.push("There is no structured IT support model in place. When systems fail, unresolved downtime directly impacts billing, clinical staff, and patient care. A defined support model ensures timely response and faster recovery.");
    if (formData.wifiQuality === "Frequently unstable") obs.push("Wi-Fi coverage is unreliable across facility areas. Poor wireless connectivity affects clinical mobility, EMR access, lab communication, and staff productivity — especially in wards, ICU, and OPD areas.");
    if (formData.cablingQuality === "Poor") obs.push("Network cabling is unstructured and poorly organised. Disorganised cabling is a frequent source of physical network faults, makes troubleshooting slower, and signals a facility that lacks structured IT governance.");
    if (["Frequently", "Weekly"].includes(formData.downtime)) obs.push("Frequent or weekly connectivity disruptions are directly impacting hospital operations. Recurring downtime at this frequency typically signals underlying issues with hardware, ISP configuration, or lack of proactive monitoring.");
    return obs;
  };

  const TOTAL_STEPS = 7;
  const steps = [
    { num: 1, title: "Facility Profile" },
    { num: 2, title: "Network" },
    { num: 3, title: "Security & Backup" },
    { num: 4, title: "Infrastructure" },
    { num: 5, title: "IT Challenges" },
    { num: 6, title: "IT Goals" },
    { num: 7, title: "Results" },
  ];

  const startAssessment = () => { setStarted(true); setCurrentStep(1); window.scrollTo(0, 0); };
  const nextStep = () => { if (currentStep < TOTAL_STEPS) { setCurrentStep(p => p + 1); window.scrollTo(0, 0); } };
  const prevStep = () => { if (currentStep > 1) { setCurrentStep(p => p - 1); window.scrollTo(0, 0); } };
  const startNew = () => { setStarted(false); setCurrentStep(0); window.scrollTo(0, 0); };

  const handleStep1Next = () => {
    if (!step1Valid) { setStep1Error(true); return; }
    setStep1Error(false);
    nextStep();
  };

  const RadioGroup = ({ label, helperText, icon: Icon, options, value, onChange, vertical = false }: {
    label: string; helperText?: string; icon: React.ElementType; options: string[]; value: string; onChange: (v: string) => void; vertical?: boolean;
  }) => (
    <div className="space-y-3">
      <div>
        <Label className="flex items-start text-sm font-semibold text-gray-700">
          <Icon className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" /> {label}
        </Label>
        {helperText && <p className="text-xs text-gray-400 mt-1 ml-6 leading-relaxed">{helperText}</p>}
      </div>
      <div className={vertical ? "flex flex-col gap-2" : "grid grid-cols-2 md:grid-cols-4 gap-2"}>
        {options.map((opt) => (
          <div key={opt} onClick={() => onChange(opt)}
            className={`cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 select-none
              ${vertical ? "text-left" : "text-center"}
              ${value === opt ? "border-primary bg-orange-50 text-primary shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/50"}`}>
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
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">Step {stepNum} of {TOTAL_STEPS}</span>
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

  const packages = [
    {
      name: "Monitoring Package", tier: "Foundation",
      subtitle: "Visibility and early warning for hospital IT environments",
      desc: "Designed for facilities with a stable IT foundation. Provides continuous visibility into your network, servers, and connectivity — so issues are identified and addressed before they reach clinical staff.",
      price: "Starting from ₹15,000/month", devicePricing: null,
      features: ["24/7 Network & Internet Monitoring", "Firewall Health Monitoring", "Server Uptime & Performance Monitoring", "Alerts & Escalation Protocol", "Monthly IT Health Report", "Basic Remote Support"],
      bestFor: "Hospitals with stable infrastructure looking for proactive visibility and early warning.",
    },
    {
      name: "Support Package", tier: "Professional",
      subtitle: "Proactive IT support and structured infrastructure upkeep",
      desc: "Built for facilities where gaps exist and IT issues occasionally disrupt operations. Combines visibility with hands-on support — ensuring your team is never left waiting when something fails.",
      price: "Base ₹15,000/month + device pricing",
      devicePricing: "Endpoints ₹300/device · Servers ₹1,500–₹3,000 · Network devices ₹1,500–₹2,500",
      features: ["Everything in Monitoring", "Unlimited Remote IT Support", "Patch & Update Management", "Scheduled On-site Visits", "Incident Response with Defined SLA", "Asset Tracking & Documentation"],
      bestFor: "Hospitals experiencing recurring IT issues who need reliable hands-on support with defined SLAs.",
    },
    {
      name: "Security Package", tier: "Enterprise",
      subtitle: "Advanced protection, resilience, and governance",
      desc: "For facilities with significant infrastructure gaps or recurring operational risk. Delivers a complete managed IT environment — covering security, backup, recovery, and strategic IT oversight.",
      price: "Starting from ₹45,000/month",
      devicePricing: "Final pricing depends on systems, servers, branches, and support scope.",
      features: ["Everything in Support", "Advanced Endpoint Security", "Backup Management & Disaster Recovery", "Security Awareness Support for Staff", "Firewall Policy Review & Hardening", "IT Risk & Governance Advisory"],
      bestFor: "Hospitals with critical infrastructure gaps, high downtime risk, or multi-branch environments.",
    },
  ];

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
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/60">Hospital IT Assessment Platform</span>
                <div className="hidden sm:block h-px w-12 bg-gradient-to-l from-transparent to-primary/40" />
              </div>
              <h1 className="text-xl md:text-2xl lg:text-[1.65rem] font-black text-white tracking-tight leading-tight">ZENYX Hospital IT Health Audit</h1>
              <p className="text-gray-500 text-[11px] mt-1.5 tracking-wide hidden sm:block uppercase">Hospital Infrastructure Risk, Reliability & Technology Assessment</p>
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

      {/* PROGRESS BAR */}
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
                  <img src="/zenyx-icon.png" alt="ZENYX" className="w-16 h-16 mb-6 rounded-xl border border-white/10 shadow-lg shadow-primary/20" onError={(e) => (e.currentTarget.style.display = "none")} />
                  <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight">ZENYX Hospital<br /><span className="text-primary">IT Health Audit</span></h2>
                  <p className="text-sm font-medium text-gray-300 uppercase tracking-widest leading-relaxed mb-4">Hospital Infrastructure Risk, Reliability & Technology Assessment</p>
                  <p className="text-gray-400 text-sm mb-6">Built exclusively for healthcare facilities — hospitals, clinics, diagnostic centres, and nursing homes across India.</p>
                  <div className="mt-auto border-t border-white/10 pt-6">
                    <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Powered by</p>
                    <p className="text-sm font-bold text-white mt-1">ZENYX IT Infra Solutions</p>
                  </div>
                </div>
              </div>
              <div className="lg:w-3/5 p-10 flex flex-col justify-center bg-white">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Know exactly where your hospital IT stands — before something fails.</h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  Every day, hospitals depend on IT to keep patient records accessible, billing running, labs reporting, and clinical staff connected. A single point of failure can affect patient care, revenue, and reputation. This audit gives you a clear, structured picture of your IT environment — and the steps needed to make it reliable.
                </p>
                <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-semibold text-sm mb-8 self-start border border-orange-100">
                  <Clock className="w-4 h-4" /> Estimated time: 3–5 minutes
                </div>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: Building2, label: "Hospital-Specific\nAssessment" },
                    { icon: Activity, label: "Live Risk\nScoring" },
                    { icon: Clipboard, label: "Prioritised\nAction Plan" },
                    { icon: Package, label: "Support Model\nRecommendation" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-gray-50">
                      <div className="bg-primary/10 p-3 rounded-full text-primary"><Icon className="w-5 h-5" /></div>
                      <span className="text-[10px] font-bold text-gray-700 uppercase leading-tight whitespace-pre-line">{label}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={startAssessment} size="lg" className="w-full sm:w-auto self-start text-base h-14 px-8 rounded-xl font-bold hover:shadow-lg transition-all group">
                  Start Free Audit <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-gray-400 font-medium mt-3">No registration required · Free assessment</p>
              </div>
            </Card>
          </div>
        )}

        {/* STEP 1 — Facility Profile */}
        {started && currentStep === 1 && (
          <CardShell icon={Building2} stepNum={1} title="Facility Profile" desc="Basic information about your healthcare facility — used to personalise your assessment and report">
            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Required Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  <div className="space-y-2.5 lg:col-span-2">
                    <Label className="flex items-center text-gray-700 font-semibold">
                      <Building2 className="w-4 h-4 mr-2 text-primary" /> Hospital / Facility Name <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input value={formData.hospitalName} onChange={e => updateForm("hospitalName", e.target.value)} placeholder="e.g. City General Hospital"
                      className={`bg-gray-50 focus-visible:ring-primary h-11 ${step1Error && !formData.hospitalName.trim() ? "border-red-400" : ""}`} />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold">
                      <Layers className="w-4 h-4 mr-2 text-primary" /> Facility Type <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <select value={formData.hospitalType} onChange={e => updateForm("hospitalType", e.target.value)}
                      className={`flex h-11 w-full rounded-lg border border-input bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm ${step1Error && !formData.hospitalType ? "border-red-400" : ""}`}>
                      <option value="">Select facility type...</option>
                      <option value="Multi-speciality Hospital">Multi-speciality Hospital</option>
                      <option value="Single-speciality Hospital">Single-speciality Hospital</option>
                      <option value="Super Speciality Hospital">Super Speciality Hospital</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Diagnostic Centre">Diagnostic Centre</option>
                      <option value="Daycare / Small Hospital">Daycare / Small Hospital</option>
                      <option value="Nursing Home">Nursing Home</option>
                      <option value="Medical College Hospital">Medical College Hospital</option>
                      <option value="IVF / Fertility Centre">IVF / Fertility Centre</option>
                      <option value="Dental Hospital / Clinic">Dental Hospital / Clinic</option>
                      <option value="Eye Hospital / Clinic">Eye Hospital / Clinic</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold">
                      <User className="w-4 h-4 mr-2 text-primary" /> Your Designation / Role <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <select value={formData.designation} onChange={e => updateForm("designation", e.target.value)}
                      className={`flex h-11 w-full rounded-lg border border-input bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm ${step1Error && !formData.designation ? "border-red-400" : ""}`}>
                      <option value="">Select your role...</option>
                      <option value="Hospital Owner / Director">Hospital Owner / Director</option>
                      <option value="IT Head / IT Manager">IT Head / IT Manager</option>
                      <option value="System Administrator">System Administrator</option>
                      <option value="Operations Manager">Operations Manager</option>
                      <option value="Doctor / Department Head">Doctor / Department Head</option>
                      <option value="Purchase / Procurement">Purchase / Procurement</option>
                      <option value="Biomedical Engineer">Biomedical Engineer</option>
                      <option value="Admin Manager">Admin Manager</option>
                      <option value="Other">Other</option>
                    </select>
                    {formData.designation === "Other" && (
                      <Input value={formData.designationOther} onChange={e => updateForm("designationOther", e.target.value)}
                        placeholder="Please specify your role" className="bg-gray-50 focus-visible:ring-primary h-10 mt-2" />
                    )}
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold">
                      <Phone className="w-4 h-4 mr-2 text-primary" /> Mobile Number <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input value={formData.mobileNumber} onChange={e => updateForm("mobileNumber", e.target.value)} placeholder="e.g. 9876543210" type="tel"
                      className={`bg-gray-50 focus-visible:ring-primary h-11 ${step1Error && !formData.mobileNumber.trim() ? "border-red-400" : ""}`} />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold">
                      <Mail className="w-4 h-4 mr-2 text-primary" /> Email Address <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input value={formData.email} onChange={e => updateForm("email", e.target.value)} placeholder="e.g. it@cityhospital.com" type="email"
                      className={`bg-gray-50 focus-visible:ring-primary h-11 ${step1Error && !formData.email.trim() ? "border-red-400" : ""}`} />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold">
                      <Monitor className="w-4 h-4 mr-2 text-primary" /> Computers / Endpoints <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input value={formData.computers} onChange={e => updateForm("computers", e.target.value)} placeholder="e.g. 45" type="number"
                      className={`bg-gray-50 focus-visible:ring-primary h-11 ${step1Error && !formData.computers.trim() ? "border-red-400" : ""}`} />
                  </div>
                </div>
                {step1Error && !step1Valid && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                    Please fill in all required fields marked with * before continuing.
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
                  Additional Details <span className="font-normal lowercase">(optional)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><MapPin className="w-4 h-4 mr-2 text-primary" /> Location / City</Label>
                    <Input value={formData.location} onChange={e => updateForm("location", e.target.value)} placeholder="e.g. Hyderabad" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><Layers className="w-4 h-4 mr-2 text-primary" /> Number of Branches</Label>
                    <Input value={formData.branches} onChange={e => updateForm("branches", e.target.value)} placeholder="e.g. 3" type="number" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><Server className="w-4 h-4 mr-2 text-primary" /> Number of Servers</Label>
                    <Input value={formData.servers} onChange={e => updateForm("servers", e.target.value)} placeholder="e.g. 4" type="number" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="flex items-center text-gray-700 font-semibold"><Users className="w-4 h-4 mr-2 text-primary" /> Number of Beds</Label>
                    <Input value={formData.beds} onChange={e => updateForm("beds", e.target.value)} placeholder="e.g. 100" type="number" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                </div>
              </div>

              <SectionNav onNext={handleStep1Next} nextLabel="Continue to Network Assessment" isFirst />
            </div>
          </CardShell>
        )}

        {/* STEP 2 — Network & Connectivity */}
        {started && currentStep === 2 && (
          <CardShell icon={Wifi} stepNum={2} title="Network & Connectivity" desc="Evaluate your internet reliability, internal network coverage, and the frequency of connectivity disruptions across departments">
            <div className="space-y-10">
              <div className="space-y-8">
                <RadioGroup label="Do you have backup internet connectivity?" helperText="A secondary internet connection ensures your hospital stays online when the primary provider fails." icon={Network}
                  options={["Dual ISP", "Single ISP", "No backup internet", "Don't know"]} value={formData.internetRedundancy} onChange={v => updateForm("internetRedundancy", v)} vertical />
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="How often does IT or network downtime affect daily operations?" helperText="This helps us understand the business impact of current infrastructure gaps." icon={Clock}
                    options={["Never", "Rarely", "Monthly", "Weekly", "Frequently"]} value={formData.downtime} onChange={v => updateForm("downtime", v)} />
                </div>
                {showFrequentDowntimeFollowUp && (
                  <div className="bg-orange-50/40 border border-orange-100 rounded-xl p-5">
                    <RadioGroup label="Which area is most affected by downtime?" icon={AlertTriangle}
                      options={["Billing", "Lab / Diagnostics", "Patient records / HIS", "Wi-Fi / Wireless", "Branch connectivity", "Printing / Peripherals"]}
                      value={formData.downtimeAreas} onChange={v => updateForm("downtimeAreas", v)} vertical />
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Is Wi-Fi stable in all important working areas?" helperText="Unreliable Wi-Fi directly affects clinical mobility, lab systems, and billing workflows." icon={Wifi}
                    options={["Stable everywhere", "Stable in some areas", "Frequently unstable"]} value={formData.wifiQuality} onChange={v => updateForm("wifiQuality", v)} />
                </div>
              </div>

              {isLargeHospital && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Large Hospital — Additional Network Questions</h4>
                  <RadioGroup label="Is Wi-Fi stable across wards, ICU, OPD, labs, and admin areas?" helperText="Coverage gaps in clinical areas can directly impact patient care and staff efficiency." icon={Wifi}
                    options={["Fully stable", "Partial coverage", "Poor coverage"]} value={formData.wifiAcrossDepts} onChange={v => updateForm("wifiAcrossDepts", v)} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Do connectivity issues affect billing, lab, or patient record access?" icon={Activity}
                      options={["Never", "Sometimes", "Frequently"]} value={formData.connectivityImpact} onChange={v => updateForm("connectivityImpact", v)} />
                  </div>
                </div>
              )}

              {isDiagnostic && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Diagnostic Centre — Additional Questions</h4>
                  <RadioGroup label="Do imaging or reporting systems face network delays?" helperText="Network bottlenecks frequently cause delays in PACS, RIS, and report delivery." icon={Monitor}
                    options={["Reliable", "Sometimes delayed", "Frequently delayed"]} value={formData.imagingReliability} onChange={v => updateForm("imagingReliability", v)} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Are large scan or report files transferred smoothly between systems?" icon={HardDrive}
                      options={["Fast", "Moderate", "Slow"]} value={formData.fileTransfer} onChange={v => updateForm("fileTransfer", v)} />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Do server or network issues delay report delivery to patients?" icon={FileText}
                      options={["Never", "Sometimes", "Frequently"]} value={formData.reportDelay} onChange={v => updateForm("reportDelay", v)} />
                  </div>
                </div>
              )}

              {isClinic && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clinic — Additional Questions</h4>
                  <RadioGroup label="Do consultation or billing systems ever become slow or unavailable?" icon={Monitor}
                    options={["Never", "Sometimes", "Often"]} value={formData.systemSlowdown} onChange={v => updateForm("systemSlowdown", v)} />
                </div>
              )}

              {isOperations && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Operations — Additional Questions</h4>
                  <RadioGroup label="Do staff face system delays during peak operational hours?" icon={Clock}
                    options={["Rarely", "Sometimes", "Often"]} value={formData.staffDelays} onChange={v => updateForm("staffDelays", v)} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Are patient records, billing, and admin systems available without interruption?" icon={Database}
                      options={["Usually yes", "Sometimes interrupted", "Frequently interrupted"]} value={formData.systemAvailability} onChange={v => updateForm("systemAvailability", v)} />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Do departments frequently complain about Wi-Fi, slow systems, or downtime?" icon={Users}
                      options={["Rarely", "Sometimes", "Frequently"]} value={formData.departmentComplaints} onChange={v => updateForm("departmentComplaints", v)} />
                  </div>
                </div>
              )}

              {isDoctor && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clinical — Additional Questions</h4>
                  <RadioGroup label="Do IT or system issues ever delay patient care or department work?" icon={AlertTriangle}
                    options={["Never", "Sometimes", "Frequently"]} value={formData.itDelaysPatientCare} onChange={v => updateForm("itDelaysPatientCare", v)} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Is access to reports, records, or systems smooth during working hours?" icon={FileText}
                      options={["Smooth", "Sometimes slow", "Frequently problematic"]} value={formData.recordsAccess} onChange={v => updateForm("recordsAccess", v)} />
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 space-y-3">
                <Label className="flex items-center font-semibold text-gray-700">
                  <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Network Observations
                  <span className="text-xs text-gray-400 font-normal ml-2">(optional — for consultant notes)</span>
                </Label>
                <Textarea value={formData.networkObservations} onChange={e => updateForm("networkObservations", e.target.value)}
                  placeholder="e.g. Internet goes down in the afternoon, Wi-Fi not reaching ICU, billing system hangs during peak hours..."
                  className="bg-gray-50 border-gray-200 min-h-[80px]" />
              </div>

              <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="Next: Security & Backup" />
            </div>
          </CardShell>
        )}

        {/* STEP 3 — Security & Data Protection */}
        {started && currentStep === 3 && (
          <CardShell icon={Shield} stepNum={3} title="Security & Data Protection" desc="Assess the protection in place for hospital data, patient records, and critical systems — including backup reliability and endpoint security">
            <div className="space-y-10">
              <div className="space-y-8">
                <RadioGroup label="Do all computers have antivirus or endpoint security installed?" helperText="Unprotected workstations are the most common entry point for ransomware in hospitals." icon={Shield}
                  options={["Yes", "Partial", "No", "Not sure"]} value={formData.endpointSecurity} onChange={v => updateForm("endpointSecurity", v)} />
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Is there a firewall protecting your internet connection and internal network?" helperText="A firewall is the primary defence between your hospital network and external threats." icon={Lock}
                    options={["Yes", "No", "Don't know"]} value={formData.firewall} onChange={v => updateForm("firewall", v)} />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Is access to systems controlled based on staff roles and departments?" helperText="Role-based access control prevents unauthorised staff from accessing sensitive patient data." icon={Lock}
                    options={["Yes", "Partial", "No", "Not sure"]} value={formData.accessControl} onChange={v => updateForm("accessControl", v)} />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Backup & Recovery</h4>
                <RadioGroup label="Is hospital data backed up automatically and regularly?" helperText="Data backups protect against server failure, ransomware, and accidental deletion." icon={Database}
                  options={["Daily automatic", "Partial / selected systems", "No", "Not sure"]} value={formData.backupSystem} onChange={v => updateForm("backupSystem", v)} vertical />
                {showBackupPriority && (
                  <div className="bg-orange-50/40 border border-orange-100 rounded-xl p-5">
                    <RadioGroup label="Would backup and recovery planning be a priority for your facility?" icon={Target}
                      options={["Yes, high priority", "Maybe", "Not at this time"]} value={formData.backupPriority} onChange={v => updateForm("backupPriority", v)} />
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Are backups tested to confirm successful recovery is possible?" helperText="Untested backups frequently fail when needed most. This is a critical but often overlooked step." icon={CheckCircle2}
                    options={["Regularly tested", "Rarely tested", "Never tested", "Not sure"]} value={formData.backupTesting} onChange={v => updateForm("backupTesting", v)} vertical />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monitoring & Alerting</h4>
                <RadioGroup label="Do you get alerts when servers, internet, or key systems go down?" helperText="Proactive alerts allow your team to respond before downtime affects hospital operations." icon={Activity}
                  options={["Yes", "Partial alerts", "No", "Don't know"]} value={formData.serverMonitoring} onChange={v => updateForm("serverMonitoring", v)} />
                {showMonitoringWanted && (
                  <div className="bg-orange-50/40 border border-orange-100 rounded-xl p-5">
                    <RadioGroup label="Would you like proactive alerts when internet, servers, or firewall issues happen?" icon={Activity}
                      options={["Yes, this would be valuable", "Maybe", "Not a priority right now"]} value={formData.monitoringWanted} onChange={v => updateForm("monitoringWanted", v)} vertical />
                  </div>
                )}
              </div>

              {isOwner && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Leadership Perspective</h4>
                  <RadioGroup label="Has IT downtime affected patient service, billing, or operations in the past year?" icon={AlertTriangle}
                    options={["Never", "Occasionally", "Multiple times"]} value={formData.downtimeImpact} onChange={v => updateForm("downtimeImpact", v)} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Do you currently receive regular reports or visibility on IT health status?" helperText="Decision-makers need periodic IT health summaries to manage risk proactively." icon={FileText}
                      options={["Yes, regularly", "Occasionally", "No"]} value={formData.itVisibility} onChange={v => updateForm("itVisibility", v)} />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Are you confident that hospital data is secure and recoverable in an emergency?" icon={Database}
                      options={["Very confident", "Some concerns", "Not confident"]} value={formData.dataConfidence} onChange={v => updateForm("dataConfidence", v)} />
                  </div>
                </div>
              )}

              {isITHead && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">IT Operations</h4>
                  <RadioGroup label="Are servers monitored for CPU, memory, storage, and downtime metrics?" icon={Server}
                    options={["Yes", "Partial", "No"]} value={formData.serverMonitoringDepth} onChange={v => updateForm("serverMonitoringDepth", v)} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Are firewalls, internet links, and switches proactively monitored for health and performance?" icon={Network}
                      options={["Yes", "Partial", "No"]} value={formData.firewallMonitoring} onChange={v => updateForm("firewallMonitoring", v)} />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Are patches and security updates applied regularly across all systems?" icon={Shield}
                      options={["Yes, all systems", "Some systems only", "Irregularly"]} value={formData.patchManagement} onChange={v => updateForm("patchManagement", v)} />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Is backup recovery testing conducted on a regular schedule?" icon={CheckCircle2}
                      options={["Yes", "Rarely", "Never"]} value={formData.recoveryTesting} onChange={v => updateForm("recoveryTesting", v)} />
                  </div>
                </div>
              )}

              {isProcurement && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Procurement & Planning</h4>
                  <RadioGroup label="Is there a structured IT upgrade roadmap for the next 12–24 months?" icon={TrendingUp}
                    options={["Yes", "In discussion", "No"]} value={formData.upgradeRoadmap} onChange={v => updateForm("upgradeRoadmap", v)} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Are devices, servers, and network equipment tracked for lifecycle and replacement planning?" icon={Monitor}
                      options={["Yes", "Partial", "No"]} value={formData.deviceTracking} onChange={v => updateForm("deviceTracking", v)} />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Is there annual IT support or maintenance coverage in place?" icon={Package}
                      options={["Yes", "Partial", "No"]} value={formData.maintenanceCoverage} onChange={v => updateForm("maintenanceCoverage", v)} />
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 space-y-3">
                <Label className="flex items-center font-semibold text-gray-700">
                  <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Security Observations
                  <span className="text-xs text-gray-400 font-normal ml-2">(optional)</span>
                </Label>
                <Textarea value={formData.securityObservations} onChange={e => updateForm("securityObservations", e.target.value)}
                  placeholder="e.g. No centralised backup, antivirus not updated on all systems, no monitoring tools..."
                  className="bg-gray-50 border-gray-200 min-h-[80px]" />
              </div>

              <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="Next: Physical Infrastructure" />
            </div>
          </CardShell>
        )}

        {/* STEP 4 — Physical Infrastructure */}
        {started && currentStep === 4 && (
          <CardShell icon={Settings} stepNum={4} title="Physical Infrastructure" desc="Review the condition of your server room, power backup, cabling, storage systems, and current IT support arrangement">
            <div className="space-y-10">
              <div className="space-y-8">
                <RadioGroup label="Do critical systems have power backup — UPS or generator protection?" helperText="Power failures can damage servers, corrupt databases, and immediately halt hospital operations." icon={Zap}
                  options={["Yes", "Partial", "No"]} value={formData.ups} onChange={v => updateForm("ups", v)} />
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="How is the overall LAN cabling health and organisation across your facility?" helperText="Disorganised cabling is a frequent source of intermittent network faults and slow troubleshooting." icon={Network}
                    options={["Good", "Average", "Poor", "Don't know"]} value={formData.cablingQuality} onChange={v => updateForm("cablingQuality", v)} />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="What is your current IT support model?" icon={Users}
                    options={["In-house IT team", "Vendor on call", "No proper support"]} value={formData.itSupport} onChange={v => updateForm("itSupport", v)} vertical />
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <RadioGroup label="Is centralised NAS or dedicated storage available for critical data?" icon={HardDrive}
                    options={["Yes", "No", "Planned"]} value={formData.nas} onChange={v => updateForm("nas", v)} />
                </div>
              </div>

              {isLargeHospital && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Server Room & Rack Infrastructure</h4>
                  <RadioGroup label="What is the condition of your server room and network rack setup?" helperText="A well-organised server room reduces failure risk and speeds up troubleshooting significantly." icon={Server}
                    options={["Well organised", "Average", "Poor / disorganised", "Don't know"]} value={formData.rackManagement} onChange={v => updateForm("rackManagement", v)} vertical />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Are branch or department systems centrally monitored?" icon={Monitor}
                      options={["Yes", "Partial", "No"]} value={formData.centralMonitoring} onChange={v => updateForm("centralMonitoring", v)} />
                  </div>
                </div>
              )}

              {isBiomedical && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Medical Equipment & IT Integration</h4>
                  <RadioGroup label="Do connected medical devices face network or data-sharing issues?" icon={Activity}
                    options={["Never", "Sometimes", "Frequently"]} value={formData.medicalDeviceIssues} onChange={v => updateForm("medicalDeviceIssues", v)} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Is there coordination between biomedical equipment and IT / network support teams?" icon={Users}
                      options={["Strong coordination", "Some coordination", "Weak / no coordination"]} value={formData.biomedicITCoordination} onChange={v => updateForm("biomedicITCoordination", v)} vertical />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Are critical connected devices supported by stable power and network availability?" icon={Zap}
                      options={["Yes", "Partial", "No"]} value={formData.criticalDevicePower} onChange={v => updateForm("criticalDevicePower", v)} />
                  </div>
                </div>
              )}

              {isDoctor && (
                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clinical Operations</h4>
                  <RadioGroup label="Are there recurring issues with printers, systems, or connectivity in your department?" icon={AlertTriangle}
                    options={["No", "Sometimes", "Often"]} value={formData.recurringIssues} onChange={v => updateForm("recurringIssues", v)} />
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 space-y-3">
                <Label className="flex items-center font-semibold text-gray-700">
                  <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Infrastructure Observations
                  <span className="text-xs text-gray-400 font-normal ml-2">(optional)</span>
                </Label>
                <Textarea value={formData.infrastructureObservations} onChange={e => updateForm("infrastructureObservations", e.target.value)}
                  placeholder="e.g. Server room not air-conditioned, cables unorganised, no UPS for billing computers..."
                  className="bg-gray-50 border-gray-200 min-h-[80px]" />
              </div>

              <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="Next: IT Challenges" />
            </div>
          </CardShell>
        )}

        {/* STEP 5 — Day-to-Day IT Challenges */}
        {started && currentStep === 5 && (
          <CardShell icon={AlertTriangle} stepNum={5} title="Day-to-Day IT Challenges" desc="Help us understand the recurring IT issues that affect hospital staff, patient workflows, and daily operations">
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Why this matters:</strong> Your day-to-day IT pain points help ZENYX prioritise the improvements with the highest operational impact — rather than applying a generic solution.
              </div>
              <div className="space-y-3">
                <Label className="flex items-center font-semibold text-gray-700 text-base">
                  <Target className="w-5 h-5 mr-2 text-primary" /> What day-to-day IT issues are affecting your hospital operations?
                </Label>
                <Textarea value={formData.itChallenges} onChange={e => updateForm("itChallenges", e.target.value)}
                  placeholder="Examples: HIS slow, billing interruptions, weak Wi-Fi in wards/ICU, lab or report delays, server downtime, branch disconnections, printer/network issues, EMR crashes..."
                  className="bg-gray-50 border-gray-200 min-h-[220px] text-base leading-relaxed" />
                <p className="text-xs text-gray-400">Be as specific as possible — this directly shapes the quality of your recommendations.</p>
              </div>
            </div>
            <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="Next: IT Goals" />
          </CardShell>
        )}

        {/* STEP 6 — IT Improvement Goals */}
        {started && currentStep === 6 && (
          <CardShell icon={TrendingUp} stepNum={6} title="IT Improvement Goals" desc="Share where you want your hospital IT infrastructure to be in the next 6–12 months — this shapes your personalised roadmap">
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-gray-700 leading-relaxed">
                <strong className="text-gray-900">Shaping your roadmap:</strong> Your goals help ZENYX design a support model and implementation plan that aligns with where your hospital is heading — not just where it is today.
              </div>
              <div className="space-y-3">
                <Label className="flex items-center font-semibold text-gray-700 text-base">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" /> What improvements would you like to achieve in your hospital IT environment over the next 6–12 months?
                </Label>
                <Textarea value={formData.futureGoals} onChange={e => updateForm("futureGoals", e.target.value)}
                  placeholder="Examples: zero downtime for critical systems, better Wi-Fi coverage, stronger backup readiness, centralised monitoring, branch connectivity, stronger security, structured support model..."
                  className="bg-gray-50 border-gray-200 min-h-[220px] text-base leading-relaxed" />
                <p className="text-xs text-gray-400">Your input will be used to personalise the recommendations and implementation roadmap in the results section.</p>
              </div>
            </div>
            <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="View My Results" />
          </CardShell>
        )}

        {/* STEP 7 — RESULTS */}
        {started && currentStep === 7 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8 pb-12 w-full">

            {/* Hospital IT Health Score */}
            <Card className="shadow-sm border border-gray-200 overflow-hidden rounded-2xl bg-white print-section">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b border-gray-100 pb-5 pt-7 px-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary"><Activity className="w-6 h-6" /></div>
                    <div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-wider">Results</span>
                      <CardTitle className="text-2xl text-gray-900 font-black tracking-tight mt-1">Hospital IT Health Score</CardTitle>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-gray-700 text-sm font-semibold">{formData.hospitalName || "Hospital Assessment"}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{formData.assessmentDate}</p>
                    {formData.designation && <p className="text-gray-400 text-xs mt-0.5">{formData.designation}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center justify-start lg:border-r border-gray-100 lg:pr-8">
                    <div className="relative w-52 h-52 flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F3F4F6" strokeWidth="2.8" />
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke={riskColor} strokeWidth="2.8"
                          strokeDasharray={`${riskScore} 100`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black tabular-nums leading-none" style={{ color: riskColor }}>{riskScore}</span>
                        <span className="text-[10px] text-gray-400 font-semibold tracking-widest mt-2 uppercase">out of 100</span>
                      </div>
                    </div>
                    <div className="mt-2 px-4 py-1 rounded-full font-bold text-xs border uppercase tracking-wider"
                      style={{ borderColor: riskColor, color: riskColor, backgroundColor: `${riskColor}15` }}>
                      {riskBadge}
                    </div>
                    <div className="mt-2 px-5 py-2 rounded-full font-bold text-sm border uppercase tracking-wider text-center"
                      style={{ borderColor: riskColor, color: riskColor, backgroundColor: `${riskColor}10` }}>
                      {riskGrade}
                    </div>
                    <p className="text-sm text-center text-gray-500 mt-4 leading-relaxed">{riskMessage}</p>
                    <div className="mt-5 w-full space-y-2 bg-gray-50 rounded-xl p-4">
                      {[
                        { label: "0–25", name: "Optimised Infrastructure", color: "#22C55E" },
                        { label: "26–50", name: "Needs Optimisation", color: "#F59E0B" },
                        { label: "51–75", name: "Operational Risk Areas", color: "#F97316" },
                        { label: "76–100", name: "Critical Infrastructure Gaps", color: "#DC2626" },
                      ].map(item => (
                        <div key={item.name} className="flex items-center gap-2 text-xs">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-400 font-mono w-12">{item.label}</span>
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pb-3 mb-5 border-b border-gray-100">Infrastructure Category Breakdown</h4>
                      <div className="space-y-5">
                        {[
                          { label: "Network Reliability", val: breakdown.network, max: 57 },
                          { label: "Backup & Recovery", val: breakdown.backup, max: 28 },
                          { label: "Security Posture", val: breakdown.data, max: 18 },
                          { label: "Infrastructure Readiness", val: breakdown.infrastructure, max: 17 },
                          { label: "Monitoring & Support", val: breakdown.support, max: 20 },
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
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Facility Assessment Overview</h5>
                      <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                        {formData.hospitalType && <div className="text-gray-500">Facility Type: <span className="text-gray-800 font-semibold">{formData.hospitalType}</span></div>}
                        {formData.designation && <div className="text-gray-500">Assessed by: <span className="text-gray-800 font-semibold">{formData.designation}</span></div>}
                        {formData.computers && <div className="text-gray-500">Endpoints: <span className="text-gray-800 font-semibold">{formData.computers}</span></div>}
                        {formData.servers && <div className="text-gray-500">Servers: <span className="text-gray-800 font-semibold">{formData.servers}</span></div>}
                        {formData.beds && <div className="text-gray-500">Beds: <span className="text-gray-800 font-semibold">{formData.beds}</span></div>}
                        {formData.branches && <div className="text-gray-500">Branches: <span className="text-gray-800 font-semibold">{formData.branches}</span></div>}
                        {formData.location && <div className="text-gray-500">Location: <span className="text-gray-800 font-semibold">{formData.location}</span></div>}
                        <div className="col-span-2 text-gray-500 pt-1 border-t border-gray-200 mt-1">Recommended: <span className="font-bold" style={{ color: "#F97316" }}>{recommendedPackage}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Infrastructure Observations */}
            <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden print-section">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b border-gray-100 px-8 py-6">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0"><Info className="w-5 h-5" /></div>
                  Key Infrastructure Observations
                </CardTitle>
                <CardDescription className="text-base text-gray-500 mt-1">Based on your assessment responses, here are the consulting observations for your facility.</CardDescription>
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
                    <p className="text-green-800 font-medium">Your hospital IT environment shows a strong foundation. No significant risk areas were identified. We recommend continuing with regular monitoring and structured IT governance to maintain this standard.</p>
                  </div>
                )}
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

            {/* Prioritised Actions */}
            {actions.length > 0 && (
              <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden print-section">
                <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
                <CardHeader className="border-b border-gray-100 px-8 py-6">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0"><Clipboard className="w-5 h-5" /></div>
                    Prioritised Improvement Actions
                  </CardTitle>
                  <CardDescription className="text-base text-gray-500 mt-1">Structured steps to reduce infrastructure risk and strengthen hospital IT reliability</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {actions.map((action, idx) => (
                      <div key={idx} className="border border-gray-200 bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${action.priority === "CRITICAL" ? "bg-red-600" : action.priority === "HIGH" ? "bg-orange-500" : action.priority === "MEDIUM" ? "bg-yellow-500" : "bg-green-500"}`} />
                        <div className="flex justify-between items-start mb-2 pl-3">
                          <h4 className="font-bold text-gray-900 pr-4 text-sm">{action.title}</h4>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shrink-0 ${action.priority === "CRITICAL" ? "bg-red-100 text-red-700" : action.priority === "HIGH" ? "bg-orange-100 text-orange-700" : action.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
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

            {/* Future Goals */}
            {formData.futureGoals && (
              <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden print-section">
                <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
                <CardHeader className="border-b border-gray-100 px-8 py-6">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0"><TrendingUp className="w-5 h-5" /></div>
                    Hospital IT Improvement Vision
                  </CardTitle>
                  <CardDescription className="text-base text-gray-500 mt-1">Goals captured from the assessment — to be incorporated into the implementation roadmap</CardDescription>
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
                <CardTitle className="text-xl font-black text-gray-900">Recommended Support Model</CardTitle>
                <CardDescription className="text-base text-gray-500 mt-1 max-w-2xl">
                  Based on your risk profile and the infrastructure gaps identified, the following support model is recommended for {formData.hospitalName || "your facility"}.
                </CardDescription>
                <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-sm font-semibold px-4 py-2 rounded-lg text-primary border border-primary/20">
                  <Star className="w-4 h-4" /> Assessment score {riskScore}/100 — <span className="font-black">{recommendedPackage}</span> recommended
                </div>
                <p className="text-xs text-gray-400 mt-2">Recommended based on your current risk profile, infrastructure maturity, and the specific gaps identified in this assessment.</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                  {packages.map((pkg) => {
                    const isRec = pkg.name === recommendedPackage;
                    return (
                      <div key={pkg.name} className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 ${isRec ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20" : "border-gray-200 shadow-sm"}`}>
                        {isRec && (
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <Star className="w-3 h-3" /> Recommended
                          </div>
                        )}
                        <div className={`px-6 pt-6 pb-5 border-b border-gray-100 ${isRec ? "bg-primary/5" : "bg-gray-50"}`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isRec ? "text-primary" : "text-gray-400"}`}>{pkg.tier}</span>
                          <h3 className="text-lg font-black text-gray-900 mt-1">{pkg.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{pkg.subtitle}</p>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">{pkg.desc}</p>
                          <div className="mb-5">
                            <p className={`text-base font-black ${isRec ? "text-primary" : "text-gray-800"}`}>{pkg.price}</p>
                            {pkg.devicePricing && <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{pkg.devicePricing}</p>}
                          </div>
                          <ul className="space-y-2.5 flex-1">
                            {pkg.features.map(f => (
                              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isRec ? "text-primary" : "text-gray-400"}`} />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-5 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 leading-relaxed"><span className="font-semibold text-gray-700">Best for:</span> {pkg.bestFor}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 text-center mt-4">Final pricing depends on number of systems, servers, branches, and support scope.</p>
              </CardContent>
            </Card>

            {/* What Happens Next */}
            <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden print-section">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b border-gray-100 px-8 py-6">
                <CardTitle className="text-xl font-black text-gray-900">Proposed Next Steps</CardTitle>
                <CardDescription className="text-base text-gray-500 mt-1">ZENYX will work with your team to translate this assessment into a structured improvement programme.</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {[
                    { step: "01", title: "Audit Review Call", desc: "Walk through the findings with your ZENYX consultant and clarify priorities specific to your facility." },
                    { step: "02", title: "Risk Reduction Plan", desc: "Receive a prioritised action plan tailored to your facility, risk level, and available budget." },
                    { step: "03", title: "Infrastructure Stabilisation", desc: "Begin resolving critical and high-priority gaps with ZENYX technical support on-site and remotely." },
                    { step: "04", title: "Monitoring & Support Activation", desc: "Deploy proactive monitoring across key systems — network, servers, firewall, and internet." },
                    { step: "05", title: "Quarterly IT Governance Reviews", desc: "Ongoing visibility, continuous improvement, and a structured long-term partner relationship." },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-5 p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">{item.step}</div>
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">{item.title}</h5>
                        <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lead Capture */}
            <Card className="shadow-sm border-2 border-primary/20 rounded-2xl bg-white overflow-hidden print:hidden">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b border-gray-100 px-8 py-6 bg-primary/5">
                <CardTitle className="text-xl font-black text-gray-900">Ready to strengthen your hospital's IT reliability?</CardTitle>
                <CardDescription className="text-base text-gray-600 mt-1 max-w-xl">
                  Speak with a ZENYX consultant to review your findings, build a structured risk reduction plan, and define the right support model for your facility.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm">Your Name</Label>
                    <Input value={leadData.name} onChange={e => setLeadData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Full name" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm">Mobile Number</Label>
                    <Input value={leadData.mobile} onChange={e => setLeadData(p => ({ ...p, mobile: e.target.value }))}
                      placeholder="e.g. 9876543210" type="tel" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm">Email Address</Label>
                    <Input value={leadData.email} onChange={e => setLeadData(p => ({ ...p, email: e.target.value }))}
                      placeholder="e.g. director@hospital.com" type="email" className="bg-gray-50 focus-visible:ring-primary h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-semibold text-sm">Hospital / Facility Name</Label>
                    <Input value={formData.hospitalName} readOnly className="bg-gray-50 text-gray-600 h-11 cursor-not-allowed" />
                  </div>
                </div>
                <Button size="lg" className="w-full h-13 text-base font-bold rounded-xl hover:shadow-lg transition-all">
                  Book Free IT Health Audit <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <p className="text-xs text-gray-400 text-center mt-3">No commitment required · A ZENYX consultant will reach out within 24 hours</p>
              </CardContent>
            </Card>

            {/* IT Challenges display (print) */}
            {formData.itChallenges && (
              <Card className="shadow-sm border border-gray-200 rounded-2xl bg-white overflow-hidden print-section">
                <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
                <CardHeader className="border-b border-gray-100 px-8 py-6">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-lg text-primary shrink-0"><AlertTriangle className="w-5 h-5" /></div>
                    Operational IT Challenges Noted
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="p-5 bg-amber-50/40 border border-amber-100 rounded-xl">
                    <p className="text-gray-700 leading-relaxed text-sm">{formData.itChallenges}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 print:hidden">
              <Button variant="outline" size="lg" onClick={() => window.print()} className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold border-gray-300 gap-2">
                <Printer className="w-4 h-4" /> Print Report
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.print()} className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold border-gray-300 gap-2">
                <Download className="w-4 h-4" /> Export as PDF
              </Button>
              <Button variant="ghost" size="lg" onClick={startNew} className="w-full sm:w-auto h-12 px-6 rounded-xl font-semibold text-gray-500 gap-2">
                Start New Assessment
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-gray-200 bg-white print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/zenyx-icon.png" alt="ZENYX" className="w-6 h-6 rounded" onError={(e) => (e.currentTarget.style.display = "none")} />
            <span className="text-sm font-bold text-gray-700">ZENYX IT Infra Solutions</span>
          </div>
          <p className="text-xs text-gray-400 text-center">ZENYX Hospital IT Health Audit · Hospital Infrastructure Risk, Reliability & Technology Assessment</p>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} ZENYX IT Infra Solutions</p>
        </div>
      </footer>
    </div>
  );
}
