import React, { useState, useMemo } from "react";
import {
  Building2, Settings, Shield, Server, Monitor, Wifi, HardDrive,
  Network, Clock, Users, Lock, Database, FileText,
  AlertTriangle, CheckCircle2, Package, Clipboard, Phone,
  Mail, MapPin, Layers, Activity,
  Info, ArrowRight, ArrowLeft, Printer, Download, Target,
  MessageSquare, TrendingUp, Star, Zap, Eye
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
  const [step2Errors, setStep2Errors] = useState<string[]>([]);
  const [step3Errors, setStep3Errors] = useState<string[]>([]);
  const [leadData, setLeadData] = useState({ name: "", mobile: "", email: "" });

  const [formData, setFormData] = useState({
    hospitalName: "", hospitalType: "", designation: "", designationOther: "",
    mobileNumber: "", email: "", computers: "", beds: "", branches: "", location: "", servers: "",
    internetRedundancy: "", downtime: "", wifiQuality: "", downtimeAreas: "",
    wifiAcrossDepts: "", connectivityImpact: "", imagingReliability: "", fileTransfer: "",
    reportDelay: "", systemSlowdown: "", staffDelays: "", systemAvailability: "",
    departmentComplaints: "", itDelaysPatientCare: "", recordsAccess: "",
    endpointSecurity: "", firewall: "", accessControl: "", backupSystem: "",
    backupTesting: "", serverMonitoring: "", backupPriority: "", monitoringWanted: "",
    downtimeImpact: "", itVisibility: "", dataConfidence: "", serverMonitoringDepth: "",
    firewallMonitoring: "", patchManagement: "", recoveryTesting: "", upgradeRoadmap: "",
    deviceTracking: "", maintenanceCoverage: "", ups: "", cablingQuality: "",
    rackManagement: "", nas: "", itSupport: "", centralMonitoring: "", criticalDevicePower: "",
    medicalDeviceIssues: "", biomedicITCoordination: "", recurringIssues: "",
    itChallenges: "", futureGoals: "", networkObservations: "", securityObservations: "",
    infrastructureObservations: "", assessmentDate: new Date().toISOString().split("T")[0],
  });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setStep2Errors(prev => prev.filter(f => f !== field));
    setStep3Errors(prev => prev.filter(f => f !== field));
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
    formData.hospitalName.trim() && formData.hospitalType && formData.designation &&
    formData.mobileNumber.trim() && formData.email.trim() && formData.computers.trim()
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
    const addScore = (field: string, cat: keyof typeof breakdownScores) => {
      const val = fd[field]; if (val && rules[field]?.[val] !== undefined) { const s = rules[field][val]; score += s; breakdownScores[cat] += s; }
    };
    addScore("firewall", "network"); addScore("internetRedundancy", "network"); addScore("downtime", "network"); addScore("wifiQuality", "network");
    addScore("backupSystem", "backup"); addScore("backupTesting", "backup");
    addScore("serverMonitoring", "support"); addScore("itSupport", "support");
    addScore("endpointSecurity", "data"); addScore("accessControl", "data");
    addScore("cablingQuality", "infrastructure"); addScore("rackManagement", "infrastructure"); addScore("ups", "infrastructure");

    const rawRisk = Math.min(100, Math.round((score / 140) * 100));
    const hs = 100 - rawRisk; // health score: higher = better

    // Traffic-light thresholds (applied to health score)
    let grade = "Critical Infrastructure Risk", color = "#6B7280", badge = "Critical";
    let message = "Your facility's IT setup has serious gaps that put daily operations at risk. Systems may fail without warning, patient data may not be protected, and restoring normal service after a failure could take days.";
    if (hs >= 40) { grade = "High Infrastructure Risk"; color = "#DC2626"; badge = "High Risk"; message = "There are significant problems in your IT setup that are already likely affecting billing, patient records, and daily staff work. These issues need to be addressed soon — before a failure causes a longer disruption."; }
    if (hs >= 60) { grade = "Needs Improvement"; color = "#F59E0B"; badge = "Moderate"; message = "Your systems are running, but there are gaps in backup coverage, security, or monitoring that could cause disruptions when something goes wrong. Addressing these now will prevent bigger problems later."; }
    if (hs >= 80) { grade = "Excellent Infrastructure"; color = "#22C55E"; badge = "Excellent"; message = "Your hospital's IT foundation is in good shape. Systems appear to be protected, monitored, and supported. Keep up regular maintenance and periodic reviews to stay ahead of any new risks."; }

    const acts: { title: string; priority: string; desc: string }[] = [];
    if (formData.firewall === "No") acts.push({ title: "Add a Firewall to Protect Your Hospital Network", priority: "CRITICAL", desc: "Right now, there is nothing blocking outside threats from reaching your systems. A firewall acts as a security gate between the internet and your hospital's patient records, billing tools, and clinical applications." });
    if (formData.backupSystem === "No") acts.push({ title: "Set Up Automatic Backups for All Hospital Data", priority: "CRITICAL", desc: "Your hospital data is not being backed up. If a server fails, files are deleted, or a virus strikes, that data may be gone permanently. Automatic daily backups ensure you can always recover." });
    if (formData.itSupport === "No proper support") acts.push({ title: "Get Dedicated IT Support with a Clear Response Plan", priority: "CRITICAL", desc: "When systems go down today, there is no structured process to fix them quickly. This means staff wait, billing stops, and patient care is affected while the problem gets sorted out informally." });
    if (["Single ISP", "No backup internet", "Don't know"].includes(formData.internetRedundancy)) acts.push({ title: "Add a Backup Internet Line for Your Facility", priority: "HIGH", desc: "Your facility runs on a single internet connection. If that connection goes down, billing, lab results, and patient records become inaccessible until the provider restores service." });
    if (["Frequently", "Weekly"].includes(formData.downtime)) acts.push({ title: "Start Monitoring Your Network Around the Clock", priority: "HIGH", desc: "Your facility experiences outages regularly. Without monitoring, problems are only discovered after they have already stopped billing, records access, or ward systems from working." });
    if (["No", "Don't know"].includes(formData.serverMonitoring)) acts.push({ title: "Start Monitoring Your Servers and Network", priority: "HIGH", desc: "Your servers and network devices are not being watched. Without monitoring, the first sign of a problem is usually a complete outage — by which time the disruption is already affecting your teams." });
    if (["No", "Not sure"].includes(formData.endpointSecurity)) acts.push({ title: "Install Security Software on Every Computer", priority: "HIGH", desc: "Computers without security software are an open door for viruses and ransomware. A single infected machine in your hospital network can spread to patient records, billing, and clinical tools." });
    if (formData.ups === "No") acts.push({ title: "Protect Your Servers from Power Failures", priority: "HIGH", desc: "A sudden power cut or surge can instantly damage servers and corrupt databases. Power backup equipment (UPS) keeps critical systems running during outages and prevents data loss." });
    if (["No", "Not sure"].includes(formData.accessControl)) acts.push({ title: "Control Who Can Access Which Systems", priority: "MEDIUM", desc: "Currently, staff may be able to access systems and data they don't need. Limiting access by role prevents accidental changes, data leaks, and makes it easier to investigate any issues." });
    if (["Never tested", "Not sure"].includes(formData.backupTesting)) acts.push({ title: "Test Your Backups to Make Sure They Actually Work", priority: "MEDIUM", desc: "Many backup systems appear to be running but fail when recovery is attempted. Regular testing confirms that when you actually need to restore data, it will be there." });
    if (formData.cablingQuality === "Poor") acts.push({ title: "Fix and Organise Your Network Cabling", priority: "MEDIUM", desc: "Messy or poorly installed cabling causes random connection drops and makes problems much harder to diagnose. Organised, structured cabling improves reliability and speeds up any maintenance work." });
    if (formData.wifiQuality === "Frequently unstable") acts.push({ title: "Improve Wi-Fi Coverage Across All Areas", priority: "MEDIUM", desc: "Unreliable Wi-Fi interrupts staff who depend on it for patient records, ward updates, and lab communication. A proper wireless coverage plan eliminates dead zones and improves daily workflows." });
    if (["Poor", "Don't know"].includes(formData.rackManagement)) acts.push({ title: "Organise Your Server Room and Cabling", priority: "LOW", desc: "A disorganised server room makes every maintenance visit slower and riskier. Labelled, tidy racks and cabling reduce the chance of accidental disconnections and cut troubleshooting time." });

    return { riskScore: hs, riskGrade: grade, riskColor: color, riskBadge: badge, riskMessage: message, actions: acts.slice(0, 10), breakdown: breakdownScores };
  }, [formData]);

  const recommendedPackage = useMemo(() => {
    if (riskScore >= 80) return "Monitoring Package";
    if (riskScore >= 60) return "Support Package";
    return "Security Package";
  }, [riskScore]);

  const getObservations = () => {
    const obs: string[] = [];
    if (formData.firewall === "No") obs.push("Your internet connection has no firewall. Without this basic protection, outside threats can reach your patient records, billing systems, and clinical tools directly.");
    if (formData.backupSystem === "No") obs.push("Your hospital data is not being backed up. If a server fails, a virus strikes, or files are accidentally deleted, that data could be permanently lost with no way to recover it.");
    if (["No", "Don't know"].includes(formData.serverMonitoring)) obs.push("Your servers and network are not monitored continuously. Problems may only be noticed after systems have already stopped working — by which point billing, records, or ward tools may already be down.");
    if (formData.internetRedundancy === "Single ISP") obs.push("You have only one internet connection. If it goes down, your billing software, lab reports, and patient records all become inaccessible until the provider restores the line.");
    if (["No backup internet", "Don't know"].includes(formData.internetRedundancy)) obs.push("It's not clear how your internet connection is set up or whether a backup exists. Without this information, there is no plan for what happens when the connection fails.");
    if (["No", "Not sure"].includes(formData.endpointSecurity)) obs.push("Many computers in your facility don't have proper security software installed. These unprotected machines are a common entry point for viruses and ransomware that can spread to your entire network.");
    if (["No", "Not sure"].includes(formData.accessControl)) obs.push("Staff may be able to access systems and patient data they don't need for their work. Without access restrictions, sensitive records are harder to protect and incidents are harder to investigate.");
    if (["Never tested", "Not sure"].includes(formData.backupTesting)) obs.push("Your backups have never been tested to confirm they actually work. Many backup systems appear to be running but fail when recovery is attempted — and you won't find out until it's too late.");
    if (formData.ups === "No") obs.push("Your servers and IT equipment are not protected from sudden power failures or surges. A single power cut can instantly corrupt databases and bring hospital operations to a halt.");
    if (formData.itSupport === "No proper support") obs.push("There is no dedicated IT support in place. When a system goes down, there's no clear process to fix it quickly — meaning staff wait, billing stops, and patient care is disrupted while the issue gets resolved informally.");
    if (formData.wifiQuality === "Frequently unstable") obs.push("Wi-Fi is unreliable in parts of your facility. Staff who depend on it for patient records, ward updates, or lab results regularly face interruptions during their work.");
    if (formData.cablingQuality === "Poor") obs.push("Your network cabling is poorly organised. Messy or unsecured cables are a common cause of random connection drops and make it much harder and slower to fix problems when they occur.");
    if (["Frequently", "Weekly"].includes(formData.downtime)) obs.push("Your facility experiences system or network outages on a regular basis. This level of disruption is affecting billing, patient record access, and staff workflows right now — and points to underlying problems that won't resolve on their own.");
    return obs;
  };

  const TOTAL_STEPS = 7;
  const steps = [
    { num: 1, title: "Facility Profile" }, { num: 2, title: "Network" },
    { num: 3, title: "Security & Backup" }, { num: 4, title: "Infrastructure" },
    { num: 5, title: "IT Challenges" }, { num: 6, title: "IT Goals" }, { num: 7, title: "Results" },
  ];

  const startAssessment = () => { setStarted(true); setCurrentStep(1); window.scrollTo(0, 0); };
  const nextStep = () => { if (currentStep < TOTAL_STEPS) { setCurrentStep(p => p + 1); window.scrollTo(0, 0); } };
  const prevStep = () => { if (currentStep > 1) { setCurrentStep(p => p - 1); window.scrollTo(0, 0); } };
  const startNew = () => { setStarted(false); setCurrentStep(0); window.scrollTo(0, 0); };
  const handleStep1Next = () => { if (!step1Valid) { setStep1Error(true); return; } setStep1Error(false); nextStep(); };

  const handleStep2Next = () => {
    const missing: string[] = [];
    if (!formData.internetRedundancy) missing.push("internetRedundancy");
    if (!formData.downtime) missing.push("downtime");
    if (missing.length > 0) { setStep2Errors(missing); window.scrollTo(0, 0); return; }
    setStep2Errors([]);
    nextStep();
  };

  const handleStep3Next = () => {
    const missing: string[] = [];
    if (!formData.endpointSecurity) missing.push("endpointSecurity");
    if (!formData.backupSystem) missing.push("backupSystem");
    if (!formData.serverMonitoring) missing.push("serverMonitoring");
    if (missing.length > 0) { setStep3Errors(missing); window.scrollTo(0, 0); return; }
    setStep3Errors([]);
    nextStep();
  };

  const RadioGroup = ({ label, helperText, icon: Icon, options, value, onChange, vertical = false, error = false }: {
    label: string; helperText?: string; icon: React.ElementType; options: string[]; value: string; onChange: (v: string) => void; vertical?: boolean; error?: boolean;
  }) => (
    <div className={`space-y-3 ${error ? "rounded-xl border border-red-200 bg-red-50/40 p-4 -mx-4" : ""}`}>
      <div>
        <Label className="flex items-start text-sm font-normal text-gray-700">
          <Icon className="w-4 h-4 mr-2 text-primary shrink-0 mt-0.5" /> {label}
          {error && <span className="ml-1 text-red-400">*</span>}
        </Label>
        {helperText && <p className="text-xs text-gray-400 mt-1 ml-6 leading-relaxed">{helperText}</p>}
      </div>
      <div className={vertical ? "flex flex-col gap-2" : "grid grid-cols-2 md:grid-cols-4 gap-2"}>
        {options.map((opt) => (
          <div key={opt} onClick={() => onChange(opt)}
            className={`cursor-pointer border rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 select-none
              ${vertical ? "text-left" : "text-center"}
              ${value === opt
                ? "border-primary bg-orange-50 text-primary shadow-sm"
                : error
                  ? "border-red-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/40"
                  : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:bg-orange-50/40"}`}>
            {opt}
          </div>
        ))}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium mt-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          Please answer this question to continue.
        </p>
      )}
    </div>
  );

  const SectionNav = ({ onBack, onNext, nextLabel, isFirst = false }: { onBack?: () => void; onNext: () => void; nextLabel: string; isFirst?: boolean }) => (
    <div className="mt-10 flex items-center justify-between pt-6 border-t border-gray-100">
      {!isFirst ? (
        <Button onClick={onBack} variant="ghost" size="lg" className="h-11 px-6 rounded-xl font-medium text-gray-600">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
      ) : <div />}
      <Button onClick={onNext} size="lg" className="h-11 px-8 rounded-xl font-medium hover:shadow-md transition-all group">
        {nextLabel} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Button>
    </div>
  );

  const CardShell = ({ icon: Icon, stepNum, title, desc, children }: { icon: React.ElementType; stepNum: number; title: string; desc: string; children: React.ReactNode }) => (
    <div className="animate-in slide-in-from-right-4 fade-in duration-300">
      <Card className="shadow-sm border border-gray-200/80 rounded-2xl bg-white overflow-hidden">
        <div className="h-[3px] w-full bg-gradient-to-r from-primary to-orange-300" />
        <CardHeader className="border-b border-gray-100 pb-6 px-8 pt-7">
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-xl text-primary shrink-0"><Icon className="w-5 h-5" /></div>
            <div>
              <span className="text-xs font-medium text-primary/80 bg-orange-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                Step {stepNum} of {TOTAL_STEPS}
              </span>
              <CardTitle className="text-lg font-medium text-gray-900 mt-1.5" style={{ letterSpacing: "-0.01em" }}>{title}</CardTitle>
              <CardDescription className="text-sm text-gray-400 mt-0.5 font-normal">{desc}</CardDescription>
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
      name: "Monitoring Package", tier: "FOUNDATION",
      subtitle: "Visibility and early warning for hospital IT environments",
      desc: "Continuous visibility into your hospital's core IT systems so issues can be identified before they disrupt operations.",
      price: "₹11,999/month",
      devicePricing: null,
      securityNote: null,
      features: ["24/7 Network Monitoring", "Internet Uptime Monitoring", "Firewall Availability Monitoring", "Server Health Monitoring", "Alert Notifications", "Monthly IT Health Report", "Email Support"],
      bestFor: "Best for facilities that need proactive visibility into infrastructure health.",
    },
    {
      name: "Support Package", tier: "PROFESSIONAL",
      subtitle: "Monitoring plus active IT support and infrastructure upkeep",
      desc: "Ideal for facilities where IT issues affect staff productivity or operations and need ongoing support beyond monitoring.",
      price: "₹12,999/month base",
      devicePricing: "+ ₹300 per endpoint\n+ ₹2,500 per server\n+ ₹1,500 per network / firewall device",
      securityNote: null,
      features: ["Everything in Monitoring", "Unlimited Remote Support", "User Troubleshooting", "Patch Management", "Preventive Maintenance", "Vendor Coordination", "Asset Tracking & Documentation", "2 Scheduled Onsite Visits / Month", "Incident Response SLA"],
      bestFor: "Best for facilities that require active hands-on IT support along with monitoring.",
    },
    {
      name: "Security Package", tier: "ENTERPRISE",
      subtitle: "Monitoring + support + security resilience and governance",
      desc: "A complete managed IT environment combining infrastructure visibility, support responsiveness, and stronger security posture.",
      price: "₹43,999/month onward",
      devicePricing: "Device / server / network support pricing applies based on infrastructure size and support scope.",
      securityNote: "Includes Monitoring + Support + Security services",
      features: ["Everything in Support", "Advanced Endpoint Security Oversight", "Managed Backup Monitoring", "Backup Recovery Verification", "Disaster Recovery Readiness Review", "Firewall Policy Review", "Vulnerability & Security Posture Review", "Staff Awareness Support", "Quarterly IT Risk Review", "Strategic IT Governance Review"],
      bestFor: "Best for hospitals with recurring risk, higher compliance expectations, or a need for stronger resilience.",
    },
  ];

  return (
    <div className="min-h-screen font-sans flex flex-col" style={{ backgroundColor: "#F5F5F7", fontFamily: "'Inter', sans-serif" }}>

      {/* PROGRESS BAR — wizard only */}
      {started && currentStep >= 1 && currentStep <= TOTAL_STEPS && (
        <div className="bg-white border-b border-gray-200/80 print:hidden shadow-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Step {currentStep} of {TOTAL_STEPS} — {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
              </span>
              <span className="text-xs text-primary font-medium">{steps[currentStep - 1]?.title}</span>
            </div>
            <div className="relative flex items-center justify-between">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-gray-100" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-primary transition-all duration-500 ease-out"
                style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }} />
              {steps.map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                return (
                  <div key={step.num} className="relative z-10 flex flex-col items-center gap-1.5 bg-white px-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300
                      ${isActive ? "bg-primary text-white shadow-sm shadow-primary/30" : isCompleted ? "bg-gray-200 text-gray-500" : "bg-white border-2 border-gray-200 text-gray-400"}`}>
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.num}
                    </div>
                    <span className={`text-[9px] font-medium hidden md:block uppercase tracking-wider
                      ${isActive ? "text-primary" : isCompleted ? "text-gray-400" : "text-gray-300"}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FULL-VIEWPORT HERO — landing screen */}
      {!started && (
        <div>
          {/* Hero */}
          <div className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-16">
            <div className="max-w-2xl mx-auto w-full">

              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img
                  src="/zenyx-pulse-logo-nobg.png"
                  alt="ZENYX Pulse"
                  className="h-10 sm:h-14 md:h-16 w-auto object-contain"
                  style={{ maxWidth: "220px" }}
                />
              </div>

              {/* Main headline */}
              <h1 className="text-[2.5rem] md:text-[3rem] font-light text-gray-800 leading-[1.2] mb-5"
                style={{ letterSpacing: "-0.02em" }}>
                Hospital IT Health Audit
              </h1>

              {/* Supporting headline */}
              <p className="text-xl text-gray-600 font-normal leading-snug mb-4 max-w-xl mx-auto">
                Protect your hospital from IT downtime, security risks,<br className="hidden sm:block" /> and system failures.
              </p>

              {/* Subtext */}
              <p className="text-base text-gray-400 leading-relaxed mb-3 max-w-lg mx-auto" style={{ fontWeight: 400 }}>
                Hospital infrastructure risk, reliability, and technology assessment — built for Indian healthcare environments.
              </p>

              {/* Trust line */}
              <p className="text-sm text-gray-400 mb-10">
                Designed for hospitals, clinics, and diagnostic centres.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                {[
                  { icon: Eye, text: "Detect Hidden IT Risks" },
                  { icon: Activity, text: "Prevent Downtime Across Critical Systems" },
                  { icon: Shield, text: "Identify Security & Backup Gaps" },
                  { icon: Clipboard, text: "Get a Hospital IT Reliability Plan" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2.5 rounded-full shadow-sm">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-normal">{text}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col items-center gap-3">
                <Button onClick={startAssessment} size="lg"
                  className="h-14 px-10 rounded-2xl text-base font-medium hover:shadow-lg hover:shadow-primary/20 transition-all group">
                  Start Free Audit
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <p className="text-sm text-gray-400">
                  <span className="mr-4">✓ Takes 3–5 minutes</span>
                  <span>✓ Instant IT risk score</span>
                </p>
              </div>

              {/* Trust bar */}
              <div className="mt-12 pt-10 border-t border-gray-200/60 flex items-center justify-center gap-6 text-xs text-gray-400 font-normal">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 3–5 minutes</span>
                <span className="w-px h-3 bg-gray-300" />
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Free assessment</span>
                <span className="w-px h-3 bg-gray-300" />
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> No commitment</span>
              </div>
            </div>
          </div>

          {/* WHAT THIS AUDIT EVALUATES */}
          <div className="bg-white border-t border-gray-200/60 py-16 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-normal text-primary/70 uppercase tracking-widest mb-2">Assessment Coverage</p>
                <h2 className="text-2xl font-light text-gray-900 mb-3" style={{ letterSpacing: "-0.015em" }}>
                  What This Audit Evaluates
                </h2>
                <p className="text-sm text-gray-400 max-w-md mx-auto">
                  A structured review of five critical infrastructure domains — each with a live risk score and improvement recommendations.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: Wifi,
                    title: "Network Reliability",
                    desc: "Internet redundancy, Wi-Fi stability, downtime frequency, and connectivity resilience across departments.",
                  },
                  {
                    icon: Shield,
                    title: "Security Protection",
                    desc: "Firewall coverage, endpoint security, access control, and overall security readiness.",
                  },
                  {
                    icon: Database,
                    title: "Backup & Recovery",
                    desc: "Data backup coverage, recovery testing, and disaster recovery confidence.",
                  },
                  {
                    icon: Server,
                    title: "Infrastructure Health",
                    desc: "Power backup, rack condition, server room organisation, support maturity, and monitoring readiness.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6 text-left hover:shadow-md transition-shadow">
                    <div className="bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">{title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Button onClick={startAssessment} variant="outline" size="lg"
                  className="h-11 px-8 rounded-xl font-medium border-gray-200 hover:border-primary hover:text-primary transition-all">
                  Start the Audit <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIZARD STEPS */}
      {started && (
        <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 w-full pb-20">

          {/* STEP 1 — Facility Profile */}
          {currentStep === 1 && (
            <CardShell icon={Building2} stepNum={1} title="Facility Profile" desc="Basic information about your healthcare facility — used to personalise your assessment and report">
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest mb-5">Required Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                    <div className="space-y-2 lg:col-span-2">
                      <Label className="flex items-center text-gray-700 font-normal text-sm">
                        <Building2 className="w-4 h-4 mr-2 text-primary" /> Hospital / Facility Name <span className="text-red-400 ml-1">*</span>
                      </Label>
                      <Input value={formData.hospitalName} onChange={e => updateForm("hospitalName", e.target.value)} placeholder="e.g. City General Hospital"
                        className={`bg-gray-50 focus-visible:ring-primary h-11 text-sm ${step1Error && !formData.hospitalName.trim() ? "border-red-300" : ""}`} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-700 font-normal text-sm">
                        <Layers className="w-4 h-4 mr-2 text-primary" /> Facility Type <span className="text-red-400 ml-1">*</span>
                      </Label>
                      <select value={formData.hospitalType} onChange={e => updateForm("hospitalType", e.target.value)}
                        className={`flex h-11 w-full rounded-lg border border-input bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${step1Error && !formData.hospitalType ? "border-red-300" : ""}`}>
                        <option value="">Select type...</option>
                        <option>Multi-speciality Hospital</option><option>Single-speciality Hospital</option>
                        <option>Super Speciality Hospital</option><option>Clinic</option>
                        <option>Diagnostic Centre</option><option>Daycare / Small Hospital</option>
                        <option>Nursing Home</option><option>Medical College Hospital</option>
                        <option>IVF / Fertility Centre</option><option>Dental Hospital / Clinic</option>
                        <option>Eye Hospital / Clinic</option><option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-700 font-normal text-sm">
                        <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Designation / Role <span className="text-red-400 ml-1">*</span>
                      </Label>
                      <select value={formData.designation} onChange={e => updateForm("designation", e.target.value)}
                        className={`flex h-11 w-full rounded-lg border border-input bg-gray-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${step1Error && !formData.designation ? "border-red-300" : ""}`}>
                        <option value="">Select your role...</option>
                        <option>Hospital Owner / Director</option><option>IT Head / IT Manager</option>
                        <option>System Administrator</option><option>Operations Manager</option>
                        <option>Doctor / Department Head</option><option>Purchase / Procurement</option>
                        <option>Biomedical Engineer</option><option>Admin Manager</option><option>Other</option>
                      </select>
                      {formData.designation === "Other" && (
                        <Input value={formData.designationOther} onChange={e => updateForm("designationOther", e.target.value)}
                          placeholder="Please specify your role" className="bg-gray-50 h-10 mt-2 text-sm" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-700 font-normal text-sm">
                        <Phone className="w-4 h-4 mr-2 text-primary" /> Mobile Number <span className="text-red-400 ml-1">*</span>
                      </Label>
                      <Input value={formData.mobileNumber} onChange={e => updateForm("mobileNumber", e.target.value)} placeholder="e.g. 9876543210" type="tel"
                        className={`bg-gray-50 focus-visible:ring-primary h-11 text-sm ${step1Error && !formData.mobileNumber.trim() ? "border-red-300" : ""}`} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-700 font-normal text-sm">
                        <Mail className="w-4 h-4 mr-2 text-primary" /> Email Address <span className="text-red-400 ml-1">*</span>
                      </Label>
                      <Input value={formData.email} onChange={e => updateForm("email", e.target.value)} placeholder="e.g. it@hospital.com" type="email"
                        className={`bg-gray-50 focus-visible:ring-primary h-11 text-sm ${step1Error && !formData.email.trim() ? "border-red-300" : ""}`} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-700 font-normal text-sm">
                        <Monitor className="w-4 h-4 mr-2 text-primary" /> Computers / Endpoints <span className="text-red-400 ml-1">*</span>
                      </Label>
                      <Input value={formData.computers} onChange={e => updateForm("computers", e.target.value)} placeholder="e.g. 45" type="number"
                        className={`bg-gray-50 focus-visible:ring-primary h-11 text-sm ${step1Error && !formData.computers.trim() ? "border-red-300" : ""}`} />
                    </div>
                  </div>
                  {step1Error && !step1Valid && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                      Please fill in all required fields marked with * before continuing.
                    </div>
                  )}
                </div>
                <div className="pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest mb-5">Additional Details <span className="font-normal lowercase">(optional)</span></h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-700 font-normal text-sm"><MapPin className="w-4 h-4 mr-2 text-primary" /> Location / City</Label>
                      <Input value={formData.location} onChange={e => updateForm("location", e.target.value)} placeholder="e.g. Hyderabad" className="bg-gray-50 h-11 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-700 font-normal text-sm"><Layers className="w-4 h-4 mr-2 text-primary" /> Branches</Label>
                      <Input value={formData.branches} onChange={e => updateForm("branches", e.target.value)} placeholder="e.g. 3" type="number" className="bg-gray-50 h-11 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-700 font-normal text-sm"><Server className="w-4 h-4 mr-2 text-primary" /> Servers</Label>
                      <Input value={formData.servers} onChange={e => updateForm("servers", e.target.value)} placeholder="e.g. 4" type="number" className="bg-gray-50 h-11 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center text-gray-700 font-normal text-sm"><Users className="w-4 h-4 mr-2 text-primary" /> Beds</Label>
                      <Input value={formData.beds} onChange={e => updateForm("beds", e.target.value)} placeholder="e.g. 100" type="number" className="bg-gray-50 h-11 text-sm" />
                    </div>
                  </div>
                </div>
                <SectionNav onNext={handleStep1Next} nextLabel="Continue to Network Assessment" isFirst />
              </div>
            </CardShell>
          )}

          {/* STEP 2 — Network */}
          {currentStep === 2 && (
            <CardShell icon={Wifi} stepNum={2} title="Network & Connectivity" desc="Evaluate your internet reliability, internal network coverage, and the frequency of connectivity disruptions">
              <div className="space-y-10">
                <div className="space-y-8">
                  <RadioGroup label="Do you have backup internet connectivity?" helperText="A second internet connection keeps your hospital online when the primary provider fails." icon={Network}
                    options={["Dual ISP", "Single ISP", "No backup internet", "Don't know"]} value={formData.internetRedundancy} onChange={v => updateForm("internetRedundancy", v)} vertical
                    error={step2Errors.includes("internetRedundancy")} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="How often does IT or network downtime affect daily work?" helperText="This helps us understand how current infrastructure gaps are impacting operations." icon={Clock}
                      options={["Never", "Rarely", "Monthly", "Weekly", "Frequently"]} value={formData.downtime} onChange={v => updateForm("downtime", v)}
                      error={step2Errors.includes("downtime")} />
                  </div>
                  {showFrequentDowntimeFollowUp && (
                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5">
                      <RadioGroup label="Which area is most affected by downtime?" icon={AlertTriangle}
                        options={["Billing", "Lab / Diagnostics", "Patient records / HIS", "Wi-Fi / Wireless", "Branch connectivity", "Printing / Peripherals"]}
                        value={formData.downtimeAreas} onChange={v => updateForm("downtimeAreas", v)} vertical />
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Is Wi-Fi stable in all important working areas?" helperText="Unreliable Wi-Fi affects clinical mobility, lab systems, and billing workflows." icon={Wifi}
                      options={["Stable everywhere", "Stable in some areas", "Frequently unstable"]} value={formData.wifiQuality} onChange={v => updateForm("wifiQuality", v)} />
                  </div>
                </div>

                {isLargeHospital && (
                  <div className="pt-6 border-t border-gray-100 space-y-8">
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Large Hospital — Network</h4>
                    <RadioGroup label="Is Wi-Fi stable across wards, ICU, OPD, labs, and admin areas?" helperText="Coverage gaps in clinical areas can directly impact patient care and staff productivity." icon={Wifi}
                      options={["Fully stable", "Partial coverage", "Poor coverage"]} value={formData.wifiAcrossDepts} onChange={v => updateForm("wifiAcrossDepts", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Do connectivity issues affect billing, lab, or patient record access?" icon={Activity}
                        options={["Never", "Sometimes", "Frequently"]} value={formData.connectivityImpact} onChange={v => updateForm("connectivityImpact", v)} />
                    </div>
                  </div>
                )}

                {isDiagnostic && (
                  <div className="pt-6 border-t border-gray-100 space-y-8">
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Diagnostic Centre — Network</h4>
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
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Clinic — Network</h4>
                    <RadioGroup label="Do consultation or billing systems ever become slow or unavailable?" icon={Monitor}
                      options={["Never", "Sometimes", "Often"]} value={formData.systemSlowdown} onChange={v => updateForm("systemSlowdown", v)} />
                  </div>
                )}

                {isOperations && (
                  <div className="pt-6 border-t border-gray-100 space-y-8">
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Operations</h4>
                    <RadioGroup label="Do staff face system delays during peak operational hours?" icon={Clock}
                      options={["Rarely", "Sometimes", "Often"]} value={formData.staffDelays} onChange={v => updateForm("staffDelays", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Are patient records, billing, and admin systems available without interruption?" icon={Database}
                        options={["Usually yes", "Sometimes interrupted", "Frequently interrupted"]} value={formData.systemAvailability} onChange={v => updateForm("systemAvailability", v)} vertical />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Do departments frequently complain about Wi-Fi, slow systems, or downtime?" icon={Users}
                        options={["Rarely", "Sometimes", "Frequently"]} value={formData.departmentComplaints} onChange={v => updateForm("departmentComplaints", v)} />
                    </div>
                  </div>
                )}

                {isDoctor && (
                  <div className="pt-6 border-t border-gray-100 space-y-8">
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Clinical</h4>
                    <RadioGroup label="Do IT or system issues ever delay patient care or department work?" icon={AlertTriangle}
                      options={["Never", "Sometimes", "Frequently"]} value={formData.itDelaysPatientCare} onChange={v => updateForm("itDelaysPatientCare", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Is access to reports, records, or systems smooth during working hours?" icon={FileText}
                        options={["Smooth", "Sometimes slow", "Frequently problematic"]} value={formData.recordsAccess} onChange={v => updateForm("recordsAccess", v)} />
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <Label className="flex items-center font-medium text-gray-700 text-sm">
                    <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Network Observations
                    <span className="text-xs text-gray-400 font-normal ml-2">(optional)</span>
                  </Label>
                  <Textarea value={formData.networkObservations} onChange={e => updateForm("networkObservations", e.target.value)}
                    placeholder="e.g. Internet goes down in the afternoon, Wi-Fi not reaching ICU, billing system hangs during peak hours..."
                    className="bg-gray-50 border-gray-200 min-h-[80px] text-sm" />
                </div>
                {step2Errors.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Please answer all required questions above before continuing.
                  </div>
                )}
                <SectionNav onBack={prevStep} onNext={handleStep2Next} nextLabel="Next: Security & Backup" />
              </div>
            </CardShell>
          )}

          {/* STEP 3 — Security & Data Protection */}
          {currentStep === 3 && (
            <CardShell icon={Shield} stepNum={3} title="Security & Data Protection" desc="Assess the protection in place for hospital data, patient records, and critical systems">
              <div className="space-y-10">
                <div className="space-y-8">
                  <RadioGroup label="Do all computers have antivirus or endpoint security installed?" helperText="Unprotected workstations are the most common entry point for ransomware in hospitals." icon={Shield}
                    options={["Yes", "Partial", "No", "Not sure"]} value={formData.endpointSecurity} onChange={v => updateForm("endpointSecurity", v)}
                    error={step3Errors.includes("endpointSecurity")} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Is there a firewall protecting your network and internet connection?" helperText="A firewall is the primary defence between your hospital network and external threats." icon={Lock}
                      options={["Yes", "No", "Don't know"]} value={formData.firewall} onChange={v => updateForm("firewall", v)} />
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Is access to systems controlled by staff role or department?" helperText="Role-based access control prevents unauthorised staff from accessing sensitive patient data." icon={Lock}
                      options={["Yes", "Partial", "No", "Not sure"]} value={formData.accessControl} onChange={v => updateForm("accessControl", v)} />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Backup & Recovery</h4>
                  <RadioGroup label="Is hospital data backed up automatically and regularly?" helperText="Data backups protect against server failure, ransomware, and accidental deletion." icon={Database}
                    options={["Daily automatic", "Partial / selected systems", "No", "Not sure"]} value={formData.backupSystem} onChange={v => updateForm("backupSystem", v)} vertical
                    error={step3Errors.includes("backupSystem")} />
                  {showBackupPriority && (
                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5">
                      <RadioGroup label="Would backup and recovery planning be a priority for your facility?" icon={Target}
                        options={["Yes, high priority", "Maybe", "Not at this time"]} value={formData.backupPriority} onChange={v => updateForm("backupPriority", v)} />
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="Are backups tested to confirm recovery actually works?" helperText="Untested backups frequently fail when needed most. This is a critical but often overlooked step." icon={CheckCircle2}
                      options={["Regularly tested", "Rarely tested", "Never tested", "Not sure"]} value={formData.backupTesting} onChange={v => updateForm("backupTesting", v)} vertical />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-8">
                  <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Monitoring & Alerting</h4>
                  <RadioGroup label="Do you get alerts when internet, firewall, or server issues happen?" helperText="Early alerts help prevent downtime from affecting billing, records, and daily operations." icon={Activity}
                    options={["Yes", "Partial alerts", "No", "Don't know"]} value={formData.serverMonitoring} onChange={v => updateForm("serverMonitoring", v)}
                    error={step3Errors.includes("serverMonitoring")} />
                  {showMonitoringWanted && (
                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-5">
                      <RadioGroup label="Would you like proactive alerts when internet, servers, or firewall issues happen?" icon={Activity}
                        options={["Yes, this would be valuable", "Maybe", "Not a priority right now"]} value={formData.monitoringWanted} onChange={v => updateForm("monitoringWanted", v)} vertical />
                    </div>
                  )}
                </div>

                {isOwner && (
                  <div className="pt-6 border-t border-gray-100 space-y-8">
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Leadership Perspective</h4>
                    <RadioGroup label="Has IT downtime affected patient service, billing, or operations in the past year?" icon={AlertTriangle}
                      options={["Never", "Occasionally", "Multiple times"]} value={formData.downtimeImpact} onChange={v => updateForm("downtimeImpact", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Do you receive regular reports or visibility on IT health status?" helperText="Decision-makers need periodic IT health summaries to manage risk proactively." icon={FileText}
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
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">IT Operations</h4>
                    <RadioGroup label="Are servers monitored for CPU, memory, storage, and downtime metrics?" icon={Server}
                      options={["Yes", "Partial", "No"]} value={formData.serverMonitoringDepth} onChange={v => updateForm("serverMonitoringDepth", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Are firewalls, internet links, and switches proactively monitored?" icon={Network}
                        options={["Yes", "Partial", "No"]} value={formData.firewallMonitoring} onChange={v => updateForm("firewallMonitoring", v)} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Are patches and security updates applied regularly across all systems?" icon={Shield}
                        options={["Yes, all systems", "Some systems only", "Irregularly"]} value={formData.patchManagement} onChange={v => updateForm("patchManagement", v)} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Is backup recovery testing done on a regular schedule?" icon={CheckCircle2}
                        options={["Yes", "Rarely", "Never"]} value={formData.recoveryTesting} onChange={v => updateForm("recoveryTesting", v)} />
                    </div>
                  </div>
                )}

                {isProcurement && (
                  <div className="pt-6 border-t border-gray-100 space-y-8">
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Procurement & Planning</h4>
                    <RadioGroup label="Is there a structured IT upgrade roadmap for the next 12–24 months?" icon={TrendingUp}
                      options={["Yes", "In discussion", "No"]} value={formData.upgradeRoadmap} onChange={v => updateForm("upgradeRoadmap", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Are devices, servers, and network equipment tracked for lifecycle and replacement planning?" icon={Monitor}
                        options={["Yes", "Partial", "No"]} value={formData.deviceTracking} onChange={v => updateForm("deviceTracking", v)} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Is annual IT support or maintenance coverage in place?" icon={Package}
                        options={["Yes", "Partial", "No"]} value={formData.maintenanceCoverage} onChange={v => updateForm("maintenanceCoverage", v)} />
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <Label className="flex items-center font-medium text-gray-700 text-sm">
                    <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Security Observations
                    <span className="text-xs text-gray-400 font-normal ml-2">(optional)</span>
                  </Label>
                  <Textarea value={formData.securityObservations} onChange={e => updateForm("securityObservations", e.target.value)}
                    placeholder="e.g. No centralised backup, antivirus not updated on all systems, no monitoring tools..."
                    className="bg-gray-50 border-gray-200 min-h-[80px] text-sm" />
                </div>
                {step3Errors.length > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Please answer all required questions above before continuing.
                  </div>
                )}
                <SectionNav onBack={prevStep} onNext={handleStep3Next} nextLabel="Next: Physical Infrastructure" />
              </div>
            </CardShell>
          )}

          {/* STEP 4 — Physical Infrastructure */}
          {currentStep === 4 && (
            <CardShell icon={Settings} stepNum={4} title="Physical Infrastructure" desc="Review the condition of your server room, power backup, cabling, storage systems, and current IT support arrangement">
              <div className="space-y-10">
                <div className="space-y-8">
                  <RadioGroup label="Do critical systems have power backup — UPS or generator?" helperText="Power failures can damage servers, corrupt databases, and immediately halt hospital operations." icon={Zap}
                    options={["Yes", "Partial", "No"]} value={formData.ups} onChange={v => updateForm("ups", v)} />
                  <div className="pt-2 border-t border-gray-100">
                    <RadioGroup label="How is the overall LAN cabling condition across your facility?" helperText="Disorganised cabling is a frequent source of intermittent network faults." icon={Network}
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
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Server Room & Rack Infrastructure</h4>
                    <RadioGroup label="What is the condition of your server room and network rack setup?" helperText="A well-organised server room reduces failure risk and speeds up troubleshooting." icon={Server}
                      options={["Well organised", "Average", "Poor / disorganised", "Don't know"]} value={formData.rackManagement} onChange={v => updateForm("rackManagement", v)} vertical />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Are branch or department systems centrally monitored?" icon={Monitor}
                        options={["Yes", "Partial", "No"]} value={formData.centralMonitoring} onChange={v => updateForm("centralMonitoring", v)} />
                    </div>
                  </div>
                )}

                {isBiomedical && (
                  <div className="pt-6 border-t border-gray-100 space-y-8">
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Medical Equipment & IT Integration</h4>
                    <RadioGroup label="Do connected medical devices face network or data-sharing issues?" icon={Activity}
                      options={["Never", "Sometimes", "Frequently"]} value={formData.medicalDeviceIssues} onChange={v => updateForm("medicalDeviceIssues", v)} />
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Is there coordination between biomedical equipment and IT / network support teams?" icon={Users}
                        options={["Strong", "Some coordination", "Weak / none"]} value={formData.biomedicITCoordination} onChange={v => updateForm("biomedicITCoordination", v)} />
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <RadioGroup label="Are critical connected devices supported by stable power and network availability?" icon={Zap}
                        options={["Yes", "Partial", "No"]} value={formData.criticalDevicePower} onChange={v => updateForm("criticalDevicePower", v)} />
                    </div>
                  </div>
                )}

                {isDoctor && (
                  <div className="pt-6 border-t border-gray-100 space-y-8">
                    <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest">Clinical Operations</h4>
                    <RadioGroup label="Are there recurring issues with printers, systems, or connectivity in your department?" icon={AlertTriangle}
                      options={["No", "Sometimes", "Often"]} value={formData.recurringIssues} onChange={v => updateForm("recurringIssues", v)} />
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <Label className="flex items-center font-medium text-gray-700 text-sm">
                    <MessageSquare className="w-4 h-4 mr-2 text-primary" /> Infrastructure Observations
                    <span className="text-xs text-gray-400 font-normal ml-2">(optional)</span>
                  </Label>
                  <Textarea value={formData.infrastructureObservations} onChange={e => updateForm("infrastructureObservations", e.target.value)}
                    placeholder="e.g. Server room not air-conditioned, cables unorganised, no UPS for billing computers..."
                    className="bg-gray-50 border-gray-200 min-h-[80px] text-sm" />
                </div>
                <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="Next: IT Challenges" />
              </div>
            </CardShell>
          )}

          {/* STEP 5 — IT Challenges */}
          {currentStep === 5 && (
            <CardShell icon={AlertTriangle} stepNum={5} title="Day-to-Day IT Challenges" desc="Help us understand the recurring IT issues that affect hospital staff, patient workflows, and daily operations">
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-gray-600 leading-relaxed">
                  <strong className="text-gray-800 font-medium">Why this matters:</strong> Your day-to-day IT pain points help ZENYX prioritise improvements with the highest operational impact — not a generic solution.
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center font-medium text-gray-800 text-sm">
                    <Target className="w-4 h-4 mr-2 text-primary" /> What day-to-day IT issues are affecting hospital operations?
                  </Label>
                  <Textarea value={formData.itChallenges} onChange={e => updateForm("itChallenges", e.target.value)}
                    placeholder="Examples: HIS slow, billing interruptions, weak Wi-Fi in wards/ICU, lab or report delays, server downtime, branch disconnections, printer/network issues, EMR crashes..."
                    className="bg-gray-50 border-gray-200 min-h-[220px] text-sm leading-relaxed" />
                  <p className="text-xs text-gray-400">Be as specific as possible — this directly shapes the quality of your recommendations.</p>
                </div>
              </div>
              <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="Next: IT Goals" />
            </CardShell>
          )}

          {/* STEP 6 — IT Goals */}
          {currentStep === 6 && (
            <CardShell icon={TrendingUp} stepNum={6} title="IT Improvement Goals" desc="Share where you want your hospital IT infrastructure to be in the next 6–12 months">
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-sm text-gray-600 leading-relaxed">
                  <strong className="text-gray-800 font-medium">Shaping your roadmap:</strong> Your goals help ZENYX design a support model and implementation plan aligned with where your hospital is heading — not just where it is today.
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center font-medium text-gray-800 text-sm">
                    <TrendingUp className="w-4 h-4 mr-2 text-primary" /> What improvements would you like to achieve in the next 6–12 months?
                  </Label>
                  <Textarea value={formData.futureGoals} onChange={e => updateForm("futureGoals", e.target.value)}
                    placeholder="Examples: zero downtime for critical systems, better Wi-Fi coverage, stronger backup readiness, centralised monitoring, branch connectivity, stronger security, structured support model..."
                    className="bg-gray-50 border-gray-200 min-h-[220px] text-sm leading-relaxed" />
                  <p className="text-xs text-gray-400">Your input will be used to personalise the recommendations in the results section.</p>
                </div>
              </div>
              <SectionNav onBack={prevStep} onNext={nextStep} nextLabel="View My Results" />
            </CardShell>
          )}

          {/* STEP 7 — RESULTS */}
          {currentStep === 7 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 w-full">

              {/* Score Card */}
              <Card className="shadow-sm border border-gray-200/80 overflow-hidden rounded-2xl bg-white print-section">
                <div className="h-[3px] w-full bg-gradient-to-r from-primary to-orange-300" />
                <CardHeader className="border-b border-gray-100 pb-5 pt-7 px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-50 p-3 rounded-xl text-primary"><Activity className="w-5 h-5" /></div>
                      <div>
                        <span className="text-xs font-medium text-primary/80 bg-orange-50 px-2.5 py-1 rounded-md uppercase tracking-wider">Pulse Assessment</span>
                        <CardTitle className="text-xl font-semibold text-gray-900 tracking-tight mt-1.5">Hospital IT Health Score</CardTitle>
                      </div>
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-gray-700 text-sm font-medium">{formData.hospitalName || "Hospital Assessment"}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{formData.assessmentDate}</p>
                      {formData.designation && <p className="text-gray-400 text-xs mt-0.5">{formData.designation}</p>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center justify-start lg:border-r border-gray-100 lg:pr-8">
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F3F4F6" strokeWidth="2.5" />
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke={riskColor} strokeWidth="2.5"
                            strokeDasharray={`${riskScore} 100`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-semibold tabular-nums leading-none" style={{ color: riskColor, letterSpacing: "-0.02em" }}>{riskScore}</span>
                          <span className="text-[10px] text-gray-400 font-medium tracking-widest mt-2 uppercase">out of 100</span>
                        </div>
                      </div>
                      <div className="mt-3 px-4 py-1 rounded-full text-xs font-medium border uppercase tracking-wide"
                        style={{ borderColor: riskColor, color: riskColor, backgroundColor: `${riskColor}12` }}>
                        {riskBadge}
                      </div>
                      <div className="mt-1.5 px-5 py-2 rounded-full text-sm font-semibold border uppercase tracking-wide text-center"
                        style={{ borderColor: riskColor, color: riskColor, backgroundColor: `${riskColor}08` }}>
                        {riskGrade}
                      </div>
                      <p className="text-sm text-center text-gray-500 mt-4 leading-relaxed">{riskMessage}</p>
                      <div className="mt-5 w-full space-y-2 bg-gray-50 rounded-xl p-4">
                        {[
                          { label: "80–100", name: "Excellent Infrastructure", color: "#22C55E" },
                          { label: "60–79",  name: "Needs Improvement",        color: "#F59E0B" },
                          { label: "40–59",  name: "High Infrastructure Risk", color: "#DC2626" },
                          { label: "0–39",   name: "Critical Infrastructure Risk", color: "#6B7280" },
                        ].map(item => (
                          <div key={item.name} className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1 transition-colors ${riskScore >= parseInt(item.label) && riskScore <= parseInt(item.label.split("–")[1]) ? "bg-white shadow-sm" : ""}`}>
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="text-gray-400 font-mono w-14">{item.label}</span>
                            <span className="text-gray-600">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                      <div>
                        <h4 className="text-xs font-normal text-gray-400 uppercase tracking-widest pb-3 mb-5 border-b border-gray-100">Infrastructure Category Breakdown</h4>
                        <div className="space-y-4">
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
                                  <span className="text-gray-700 font-medium">{item.label}</span>
                                  <span className="text-gray-400 font-mono text-xs">{pct}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Facility Assessment Overview</h5>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
                          {formData.hospitalType && <div className="text-gray-500">Facility: <span className="text-gray-800 font-medium">{formData.hospitalType}</span></div>}
                          {formData.designation && <div className="text-gray-500">Assessed by: <span className="text-gray-800 font-medium">{formData.designation}</span></div>}
                          {formData.computers && <div className="text-gray-500">Endpoints: <span className="text-gray-800 font-medium">{formData.computers}</span></div>}
                          {formData.servers && <div className="text-gray-500">Servers: <span className="text-gray-800 font-medium">{formData.servers}</span></div>}
                          {formData.beds && <div className="text-gray-500">Beds: <span className="text-gray-800 font-medium">{formData.beds}</span></div>}
                          {formData.branches && <div className="text-gray-500">Branches: <span className="text-gray-800 font-medium">{formData.branches}</span></div>}
                          {formData.location && <div className="text-gray-500">Location: <span className="text-gray-800 font-medium">{formData.location}</span></div>}
                          <div className="col-span-2 pt-1 border-t border-gray-200 mt-1 text-gray-500">Recommended: <span className="font-semibold" style={{ color: "#F97316" }}>{recommendedPackage}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Observations */}
              <Card className="shadow-sm border border-gray-200/80 rounded-2xl bg-white overflow-hidden print-section">
                <div className="h-[3px] w-full bg-gradient-to-r from-primary to-orange-300" />
                <CardHeader className="border-b border-gray-100 px-8 py-6">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3" style={{ letterSpacing: "-0.01em" }}>
                    <div className="bg-orange-50 p-2.5 rounded-lg text-primary shrink-0"><Info className="w-4 h-4" /></div>
                    What We Found in Your Hospital IT Setup
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-400 mt-1 font-normal">These are the specific gaps and issues identified based on your answers. Each one has a direct impact on your daily operations.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {observations.length > 0 ? (
                    <div className="space-y-3">
                      {observations.map((obs, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-gray-700 font-normal leading-relaxed text-sm">{obs}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-6 rounded-xl bg-green-50 border border-green-100">
                      <CheckCircle2 className="w-7 h-7 text-green-500 shrink-0" />
                      <p className="text-green-800 font-medium text-sm">No major issues were found based on your answers. Your hospital's IT setup appears to be in good shape. Keep doing regular maintenance and check in periodically to make sure things stay that way.</p>
                    </div>
                  )}
                  {(formData.networkObservations || formData.securityObservations || formData.infrastructureObservations) && (
                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Additional Notes</h4>
                      {formData.networkObservations && <div className="p-4 bg-gray-50 rounded-xl border border-gray-100"><p className="text-xs font-semibold text-gray-400 uppercase mb-2">Network</p><p className="text-sm text-gray-600 leading-relaxed">{formData.networkObservations}</p></div>}
                      {formData.securityObservations && <div className="p-4 bg-gray-50 rounded-xl border border-gray-100"><p className="text-xs font-semibold text-gray-400 uppercase mb-2">Security</p><p className="text-sm text-gray-600 leading-relaxed">{formData.securityObservations}</p></div>}
                      {formData.infrastructureObservations && <div className="p-4 bg-gray-50 rounded-xl border border-gray-100"><p className="text-xs font-semibold text-gray-400 uppercase mb-2">Infrastructure</p><p className="text-sm text-gray-600 leading-relaxed">{formData.infrastructureObservations}</p></div>}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prioritised Actions */}
              {actions.length > 0 && (
                <Card className="shadow-sm border border-gray-200/80 rounded-2xl bg-white overflow-hidden print-section">
                  <div className="h-[3px] w-full bg-gradient-to-r from-primary to-orange-300" />
                  <CardHeader className="border-b border-gray-100 px-8 py-6">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3" style={{ letterSpacing: "-0.01em" }}>
                      <div className="bg-orange-50 p-2.5 rounded-lg text-primary shrink-0"><Clipboard className="w-4 h-4" /></div>
                      What Your Facility Needs to Fix
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-400 mt-1 font-normal">These are the most important improvements for your hospital, listed in order of priority.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {actions.map((action, idx) => (
                        <div key={idx} className="border border-gray-200 bg-white rounded-xl p-5 relative overflow-hidden hover:shadow-sm transition-shadow">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${action.priority === "CRITICAL" ? "bg-red-500" : action.priority === "HIGH" ? "bg-orange-500" : action.priority === "MEDIUM" ? "bg-yellow-400" : "bg-green-400"}`} />
                          <div className="flex justify-between items-start mb-2 pl-3">
                            <h4 className="font-medium text-gray-900 pr-4 text-sm leading-snug">{action.title}</h4>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${action.priority === "CRITICAL" ? "bg-red-50 text-red-600" : action.priority === "HIGH" ? "bg-orange-50 text-orange-600" : action.priority === "MEDIUM" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>
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
                <Card className="shadow-sm border border-gray-200/80 rounded-2xl bg-white overflow-hidden print-section">
                  <div className="h-[3px] w-full bg-gradient-to-r from-primary to-orange-300" />
                  <CardHeader className="border-b border-gray-100 px-8 py-6">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3" style={{ letterSpacing: "-0.01em" }}>
                      <div className="bg-orange-50 p-2.5 rounded-lg text-primary shrink-0"><TrendingUp className="w-4 h-4" /></div>
                      Hospital IT Improvement Vision
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-400 mt-1 font-normal">Goals captured from the assessment — to be incorporated into the implementation roadmap</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="p-5 bg-orange-50/40 border border-orange-100 rounded-xl">
                      <p className="text-gray-600 leading-relaxed text-sm italic">"{formData.futureGoals}"</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommended Support Model */}
              <Card className="shadow-sm border border-gray-200/80 rounded-2xl bg-white overflow-hidden print-section">
                <div className="h-[3px] w-full bg-gradient-to-r from-primary to-orange-300" />
                <CardHeader className="border-b border-gray-100 px-8 py-7">
                  <CardTitle className="text-xl font-semibold text-gray-900" style={{ letterSpacing: "-0.01em" }}>Recommended Support Model</CardTitle>
                  <CardDescription className="text-sm text-gray-400 mt-2 font-normal max-w-2xl leading-relaxed">
                    Based on your facility profile, risk score, and infrastructure gaps, the following package structure is recommended.
                  </CardDescription>
                  <div className="mt-5 inline-flex items-center gap-2.5 bg-orange-50 text-sm font-normal px-4 py-2.5 rounded-xl text-gray-700 border border-orange-100/80">
                    <Star className="w-4 h-4 text-primary shrink-0" />
                    Based on your assessment, <span className="font-semibold text-primary ml-0.5">{recommendedPackage}</span> is the recommended next step.
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                    {packages.map((pkg) => {
                      const isRec = pkg.name === recommendedPackage;
                      return (
                        <div key={pkg.name}
                          className={`relative flex flex-col rounded-2xl border transition-all duration-200 ease-out cursor-default
                            hover:-translate-y-1
                            ${isRec
                              ? "border-primary/40 shadow-lg shadow-orange-500/8 ring-1 ring-primary/20 hover:shadow-xl hover:shadow-orange-500/10 hover:border-primary/70"
                              : "border-gray-200 shadow-sm hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5"
                            }`}>
                          {isRec && (
                            <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-primary text-white text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                              <Star className="w-2 h-2" /> Recommended
                            </div>
                          )}

                          {/* Card header */}
                          <div className={`px-7 pt-7 pb-6 border-b border-gray-100 ${isRec ? "bg-gradient-to-b from-orange-50/70 to-orange-50/0" : "bg-gray-50/50"}`}>
                            <span className={`text-[9px] font-bold uppercase tracking-[0.14em] ${isRec ? "text-primary" : "text-gray-400"}`}>{pkg.tier}</span>
                            <h3 className="text-[1.1rem] font-semibold text-gray-900 mt-2 leading-tight" style={{ letterSpacing: "-0.015em" }}>{pkg.name}</h3>
                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-normal">{pkg.subtitle}</p>
                          </div>

                          {/* Card body */}
                          <div className="px-7 py-6 flex flex-col flex-1">
                            <p className="text-sm text-gray-500 leading-relaxed mb-5 font-normal">{pkg.desc}</p>

                            {pkg.securityNote && (
                              <div className="mb-5 flex items-center gap-2 text-[11px] font-medium text-gray-600 bg-orange-50/70 border border-orange-100 rounded-lg px-3 py-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                {pkg.securityNote}
                              </div>
                            )}

                            {/* Price */}
                            <div className="mb-5 pb-5 border-b border-gray-100">
                              <p className={`text-2xl font-semibold tracking-tight ${isRec ? "text-primary" : "text-gray-900"}`} style={{ letterSpacing: "-0.02em" }}>{pkg.price}</p>
                              {pkg.devicePricing && (
                                <p className="text-[11px] text-gray-400 mt-2 leading-relaxed whitespace-pre-line">{pkg.devicePricing}</p>
                              )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 flex-1">
                              {pkg.features.map(f => (
                                <li key={f} className="flex items-start gap-3">
                                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isRec ? "bg-primary/10" : "bg-gray-100"}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isRec ? "bg-primary" : "bg-gray-400"}`} />
                                  </div>
                                  <span className={`text-sm leading-snug font-normal ${isRec ? "text-gray-700" : "text-gray-600"}`}>{f}</span>
                                </li>
                              ))}
                            </ul>

                            {/* Best for */}
                            <div className="mt-6 pt-5 border-t border-gray-100">
                              <p className="text-xs text-gray-400 leading-relaxed">
                                <span className="font-semibold text-gray-600">Best for: </span>{pkg.bestFor}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-6">Pricing is subject to final infrastructure assessment and support scope.</p>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="shadow-sm border border-gray-200/80 rounded-2xl bg-white overflow-hidden print-section">
                <div className="h-[3px] w-full bg-gradient-to-r from-primary to-orange-300" />
                <CardHeader className="border-b border-gray-100 px-8 py-6">
                  <CardTitle className="text-xl font-semibold text-gray-900" style={{ letterSpacing: "-0.01em" }}>Proposed Next Steps</CardTitle>
                  <CardDescription className="text-sm text-gray-400 mt-1 font-normal">ZENYX will work with your team to translate this assessment into a structured improvement programme.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-3">
                    {[
                      { step: "01", title: "Audit Review Call", desc: "Walk through the findings with your ZENYX consultant and clarify priorities specific to your facility." },
                      { step: "02", title: "Risk Reduction Plan", desc: "Receive a prioritised action plan tailored to your facility, risk level, and available budget." },
                      { step: "03", title: "Infrastructure Stabilisation", desc: "Begin resolving critical and high-priority gaps with ZENYX technical support on-site and remotely." },
                      { step: "04", title: "Monitoring & Support Activation", desc: "Deploy proactive monitoring across key systems — network, servers, firewall, and internet." },
                      { step: "05", title: "Quarterly IT Governance Reviews", desc: "Ongoing visibility, continuous improvement, and a structured long-term partner relationship." },
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-5 p-5 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-gray-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-orange-50 text-primary flex items-center justify-center font-semibold text-sm shrink-0">{item.step}</div>
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">{item.title}</h5>
                          <p className="text-gray-500 text-sm mt-0.5 leading-relaxed font-normal">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Lead Capture */}
              <Card className="shadow-sm border-2 border-primary/15 rounded-2xl bg-white overflow-hidden print:hidden">
                <div className="h-[3px] w-full bg-gradient-to-r from-primary to-orange-300" />
                <CardHeader className="border-b border-gray-100 px-8 py-6 bg-orange-50/30">
                  <CardTitle className="text-xl font-semibold text-gray-900" style={{ letterSpacing: "-0.01em" }}>Ready to strengthen your hospital's IT reliability?</CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-1 font-normal max-w-xl">
                    Speak with a ZENYX consultant to review your findings, build a structured risk reduction plan, and define the right support model for your facility.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium text-sm">Your Name</Label>
                      <Input value={leadData.name} onChange={e => setLeadData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Full name" className="bg-gray-50 focus-visible:ring-primary h-11 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium text-sm">Mobile Number</Label>
                      <Input value={leadData.mobile} onChange={e => setLeadData(p => ({ ...p, mobile: e.target.value }))}
                        placeholder="e.g. 9876543210" type="tel" className="bg-gray-50 focus-visible:ring-primary h-11 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium text-sm">Email Address</Label>
                      <Input value={leadData.email} onChange={e => setLeadData(p => ({ ...p, email: e.target.value }))}
                        placeholder="e.g. director@hospital.com" type="email" className="bg-gray-50 focus-visible:ring-primary h-11 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium text-sm">Hospital / Facility Name</Label>
                      <Input value={formData.hospitalName} readOnly className="bg-gray-50 text-gray-500 h-11 text-sm cursor-not-allowed" />
                    </div>
                  </div>
                  <Button size="lg" className="w-full h-12 text-base font-medium rounded-xl hover:shadow-md transition-all">
                    Book Free IT Health Audit <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <p className="text-xs text-gray-400 text-center mt-3">No commitment required · A ZENYX consultant will reach out within 24 hours</p>
                </CardContent>
              </Card>

              {/* IT Challenges (print) */}
              {formData.itChallenges && (
                <Card className="shadow-sm border border-gray-200/80 rounded-2xl bg-white overflow-hidden print-section">
                  <div className="h-[3px] w-full bg-gradient-to-r from-primary to-orange-300" />
                  <CardHeader className="border-b border-gray-100 px-8 py-6">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                      <div className="bg-orange-50 p-2.5 rounded-lg text-primary shrink-0"><AlertTriangle className="w-4 h-4" /></div>
                      Operational IT Challenges Noted
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="p-5 bg-amber-50/40 border border-amber-100 rounded-xl">
                      <p className="text-gray-600 leading-relaxed text-sm">{formData.itChallenges}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 print:hidden">
                <Button variant="outline" size="lg" onClick={() => window.print()} className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium border-gray-200 gap-2 text-sm">
                  <Printer className="w-4 h-4" /> Print Report
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.print()} className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium border-gray-200 gap-2 text-sm">
                  <Download className="w-4 h-4" /> Export as PDF
                </Button>
                <Button variant="ghost" size="lg" onClick={startNew} className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium text-gray-400 gap-2 text-sm">
                  Start New Assessment
                </Button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* FOOTER */}
      <footer className="border-t border-gray-200/60 bg-white print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center">
            <img src="/zenyx-pulse-logo-nobg.png" alt="ZENYX Pulse" className="h-7 w-auto object-contain" style={{ maxWidth: "180px" }} />
          </div>
          <p className="text-xs text-gray-400 text-center">ZENYX Pulse · Healthcare Infrastructure Intelligence Platform</p>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} ZENYX IT Infra Solutions</p>
        </div>
      </footer>
    </div>
  );
}
