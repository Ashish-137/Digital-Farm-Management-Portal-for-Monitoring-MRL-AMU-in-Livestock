const STORAGE_KEY = "farmguard-users";
const SESSION_KEY = "farmguard-session";
const DATA_KEY = "farmguard-data";
const CHANNEL_NAME = "farmguard-live";
let charts = {};

const evidenceSources = [
  { label: "WHO AMR Fact Sheet", note: "21 Nov 2023", url: "https://www.who.int/en/news-room/fact-sheets/detail/antimicrobial-resistance" },
  { label: "WOAH AMU Overview", note: "2025", url: "https://www.woah.org/en/article/less-antimicrobial-use-in-animals-a-win-for-everyone/" },
  { label: "DAHD Annual Report 2024-25", note: "Milk and egg output", url: "https://www.dahd.gov.in/sites/default/files/2025-05/Annual-Report202425.pdf" },
  { label: "BAHS 2025", note: "Livestock GVA", url: "https://dahd.gov.in/sites/default/files/2026-02/BAHS2025.pdf" }
];

const insightStats = [
  { value: "31%", label: "Livestock share of India agricultural GVA in 2023-24" },
  { value: "142.77B", label: "Eggs produced in India in 2023-24" },
  { value: "25%", label: "India share of world milk production" }
];

const roleThemes = {
  "Farm Owner": { glyph: "FM", label: "Farm Owner", note: "Registry and farm operations", bodyClass: "theme-owner" },
  Veterinarian: { glyph: "VT", label: "Veterinarian", note: "Clinical oversight and prescriptions", bodyClass: "theme-vet" },
  "Regulatory Authority": { glyph: "RA", label: "Authority", note: "Compliance and standards control", bodyClass: "theme-authority" },
  "Public Health Analyst": { glyph: "PH", label: "Analyst", note: "AMR trends and risk intelligence", bodyClass: "theme-analyst" },
  "Processing Plant Operator": { glyph: "PP", label: "Plant Operator", note: "Clearance and intake verification", bodyClass: "theme-plant" },
  "System Administrator": { glyph: "SA", label: "System Admin", note: "Platform integrity and security", bodyClass: "theme-admin" }
};

const defaultUsers = [
  { name: "FarmGuard Authority Desk", email: "govt@farmguard.in", role: "Regulatory Authority", password: "FarmGuard123" },
  { name: "Ramesh Patel", email: "owner@farmguard.in", role: "Farm Owner", password: "FarmOwner123" },
  { name: "Dr. Meera Joshi", email: "vet@farmguard.in", role: "Veterinarian", password: "VetCare123" },
  { name: "Dr. Kavya Rao", email: "analyst@farmguard.in", role: "Public Health Analyst", password: "Analyst123" },
  { name: "Rohit Meena", email: "plant@farmguard.in", role: "Processing Plant Operator", password: "Plant123" },
  { name: "Neha Verma", email: "sysadmin@farmguard.in", role: "System Administrator", password: "Admin123" }
];

const defaultData = {
  animals: [
    { id: "AN-2101", farm: "Green Valley Dairy", animalTag: "GV-C-102", species: "Cattle", stage: "Lactating", assignedTo: "Dr. Meera Joshi", status: "Healthy", createdBy: "Ramesh Patel", createdAt: "01 Apr 2026 07:40" },
    { id: "AN-2102", farm: "Green Valley Dairy", animalTag: "GV-C-118", species: "Cattle", stage: "Treatment pen", assignedTo: "Rakesh Kumar", status: "Under Observation", createdBy: "Ramesh Patel", createdAt: "01 Apr 2026 07:55" }
  ],
  prescriptions: [
    { id: "RX-2041", farm: "Green Valley Dairy", drug: "Ceftiofur", diagnosis: "Post-partum infection", status: "Active", createdBy: "Dr. Meera Joshi", createdAt: "01 Apr 2026 09:10" }
  ],
  treatments: [
    { id: "TR-4401", farm: "Green Valley Dairy", animalLot: "Cattle Lot CT-44", drug: "Oxytetracycline", dosage: "20 ml", status: "Withdrawal Active", updatedBy: "Ramesh Patel", updatedAt: "01 Apr 2026 08:30" }
  ],
  inspections: [
    { id: "VIS-788", location: "Karnal South", finding: "Withdrawal verification pending evidence sync", status: "Evidence Pending", createdBy: "Anita Singh", createdAt: "01 Apr 2026 10:05" }
  ],
  advisories: [
    { id: "ADV-118", region: "Punjab North", subject: "Elevated poultry AMU", status: "Open", createdBy: "FarmGuard Admin", createdAt: "01 Apr 2026 07:45" }
  ],
  notifications: [
    { id: "NT-1", role: "Farm Owner", title: "Veterinary prescription issued", message: "RX-2041 was issued for Green Valley Dairy and needs farm execution.", sourceRole: "Veterinarian", createdAt: "01 Apr 2026 09:10" }
  ]
};

