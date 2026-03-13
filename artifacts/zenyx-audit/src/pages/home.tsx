import React, { useState, useMemo } from "react";
import { 
  Building2, Settings, Shield, Server, Monitor, Wifi, HardDrive, 
  Network, Clock, Users, Lock, Database, Headphones, FileText, 
  AlertTriangle, CheckCircle2, XCircle, Package, Clipboard, Phone, 
  Mail, MapPin, Calendar, User, Zap, Eye, Layers, Activity 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
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
    // There are a specific max points possible if all worst answers are selected.
    // Actually the prompt says: Cap total at 100. Normalize if exceeds 100.
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
            className={`cursor-pointer border rounded-lg px-4 py-3 text-sm font-medium transition-all text-center
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-20">
      {/* HEADER SECTION */}
      <header className="w-full bg-[#111111] relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-[#111111] to-[#1a0a00] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        {/* Orange bottom border with gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-primary to-orange-300/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/8 border border-white/10 p-2.5 rounded-xl backdrop-blur-sm">
              <img src="/zenyx-icon.png" alt="ZENYX Logo" className="h-11 w-11 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
            <div className="border-l border-white/10 pl-4">
              <img src="/zenyx-logo.png" alt="ZENYX IT Infra Solutions" className="h-7 object-contain hidden md:block brightness-0 invert" onError={(e) => e.currentTarget.style.display = 'none'} />
              <h2 className="text-white font-black tracking-wider text-xl md:hidden">ZENYX</h2>
              <p className="text-[10px] text-primary/70 font-bold tracking-[0.3em] uppercase mt-1">IT INFRA SOLUTIONS</p>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-[1.7rem] font-black text-white tracking-tight leading-tight">Hospital IT Health Audit Tool</h1>
            <p className="text-primary/60 text-xs font-medium tracking-widest uppercase mt-1 md:hidden">IT Assessment Platform</p>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-primary text-xs font-bold tracking-wide uppercase">Live Assessment</p>
            </div>
            <p className="text-gray-500 text-xs mt-1">Assessing IT Reliability, Security & Operational Risk</p>
          </div>
        </div>
      </header>

      {/* Orange accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-orange-400 to-primary/30" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">

        {/* SECTION 1: HOSPITAL INFORMATION */}
        <section className="print-section">
          <Card className="shadow-lg border-none overflow-hidden rounded-xl bg-white">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
            <CardHeader className="border-b bg-gray-50/50 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">01</span>
                    <CardTitle className="text-xl text-gray-900">Hospital Information</CardTitle>
                  </div>
                  <CardDescription className="mt-1">Basic details about the healthcare facility being assessed</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center text-gray-700 font-semibold"><Building2 className="w-4 h-4 mr-2 text-gray-400"/> Hospital Name</Label>
                <Input value={formData.hospitalName} onChange={e => updateForm("hospitalName", e.target.value)} placeholder="e.g. City General Hospital" className="bg-gray-50 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-gray-700 font-semibold"><User className="w-4 h-4 mr-2 text-gray-400"/> Contact Person</Label>
                <Input value={formData.contactPerson} onChange={e => updateForm("contactPerson", e.target.value)} placeholder="Name of IT Head/Admin" className="bg-gray-50 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-gray-700 font-semibold"><Layers className="w-4 h-4 mr-2 text-gray-400"/> Designation</Label>
                <Input value={formData.designation} onChange={e => updateForm("designation", e.target.value)} placeholder="e.g. IT Manager" className="bg-gray-50 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-gray-700 font-semibold"><Phone className="w-4 h-4 mr-2 text-gray-400"/> Mobile Number</Label>
                <Input type="tel" value={formData.mobileNumber} onChange={e => updateForm("mobileNumber", e.target.value)} placeholder="+1 (555) 000-0000" className="bg-gray-50 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-gray-700 font-semibold"><Mail className="w-4 h-4 mr-2 text-gray-400"/> Email Address</Label>
                <Input type="email" value={formData.email} onChange={e => updateForm("email", e.target.value)} placeholder="admin@hospital.com" className="bg-gray-50 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-gray-700 font-semibold"><Network className="w-4 h-4 mr-2 text-gray-400"/> Number of Branches</Label>
                <Input type="number" value={formData.branches} onChange={e => updateForm("branches", e.target.value)} placeholder="e.g. 3" className="bg-gray-50 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-gray-700 font-semibold"><MapPin className="w-4 h-4 mr-2 text-gray-400"/> Location</Label>
                <Input value={formData.location} onChange={e => updateForm("location", e.target.value)} placeholder="City, State" className="bg-gray-50 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-gray-700 font-semibold"><Calendar className="w-4 h-4 mr-2 text-gray-400"/> Assessment Date</Label>
                <Input type="date" value={formData.assessmentDate} onChange={e => updateForm("assessmentDate", e.target.value)} className="bg-gray-50 focus-visible:ring-primary" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center text-gray-700 font-semibold"><User className="w-4 h-4 mr-2 text-gray-400"/> Assessed By</Label>
                <Input value={formData.assessedBy} onChange={e => updateForm("assessedBy", e.target.value)} placeholder="ZENYX Consultant Name" className="bg-gray-50 focus-visible:ring-primary" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 2: IT INFRASTRUCTURE ASSESSMENT */}
        <section className="print-section">
          <Card className="shadow-lg border-none overflow-hidden rounded-xl bg-white">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
            <CardHeader className="border-b bg-gray-50/50 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg text-primary">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">02</span>
                    <CardTitle className="text-xl text-gray-900">IT Infrastructure Assessment</CardTitle>
                  </div>
                  <CardDescription className="mt-1">Evaluate current systems, security posture, and physical infrastructure</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              
              {/* Category 1: Network & Connectivity */}
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6"><Network className="w-5 h-5 mr-2 text-primary" /> Network & Connectivity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center font-semibold text-gray-700"><Monitor className="w-4 h-4 mr-2 text-primary" /> Number of Computers</Label>
                      <Input type="number" value={formData.computers} onChange={e => updateForm("computers", e.target.value)} placeholder="Total endpoints" className="bg-gray-50 max-w-[200px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center font-semibold text-gray-700"><Server className="w-4 h-4 mr-2 text-primary" /> Number of Servers</Label>
                      <Input type="number" value={formData.servers} onChange={e => updateForm("servers", e.target.value)} placeholder="Total physical/virtual" className="bg-gray-50 max-w-[200px]" />
                    </div>
                    
                    <RadioGroup label="Firewall available?" icon={Shield} options={["Yes", "No", "Don't Know"]} value={formData.firewall} onChange={(v: string) => updateForm("firewall", v)} />
                    
                    {formData.firewall === "Yes" && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label className="flex items-center font-semibold text-gray-700"><Package className="w-4 h-4 mr-2 text-primary" /> Firewall Brand</Label>
                        <Input value={formData.firewallBrand} onChange={e => updateForm("firewallBrand", e.target.value)} placeholder="e.g. Fortinet, Sophos, SonicWall" className="bg-gray-50" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <RadioGroup label="Managed Switches?" icon={Network} options={["Yes", "No", "Partial"]} value={formData.managedSwitches} onChange={(v: string) => updateForm("managedSwitches", v)} />
                    <RadioGroup label="Internet Redundancy" icon={Wifi} options={["Single ISP", "Dual ISP", "No clarity"]} value={formData.internetRedundancy} onChange={(v: string) => updateForm("internetRedundancy", v)} />
                    <RadioGroup label="Average Network Downtime Frequency" icon={Clock} options={["Rare", "Monthly", "Weekly", "Frequently"]} value={formData.downtime} onChange={(v: string) => updateForm("downtime", v)} />
                  </div>
                </div>
              </div>

              {/* Category 2: Security & Backup */}
              <div className="p-6 border-b bg-gray-50/30">
                <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6"><Shield className="w-5 h-5 mr-2 text-primary" /> Security & Backup</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <RadioGroup label="Backup System Available?" icon={HardDrive} options={["Yes", "No", "Partial"]} value={formData.backupSystem} onChange={(v: string) => updateForm("backupSystem", v)} />
                    
                    <div className="space-y-3">
                      <Label className="flex items-center font-semibold text-gray-700"><Database className="w-4 h-4 mr-2 text-primary" /> Backup Type</Label>
                      <select 
                        value={formData.backupType} 
                        onChange={(e) => updateForm("backupType", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select Backup Type...</option>
                        <option value="NAS">NAS</option>
                        <option value="External HDD">External HDD</option>
                        <option value="Cloud">Cloud</option>
                        <option value="Local Server">Local Server</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                    </div>

                    <RadioGroup label="Server Monitoring?" icon={Activity} options={["Yes", "No", "Don't Know"]} value={formData.serverMonitoring} onChange={(v: string) => updateForm("serverMonitoring", v)} />
                  </div>
                  <div className="space-y-6">
                    <RadioGroup label="Endpoint Antivirus/Security?" icon={Shield} options={["Yes", "No", "Partial"]} value={formData.endpointSecurity} onChange={(v: string) => updateForm("endpointSecurity", v)} />
                    <RadioGroup label="User Access/Password Policy" icon={Lock} options={["Properly managed", "Partially managed", "Not managed"]} value={formData.passwordPolicy} onChange={(v: string) => updateForm("passwordPolicy", v)} />
                    <RadioGroup label="Data Security Awareness" icon={Users} options={["Strong", "Average", "Weak"]} value={formData.dataSecurity} onChange={(v: string) => updateForm("dataSecurity", v)} />
                  </div>
                </div>
              </div>

              {/* Category 3: Physical Infrastructure */}
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6"><Building2 className="w-5 h-5 mr-2 text-primary" /> Physical Infrastructure</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <RadioGroup label="CCTV Integrated with Network?" icon={Eye} options={["Yes", "No"]} value={formData.cctvIntegrated} onChange={(v: string) => updateForm("cctvIntegrated", v)} />
                    <RadioGroup label="Wi-Fi Coverage Quality" icon={Wifi} options={["Good", "Average", "Poor"]} value={formData.wifiQuality} onChange={(v: string) => updateForm("wifiQuality", v)} />
                    <RadioGroup label="Structured LAN Cabling Quality" icon={Network} options={["Good", "Average", "Poor"]} value={formData.cablingQuality} onChange={(v: string) => updateForm("cablingQuality", v)} />
                  </div>
                  <div className="space-y-6">
                    <RadioGroup label="Rack and Patch Management" icon={Server} options={["Proper", "Average", "Poor"]} value={formData.rackManagement} onChange={(v: string) => updateForm("rackManagement", v)} />
                    <RadioGroup label="UPS / Power Backup" icon={Zap} options={["Available", "Partial", "Not available"]} value={formData.ups} onChange={(v: string) => updateForm("ups", v)} />
                  </div>
                </div>
              </div>

              {/* Category 4: Storage & Support */}
              <div className="p-6 bg-gray-50/30">
                <h3 className="text-lg font-bold text-gray-800 flex items-center mb-6"><Headphones className="w-5 h-5 mr-2 text-primary" /> Storage & Support</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <RadioGroup label="NAS / Central Storage" icon={HardDrive} options={["Yes", "No", "Planned"]} value={formData.nas} onChange={(v: string) => updateForm("nas", v)} />
                    <RadioGroup label="Existing IT Support Model" icon={Users} options={["In-house", "Vendor on call", "No proper support"]} value={formData.itSupport} onChange={(v: string) => updateForm("itSupport", v)} />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center font-semibold text-gray-700"><AlertTriangle className="w-4 h-4 mr-2 text-primary" /> Critical Issues Observed</Label>
                      <Textarea value={formData.criticalIssues} onChange={e => updateForm("criticalIssues", e.target.value)} placeholder="List any major issues noticed during walkthrough..." className="bg-white min-h-[100px]" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center font-semibold text-gray-700"><FileText className="w-4 h-4 mr-2 text-primary" /> Additional Remarks</Label>
                      <Textarea value={formData.remarks} onChange={e => updateForm("remarks", e.target.value)} placeholder="Any other observations..." className="bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 3: RISK DASHBOARD (LIVE) */}
        <section className="print-section">
          <Card className="shadow-2xl border-none overflow-hidden rounded-xl bg-[#111111] text-white">
            <CardHeader className="border-b border-white/10 pb-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 bg-gradient-to-b from-primary to-orange-600 h-full" />
              <div className="absolute top-0 right-0 w-64 h-full opacity-5 bg-gradient-to-l from-primary to-transparent" />
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-3 rounded-lg text-primary border border-primary/30">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#111] bg-primary px-2 py-1 rounded">03</span>
                    <CardTitle className="text-xl text-white">Live Risk Intelligence Dashboard</CardTitle>
                  </div>
                  <CardDescription className="mt-1 text-gray-400">Real-time risk computation — updates as you complete the assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Gauge Area */}
                <div className="flex flex-col items-center justify-center lg:border-r border-white/10 lg:pr-12">
                  <div className="relative w-52 h-52 flex items-center justify-center">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full opacity-10" style={{ boxShadow: `0 0 40px 10px ${riskColor}` }} />
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      {/* Track */}
                      <circle
                        cx="18" cy="18" r="15.9155"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth="2.5"
                      />
                      {/* Progress arc */}
                      <circle
                        cx="18" cy="18" r="15.9155"
                        fill="none"
                        stroke={riskColor}
                        strokeWidth="2.8"
                        strokeDasharray={`${riskScore} 100`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 4px ${riskColor})` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-6xl font-black tabular-nums leading-none" style={{ color: riskColor }}>{riskScore}</span>
                      <span className="text-xs text-gray-500 font-bold tracking-widest mt-2 uppercase">Risk Score</span>
                      <span className="text-xs text-gray-600 mt-1">out of 100</span>
                    </div>
                  </div>
                  
                  <div 
                    className="mt-5 px-8 py-2.5 rounded-full font-black text-sm tracking-widest border uppercase"
                    style={{ borderColor: riskColor, color: riskColor, backgroundColor: `${riskColor}18` }}
                  >
                    {riskGrade}
                  </div>
                  
                  <p className="text-sm text-center text-gray-400 mt-5 max-w-[240px] leading-relaxed">
                    {riskGrade === "Low Risk" && "IT infrastructure appears relatively stable. Proactive monitoring and structured support can further improve reliability."}
                    {riskGrade === "Moderate Risk" && "Hospital has some existing IT foundation, but multiple gaps may affect uptime, security, and service continuity."}
                    {riskGrade === "High Risk" && "Infrastructure shows significant operational and security gaps that can impact patient service systems and daily workflows."}
                    {riskGrade === "Critical Risk" && "Hospital IT is highly vulnerable to downtime, security threats, and operational disruption. Immediate structured action is required."}
                  </p>

                  {/* Score scale legend */}
                  <div className="mt-6 w-full grid grid-cols-4 text-center gap-1">
                    {[
                      { label: "LOW", range: "0–25", color: "#22C55E" },
                      { label: "MOD", range: "26–50", color: "#F59E0B" },
                      { label: "HIGH", range: "51–75", color: "#F97316" },
                      { label: "CRIT", range: "76–100", color: "#DC2626" },
                    ].map(s => (
                      <div key={s.label} className="flex flex-col items-center gap-1">
                        <div className="h-1 w-full rounded-full" style={{ backgroundColor: s.color }} />
                        <p className="text-[9px] font-bold tracking-wider" style={{ color: s.color }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown & Vulnerabilities */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2">Risk Breakdown</h4>
                    
                    {[
                      { label: "Network Security", val: breakdown.network, max: 45 },
                      { label: "Backup & Recovery", val: breakdown.backup, max: 18 },
                      { label: "Data Security", val: breakdown.data, max: 26 },
                      { label: "Infrastructure", val: breakdown.infrastructure, max: 22 },
                      { label: "Support & Monitoring", val: breakdown.support, max: 20 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300 font-medium">{item.label}</span>
                          <span className="text-gray-500">{Math.round((item.val / item.max) * 100) || 0}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${Math.min(100, (item.val / item.max) * 100)}%`,
                              backgroundColor: (item.val / item.max) > 0.7 ? '#DC2626' : (item.val / item.max) > 0.4 ? '#F97316' : '#F59E0B'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-white/10 pb-2">Key Vulnerabilities</h4>
                    <ul className="space-y-3">
                      {actions.slice(0, 5).map((action, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-300">{action.title}</span>
                        </li>
                      ))}
                      {actions.length === 0 && riskScore === 0 && (
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-300">Awaiting assessment data...</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 4: RECOMMENDED ACTIONS */}
        {actions.length > 0 && (
          <section className="print-section">
            <Card className="shadow-lg border-none overflow-hidden rounded-xl bg-white">
              <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
              <CardHeader className="border-b bg-gray-50/50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary">
                    <Clipboard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">04</span>
                      <CardTitle className="text-xl text-gray-900">Recommended Actions</CardTitle>
                    </div>
                    <CardDescription className="mt-1">Prioritized steps to mitigate identified risks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {actions.map((action, idx) => (
                    <div key={idx} className="border border-gray-100 bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        action.priority === 'CRITICAL' ? 'bg-red-600' : 
                        action.priority === 'HIGH' ? 'bg-orange-500' : 
                        action.priority === 'MEDIUM' ? 'bg-amber-400' : 'bg-blue-500'
                      }`} />
                      <div className="pl-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className={`text-[10px] font-bold px-2 py-1 rounded tracking-wider ${
                            action.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                            action.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 
                            action.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {action.priority}
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{action.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{action.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* SECTION 5: MSP PACKAGES */}
        <section className="print-section">
          <Card className="shadow-lg border-none overflow-hidden rounded-xl bg-white">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-orange-300" />
            <CardHeader className="border-b bg-gray-50/50 pb-6 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-lg text-primary shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">05</span>
                      <CardTitle className="text-xl text-gray-900">Recommended MSP Packages</CardTitle>
                    </div>
                    <CardDescription className="mt-1">Managed services designed for healthcare environments</CardDescription>
                  </div>
                </div>
                {formData.hospitalName && (
                  <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-3 rounded-lg text-sm font-medium">
                    Based on a score of <strong>{riskScore}</strong>, we recommend the <strong>{recommendedPackage}</strong> for {formData.hospitalName}.
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 lg:p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
                
                {/* Package 1 — Monitoring */}
                <div className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                  recommendedPackage === 'Monitoring Package' 
                    ? 'shadow-2xl shadow-blue-200 ring-2 ring-blue-500 -translate-y-2' 
                    : 'shadow-md border border-gray-200 hover:shadow-lg'
                }`}>
                  {recommendedPackage === 'Monitoring Package' && (
                    <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-[10px] font-bold py-1.5 text-center uppercase tracking-widest">
                      ★ Recommended for This Hospital
                    </div>
                  )}
                  <div className={`p-6 ${recommendedPackage === 'Monitoring Package' ? 'pt-10' : ''} bg-gradient-to-br from-blue-50 to-white border-b border-blue-100`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
                        <Monitor className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Entry Level</p>
                        <h3 className="text-xl font-black text-gray-900">Monitoring</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">Proactive visibility into your IT environment with automated alerting and monthly health reports.</p>
                  </div>
                  <div className="p-6 bg-white flex-1 flex flex-col">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What's Included</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {[
                        "24/7 Network & Device Monitoring",
                        "Internet Health Monitoring",
                        "Firewall Availability Alerts",
                        "Automated Incident Alerting",
                        "Monthly IT Health Reports",
                        "Basic Patch Management"
                      ].map(feature => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-3 text-center">Ideal for: Low Risk Environments</p>
                      <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        recommendedPackage === 'Monitoring Package' 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-600' 
                          : 'border-2 border-blue-500 text-blue-600 hover:bg-blue-50'
                      }`}>
                        {recommendedPackage === 'Monitoring Package' ? '✓ Recommended Package' : 'Learn More'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Package 2 — Support (Most Popular) */}
                <div className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                  recommendedPackage === 'Support Package' 
                    ? 'shadow-2xl shadow-orange-200 ring-2 ring-orange-500 -translate-y-2' 
                    : 'shadow-md border border-orange-200 hover:shadow-lg'
                }`}>
                  <div className={`absolute top-0 left-0 right-0 text-white text-[10px] font-bold py-1.5 text-center uppercase tracking-widest ${
                    recommendedPackage === 'Support Package' ? 'bg-primary' : 'bg-orange-400'
                  }`}>
                    {recommendedPackage === 'Support Package' ? '★ Recommended for This Hospital' : '⭐ Most Popular'}
                  </div>
                  <div className="p-6 pt-10 bg-gradient-to-br from-orange-50 to-white border-b border-orange-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-orange-200">
                        <Headphones className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Standard Tier</p>
                        <h3 className="text-xl font-black text-gray-900">Support</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">Complete monitoring plus active helpdesk, preventive maintenance, and vendor coordination.</p>
                  </div>
                  <div className="p-6 bg-white flex-1 flex flex-col">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What's Included</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {[
                        "Everything in Monitoring",
                        "Unlimited Remote IT Support",
                        "Desktop & User Support",
                        "Preventive IT Maintenance",
                        "Vendor & ISP Coordination",
                        "Asset Tracking & Documentation",
                        "SLA-Based On-site Dispatch"
                      ].map(feature => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${feature.startsWith('Everything') ? 'text-gray-400' : 'text-primary'}`} />
                          <span className={feature.startsWith('Everything') ? 'text-gray-400 italic text-xs' : ''}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-3 text-center">Ideal for: Moderate Risk Environments</p>
                      <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        recommendedPackage === 'Support Package' 
                          ? 'bg-primary text-white shadow-lg shadow-orange-200 hover:bg-orange-600' 
                          : 'border-2 border-primary text-primary hover:bg-orange-50'
                      }`}>
                        {recommendedPackage === 'Support Package' ? '✓ Recommended Package' : 'Learn More'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Package 3 — Security (Enterprise) */}
                <div className={`relative rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ${
                  recommendedPackage === 'Security Package' 
                    ? 'shadow-2xl shadow-red-200 ring-2 ring-red-500 -translate-y-2' 
                    : 'shadow-md border border-gray-200 hover:shadow-lg'
                }`}>
                  {recommendedPackage === 'Security Package' && (
                    <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-[10px] font-bold py-1.5 text-center uppercase tracking-widest">
                      ★ Recommended for This Hospital
                    </div>
                  )}
                  <div className={`p-6 ${recommendedPackage === 'Security Package' ? 'pt-10' : ''} bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-red-300">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Enterprise Grade</p>
                        <h3 className="text-xl font-black text-white">Security</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">Full security governance, compliance guidance, and strategic IT risk management.</p>
                  </div>
                  <div className="p-6 bg-white flex-1 flex flex-col">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">What's Included</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {[
                        "Everything in Support",
                        "Security & Compliance Review",
                        "Firewall Policy Management",
                        "Backup & DR Testing",
                        "Endpoint Protection Suite",
                        "Staff Security Awareness Training",
                        "IT Risk & Governance Advisory",
                        "Annual Strategic IT Roadmap"
                      ].map(feature => (
                        <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${feature.startsWith('Everything') ? 'text-gray-400' : 'text-red-600'}`} />
                          <span className={feature.startsWith('Everything') ? 'text-gray-400 italic text-xs' : ''}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-3 text-center">Ideal for: High / Critical Risk Environments</p>
                      <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                        recommendedPackage === 'Security Package' 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-200 hover:bg-red-700' 
                          : 'border-2 border-gray-800 text-gray-800 hover:bg-gray-50'
                      }`}>
                        {recommendedPackage === 'Security Package' ? '✓ Recommended Package' : 'Learn More'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </section>

        {/* SECTION 6: EXECUTIVE SUMMARY REPORT */}
        {formData.hospitalName && (
          <section className="print-section">
            <Card className="shadow-lg border-2 border-gray-800 overflow-hidden rounded-xl bg-white">
              <CardHeader className="border-b bg-gray-900 text-white pb-6 p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <img src="/zenyx-logo.png" alt="ZENYX" className="h-8 object-contain bg-white/10 p-1 rounded mb-4" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <CardTitle className="text-2xl font-bold text-white">Executive IT Health Assessment</CardTitle>
                    <p className="text-gray-400 text-sm mt-1">Preliminary findings and strategic recommendations.</p>
                  </div>
                  <div className="bg-black/50 border border-white/20 p-4 rounded-lg flex items-center gap-4">
                    <div className="text-center px-4 border-r border-white/20">
                      <p className="text-xs text-gray-400 font-bold tracking-wider mb-1">SCORE</p>
                      <p className="text-3xl font-black" style={{ color: riskColor }}>{riskScore}<span className="text-sm text-gray-500">/100</span></p>
                    </div>
                    <div className="px-2">
                      <p className="text-xs text-gray-400 font-bold tracking-wider mb-1">GRADE</p>
                      <p className="text-lg font-bold" style={{ color: riskColor }}>{riskGrade}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 tracking-widest uppercase border-b pb-2 mb-4">Facility Details</h4>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-100"><td className="py-2 text-gray-500 w-1/3">Facility</td><td className="py-2 font-medium text-gray-900">{formData.hospitalName}</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Contact</td><td className="py-2 font-medium text-gray-900">{formData.contactPerson} ({formData.designation})</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Location</td><td className="py-2 font-medium text-gray-900">{formData.location}</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-2 text-gray-500">Scale</td><td className="py-2 font-medium text-gray-900">{formData.branches} Branches, {formData.computers} Endpoints</td></tr>
                        <tr><td className="py-2 text-gray-500">Assessment</td><td className="py-2 font-medium text-gray-900">{formData.assessmentDate} by {formData.assessedBy}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-400 tracking-widest uppercase border-b pb-2 mb-4">Strategic Recommendation</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        Based on the preliminary infrastructure review, ZENYX identifies the facility as operating at a <strong>{riskGrade.toLowerCase()}</strong> level concerning IT reliability and security.
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        Recommended Service Tier: {recommendedPackage}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="text-xs font-bold text-gray-400 tracking-widest uppercase border-b pb-2 mb-4">Priority Action Items</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {actions.slice(0, 6).map((action, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${
                            action.priority === 'CRITICAL' ? 'bg-red-500' : 
                            action.priority === 'HIGH' ? 'bg-orange-500' : 'bg-amber-400'
                          }`} />
                          <div>
                            <p className="text-sm font-bold text-gray-900">{action.title}</p>
                            <p className="text-xs text-gray-500">{action.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.criticalIssues && (
                    <div className="md:col-span-2">
                      <h4 className="text-xs font-bold text-gray-400 tracking-widest uppercase border-b pb-2 mb-2">Consultant Notes</h4>
                      <p className="text-sm text-gray-700 italic border-l-2 border-primary pl-4">{formData.criticalIssues}</p>
                    </div>
                  )}

                </div>

                <div className="mt-12 text-center text-xs text-gray-400 border-t pt-4">
                  This assessment is indicative and intended for preliminary IT health evaluation.<br/>
                  Assessed by ZENYX IT Infra Solutions
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* ACTION BUTTONS (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-8 print:hidden">
          <Button 
            size="lg" 
            className="bg-primary hover:bg-orange-600 text-white font-bold px-8 shadow-lg shadow-orange-500/20"
            onClick={() => window.print()}
          >
            <FileText className="w-5 h-5 mr-2" /> Print Report
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            onClick={() => window.print()}
          >
            Export as PDF
          </Button>
          <Button 
            size="lg" 
            variant="ghost" 
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => {
              if(confirm("Are you sure you want to reset all form data?")) {
                window.location.reload();
              }
            }}
          >
            Reset Form
          </Button>
        </div>
      </main>

      <footer className="bg-[#111111] text-center py-8 mt-12 border-t border-white/10 print:hidden">
        <p className="text-white font-medium text-sm">ZENYX IT Infra Solutions</p>
        <p className="text-gray-500 text-xs mt-1">Reliable IT Infrastructure for Critical Environments</p>
        <p className="text-gray-600 text-xs mt-4 max-w-xl mx-auto px-4">This assessment tool provides an indicative health score and is intended for preliminary IT evaluation purposes only.</p>
        <p className="text-gray-700 text-xs mt-2">&copy; {new Date().getFullYear()} ZENYX. All rights reserved.</p>
      </footer>
    </div>
  );
}
