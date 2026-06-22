import { useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconArchive,
  IconBell,
  IconBriefcase,
  IconCalendarEvent,
  IconChartDonut3,
  IconChevronDown,
  IconChevronsLeft,
  IconCircleCheck,
  IconClipboardList,
  IconClock,
  IconDatabase,
  IconDownload,
  IconFileText,
  IconFilter,
  IconGauge,
  IconGridDots,
  IconInfoCircle,
  IconLayoutBoard,
  IconMapPin,
  IconMessageCircle,
  IconPlus,
  IconReportAnalytics,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconSparkles,
  IconTimeline,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import portfolioData from "./data/enriched_initiatives.json";

const MONTHS = [
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
  "2026-09",
  "2026-10",
  "2026-11",
  "2026-12",
  "2027-01",
  "2027-02",
  "2027-03",
];

const NAV_ITEMS = [
  ["Dashboard", IconGauge],
  ["Portfolio", IconChartDonut3],
  ["Projects", IconBriefcase],
  ["Work Items", IconClipboardList],
  ["Cycles", IconClock],
  ["Resources", IconUsers],
  ["Timeline", IconTimeline],
  ["BCPF Map", IconMapPin],
  ["Pages", IconFileText],
  ["Reports", IconReportAnalytics],
  ["Settings", IconSettings],
];

const MEMBER_PROFILES = [
  { id: "danny-hu", name: "Danny Hu", role: "Portfolio Lead", capacity: 21, color: "#2563eb", skills: ["Planning", "BCPF", "Steering"] },
  { id: "james-wang", name: "James Wang", role: "Delivery Manager", capacity: 20, color: "#0891b2", skills: ["Delivery", "Timeline", "Risk"] },
  { id: "michael-karchov", name: "Michael Karchov", role: "Solution Architect", capacity: 22, color: "#7c3aed", skills: ["Architecture", "M&S", "Integration"] },
  { id: "ryan-park", name: "Ryan Park", role: "Product Manager", capacity: 20, color: "#0f766e", skills: ["Leasing", "Workflow", "UAT"] },
  { id: "sterling-zeng", name: "Sterling Zeng", role: "Data Platform", capacity: 20, color: "#c2410c", skills: ["Data", "Migration", "Reporting"] },
  { id: "jimmy-guo", name: "Jimmy Guo", role: "QA Lead", capacity: 19, color: "#be123c", skills: ["QA", "SIT", "Release"] },
  { id: "sean-wang", name: "Sean Wang", role: "Business Analyst", capacity: 18, color: "#4f46e5", skills: ["PSD", "Process", "Change"] },
  { id: "mei-lin", name: "Mei Lin", role: "PMO Coordinator", capacity: 20, color: "#db2777", skills: ["Governance", "Minutes", "Decks"] },
];

const STATUS_META = {
  todo: { label: "To Do", tone: "neutral" },
  wip: { label: "WIP", tone: "info" },
  review: { label: "Review", tone: "warning" },
  blocked: { label: "Blocked", tone: "danger" },
  done: { label: "Done", tone: "success" },
};

const PRIORITY_META = {
  low: { label: "Low", tone: "neutral" },
  medium: { label: "Medium", tone: "info" },
  high: { label: "High", tone: "warning" },
  urgent: { label: "Urgent", tone: "danger" },
};

function hashText(value) {
  return [...String(value)].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9973, 7);
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function money(value) {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${Math.round(value).toLocaleString()}`;
}

function compactMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function monthLabel(value) {
  const date = new Date(`${value}-02T00:00:00`);
  return date.toLocaleString("en", { month: "short", year: "numeric" });
}

function ownerToMember(owner) {
  const normalized = String(owner || "").toLowerCase();
  const direct = MEMBER_PROFILES.find((member) => normalized.includes(member.name.toLowerCase()));
  if (direct) return direct.id;
  return MEMBER_PROFILES[hashText(normalized) % MEMBER_PROFILES.length].id;
}

function buildProjects(initiatives) {
  const grouped = new Map();
  initiatives.forEach((item) => {
    const id = slug(item.sub_project || "Other");
    const current = grouped.get(id) || {
      id,
      name: item.sub_project || "Other",
      budget: 0,
      initiatives: [],
      above: 0,
      below: 0,
      domains: new Set(),
    };
    current.budget += Number(item.budget || 0);
    current.initiatives.push(item);
    if (item.status === "Above the Line") current.above += 1;
    else current.below += 1;
    if (item.bcpf_l1) current.domains.add(item.bcpf_l1);
    grouped.set(id, current);
  });
  return [...grouped.values()]
    .sort((a, b) => b.budget - a.budget)
    .map((project, index) => ({
      ...project,
      count: project.initiatives.length,
      color: ["#2563eb", "#0891b2", "#7c3aed", "#16a34a", "#ea580c", "#dc2626", "#64748b"][index % 7],
      ownerId: ownerToMember(project.initiatives[0]?.dt_owner_initiative || project.initiatives[0]?.dt_owners),
      domains: [...project.domains],
    }));
}

function buildWorkItems(initiatives, projects) {
  const statusCycle = ["wip", "review", "todo", "done", "blocked"];
  const priorityCycle = ["medium", "high", "low", "urgent"];
  return initiatives.map((item, index) => {
    const project = projects.find((candidate) => candidate.name === item.sub_project);
    const seed = hashText(`${item.item_code}-${item.initiative}`);
    const status =
      item.status === "Below the Line"
        ? statusCycle[(seed + 2) % statusCycle.length]
        : statusCycle[seed % 4];
    const ownerId = ownerToMember(item.dt_owner_initiative || item.dt_owners || item.dt_it_pm);
    const participantA = MEMBER_PROFILES[(seed + 1) % MEMBER_PROFILES.length].id;
    const participantB = MEMBER_PROFILES[(seed + 4) % MEMBER_PROFILES.length].id;
    return {
      id: `E2-${String(index + 1).padStart(3, "0")}`,
      title: item.initiative,
      summary: item.description || item.business_benefit || "Portfolio execution work item",
      projectId: project?.id || "other",
      projectName: item.sub_project,
      ownerId,
      participants: [...new Set([ownerId, participantA, participantB])],
      status,
      priority: priorityCycle[seed % priorityCycle.length],
      progress: status === "done" ? 100 : status === "review" ? 78 : status === "wip" ? 52 : status === "blocked" ? 35 : 10,
      budget: Number(item.budget || 0),
      lineStatus: item.status,
      domain: item.bcpf_l1 || "Other",
      due: item.timeline?.Go_live || "2027-01",
      gates: item.timeline || {},
      blocker:
        status === "blocked"
          ? `Waiting on ${item.bcpf_l1 || "business"} dependency before ${item.timeline?.UAT || "UAT"}.`
          : "",
      comments: [
        {
          author: MEMBER_PROFILES[(seed + 3) % MEMBER_PROFILES.length].name,
          text: status === "blocked" ? "Dependency is visible in weekly steering. ETA needs owner confirmation." : "Updated progress and next gate readiness.",
          time: "Jun 4, 2026 10:32",
        },
      ],
    };
  });
}

function buildInitialAllocations(projects) {
  const allocations = {};
  MEMBER_PROFILES.forEach((member, memberIndex) => {
    projects.forEach((project, projectIndex) => {
      const owned = project.initiatives.filter((item) => ownerToMember(item.dt_owner_initiative || item.dt_owners) === member.id);
      const roleDays = project.initiatives.reduce((sum, item) => {
        const ownedByMember = ownerToMember(item.dt_owner_initiative || item.dt_owners) === member.id;
        if (!ownedByMember) return sum;
        return sum + (item.resource_plan || []).slice(0, 2).reduce((roleSum, role) => roleSum + Number(role.monthly_days || 0), 0);
      }, 0);
      const base = owned.length ? Math.max(2, Math.round(roleDays / Math.max(owned.length * 4, 1))) : 0;
      const support = !base && (hashText(`${member.id}-${project.id}`) + projectIndex + memberIndex) % 7 === 0 ? 2 + ((projectIndex + memberIndex) % 3) : 0;
      allocations[`${member.id}:${project.id}`] = Math.min(12, base + support);
    });
  });

  // Shape the matrix so the MVP demonstrates healthy, tight, and overloaded states.
  const lead = MEMBER_PROFILES[0]?.id;
  const qa = MEMBER_PROFILES[5]?.id;
  if (lead && projects[0]) allocations[`${lead}:${projects[0].id}`] = Math.max(8, allocations[`${lead}:${projects[0].id}`] || 0);
  if (qa && projects[0]) allocations[`${qa}:${projects[0].id}`] = Math.max(7, allocations[`${qa}:${projects[0].id}`] || 0);
  if (qa && projects[1]) allocations[`${qa}:${projects[1].id}`] = Math.max(7, allocations[`${qa}:${projects[1].id}`] || 0);
  if (qa && projects[2]) allocations[`${qa}:${projects[2].id}`] = Math.max(8, allocations[`${qa}:${projects[2].id}`] || 0);

  return allocations;
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Avatar({ member, size = "md" }) {
  return (
    <span className={`avatar avatar-${size}`} style={{ "--avatar-color": member?.color || "#64748b" }} title={member?.name}>
      {initials(member?.name || "?")}
    </span>
  );
}

function AvatarStack({ ids, members }) {
  return (
    <span className="avatar-stack">
      {ids.slice(0, 4).map((id) => (
        <Avatar key={id} member={members.find((member) => member.id === id)} size="sm" />
      ))}
      {ids.length > 4 ? <span className="avatar-more">+{ids.length - 4}</span> : null}
    </span>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="select-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
      <IconChevronDown size={15} stroke={1.9} />
    </label>
  );
}

function KpiCard({ icon: Icon, label, value, note, tone = "blue" }) {
  return (
    <article className={`kpi-card kpi-${tone}`}>
      <div className="kpi-icon">
        <Icon size={20} stroke={1.9} />
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

export function App() {
  const initiatives = portfolioData.initiatives;
  const summary = portfolioData.summary;
  const projects = useMemo(() => buildProjects(initiatives), [initiatives]);
  const [activeNav, setActiveNav] = useState("Resources");
  const [periodMode, setPeriodMode] = useState("month");
  const [month, setMonth] = useState("2026-06");
  const [projectFilter, setProjectFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [allocations, setAllocations] = useState(() => buildInitialAllocations(projects));
  const [workItems, setWorkItems] = useState(() => buildWorkItems(initiatives, projects));
  const [selectedId, setSelectedId] = useState(workItems[0]?.id);
  const [showNewModal, setShowNewModal] = useState(false);
  const [notice, setNotice] = useState("");
  const [commentDraft, setCommentDraft] = useState("");

  const visibleProjects = useMemo(() => {
    const scoped = projectFilter === "all" ? projects : projects.filter((project) => project.id === projectFilter);
    return scoped.slice(0, periodMode === "fiscal" ? 6 : 5);
  }, [periodMode, projectFilter, projects]);

  const visibleMembers = useMemo(
    () => MEMBER_PROFILES.filter((member) => memberFilter === "all" || member.id === memberFilter),
    [memberFilter],
  );

  const filteredWorkItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workItems.filter((item) => {
      if (projectFilter !== "all" && item.projectId !== projectFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (memberFilter !== "all" && !item.participants.includes(memberFilter) && item.ownerId !== memberFilter) return false;
      if (!query) return true;
      return [item.title, item.summary, item.projectName, item.domain, item.id].join(" ").toLowerCase().includes(query);
    });
  }, [memberFilter, projectFilter, search, statusFilter, workItems]);

  const selectedItem = workItems.find((item) => item.id === selectedId) || filteredWorkItems[0] || workItems[0];
  const selectedProject = projects.find((project) => project.id === selectedItem?.projectId) || visibleProjects[0] || projects[0];

  function allocationValue(memberId, projectId) {
    const value = Number(allocations[`${memberId}:${projectId}`] || 0);
    return periodMode === "fiscal" ? Math.round(value * 8.5) : value;
  }

  function monthAllocationValue(memberId, projectId) {
    return Number(allocations[`${memberId}:${projectId}`] || 0);
  }

  function memberAllocated(memberId) {
    return sum(projects.map((project) => allocationValue(memberId, project.id)));
  }

  function memberCapacity(member) {
    return periodMode === "fiscal" ? member.capacity * 12 - 22 : member.capacity;
  }

  function projectAllocated(projectId) {
    return sum(MEMBER_PROFILES.map((member) => allocationValue(member.id, projectId)));
  }

  function updateAllocation(memberId, projectId, value) {
    const clean = Math.max(0, Math.min(30, Number(value || 0)));
    setAllocations((current) => ({ ...current, [`${memberId}:${projectId}`]: clean }));
  }

  function updateItemStatus(id, status) {
    setWorkItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              progress: status === "done" ? 100 : status === "review" ? 78 : status === "wip" ? 52 : status === "blocked" ? 35 : 10,
            }
          : item,
      ),
    );
  }

  function exportDeck() {
    const payload = {
      generatedAt: new Date().toISOString(),
      period: periodMode === "fiscal" ? "FY26-27" : month,
      totalBudget: summary["Total Asked (All Initiatives)"],
      visibleWorkItems: filteredWorkItems.length,
      risks: workItems.filter((item) => item.status === "blocked").length,
      allocation: MEMBER_PROFILES.map((member) => ({
        member: member.name,
        capacity: memberCapacity(member),
        allocated: memberAllocated(member.id),
        remaining: memberCapacity(member) - memberAllocated(member.id),
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ssg-pm-${periodMode === "fiscal" ? "fy26-27" : month}-deck-brief.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Deck brief exported. PPTX generation can be wired to your existing exporter next.");
  }

  function createWorkItem(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    if (!title) return;
    const projectId = String(form.get("projectId"));
    const ownerId = String(form.get("ownerId"));
    const project = projects.find((item) => item.id === projectId) || projects[0];
    const id = `E2-${String(workItems.length + 1).padStart(3, "0")}`;
    const item = {
      id,
      title,
      summary: String(form.get("summary") || "New portfolio execution item"),
      projectId,
      projectName: project.name,
      ownerId,
      participants: [ownerId],
      status: "todo",
      priority: String(form.get("priority")),
      progress: 10,
      budget: 0,
      lineStatus: "Above the Line",
      domain: project.domains[0] || "Other",
      due: month,
      gates: {},
      blocker: "",
      comments: [],
    };
    setWorkItems((current) => [item, ...current]);
    setSelectedId(id);
    setShowNewModal(false);
    setNotice("Work item created and added to the active workspace.");
  }

  function addComment() {
    const text = commentDraft.trim();
    if (!text || !selectedItem) return;
    setWorkItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              comments: [
                ...item.comments,
                { author: "Danny Hu", text, time: new Date().toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
              ],
            }
          : item,
      ),
    );
    setCommentDraft("");
  }

  const blockedCount = workItems.filter((item) => item.status === "blocked").length;
  const totalAllocated = sum(MEMBER_PROFILES.map((member) => memberAllocated(member.id)));
  const totalCapacity = sum(MEMBER_PROFILES.map((member) => memberCapacity(member)));
  const overAllocated = MEMBER_PROFILES.filter((member) => memberAllocated(member.id) > memberCapacity(member)).length;
  const aboveCount = initiatives.filter((item) => item.status === "Above the Line").length;
  const belowCount = initiatives.length - aboveCount;
  const readiness = Math.round((workItems.filter((item) => item.progress >= 75).length / Math.max(workItems.length, 1)) * 100);
  const bcpfTotals = Object.entries(
    initiatives.reduce((acc, item) => {
      const key = item.bcpf_l1 || "Other";
      acc[key] = (acc[key] || 0) + Number(item.budget || 0);
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <span className="brand-mark">SSG</span>
          <div>
            <strong>SSG PM Workspace</strong>
            <span>Internal portfolio OS</span>
          </div>
          <IconChevronDown size={16} />
        </div>

        <nav className="main-nav" aria-label="Workspace navigation">
          {NAV_ITEMS.map(([label, Icon]) => (
            <button key={label} className={activeNav === label ? "active" : ""} type="button" onClick={() => setActiveNav(label)}>
              <Icon size={19} stroke={1.8} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <section className="project-nav">
          <div className="project-nav-head">
            <span>Projects</span>
            <button type="button" aria-label="Add project">
              <IconPlus size={15} />
            </button>
          </div>
          <button className={projectFilter === "all" ? "project-link active" : "project-link"} type="button" onClick={() => setProjectFilter("all")}>
            <i style={{ "--dot": "#2563eb" }} />
            <span>EaaS 2.0</span>
            <b>{initiatives.length}</b>
          </button>
          {projects.slice(0, 8).map((project) => (
            <button key={project.id} className={projectFilter === project.id ? "project-link active" : "project-link"} type="button" onClick={() => setProjectFilter(project.id)}>
              <i style={{ "--dot": project.color }} />
              <span>{project.name}</span>
              <b>{project.count}</b>
            </button>
          ))}
        </section>

        <button className="collapse-btn" type="button">
          <IconChevronsLeft size={18} />
          <span>Collapse</span>
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="title-group">
            <span className="breadcrumb">Workspace / {activeNav}</span>
            <div className="title-line">
              <h1>{activeNav === "Resources" ? "Resource Ledger" : activeNav}</h1>
              <IconInfoCircle size={17} />
            </div>
          </div>
          <div className="top-icons">
            <button type="button" aria-label="Search">
              <IconSearch size={21} />
            </button>
            <button type="button" aria-label="Notifications">
              <IconBell size={21} />
              <b>3</b>
            </button>
            <Avatar member={MEMBER_PROFILES[0]} size="sm" />
          </div>
        </header>

        <section className="toolbar" aria-label="Resource filters">
          <div className="segmented">
            <button className={periodMode === "month" ? "active" : ""} type="button" onClick={() => setPeriodMode("month")}>
              Month
            </button>
            <button className={periodMode === "fiscal" ? "active" : ""} type="button" onClick={() => setPeriodMode("fiscal")}>
              Fiscal Year
            </button>
          </div>
          <Select label="Period" value={month} onChange={setMonth}>
            {MONTHS.map((item) => (
              <option key={item} value={item}>
                {monthLabel(item)}
              </option>
            ))}
          </Select>
          <Select label="FY" value="FY26-27" onChange={() => {}}>
            <option>FY26-27</option>
          </Select>
          <span className="toolbar-spacer" />
          <Select label="Project" value={projectFilter} onChange={setProjectFilter}>
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select label="Member" value={memberFilter} onChange={setMemberFilter}>
            <option value="all">All Members</option>
            {MEMBER_PROFILES.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
          <Select label="Status" value={statusFilter} onChange={setStatusFilter}>
            <option value="all">All Status</option>
            {Object.entries(STATUS_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
          <label className="search-control">
            <IconSearch size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search..." />
            <span>⌘K</span>
          </label>
          <button className="primary-btn" type="button" onClick={() => setShowNewModal(true)}>
            <IconPlus size={18} />
            New Work Item
          </button>
          <button className="ghost-btn export-btn" type="button" onClick={exportDeck}>
            <IconDownload size={18} />
            Export PPTX
          </button>
        </section>

        {notice ? (
          <div className="notice" role="status">
            <IconSparkles size={18} />
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">
              <IconX size={16} />
            </button>
          </div>
        ) : null}

        <div className="content-grid">
          <section className="main-panel">
            <div className="kpi-grid">
              <KpiCard icon={IconShieldCheck} label="Total Budget (FY26-27)" value={money(summary["Total Asked (All Initiatives)"])} note={`${money(summary["Total Budget"])} plan`} />
              <KpiCard icon={IconClipboardList} label="Initiatives" value={initiatives.length} note={`${aboveCount} on track / ${belowCount} at risk`} tone="cyan" />
              <KpiCard icon={IconUsers} label="Person-days" value={totalAllocated.toLocaleString()} note={`${totalCapacity.toLocaleString()} capacity`} tone="indigo" />
              <KpiCard icon={IconAlertTriangle} label="Risk / Blocked" value={blockedCount + overAllocated} note={`${blockedCount} blockers / ${overAllocated} overloads`} tone="orange" />
              <KpiCard icon={IconCircleCheck} label="Go-live Readiness" value={`${readiness}%`} note={`${workItems.filter((item) => item.progress >= 75).length} / ${workItems.length} ready`} tone="green" />
            </div>

            <section className="matrix-panel">
              <div className="section-head">
                <div>
                  <h2>Allocation Matrix</h2>
                  <span className="legend">
                    <i className="ok" /> Under utilized
                    <i className="info" /> Optimal
                    <i className="warn" /> High utilization
                    <i className="bad" /> Over allocated
                  </span>
                </div>
                <div className="section-tools">
                  <span>Unit: Person-days</span>
                  <button type="button" aria-label="Matrix filters">
                    <IconFilter size={17} />
                  </button>
                  <button type="button" aria-label="Download matrix" onClick={exportDeck}>
                    <IconDownload size={17} />
                  </button>
                </div>
              </div>

              <div className="allocation-table-wrap">
                <table className="allocation-table">
                  <thead>
                    <tr>
                      <th className="member-col">Member</th>
                      <th>Available<br /><small>{periodMode === "fiscal" ? "FY26-27" : monthLabel(month)}</small></th>
                      <th>Allocated<br /><small>{periodMode === "fiscal" ? "FY26-27" : monthLabel(month)}</small></th>
                      <th>Remaining<br /><small>{periodMode === "fiscal" ? "FY26-27" : monthLabel(month)}</small></th>
                      <th>Utilization</th>
                      {visibleProjects.map((project) => (
                        <th key={project.id}>
                          <button type="button" onClick={() => setProjectFilter(project.id)} className="project-head-btn">
                            {project.name}
                            <small>{project.above >= project.below ? "Above the Line" : "Below the Line"}</small>
                          </button>
                        </th>
                      ))}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMembers.map((member) => {
                      const capacity = memberCapacity(member);
                      const allocated = memberAllocated(member.id);
                      const remaining = capacity - allocated;
                      const utilization = Math.round((allocated / Math.max(capacity, 1)) * 100);
                      const state = utilization >= 100 ? "over" : utilization >= 85 ? "high" : utilization >= 65 ? "optimal" : "low";
                      return (
                        <tr key={member.id} className={remaining < 0 ? "over-row" : ""}>
                          <td className="member-cell">
                            <Avatar member={member} />
                            <div>
                              <strong>{member.name}</strong>
                              <span>{member.role}</span>
                            </div>
                          </td>
                          <td>{capacity}</td>
                          <td className={remaining < 0 ? "danger-text" : ""}>{allocated}</td>
                          <td className={remaining < 0 ? "danger-text" : ""}>
                            <strong>{remaining}</strong>
                            {remaining < 0 ? <small>Over by {Math.abs(remaining)}d</small> : null}
                          </td>
                          <td>
                            <div className={`util-meter ${state}`}>
                              <span style={{ width: `${Math.min(utilization, 130)}%` }} />
                            </div>
                            <b>{utilization}%</b>
                          </td>
                          {visibleProjects.map((project) => (
                            <td key={project.id}>
                              <input
                                className="day-input"
                                value={monthAllocationValue(member.id, project.id)}
                                disabled={periodMode === "fiscal"}
                                onChange={(event) => updateAllocation(member.id, project.id, event.target.value)}
                                onFocus={() => {
                                  const item = workItems.find((candidate) => candidate.projectId === project.id);
                                  if (item) setSelectedId(item.id);
                                }}
                                aria-label={`${member.name} allocation for ${project.name}`}
                                type="number"
                                min="0"
                                max="30"
                              />
                            </td>
                          ))}
                          <td>{allocated}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>Total ({visibleMembers.length})</td>
                      <td>{sum(visibleMembers.map((member) => memberCapacity(member)))}</td>
                      <td>{sum(visibleMembers.map((member) => memberAllocated(member.id)))}</td>
                      <td>{sum(visibleMembers.map((member) => memberCapacity(member) - memberAllocated(member.id)))}</td>
                      <td>{Math.round((sum(visibleMembers.map((member) => memberAllocated(member.id))) / Math.max(sum(visibleMembers.map((member) => memberCapacity(member))), 1)) * 100)}%</td>
                      {visibleProjects.map((project) => (
                        <td key={project.id}>{projectAllocated(project.id)}</td>
                      ))}
                      <td>{sum(visibleProjects.map((project) => projectAllocated(project.id)))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            <section className="lower-grid">
              <article className="insight-card weekly-card">
                <header>
                  <div>
                    <h3>Weekly Steering</h3>
                    <span>Week of May 12 - May 18, 2026</span>
                  </div>
                  <IconCalendarEvent size={18} />
                </header>
                <p>
                  Portfolio is trending positive. {aboveCount} initiatives are above the line, but {blockedCount} blockers and {overAllocated} capacity overloads need decisions before the next gate.
                </p>
                <div className="summary-strip">
                  <b>{aboveCount}<span>On Track</span></b>
                  <b>{belowCount}<span>At Risk</span></b>
                  <b>{blockedCount}<span>Blocked</span></b>
                </div>
                <button type="button" onClick={() => setActiveNav("Reports")}>View full weekly summary</button>
              </article>

              <article className="insight-card risk-card">
                <header>
                  <div>
                    <h3>Risk Escalation Queue</h3>
                    <span>{blockedCount} active blockers</span>
                  </div>
                  <Badge tone="danger">{blockedCount}</Badge>
                </header>
                {workItems.filter((item) => item.status === "blocked").slice(0, 3).map((item) => (
                  <button key={item.id} type="button" className="risk-row" onClick={() => setSelectedId(item.id)}>
                    <Badge tone={item.priority === "urgent" ? "danger" : "warning"}>{PRIORITY_META[item.priority].label}</Badge>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.blocker}</span>
                    </div>
                  </button>
                ))}
              </article>

              <article className="insight-card bcpf-card">
                <header>
                  <div>
                    <h3>BCPF Domain Distribution</h3>
                    <span>Budget by domain</span>
                  </div>
                  <IconChartDonut3 size={18} />
                </header>
                <div className="domain-layout">
                  <div className="donut" style={{ "--a": "30%", "--b": "52%", "--c": "68%", "--d": "82%" }}>
                    <strong>{money(summary["Total Asked (All Initiatives)"])}</strong>
                    <span>Total</span>
                  </div>
                  <div className="domain-list">
                    {bcpfTotals.slice(0, 6).map(([domain, value], index) => (
                      <button key={domain} type="button" onClick={() => setSearch(domain)}>
                        <i style={{ "--dot": ["#14b8a6", "#2563eb", "#7c3aed", "#f59e0b", "#16a34a", "#ef4444"][index] }} />
                        <span>{domain}</span>
                        <b>{money(value)}</b>
                      </button>
                    ))}
                  </div>
                </div>
              </article>

              <article className="insight-card gates-card">
                <header>
                  <div>
                    <h3>Upcoming Gates</h3>
                    <span>Next 60 days</span>
                  </div>
                  <IconTimeline size={18} />
                </header>
                {filteredWorkItems.slice(0, 4).map((item) => (
                  <button key={item.id} type="button" className="gate-row" onClick={() => setSelectedId(item.id)}>
                    <span>{item.gates.SIT ? "SIT" : item.gates.UAT ? "UAT" : "Go-live"}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.gates.SIT || item.gates.UAT || item.due}</small>
                    </div>
                  </button>
                ))}
              </article>
            </section>

            <section className="capacity-bar">
              <strong>Capacity Calendar ({monthLabel(month)})</strong>
              <span><IconCalendarEvent size={15} /> Company Holiday 2d</span>
              <span><IconUsers size={15} /> Team Leave 3d</span>
              <span><IconClock size={15} /> Public Holiday 1d</span>
              <b>Total Capacity: {totalCapacity}d</b>
              <b>Allocated: {totalAllocated}d</b>
              <b className={totalAllocated > totalCapacity ? "danger-text" : ""}>Remaining: {totalCapacity - totalAllocated}d</b>
            </section>
          </section>

          <aside className="detail-rail">
            <div className="detail-header">
              <div>
                <strong>{selectedProject?.name || "EaaS 2.0"} - {selectedItem?.title?.slice(0, 34)}</strong>
                <span>{selectedItem?.id} / {selectedItem?.domain}</span>
              </div>
              <button type="button" aria-label="Close detail">
                <IconX size={18} />
              </button>
            </div>

            <div className="detail-badges">
              <Badge tone={STATUS_META[selectedItem?.status]?.tone || "neutral"}>{STATUS_META[selectedItem?.status]?.label}</Badge>
              <Badge tone={PRIORITY_META[selectedItem?.priority]?.tone || "neutral"}>{PRIORITY_META[selectedItem?.priority]?.label}</Badge>
              <Badge tone={selectedItem?.lineStatus === "Above the Line" ? "info" : "warning"}>{selectedItem?.lineStatus}</Badge>
            </div>

            <dl className="detail-list">
              <div>
                <dt>Owner</dt>
                <dd><Avatar member={MEMBER_PROFILES.find((member) => member.id === selectedItem?.ownerId)} size="sm" /> {MEMBER_PROFILES.find((member) => member.id === selectedItem?.ownerId)?.name}</dd>
              </div>
              <div>
                <dt>Participants</dt>
                <dd><AvatarStack ids={selectedItem?.participants || []} members={MEMBER_PROFILES} /></dd>
              </div>
              <div>
                <dt>Cycle</dt>
                <dd>Cycle 3: Build & Integrate</dd>
              </div>
              <div>
                <dt>Person-days</dt>
                <dd>{projectAllocated(selectedItem?.projectId)} ({periodMode === "fiscal" ? "FY26-27" : monthLabel(month)})</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <select value={selectedItem?.status} onChange={(event) => updateItemStatus(selectedItem.id, event.target.value)}>
                    {Object.entries(STATUS_META).map(([value, meta]) => (
                      <option key={value} value={value}>{meta.label}</option>
                    ))}
                  </select>
                </dd>
              </div>
              <div>
                <dt>Progress</dt>
                <dd className="progress-cell"><div className="progress-line"><span style={{ width: `${selectedItem?.progress || 0}%` }} /></div>{selectedItem?.progress}%</dd>
              </div>
              <div>
                <dt>Budget</dt>
                <dd>{compactMoney(selectedItem?.budget || selectedProject?.budget)}</dd>
              </div>
              <div>
                <dt>Linked Page</dt>
                <dd><button type="button" className="link-btn" onClick={() => setActiveNav("Pages")}><IconFileText size={16} /> EaaS 2.0 Execution Plan</button></dd>
              </div>
            </dl>

            <section className="rail-section">
              <h3>Timeline Gates</h3>
              <div className="gate-track">
                {["BSR", "ISR", "SIT", "UAT", "GRR", "Go_live"].map((gate) => (
                  <div key={gate}>
                    <i className={selectedItem?.gates?.[gate] ? "done" : ""} />
                    <span>{gate.replace("_", "-")}</span>
                    <small>{selectedItem?.gates?.[gate] || "-"}</small>
                  </div>
                ))}
              </div>
            </section>

            {selectedItem?.blocker ? (
              <section className="blocker-box">
                <h3><IconAlertTriangle size={17} /> Blocker</h3>
                <p>{selectedItem.blocker}</p>
                <span>Raised by {MEMBER_PROFILES.find((member) => member.id === selectedItem.ownerId)?.name} on Jun 4, 2026</span>
              </section>
            ) : null}

            <section className="rail-section comments">
              <div className="comment-tabs">
                <button className="active" type="button">Comments</button>
                <button type="button">Activity</button>
              </div>
              {(selectedItem?.comments || []).map((comment, index) => (
                <article key={`${comment.author}-${index}`} className="comment-row">
                  <Avatar member={MEMBER_PROFILES.find((member) => member.name === comment.author) || MEMBER_PROFILES[0]} size="sm" />
                  <div>
                    <strong>{comment.author}<span>{comment.time}</span></strong>
                    <p>{comment.text}</p>
                  </div>
                </article>
              ))}
              <label className="comment-box">
                <IconMessageCircle size={17} />
                <input value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Add a comment..." onKeyDown={(event) => { if (event.key === "Enter") addComment(); }} />
                <button type="button" onClick={addComment}>Send</button>
              </label>
            </section>
          </aside>
        </div>
      </main>

      {showNewModal ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="new-work-item-title">
          <form className="modal" onSubmit={createWorkItem}>
            <div className="modal-head">
              <div>
                <h2 id="new-work-item-title">New Work Item</h2>
                <span>Create execution work under a project. Person-days stay in the resource ledger.</span>
              </div>
              <button type="button" onClick={() => setShowNewModal(false)} aria-label="Close">
                <IconX size={18} />
              </button>
            </div>
            <label>
              <span>Title</span>
              <input name="title" placeholder="Describe the work item" autoFocus />
            </label>
            <label>
              <span>Summary</span>
              <textarea name="summary" placeholder="Outcome, scope, or next decision" rows={3} />
            </label>
            <div className="modal-grid">
              <label>
                <span>Project</span>
                <select name="projectId" defaultValue={projectFilter === "all" ? projects[0]?.id : projectFilter}>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </label>
              <label>
                <span>Owner</span>
                <select name="ownerId" defaultValue={MEMBER_PROFILES[0].id}>
                  {MEMBER_PROFILES.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
              </label>
              <label>
                <span>Priority</span>
                <select name="priority" defaultValue="medium">
                  {Object.entries(PRIORITY_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button className="ghost-btn" type="button" onClick={() => setShowNewModal(false)}>Cancel</button>
              <button className="primary-btn" type="submit">Create Work Item</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