const roleConfigs = {
  "Farm Owner": {
    banner: "Farm overview",
    purpose: "Farm Owners manage the farm registry itself. They add animals, assign staff or veterinarians, and monitor medicine, treatment, inspection, and withdrawal updates across the farm. They review activity, but they do not issue prescriptions or regulatory advisories.",
    permissions: ["Add animals to the farm registry", "Track assigned worker or veterinarian", "View prescriptions, medicines, and inspections", "Monitor treatment and withdrawal progress", "Cannot issue prescriptions or advisories"],
    metrics: [
      { label: "Registered Animals", value: "418", detail: "Animals and production lots tracked in this farm account." },
      { label: "People Working Today", value: "14", detail: "Farm staff, vets, and field teams assigned across units." },
      { label: "Medicine Alerts", value: "9", detail: "Treatments, prescriptions, or withdrawal actions awaiting review." }
    ],
    workflows: [
      "Register each animal or lot with a clear tag, species, stage, and assigned person.",
      "Track which veterinarian or worker is currently handling the animal, shed, or treatment group.",
      "Review medicine instructions, prescription changes, and treatment history in one running feed.",
      "Check inspection and withdrawal updates before dispatch, sale, or milk collection."
    ],
    actions: ["Add Animal", "View Farm Activity", "Check Medicines", "Review Withdrawal", "Export Farm Report"],
    operations: [
      { title: "Animal registry update", detail: "Six calves from the morning intake still need tags and shed assignment." },
      { title: "Vet round coordination", detail: "Dr. Meera Joshi is reviewing two dairy cases and one withdrawal hold." },
      { title: "Medicine watch", detail: "Three active drugs need stock and administration confirmation by evening." }
    ],
    alerts: [
      { title: "Worker assignment missing", detail: "Two active animals do not have a responsible worker assigned." },
      { title: "Withdrawal lock active", detail: "Lot CT-44 must not be sold before 3 April 2026." },
      { title: "Prescription updated", detail: "A veterinarian changed one medicine plan this morning and it needs acknowledgement." }
    ],
    tableTitle: "Farm Animal and Staffing Snapshot",
    tableTag: "Registry View",
    tableHeaders: ["Animal / Lot", "Species", "Assigned To", "Medicine Status", "Next Action"],
    tableRows: [
      ["GV-C-102", "Cattle", "Dr. Meera Joshi", "Ceftiofur active", "Review response at 6 PM"],
      ["GV-C-118", "Cattle", "Rakesh Kumar", "Withdrawal watch", "Do not release milk"],
      ["GV-B-044", "Buffalo", "Sonal Devi", "No active medicine", "Routine health check"]
    ],
    editor: {
      title: "Animal Registry Workspace",
      tag: "Farm Registry",
      feedTitle: "Farm Animal Overview",
      entity: "animals",
      fields: [
        { name: "farm", label: "Farm", type: "text", placeholder: "Green Valley Dairy" },
        { name: "animalTag", label: "Animal Tag", type: "text", placeholder: "GV-C-205" },
        { name: "species", label: "Species", type: "select", options: ["Cattle", "Buffalo", "Goat", "Poultry", "Sheep"] },
        { name: "stage", label: "Stage / Group", type: "text", placeholder: "Lactating" },
        { name: "assignedTo", label: "Assigned To", type: "text", placeholder: "Rakesh Kumar / Dr. Meera Joshi" },
        { name: "status", label: "Animal Status", type: "select", options: ["Healthy", "Under Observation", "Treatment Active", "Withdrawal Hold"] }
      ],
      aggregateFeed: true
    }
  },
  Veterinarian: {
    banner: "This workspace is centered on prescriptions, case follow-up, treatment appropriateness, and stewardship so clinical oversight stays connected to what farms are actually administering.",
    purpose: "Veterinarians issue prescriptions, monitor case safety, and guide stewardship. Their changes should reach farms immediately, but they should not edit inspection or regulatory decisions.",
    permissions: ["Create or update prescriptions", "Add clinical notes", "Review treatment appropriateness", "Notify farms of prescription changes", "Cannot close regulatory enforcement"],
    metrics: [
      { label: "Active Prescriptions", value: "54", detail: "Valid prescriptions currently linked to live farm cases." },
      { label: "Cases Requiring Review", value: "11", detail: "Escalated for dosage adjustment or therapy reassessment." },
      { label: "Guideline Adherence", value: "92%", detail: "Treatment plans aligned with protocol and diagnosis notes." }
    ],
    workflows: [
      "Issue or renew prescriptions tied to diagnosis, duration, and dose.",
      "Review farms with repeated antimicrobial use for the same syndrome.",
      "Monitor combination therapy and extra-label use flags requiring justification.",
      "Close cases only after treatment completion and withdrawal instruction confirmation."
    ],
    actions: ["Create Prescription", "Review Escalated Case", "Approve Renewal", "Add Clinical Note", "Print Stewardship Summary"],
    operations: [
      { title: "Clinical review queue", detail: "Six respiratory cases need culture-guided follow-up advice." },
      { title: "Prescription renewals", detail: "Nine entries await sign-off for continuing therapy past 5 days." },
      { title: "Field consultation slots", detail: "Three on-site visits scheduled for high-AMU farms this afternoon." }
    ],
    alerts: [
      { title: "Repeated therapy pattern", detail: "Farm GV-12 has used the same class three times this month." },
      { title: "Dose mismatch", detail: "One entered poultry dose exceeds the prescription plan by 8%." },
      { title: "Unlinked treatment", detail: "Four farm records were entered without a valid prescription reference." }
    ],
    tableTitle: "Prescription Surveillance",
    tableTag: "Clinical Oversight",
    tableHeaders: ["Prescription ID", "Farm", "Drug", "Status", "Clinical Action"],
    tableRows: [
      ["RX-2041", "Green Valley Dairy", "Ceftiofur", "Active", "Review response at 48h"],
      ["RX-2058", "Sunrise Poultry Shed", "Amoxicillin", "Renewal pending", "Approve or adjust duration"],
      ["RX-2064", "Riverbend Goat Farm", "Oxytetracycline", "Dose mismatch", "Validate entry with farmer"]
    ],
    editor: {
      title: "Prescription Workspace",
      tag: "Clinical Updates",
      feedTitle: "Recent Prescriptions",
      entity: "prescriptions",
      fields: [
        { name: "farm", label: "Farm", type: "text", placeholder: "Green Valley Dairy" },
        { name: "drug", label: "Drug", type: "text", placeholder: "Ceftiofur" },
        { name: "diagnosis", label: "Diagnosis", type: "text", placeholder: "Respiratory infection" },
        { name: "status", label: "Prescription Status", type: "select", options: ["Active", "Renewal Pending", "Completed"] }
      ]
    }
  },
  "Regulatory Authority": {
    banner: "Regulatory authorities monitor AMU across farms, species, and regions while enforcing MRL compliance, managing standards, and reviewing traceable audit activity.",
    purpose: "This role owns compliance oversight. Regulatory authorities review cross-farm trends, flag violations, set thresholds and withdrawal standards, and produce official policy-facing reports.",
    permissions: ["Monitor farms and regions", "Set MRL thresholds", "Update withdrawal standards", "Review audit trails", "Generate compliance reports"],
    metrics: [
      { label: "Reporting Farms", value: "1,248", detail: "Active submissions across connected districts this month." },
      { label: "High-Risk Alerts", value: "27", detail: "Residue or misuse patterns needing immediate review." },
      { label: "Regional Compliance", value: "88%", detail: "Composite adherence across AMU and MRL reporting controls." }
    ],
    workflows: [
      "Track AMU trends across species, districts, and reporting periods.",
      "Flag MRL violations and unresolved withdrawal breaches.",
      "Update threshold rules and withdrawal standards when regulations change.",
      "Generate automated briefs for district and national decision-making."
    ],
    actions: ["Review Violations", "Update Standards", "Export Report", "Inspect Audit Trail", "Publish Notice"],
    operations: [
      { title: "Threshold review", detail: "MRL guidance for two antibiotic classes is under policy review." },
      { title: "Regional watch", detail: "Punjab North and UP West remain on the enforcement watchlist." },
      { title: "Monthly reporting", detail: "State AMU compliance brief due by end of day." }
    ],
    alerts: [
      { title: "Repeated non-compliance", detail: "Three farms crossed the allowable correction window twice." },
      { title: "Audit trail requested", detail: "One batch requires blockchain-backed record verification." },
      { title: "Threshold update pending", detail: "New withdrawal standards are awaiting publication." }
    ],
    tableTitle: "Compliance and Region Snapshot",
    tableTag: "Authority View",
    tableHeaders: ["Region", "Species Focus", "AMU Risk", "MRL Status", "Action"],
    tableRows: [
      ["Punjab North", "Poultry", "High", "4 residue alerts", "Open enforcement review"],
      ["Haryana Central", "Cattle", "Moderate", "Within limits", "Continue monitoring"],
      ["UP West", "Mixed livestock", "Elevated", "3 blocked consignments", "Issue compliance order"]
    ],
    editor: {
      title: "Standards and Advisory Workspace",
      tag: "Authority Actions",
      feedTitle: "Recent Authority Updates",
      entity: "advisories",
      fields: [
        { name: "region", label: "Region", type: "text", placeholder: "Punjab North" },
        { name: "subject", label: "Rule / Advisory", type: "text", placeholder: "Withdrawal period update" },
        { name: "status", label: "Status", type: "select", options: ["Open", "Monitoring", "Closed"] }
      ]
    }
  },
  "Public Health Analyst": {
    banner: "Public health analysts use the portal to study AMU patterns, detect high-risk behavior, and support AMR mitigation and reporting.",
    purpose: "This role is analytical rather than operational. Analysts compare geographies, time periods, and species to identify risk patterns and generate AMR insights for policy and public health programs.",
    permissions: ["View AMU trend data", "Compare geographies and species", "Generate AMR insight notes", "Export analytical reports", "Cannot alter prescriptions or farm records"],
    metrics: [
      { label: "Trend Models", value: "12", detail: "Saved analytical views across species and geographies." },
      { label: "Risk Clusters", value: "6", detail: "High-usage patterns requiring epidemiological review." },
      { label: "Reporting Packs", value: "9", detail: "Prepared for national and partner AMR reporting." }
    ],
    workflows: [
      "Compare AMU over time and isolate shifts by antimicrobial class.",
      "Identify emerging resistance-risk behavior by geography and species.",
      "Prepare technical insights for AMR mitigation strategy teams.",
      "Support national and global reporting with clean summaries."
    ],
    actions: ["Run Analysis", "Compare Regions", "Export Dataset", "Create Insight Note", "Publish Summary"],
    operations: [
      { title: "Quarterly trend analysis", detail: "Three-year poultry AMU comparison ready for interpretation." },
      { title: "Hotspot mapping", detail: "Two mixed-livestock clusters show elevated repeat usage patterns." },
      { title: "Reporting alignment", detail: "National AMR summary requires updated species-wise visuals." }
    ],
    alerts: [
      { title: "Usage spike", detail: "Goat treatment intensity rose sharply in one western cluster." },
      { title: "Data anomaly", detail: "Two farms reported unusually high repeat dosage frequency." },
      { title: "Reporting gap", detail: "One district remains below the analyst minimum completeness threshold." }
    ],
    tableTitle: "AMR Insight Snapshot",
    tableTag: "Analysis View",
    tableHeaders: ["Cluster", "Species", "Signal", "Trend", "Next Analysis"],
    tableRows: [
      ["Cluster A", "Poultry", "High repeat class use", "Rising", "Resistance review"],
      ["Cluster C", "Cattle", "Stable stewardship", "Flat", "Monthly follow-up"],
      ["Cluster F", "Goat", "Treatment density spike", "Rising", "Dose pattern audit"]
    ],
    editor: {
      title: "Insight Workspace",
      tag: "AMR Analysis",
      feedTitle: "Recent Insight Notes",
      entity: "advisories",
      fields: [
        { name: "region", label: "Region / Cluster", type: "text", placeholder: "Cluster A" },
        { name: "subject", label: "Insight", type: "text", placeholder: "High repeat tetracycline use" },
        { name: "status", label: "Status", type: "select", options: ["Open", "Reviewed", "Published"] }
      ]
    }
  },
  "Processing Plant Operator": {
    banner: "Processing plants use the portal to verify incoming livestock clearance, check withdrawal status, and reject non-compliant animals before processing.",
    purpose: "This role sits at the final compliance gate. Plant operators verify withdrawal clearance and MRL compliance certificates before accepting livestock for processing.",
    permissions: ["Verify clearance status", "View compliance certificates", "Flag rejected consignments", "Record intake decisions", "Cannot change farm or prescription data"],
    metrics: [
      { label: "Incoming Lots Today", value: "34", detail: "Lots scheduled for plant intake and verification." },
      { label: "Cleared For Processing", value: "29", detail: "Lots with valid withdrawal and compliance status." },
      { label: "Rejected / On Hold", value: "5", detail: "Lots blocked pending MRL or withdrawal confirmation." }
    ],
    workflows: [
      "Check withdrawal clearance before accepting an animal or batch.",
      "Validate MRL compliance certificates tied to incoming livestock.",
      "Reject or hold animals lacking clearance.",
      "Record plant intake decisions with traceable timestamps."
    ],
    actions: ["Verify Lot", "View Certificate", "Hold Consignment", "Reject Animal", "Export Intake Log"],
    operations: [
      { title: "Morning intake window", detail: "Nine dairy lots queued for pre-processing verification." },
      { title: "Certificate review", detail: "Three incoming batches require document confirmation." },
      { title: "Hold decision", detail: "One poultry consignment remains blocked by withdrawal status." }
    ],
    alerts: [
      { title: "Not cleared for sale", detail: "Lot CT-44 still has an active withdrawal hold." },
      { title: "Certificate missing", detail: "Two consignments arrived without valid compliance certificates." },
      { title: "Rejected intake", detail: "One animal batch failed plant-side acceptance review." }
    ],
    tableTitle: "Plant Intake Status",
    tableTag: "Processing Gate",
    tableHeaders: ["Lot / Batch", "Species", "Clearance", "Certificate", "Decision"],
    tableRows: [
      ["CT-44", "Cattle", "Withdrawal active", "Pending", "Hold"],
      ["PL-19", "Poultry", "Cleared", "Available", "Accept"],
      ["GT-08", "Goat", "MRL review", "Missing", "Reject until verified"]
    ],
    editor: {
      title: "Plant Verification Workspace",
      tag: "Intake Control",
      feedTitle: "Recent Intake Decisions",
      entity: "inspections",
      fields: [
        { name: "location", label: "Plant / Gate", type: "text", placeholder: "Processing Gate 2" },
        { name: "finding", label: "Decision Note", type: "text", placeholder: "Rejected due to withdrawal hold" },
        { name: "status", label: "Verification Status", type: "select", options: ["Accepted", "On Hold", "Rejected", "Escalated"] }
      ]
    }
  },
  "System Administrator": {
    banner: "System administrators manage access, integrations, integrity controls, and system health across the AMU portal.",
    purpose: "This role maintains the platform itself: user management, permissions, integration reliability, blockchain node oversight, and system security.",
    permissions: ["Manage users and roles", "Monitor system health", "Oversee integrations", "Review security logs", "Maintain blockchain nodes"],
    metrics: [
      { label: "Active Users", value: "2,846", detail: "Users currently provisioned across stakeholder roles." },
      { label: "Integration Health", value: "97%", detail: "Prescription, lab, and reporting connectors online." },
      { label: "Security Events", value: "4", detail: "Events needing administrator review today." }
    ],
    workflows: [
      "Manage access control and user permissions.",
      "Monitor connector health for prescriptions, labs, and reporting systems.",
      "Review integrity and blockchain node status.",
      "Investigate security, audit, and application log anomalies."
    ],
    actions: ["Create User", "Update Permissions", "Review Logs", "Check Integrations", "Inspect Nodes"],
    operations: [
      { title: "Access review", detail: "Twenty-three new accounts are pending role assignment." },
      { title: "Connector check", detail: "The lab results integration shows intermittent delay." },
      { title: "Security watch", detail: "Four elevated login events require admin review." }
    ],
    alerts: [
      { title: "Node health warning", detail: "One audit node is lagging behind the replication target." },
      { title: "Permission request", detail: "A district authority requested expanded report access." },
      { title: "Connector delay", detail: "Prescription sync latency crossed the warning threshold." }
    ],
    tableTitle: "System Operations Snapshot",
    tableTag: "Admin View",
    tableHeaders: ["Service", "Status", "Last Check", "Risk", "Action"],
    tableRows: [
      ["Auth Service", "Healthy", "09:32", "Low", "Observe"],
      ["Lab Integration", "Delayed", "09:28", "Medium", "Inspect connector"],
      ["Audit Node 3", "Lagging", "09:30", "High", "Reconcile chain state"]
    ],
    editor: {
      title: "Administration Workspace",
      tag: "System Control",
      feedTitle: "Recent System Updates",
      entity: "advisories",
      fields: [
        { name: "region", label: "System Area", type: "text", placeholder: "Auth Service" },
        { name: "subject", label: "Admin Action", type: "text", placeholder: "Permission review completed" },
        { name: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Closed"] }
      ]
    }
  }
};

const broadcastChannel = "BroadcastChannel" in window ? new BroadcastChannel(CHANNEL_NAME) : null;
let currentUser = null;

const signInTab = document.getElementById("signInTab");
const createTab = document.getElementById("createTab");
const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");
const statusMessage = document.getElementById("statusMessage");
const authPanel = document.getElementById("authPanel");
const dashboardPanel = document.getElementById("dashboardPanel");
const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeMeta = document.getElementById("welcomeMeta");
const logoutButton = document.getElementById("logoutButton");
const metricCardOne = document.getElementById("metricCardOne");
const metricCardTwo = document.getElementById("metricCardTwo");
const metricCardThree = document.getElementById("metricCardThree");
const roleBanner = document.getElementById("roleBanner");
const rolePurpose = document.getElementById("rolePurpose");
const permissionList = document.getElementById("permissionList");
const workflowList = document.getElementById("workflowList");
const quickActionList = document.getElementById("quickActionList");
const opsList = document.getElementById("opsList");
const alertList = document.getElementById("alertList");
const tableTitle = document.getElementById("tableTitle");
const tableTag = document.getElementById("tableTag");
const tableHeadRow = document.getElementById("tableHeadRow");
const tableBody = document.getElementById("tableBody");
const editorTitle = document.getElementById("editorTitle");
const editorTag = document.getElementById("editorTag");
const formFields = document.getElementById("formFields");
const formSubmitButton = document.getElementById("formSubmitButton");
const exportDataButton = document.getElementById("exportDataButton");
const recordForm = document.getElementById("recordForm");
const recordFeedTitle = document.getElementById("recordFeedTitle");
const recordFeed = document.getElementById("recordFeed");
const notificationList = document.getElementById("notificationList");
const notificationTag = document.getElementById("notificationTag");
const navTitle = document.getElementById("navTitle");
const roleNavLinks = document.querySelectorAll("#roleNavLinks .nav-link");
const sourceList = document.getElementById("sourceList");
const insightStatsList = document.getElementById("insightStats");
const roleBadge = document.getElementById("roleBadge");
const roleGlyph = document.getElementById("roleGlyph");
const roleLabel = document.getElementById("roleLabel");
const roleStyleNote = document.getElementById("roleStyleNote");

initializeStorage();
restoreSession();

signInTab.addEventListener("click", () => setMode("signin"));
createTab.addEventListener("click", () => setMode("signup"));
roleNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    roleNavLinks.forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

signinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("signinEmail").value.trim().toLowerCase();
  const password = document.getElementById("signinPassword").value;
  const users = getUsers();
  const user = users.find((entry) => entry.email === email && entry.password === password);
  if (!user) {
    setStatus("We couldn't match that email and password.");
    return;
  }
  currentUser = { name: user.name, email: user.email, role: user.role };
  saveSession(currentUser);
  showDashboard(currentUser);
  setStatus("");
  signinForm.reset();
});

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const role = document.getElementById("signupRole").value;
  const password = document.getElementById("signupPassword").value;
  const users = getUsers();
  if (users.some((entry) => entry.email === email)) {
    setStatus("That email is already registered. Try signing in instead.");
    setMode("signin");
    return;
  }
  const newUser = { name, email, role, password };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  currentUser = { name, email, role };
  saveSession(currentUser);
  showDashboard(currentUser);
  setStatus("");
  signupForm.reset();
});

logoutButton.addEventListener("click", () => {
  performLogout();
});

function performLogout() {
  localStorage.removeItem(SESSION_KEY);
  currentUser = null;
  dashboardPanel.classList.add("hidden");
  authPanel.classList.remove("hidden");
  document.body.classList.remove("dashboard-mode");
  setMode("signin");
  signinForm.reset();
  signupForm.reset();
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
  signInTab.focus();
  setStatus("You have been signed out.");
}

recordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!currentUser) {
    return;
  }
  const config = roleConfigs[currentUser.role];
  const entity = config.editor.entity;
  const formData = new FormData(recordForm);
  const values = {};
  config.editor.fields.forEach((field) => {
    values[field.name] = String(formData.get(field.name) || "").trim();
  });
  const now = formatNow();
  const record = { id: `${entity.slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-5)}`, ...values, createdBy: currentUser.name, updatedBy: currentUser.name, createdAt: now, updatedAt: now };
  const data = getAppData();
  data[entity].unshift(record);
  data.notifications.unshift(...buildNotificationsForUpdate(currentUser, entity, record));
  saveAppData(data);
  notifyLiveUpdate();
  renderRoleBanner(currentUser, data, roleConfigs[currentUser.role] || roleConfigs["Regulatory Authority"]);
  renderRoleWorkspace(currentUser);
  renderNotifications(currentUser);
  recordForm.reset();
  setStatus(`${config.editor.title} updated successfully.`);
});

exportDataButton.addEventListener("click", () => {
  if (!currentUser || currentUser.role !== "Farm Owner") {
    return;
  }

  exportFarmOwnerData();
  setStatus("Farm data export started.");
});

window.addEventListener("storage", (event) => {
  if (event.key === DATA_KEY && currentUser) {
    renderRoleBanner(currentUser, getAppData(), roleConfigs[currentUser.role] || roleConfigs["Regulatory Authority"]);
    renderRoleWorkspace(currentUser);
    renderNotifications(currentUser);
  }
});

if (broadcastChannel) {
  broadcastChannel.addEventListener("message", (event) => {
    if (event.data?.type === "farmguard-sync" && currentUser) {
      renderRoleBanner(currentUser, getAppData(), roleConfigs[currentUser.role] || roleConfigs["Regulatory Authority"]);
      renderRoleWorkspace(currentUser);
      renderNotifications(currentUser);
    }
  });
}

function setMode(mode) {
  const isSignin = mode === "signin";
  signInTab.classList.toggle("active", isSignin);
  createTab.classList.toggle("active", !isSignin);
  signinForm.classList.toggle("active", isSignin);
  signupForm.classList.toggle("active", !isSignin);
  setStatus("");
}

function setStatus(message) {
  statusMessage.textContent = message;
}

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(DATA_KEY)) {
    localStorage.setItem(DATA_KEY, JSON.stringify(defaultData));
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function getAppData() {
  return JSON.parse(localStorage.getItem(DATA_KEY) || JSON.stringify(defaultData));
}

function saveAppData(data) {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function restoreSession() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  if (session) {
    currentUser = session;
    showDashboard(session);
  }
}

function showDashboard(user) {
  const config = roleConfigs[user.role] || roleConfigs["Regulatory Authority"];
  const data = getAppData();
  document.body.classList.add("dashboard-mode");
  applyRoleTheme(user.role);
  authPanel.classList.add("hidden");
  dashboardPanel.classList.remove("hidden");
  welcomeTitle.textContent = `Welcome, ${user.name}`;
  welcomeMeta.textContent = `${user.role} account active for ${user.email}`;
  navTitle.textContent = `${user.role} Navigation`;
  roleNavLinks.forEach((item, index) => item.classList.toggle("active", index === 0));
  renderRoleBanner(user, data, config);
  rolePurpose.textContent = config.purpose;
  permissionList.innerHTML = config.permissions.map((item) => `<span class="pill">${item}</span>`).join("");
  renderMetricCard(metricCardOne, config.metrics[0]);
  renderMetricCard(metricCardTwo, config.metrics[1]);
  renderMetricCard(metricCardThree, config.metrics[2]);
  workflowList.innerHTML = config.workflows.map((item) => `<li>${item}</li>`).join("");
  quickActionList.innerHTML = config.actions.map((item) => `<span class="pill">${item}</span>`).join("");
  opsList.innerHTML = config.operations.map((item) => renderQueueItem(item.title, item.detail)).join("");
  alertList.innerHTML = config.alerts.map((item) => renderQueueItem(item.title, item.detail)).join("");
  tableTitle.textContent = config.tableTitle;
  tableTag.textContent = config.tableTag;
  tableHeadRow.innerHTML = config.tableHeaders.map((header) => `<th>${header}</th>`).join("");
  tableBody.innerHTML = config.tableRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");
  renderEvidencePanel();
  renderRoleWorkspace(user);
  renderNotifications(user);
}

function applyRoleTheme(role) {
  Object.values(roleThemes).forEach((theme) => document.body.classList.remove(theme.bodyClass));
  const theme = roleThemes[role] || roleThemes["Regulatory Authority"];
  document.body.classList.add(theme.bodyClass);
  roleGlyph.textContent = theme.glyph;
  roleLabel.textContent = theme.label;
  roleStyleNote.textContent = theme.note;
}

function renderRoleWorkspace(user) {
  const config = roleConfigs[user.role];
  const editor = config.editor;
  const data = getAppData();
  editorTitle.textContent = editor.title;
  editorTag.textContent = editor.tag;
  recordFeedTitle.textContent = editor.feedTitle;
  formFields.className = `form-grid ${editor.fields.length > 3 ? "two-column" : ""}`.trim();
  formFields.innerHTML = editor.fields.map(renderField).join("");
  formSubmitButton.textContent = `Save ${editor.title.replace(" Workspace", "")}`;
  exportDataButton.classList.toggle("hidden", user.role !== "Farm Owner");
  if (editor.aggregateFeed) {
    recordFeed.innerHTML = renderOwnerFarmPanel(data);
    return;
  }

  const records = data[editor.entity].slice(0, 4);
  recordFeed.innerHTML = records.length ? records.map((record) => renderRecordItem(editor.entity, record)).join("") : `<div class="empty-state">No updates yet for this role.</div>`;
}

function renderRoleBanner(user, data, config) {
  if (user.role !== "Farm Owner") {
    roleBanner.classList.remove("farm-banner");
    roleBanner.textContent = config.banner;
    return;
  }

  const animals = data.animals || [];
  const speciesIcons = {
    Cattle: "🐄",
    Buffalo: "🐃",
    Goat: "🐐",
    Poultry: "🐓",
    Sheep: "🐑"
  };

  const grouped = animals.reduce((acc, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {});

  const cards = Object.entries(grouped)
    .map(([species, count]) => `
      <article class="farm-banner-card">
        <div class="animal-icon">${speciesIcons[species] || "🐾"}</div>
        <div>
          <strong>${species}</strong>
          <p>${count} animals</p>
        </div>
      </article>
    `)
    .join("");

  roleBanner.classList.add("farm-banner");
  roleBanner.innerHTML = `
    <div class="farm-banner-head">
      <div>
        <p class="eyebrow mb-2">Farm Overview</p>
        <h3 class="mb-1">Green Valley Dairy</h3>
        <p class="purpose-copy mb-0">Track your animals, assigned people, medicines, and farm activity from one overview.</p>
      </div>
      <div class="farm-banner-total">
        <strong>${animals.length}</strong>
        <span>Total animals</span>
      </div>
    </div>
    <div class="farm-banner-grid">
      ${cards}
    </div>
  `;
}

function renderNotifications(user) {
  const data = getAppData();
  const visible = data.notifications.filter((item) => item.role === user.role || item.role === "All").slice(0, 6);
  notificationTag.textContent = `Live for ${user.role}`;
  notificationList.innerHTML = visible.length ? visible.map((item) => renderQueueItem(item.title, `${item.message} ${item.sourceRole} | ${item.createdAt}`, true)).join("") : `<div class="empty-state">No notifications yet for this role.</div>`;
}

function renderMetricCard(element, metric) {
  element.innerHTML = `<span>${metric.label}</span><strong>${metric.value}</strong><p>${metric.detail}</p>`;
}

function renderField(field) {
  if (field.type === "select") {
    return `<label>${field.label}<select name="${field.name}" required><option value="">Choose</option>${field.options.map((option) => `<option value="${option}">${option}</option>`).join("")}</select></label>`;
  }
  return `<label>${field.label}<input name="${field.name}" type="${field.type}" placeholder="${field.placeholder}" required></label>`;
}

function renderQueueItem(title, detail, highlighted = false) {
  return `<article class="queue-item ${highlighted ? "highlight" : ""}"><strong>${title}</strong><p>${detail}</p></article>`;
}

function renderRecordItem(entity, record) {
  const summaryMap = {
    animals: `${record.farm} | ${record.animalTag} | ${record.species} | ${record.assignedTo} | ${record.status}`,
    prescriptions: `${record.farm} | ${record.drug} | ${record.status}`,
    treatments: `${record.farm} | ${record.animalLot} | ${record.status}`,
    inspections: `${record.location} | ${record.finding} | ${record.status}`,
    advisories: `${record.region} | ${record.subject} | ${record.status}`
  };
  return `<article class="queue-item"><strong>${record.id}</strong><p>${summaryMap[entity]}</p><span class="meta-line">${record.createdBy || record.updatedBy} | ${record.createdAt || record.updatedAt}</span></article>`;
}

function getFarmOwnerFeed(data) {
  return [
    ...data.animals.map((item) => ({ ...item, feedEntity: "animals" })),
    ...data.treatments.map((item) => ({ ...item, feedEntity: "treatments" })),
    ...data.prescriptions.map((item) => ({ ...item, feedEntity: "prescriptions" })),
    ...data.inspections.map((item) => ({ ...item, feedEntity: "inspections" }))
  ]
    .sort((a, b) => Date.parse(normalizeTimestamp(b.createdAt || b.updatedAt)) - Date.parse(normalizeTimestamp(a.createdAt || a.updatedAt)))
    .slice(0, 5)
    .map((item) => ({ ...item, displayEntity: item.feedEntity }));
}

function renderOwnerFarmPanel(data) {
  const animals = data.animals || [];
  const speciesIcons = {
    Cattle: "🐄",
    Buffalo: "🐃",
    Goat: "🐐",
    Poultry: "🐓",
    Sheep: "🐑"
  };

  const grouped = animals.reduce((acc, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {});

  const overviewCards = Object.entries(grouped).length
    ? Object.entries(grouped)
        .map(([species, count]) => `
          <article class="animal-type-card">
            <div class="animal-icon">${speciesIcons[species] || "🐾"}</div>
            <div>
              <strong>${species}</strong>
              <p>${count} animals in this farm</p>
            </div>
          </article>
        `)
        .join("")
    : `<div class="empty-state">No animals registered yet for this farm.</div>`;

  const activityFeed = getFarmOwnerFeed(data);
  const activityMarkup = activityFeed.length
    ? activityFeed.map((record) => renderRecordItem(record.displayEntity, record)).join("")
    : `<div class="empty-state">No farm activity yet.</div>`;

  return `
    <section class="farm-overview-block">
      <div class="farm-overview-head">
        <h4 class="panel-title">Animal Types In Your Farm</h4>
        <span class="overview-total">${animals.length} total animals</span>
      </div>
      <div class="animal-type-grid">
        ${overviewCards}
      </div>
    </section>
    <section class="farm-overview-block">
      <div class="farm-overview-head">
        <h4 class="panel-title">Live Farm Activity</h4>
        <span class="overview-total">Latest updates</span>
      </div>
      <div class="queue-list">
        ${activityMarkup}
      </div>
    </section>
  `;
}

function normalizeTimestamp(value) {
  if (!value) {
    return "01 Jan 1970 00:00";
  }

  const [day, month, year, time] = value.split(" ");
  return `${day} ${month} ${year} ${time || "00:00"}`;
}

function buildNotificationsForUpdate(user, entity, record) {
  const now = formatNow();
  const needsVetCare = entity === "animals"
    && user.role === "Farm Owner"
    && /dr\.|vet|doctor|meera|veterinarian/i.test(record.assignedTo || "")
    && ["Under Observation", "Treatment Active", "Withdrawal Hold"].includes(record.status);

  const templates = {
    animals: needsVetCare
      ? [
          { role: "Veterinarian", title: "Farmer requested treatment", message: `${record.animalTag} (${record.species}) at ${record.farm} was assigned to ${record.assignedTo} with status ${record.status}. Please review and treat the animal.` },
          { role: "Farm Owner", title: "Care request sent", message: `${record.animalTag} was routed to veterinary care for follow-up.` }
        ]
      : [
          { role: "Veterinarian", title: "New animal registered", message: `${record.animalTag} was added for ${record.farm} and may need vet mapping.` },
          { role: "System Administrator", title: "Farm registry changed", message: `${record.animalTag} was registered under ${record.farm}.` }
        ],
    prescriptions: [
      { role: "Farm Owner", title: "New veterinary prescription", message: `${record.id} for ${record.farm} was issued with status ${record.status}.` },
      { role: "Regulatory Authority", title: "Prescription oversight update", message: `${record.id} was created for ${record.farm} by ${user.name}.` },
      { role: "Public Health Analyst", title: "Prescription data updated", message: `${record.id} contributes new AMU data for ${record.farm}.` }
    ],
    treatments: [
      { role: "Veterinarian", title: "Farm treatment log updated", message: `${record.id} for ${record.farm} was updated to ${record.status}.` },
      { role: "Processing Plant Operator", title: "Treatment record changed", message: `${record.id} may affect future intake clearance for ${record.farm}.` }
    ],
    inspections: [
      { role: "Regulatory Authority", title: "Inspection escalation update", message: `${record.id} from ${record.location} is now ${record.status}.` },
      { role: "Farm Owner", title: "Field inspection posted", message: `${record.id} logged a new finding for ${record.location}.` }
    ],
    advisories: [
      { role: "All", title: "Regulatory advisory published", message: `${record.id} for ${record.region} is now ${record.status}: ${record.subject}.` }
    ]
  };
  return (templates[entity] || []).map((item, index) => ({ id: `NT-${Date.now()}-${index}`, role: item.role, title: item.title, message: item.message, sourceRole: user.role, createdAt: now }));
}

function exportFarmOwnerData() {
  const data = getAppData();
  const animals = data.animals || [];
  const treatments = data.treatments || [];
  const prescriptions = data.prescriptions || [];
  const inspections = data.inspections || [];
  const notifications = (data.notifications || []).filter((item) => item.role === "Farm Owner" || item.role === "All");

  const assignedPeople = animals.map((animal) => ({
    farm: animal.farm,
    animal_tag: animal.animalTag,
    species: animal.species,
    assigned_to: animal.assignedTo,
    stage: animal.stage,
    status: animal.status
  }));

  const vetAssignments = assignedPeople.filter((item) => /dr\.|vet|doctor|meera|veterinarian/i.test(item.assigned_to || ""));

  const speciesCounts = animals.reduce((acc, animal) => {
    acc[animal.species] = (acc[animal.species] || 0) + 1;
    return acc;
  }, {});

  const summaryRows = [
    { metric: "total_animals", value: animals.length },
    { metric: "total_treatments", value: treatments.length },
    { metric: "total_prescriptions", value: prescriptions.length },
    { metric: "total_inspections", value: inspections.length },
    { metric: "total_farmer_notifications", value: notifications.length },
    ...Object.entries(speciesCounts).map(([species, count]) => ({ metric: `${species.toLowerCase()}_count`, value: count })),
  ];

  const files = [
    { name: "farm-summary.csv", rows: summaryRows },
    { name: "animals.csv", rows: animals },
    { name: "assigned-staff-and-vets.csv", rows: assignedPeople },
    { name: "veterinarians-assigned.csv", rows: vetAssignments },
    { name: "treatments.csv", rows: treatments },
    { name: "prescriptions.csv", rows: prescriptions },
    { name: "inspections.csv", rows: inspections },
    { name: "farmer-notifications.csv", rows: notifications }
  ];

  files.forEach((file, index) => {
    const csv = convertRowsToCsv(file.rows);
    triggerDownload(csv, `farmguard-${file.name}`, "text/csv;charset=utf-8;");
  });
}

function convertRowsToCsv(rows) {
  if (!rows.length) {
    return "no_data\n";
  }

  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers
      .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );

  return [headers.join(","), ...lines].join("\n");
}

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function notifyLiveUpdate() {
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: "farmguard-sync" });
  }
}

function formatNow() {
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${date} ${time}`;
}

function renderEvidencePanel() {
  sourceList.innerHTML = evidenceSources
    .map((source) => `<a class="source-chip" href="${source.url}" target="_blank" rel="noreferrer">${source.label}<small>${source.note}</small></a>`)
    .join("");
  insightStatsList.innerHTML = insightStats
    .map((item) => `<article class="micro-stat"><strong>${item.value}</strong><span>${item.label}</span></article>`)
    .join("");
  renderCharts();
}

function renderCharts() {
  if (!window.Chart) {
    return;
  }

  destroyCharts();

  charts.amr = new Chart(document.getElementById("amrBurdenChart"), {
    type: "bar",
    data: {
      labels: ["Directly attributable", "Associated total"],
      datasets: [{
        data: [1.27, 4.95],
        backgroundColor: ["#1d6b57", "#b35c1e"],
        borderRadius: 14
      }]
    },
    options: chartOptions("Deaths in millions")
  });

  charts.animalUse = new Chart(document.getElementById("animalUseChart"), {
    type: "line",
    data: {
      labels: ["2020", "2021", "2022"],
      datasets: [{
        label: "mg/kg animal biomass",
        data: [102, 107.9, 97],
        borderColor: "#1d6b57",
        backgroundColor: "rgba(29,107,87,0.14)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: "#124a3d"
      }]
    },
    options: chartOptions("mg/kg")
  });

  charts.india = new Chart(document.getElementById("indiaProductionChart"), {
    type: "bar",
    data: {
      labels: ["2021-22", "2022-23", "2023-24"],
      datasets: [{
        label: "Milk production (MMT)",
        data: [222.07, 230.58, 239.3],
        backgroundColor: ["#cddfd7", "#8bb8aa", "#1d6b57"],
        borderRadius: 14
      }]
    },
    options: chartOptions("Million metric tonnes")
  });
}

function chartOptions(axisLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f1a16",
        titleColor: "#fffaf1",
        bodyColor: "#fffaf1"
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#66584b", font: { weight: "700" } }
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(35,24,14,0.08)" },
        ticks: { color: "#66584b" },
        title: {
          display: true,
          text: axisLabel,
          color: "#66584b"
        }
      }
    }
  };
}

function destroyCharts() {
  Object.values(charts).forEach((chart) => chart.destroy());
  charts = {};
}

