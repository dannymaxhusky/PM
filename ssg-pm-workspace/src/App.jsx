import { useEffect, useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconBell,
  IconBriefcase,
  IconCalendarEvent,
  IconChartDonut3,
  IconChevronDown,
  IconChevronsLeft,
  IconCircleCheck,
  IconClipboardList,
  IconClock,
  IconDownload,
  IconFileText,
  IconFilter,
  IconGauge,
  IconInfoCircle,
  IconLanguage,
  IconMapPin,
  IconMessageCircle,
  IconPlus,
  IconReportAnalytics,
  IconSearch,
  IconSettings,
  IconShieldCheck,
  IconTimeline,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

const STORAGE_KEY = "ssg_pm_workspace_v2";
const COLORS = ["#2563eb", "#0891b2", "#7c3aed", "#16a34a", "#ea580c", "#be123c", "#4f46e5", "#db2777"];
const MONTHS = ["2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03"];

const NAV_ITEMS = [
  ["dashboard", IconGauge],
  ["portfolio", IconChartDonut3],
  ["projects", IconBriefcase],
  ["workItems", IconClipboardList],
  ["cycles", IconClock],
  ["resources", IconUsers],
  ["timeline", IconTimeline],
  ["bcpf", IconMapPin],
  ["pages", IconFileText],
  ["reports", IconReportAnalytics],
  ["settings", IconSettings],
];

const I18N = {
  en: {
    workspace: "SSG PM Workspace",
    subtitle: "Internal portfolio OS",
    dashboard: "Dashboard",
    portfolio: "Portfolio",
    projects: "Projects",
    workItems: "Work Items",
    cycles: "Cycles",
    resources: "Resources",
    timeline: "Timeline",
    bcpf: "BCPF Map",
    pages: "Pages",
    reports: "Reports",
    settings: "Settings",
    projectList: "Projects",
    collapse: "Collapse",
    breadcrumb: "Workspace / Resources",
    resourceLedger: "Resource Ledger",
    month: "Month",
    fiscalYear: "Fiscal Year",
    period: "Period",
    fy: "FY",
    project: "Project",
    member: "Member",
    status: "Status",
    allProjects: "All Projects",
    allMembers: "All Members",
    allStatus: "All Status",
    search: "Search...",
    newWorkItem: "New Work Item",
    addProject: "Add Project",
    addMember: "Add Member",
    exportPptx: "Export PPTX",
    totalBudget: "Total Budget",
    initiatives: "Work Items",
    personDays: "Person-days",
    riskBlocked: "Risk / Blocked",
    readiness: "Readiness",
    capacity: "capacity",
    noData: "No data yet",
    noDataBody: "Start by adding members and projects. This workspace now ships without internal reference data.",
    allocationMatrix: "Allocation Matrix",
    underUtilized: "Under utilized",
    optimal: "Optimal",
    highUtilization: "High utilization",
    overAllocated: "Over allocated",
    unitPersonDays: "Unit: Person-days",
    available: "Available",
    allocated: "Allocated",
    remaining: "Remaining",
    utilization: "Utilization",
    total: "Total",
    weeklySteering: "Weekly Steering",
    weeklyCopy: "No steering summary yet. Create work items and blockers to generate the first weekly view.",
    riskQueue: "Risk Escalation Queue",
    bcpfDistribution: "BCPF Domain Distribution",
    budgetByDomain: "Budget by domain",
    upcomingGates: "Upcoming Gates",
    next60Days: "Next 60 days",
    capacityCalendar: "Capacity Calendar",
    companyHoliday: "Company Holiday",
    teamLeave: "Team Leave",
    publicHoliday: "Public Holiday",
    owner: "Owner",
    participants: "Participants",
    cycle: "Cycle",
    progress: "Progress",
    budget: "Budget",
    linkedPage: "Linked Page",
    timelineGates: "Timeline Gates",
    blocker: "Blocker",
    comments: "Comments",
    activity: "Activity",
    addComment: "Add a comment...",
    send: "Send",
    title: "Title",
    summary: "Summary",
    priority: "Priority",
    create: "Create",
    cancel: "Cancel",
    createWorkItem: "Create Work Item",
    projectName: "Project name",
    domain: "Domain",
    lineStatus: "Line status",
    memberName: "Member name",
    role: "Role",
    monthlyCapacity: "Monthly capacity",
    save: "Save",
    emptyRailTitle: "Select or create a work item",
    emptyRailBody: "Details, comments, gates, and blockers will appear here.",
    cleanWorkspaceNotice: "This app starts empty. Reference data has been removed from the deployed bundle.",
    exported: "Deck brief exported. Backend PPTX generation can be connected later.",
    created: "Created successfully.",
    commentAdded: "Comment added.",
    todo: "To Do",
    wip: "WIP",
    review: "Review",
    blocked: "Blocked",
    done: "Done",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    aboveLine: "Above the Line",
    belowLine: "Below the Line",
  },
  zh: {
    workspace: "SSG 项目工作台",
    subtitle: "内部项目组合系统",
    dashboard: "仪表盘",
    portfolio: "项目组合",
    projects: "项目",
    workItems: "工作项",
    cycles: "周期",
    resources: "资源",
    timeline: "时间线",
    bcpf: "BCPF 地图",
    pages: "文档",
    reports: "报告",
    settings: "设置",
    projectList: "项目",
    collapse: "收起",
    breadcrumb: "工作台 / 资源",
    resourceLedger: "资源台账",
    month: "月份",
    fiscalYear: "财年",
    period: "期间",
    fy: "财年",
    project: "项目",
    member: "成员",
    status: "状态",
    allProjects: "全部项目",
    allMembers: "全部成员",
    allStatus: "全部状态",
    search: "搜索...",
    newWorkItem: "新建工作项",
    addProject: "添加项目",
    addMember: "添加成员",
    exportPptx: "导出 PPTX",
    totalBudget: "总预算",
    initiatives: "工作项",
    personDays: "人天",
    riskBlocked: "风险 / 阻塞",
    readiness: "就绪度",
    capacity: "可用",
    noData: "暂无数据",
    noDataBody: "请先添加成员和项目。当前版本不会携带任何内部参考数据。",
    allocationMatrix: "人天分配矩阵",
    underUtilized: "低负载",
    optimal: "正常",
    highUtilization: "高负载",
    overAllocated: "超分配",
    unitPersonDays: "单位：人天",
    available: "可用",
    allocated: "已分配",
    remaining: "剩余",
    utilization: "利用率",
    total: "合计",
    weeklySteering: "周会摘要",
    weeklyCopy: "还没有周会摘要。创建工作项和阻塞后，这里会形成第一版周会视图。",
    riskQueue: "风险升级队列",
    bcpfDistribution: "BCPF 领域分布",
    budgetByDomain: "按领域预算",
    upcomingGates: "即将到来的里程碑",
    next60Days: "未来 60 天",
    capacityCalendar: "容量日历",
    companyHoliday: "公司假期",
    teamLeave: "团队请假",
    publicHoliday: "公共假期",
    owner: "负责人",
    participants: "参与人",
    cycle: "周期",
    progress: "进度",
    budget: "预算",
    linkedPage: "关联文档",
    timelineGates: "时间线里程碑",
    blocker: "阻塞",
    comments: "评论",
    activity: "动态",
    addComment: "添加评论...",
    send: "发送",
    title: "标题",
    summary: "摘要",
    priority: "优先级",
    create: "创建",
    cancel: "取消",
    createWorkItem: "创建工作项",
    projectName: "项目名称",
    domain: "领域",
    lineStatus: "线内/线下",
    memberName: "成员姓名",
    role: "角色",
    monthlyCapacity: "月可用人天",
    save: "保存",
    emptyRailTitle: "选择或创建工作项",
    emptyRailBody: "详情、评论、里程碑和阻塞会显示在这里。",
    cleanWorkspaceNotice: "应用已改为干净初始化；部署包中不再包含内部参考数据。",
    exported: "已导出简版 Deck 数据。后续可接入后端 PPTX 生成。",
    created: "创建成功。",
    commentAdded: "评论已添加。",
    todo: "待办",
    wip: "进行中",
    review: "评审中",
    blocked: "阻塞",
    done: "完成",
    low: "低",
    medium: "中",
    high: "高",
    urgent: "紧急",
    aboveLine: "线内",
    belowLine: "线下",
  },
};

const STATUS_META = {
  todo: { tone: "neutral" },
  wip: { tone: "info" },
  review: { tone: "warning" },
  blocked: { tone: "danger" },
  done: { tone: "success" },
};

const PRIORITY_META = {
  low: { tone: "neutral" },
  medium: { tone: "info" },
  high: { tone: "warning" },
  urgent: { tone: "danger" },
};

function slug(value) {
  const clean = String(value || "").trim().toLowerCase();
  return clean
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/(^-|-$)/g, "") || `item-${Date.now()}`;
}

function money(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `$${Math.round(amount / 1000)}K`;
  return `$${Math.round(amount).toLocaleString()}`;
}

function compactMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function initials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function monthLabel(value, lang) {
  const date = new Date(`${value}-02T00:00:00`);
  return date.toLocaleString(lang === "zh" ? "zh-CN" : "en", { month: "short", year: "numeric" });
}

function sum(values) {
  return values.reduce((total, value) => total + Number(value || 0), 0);
}

function loadWorkspace() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Avatar({ member, size = "md" }) {
  return (
    <span className={`avatar avatar-${size}`} style={{ "--avatar-color": member?.color || "#64748b" }} title={member?.name}>
      {initials(member?.name)}
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
  const saved = loadWorkspace();
  const [lang, setLang] = useState(saved?.lang || "en");
  const [activeNav, setActiveNav] = useState("resources");
  const [periodMode, setPeriodMode] = useState(saved?.periodMode || "month");
  const [month, setMonth] = useState(saved?.month || "2026-06");
  const [projectFilter, setProjectFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState(saved?.members || []);
  const [projects, setProjects] = useState(saved?.projects || []);
  const [workItems, setWorkItems] = useState(saved?.workItems || []);
  const [allocations, setAllocations] = useState(saved?.allocations || {});
  const [selectedId, setSelectedId] = useState(saved?.selectedId || "");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const t = (key) => I18N[lang][key] || key;

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lang, periodMode, month, members, projects, workItems, allocations, selectedId }),
    );
  }, [allocations, lang, members, month, periodMode, projects, selectedId, workItems]);

  const visibleProjects = useMemo(() => {
    const scoped = projectFilter === "all" ? projects : projects.filter((project) => project.id === projectFilter);
    return scoped.slice(0, periodMode === "fiscal" ? 6 : 5);
  }, [periodMode, projectFilter, projects]);

  const visibleMembers = useMemo(() => members.filter((member) => memberFilter === "all" || member.id === memberFilter), [memberFilter, members]);

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

  const selectedItem = workItems.find((item) => item.id === selectedId) || filteredWorkItems[0] || null;
  const selectedProject = selectedItem ? projects.find((project) => project.id === selectedItem.projectId) : null;

  function allocationValue(memberId, projectId) {
    const value = Number(allocations[`${memberId}:${projectId}`] || 0);
    return periodMode === "fiscal" ? Math.round(value * 12) : value;
  }

  function monthAllocationValue(memberId, projectId) {
    return Number(allocations[`${memberId}:${projectId}`] || 0);
  }

  function memberCapacity(member) {
    return periodMode === "fiscal" ? Number(member.capacity || 0) * 12 : Number(member.capacity || 0);
  }

  function memberAllocated(memberId) {
    return sum(projects.map((project) => allocationValue(memberId, project.id)));
  }

  function projectAllocated(projectId) {
    return sum(members.map((member) => allocationValue(member.id, projectId)));
  }

  function updateAllocation(memberId, projectId, value) {
    const clean = Math.max(0, Math.min(60, Number(value || 0)));
    setAllocations((current) => ({ ...current, [`${memberId}:${projectId}`]: clean }));
  }

  function updateItemStatus(id, status) {
    const progress = status === "done" ? 100 : status === "review" ? 78 : status === "wip" ? 52 : status === "blocked" ? 35 : 10;
    setWorkItems((current) => current.map((item) => (item.id === id ? { ...item, status, progress } : item)));
  }

  function exportDeck() {
    const payload = {
      period: periodMode === "fiscal" ? "FY26-27" : month,
      members,
      projects,
      workItems,
      allocations,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ssg-pm-${periodMode === "fiscal" ? "fy26-27" : month}-deck-brief.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(t("exported"));
  }

  function createMember(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (!name) return;
    const member = {
      id: `${slug(name)}-${Date.now().toString(36)}`,
      name,
      role: String(form.get("role") || "").trim() || t("member"),
      capacity: Number(form.get("capacity") || 20),
      color: COLORS[members.length % COLORS.length],
    };
    setMembers((current) => [...current, member]);
    setModal(null);
    setNotice(t("created"));
  }

  function createProject(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (!name) return;
    const project = {
      id: `${slug(name)}-${Date.now().toString(36)}`,
      name,
      budget: Number(form.get("budget") || 0),
      domain: String(form.get("domain") || "").trim() || "-",
      lineStatus: String(form.get("lineStatus") || "aboveLine"),
      ownerId: String(form.get("ownerId") || ""),
      color: COLORS[projects.length % COLORS.length],
    };
    setProjects((current) => [...current, project]);
    setProjectFilter(project.id);
    setModal(null);
    setNotice(t("created"));
  }

  function createWorkItem(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const projectId = String(form.get("projectId") || projects[0]?.id || "");
    if (!title || !projectId) return;
    const project = projects.find((item) => item.id === projectId);
    const ownerId = String(form.get("ownerId") || members[0]?.id || "");
    const id = `WI-${String(workItems.length + 1).padStart(3, "0")}`;
    const status = "todo";
    const item = {
      id,
      title,
      summary: String(form.get("summary") || "").trim(),
      projectId,
      projectName: project?.name || "",
      ownerId,
      participants: ownerId ? [ownerId] : [],
      status,
      priority: String(form.get("priority") || "medium"),
      progress: 10,
      budget: Number(form.get("budget") || 0),
      lineStatus: project?.lineStatus || "aboveLine",
      domain: project?.domain || "-",
      due: month,
      gates: {},
      blocker: "",
      comments: [],
    };
    setWorkItems((current) => [item, ...current]);
    setSelectedId(id);
    setModal(null);
    setNotice(t("created"));
  }

  function addComment() {
    const text = commentDraft.trim();
    if (!text || !selectedItem) return;
    const author = members[0]?.name || "Admin";
    setWorkItems((current) =>
      current.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              comments: [
                ...item.comments,
                { author, text, time: new Date().toLocaleString(lang === "zh" ? "zh-CN" : "en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) },
              ],
            }
          : item,
      ),
    );
    setCommentDraft("");
    setNotice(t("commentAdded"));
  }

  const blockedCount = workItems.filter((item) => item.status === "blocked").length;
  const totalAllocated = sum(members.map((member) => memberAllocated(member.id)));
  const totalCapacity = sum(members.map((member) => memberCapacity(member)));
  const overAllocated = members.filter((member) => memberAllocated(member.id) > memberCapacity(member)).length;
  const readyCount = workItems.filter((item) => item.progress >= 75).length;
  const readiness = workItems.length ? Math.round((readyCount / workItems.length) * 100) : 0;
  const totalBudget = sum(projects.map((project) => project.budget)) + sum(workItems.map((item) => item.budget));
  const bcpfTotals = Object.entries(
    projects.reduce((acc, project) => {
      const key = project.domain || "-";
      acc[key] = (acc[key] || 0) + Number(project.budget || 0);
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const hasCoreData = members.length > 0 || projects.length > 0 || workItems.length > 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <span className="brand-mark">SSG</span>
          <div>
            <strong>{t("workspace")}</strong>
            <span>{t("subtitle")}</span>
          </div>
          <IconChevronDown size={16} />
        </div>

        <nav className="main-nav" aria-label="Workspace navigation">
          {NAV_ITEMS.map(([key, Icon]) => (
            <button key={key} className={activeNav === key ? "active" : ""} type="button" onClick={() => setActiveNav(key)}>
              <Icon size={19} stroke={1.8} />
              <span>{t(key)}</span>
            </button>
          ))}
        </nav>

        <section className="project-nav">
          <div className="project-nav-head">
            <span>{t("projectList")}</span>
            <button type="button" aria-label={t("addProject")} onClick={() => setModal("project")}>
              <IconPlus size={15} />
            </button>
          </div>
          <button className={projectFilter === "all" ? "project-link active" : "project-link"} type="button" onClick={() => setProjectFilter("all")}>
            <i style={{ "--dot": "#2563eb" }} />
            <span>{t("allProjects")}</span>
            <b>{projects.length}</b>
          </button>
          {projects.map((project) => (
            <button key={project.id} className={projectFilter === project.id ? "project-link active" : "project-link"} type="button" onClick={() => setProjectFilter(project.id)}>
              <i style={{ "--dot": project.color }} />
              <span>{project.name}</span>
              <b>{workItems.filter((item) => item.projectId === project.id).length}</b>
            </button>
          ))}
        </section>

        <button className="collapse-btn" type="button">
          <IconChevronsLeft size={18} />
          <span>{t("collapse")}</span>
        </button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="title-group">
            <span className="breadcrumb">{t("breadcrumb")}</span>
            <div className="title-line">
              <h1>{t("resourceLedger")}</h1>
              <IconInfoCircle size={17} />
            </div>
          </div>
          <div className="top-icons">
            <button className="lang-toggle" type="button" aria-label="Switch language" onClick={() => setLang(lang === "en" ? "zh" : "en")}>
              <IconLanguage size={19} />
              <span>{lang === "en" ? "中文" : "EN"}</span>
            </button>
            <button type="button" aria-label={t("search")}>
              <IconSearch size={21} />
            </button>
            <button type="button" aria-label="Notifications">
              <IconBell size={21} />
            </button>
            <Avatar member={members[0]} size="sm" />
          </div>
        </header>

        <section className="toolbar" aria-label="Resource filters">
          <div className="segmented">
            <button className={periodMode === "month" ? "active" : ""} type="button" onClick={() => setPeriodMode("month")}>
              {t("month")}
            </button>
            <button className={periodMode === "fiscal" ? "active" : ""} type="button" onClick={() => setPeriodMode("fiscal")}>
              {t("fiscalYear")}
            </button>
          </div>
          <Select label={t("period")} value={month} onChange={setMonth}>
            {MONTHS.map((item) => (
              <option key={item} value={item}>
                {monthLabel(item, lang)}
              </option>
            ))}
          </Select>
          <Select label={t("fy")} value="FY26-27" onChange={() => {}}>
            <option>FY26-27</option>
          </Select>
          <span className="toolbar-spacer" />
          <Select label={t("project")} value={projectFilter} onChange={setProjectFilter}>
            <option value="all">{t("allProjects")}</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select label={t("member")} value={memberFilter} onChange={setMemberFilter}>
            <option value="all">{t("allMembers")}</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </Select>
          <Select label={t("status")} value={statusFilter} onChange={setStatusFilter}>
            <option value="all">{t("allStatus")}</option>
            {Object.keys(STATUS_META).map((value) => (
              <option key={value} value={value}>
                {t(value)}
              </option>
            ))}
          </Select>
          <label className="search-control">
            <IconSearch size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search")} />
            <span>⌘K</span>
          </label>
          <button className="primary-btn" type="button" onClick={() => setModal("workItem")} disabled={!projects.length}>
            <IconPlus size={18} />
            {t("newWorkItem")}
          </button>
          <button className="ghost-btn" type="button" onClick={() => setModal("member")}>
            <IconPlus size={18} />
            {t("addMember")}
          </button>
          <button className="ghost-btn export-btn" type="button" onClick={exportDeck}>
            <IconDownload size={18} />
            {t("exportPptx")}
          </button>
        </section>

        {notice || !hasCoreData ? (
          <div className="notice" role="status">
            <IconInfoCircle size={18} />
            <span>{notice || t("cleanWorkspaceNotice")}</span>
            {notice ? (
              <button type="button" onClick={() => setNotice("")} aria-label="Dismiss notice">
                <IconX size={16} />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="content-grid">
          <section className="main-panel">
            <div className="kpi-grid">
              <KpiCard icon={IconShieldCheck} label={t("totalBudget")} value={money(totalBudget)} note={`${projects.length} ${t("projects")}`} />
              <KpiCard icon={IconClipboardList} label={t("initiatives")} value={workItems.length} note={`${readyCount} ${t("done")} / ${blockedCount} ${t("blocked")}`} tone="cyan" />
              <KpiCard icon={IconUsers} label={t("personDays")} value={totalAllocated.toLocaleString()} note={`${totalCapacity.toLocaleString()} ${t("capacity")}`} tone="indigo" />
              <KpiCard icon={IconAlertTriangle} label={t("riskBlocked")} value={blockedCount + overAllocated} note={`${blockedCount} ${t("blocked")} / ${overAllocated} ${t("overAllocated")}`} tone="orange" />
              <KpiCard icon={IconCircleCheck} label={t("readiness")} value={`${readiness}%`} note={`${readyCount} / ${workItems.length}`} tone="green" />
            </div>

            {!hasCoreData ? (
              <section className="empty-workspace">
                <h2>{t("noData")}</h2>
                <p>{t("noDataBody")}</p>
                <div>
                  <button className="primary-btn" type="button" onClick={() => setModal("member")}>{t("addMember")}</button>
                  <button className="ghost-btn" type="button" onClick={() => setModal("project")}>{t("addProject")}</button>
                </div>
              </section>
            ) : null}

            <section className="matrix-panel">
              <div className="section-head">
                <div>
                  <h2>{t("allocationMatrix")}</h2>
                  <span className="legend">
                    <i className="ok" /> {t("underUtilized")}
                    <i className="info" /> {t("optimal")}
                    <i className="warn" /> {t("highUtilization")}
                    <i className="bad" /> {t("overAllocated")}
                  </span>
                </div>
                <div className="section-tools">
                  <span>{t("unitPersonDays")}</span>
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
                      <th className="member-col">{t("member")}</th>
                      <th>{t("available")}<br /><small>{periodMode === "fiscal" ? "FY26-27" : monthLabel(month, lang)}</small></th>
                      <th>{t("allocated")}<br /><small>{periodMode === "fiscal" ? "FY26-27" : monthLabel(month, lang)}</small></th>
                      <th>{t("remaining")}<br /><small>{periodMode === "fiscal" ? "FY26-27" : monthLabel(month, lang)}</small></th>
                      <th>{t("utilization")}</th>
                      {visibleProjects.map((project) => (
                        <th key={project.id}>
                          <button type="button" onClick={() => setProjectFilter(project.id)} className="project-head-btn">
                            {project.name}
                            <small>{t(project.lineStatus)}</small>
                          </button>
                        </th>
                      ))}
                      <th>{t("total")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMembers.length ? visibleMembers.map((member) => {
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
                            {remaining < 0 ? <small>{Math.abs(remaining)}d</small> : null}
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
                                aria-label={`${member.name} ${project.name}`}
                                type="number"
                                min="0"
                                max="60"
                              />
                            </td>
                          ))}
                          <td>{allocated}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td className="table-empty" colSpan={6 + visibleProjects.length}>{t("noDataBody")}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td>{t("total")} ({visibleMembers.length})</td>
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
                    <h3>{t("weeklySteering")}</h3>
                    <span>{monthLabel(month, lang)}</span>
                  </div>
                  <IconCalendarEvent size={18} />
                </header>
                <p>{t("weeklyCopy")}</p>
                <div className="summary-strip">
                  <b>{workItems.filter((item) => item.status === "done").length}<span>{t("done")}</span></b>
                  <b>{workItems.filter((item) => item.priority === "high" || item.priority === "urgent").length}<span>{t("high")}</span></b>
                  <b>{blockedCount}<span>{t("blocked")}</span></b>
                </div>
              </article>

              <article className="insight-card risk-card">
                <header>
                  <div>
                    <h3>{t("riskQueue")}</h3>
                    <span>{blockedCount} {t("blocked")}</span>
                  </div>
                  <Badge tone="danger">{blockedCount}</Badge>
                </header>
                {workItems.filter((item) => item.status === "blocked").slice(0, 3).map((item) => (
                  <button key={item.id} type="button" className="risk-row" onClick={() => setSelectedId(item.id)}>
                    <Badge tone={PRIORITY_META[item.priority]?.tone || "neutral"}>{t(item.priority)}</Badge>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.blocker || item.summary}</span>
                    </div>
                  </button>
                ))}
              </article>

              <article className="insight-card bcpf-card">
                <header>
                  <div>
                    <h3>{t("bcpfDistribution")}</h3>
                    <span>{t("budgetByDomain")}</span>
                  </div>
                  <IconChartDonut3 size={18} />
                </header>
                <div className="domain-layout">
                  <div className="donut">
                    <strong>{money(totalBudget)}</strong>
                    <span>{t("total")}</span>
                  </div>
                  <div className="domain-list">
                    {bcpfTotals.length ? bcpfTotals.slice(0, 6).map(([domain, value], index) => (
                      <button key={domain} type="button" onClick={() => setSearch(domain)}>
                        <i style={{ "--dot": COLORS[index % COLORS.length] }} />
                        <span>{domain}</span>
                        <b>{money(value)}</b>
                      </button>
                    )) : <span className="mini-empty">{t("noData")}</span>}
                  </div>
                </div>
              </article>

              <article className="insight-card gates-card">
                <header>
                  <div>
                    <h3>{t("upcomingGates")}</h3>
                    <span>{t("next60Days")}</span>
                  </div>
                  <IconTimeline size={18} />
                </header>
                {filteredWorkItems.slice(0, 4).map((item) => (
                  <button key={item.id} type="button" className="gate-row" onClick={() => setSelectedId(item.id)}>
                    <span>SIT</span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.due}</small>
                    </div>
                  </button>
                ))}
              </article>
            </section>

            <section className="capacity-bar">
              <strong>{t("capacityCalendar")} ({monthLabel(month, lang)})</strong>
              <span><IconCalendarEvent size={15} /> {t("companyHoliday")} 0d</span>
              <span><IconUsers size={15} /> {t("teamLeave")} 0d</span>
              <span><IconClock size={15} /> {t("publicHoliday")} 0d</span>
              <b>{t("total")}: {totalCapacity}d</b>
              <b>{t("allocated")}: {totalAllocated}d</b>
              <b className={totalAllocated > totalCapacity ? "danger-text" : ""}>{t("remaining")}: {totalCapacity - totalAllocated}d</b>
            </section>
          </section>

          <aside className="detail-rail">
            {selectedItem ? (
              <>
                <div className="detail-header">
                  <div>
                    <strong>{selectedProject?.name || t("project")} - {selectedItem.title}</strong>
                    <span>{selectedItem.id} / {selectedItem.domain}</span>
                  </div>
                  <button type="button" aria-label="Close detail" onClick={() => setSelectedId("")}>
                    <IconX size={18} />
                  </button>
                </div>
                <div className="detail-badges">
                  <Badge tone={STATUS_META[selectedItem.status]?.tone}>{t(selectedItem.status)}</Badge>
                  <Badge tone={PRIORITY_META[selectedItem.priority]?.tone}>{t(selectedItem.priority)}</Badge>
                  <Badge tone={selectedItem.lineStatus === "aboveLine" ? "info" : "warning"}>{t(selectedItem.lineStatus)}</Badge>
                </div>
                <dl className="detail-list">
                  <div><dt>{t("owner")}</dt><dd><Avatar member={members.find((member) => member.id === selectedItem.ownerId)} size="sm" /> {members.find((member) => member.id === selectedItem.ownerId)?.name || "-"}</dd></div>
                  <div><dt>{t("participants")}</dt><dd><AvatarStack ids={selectedItem.participants || []} members={members} /></dd></div>
                  <div><dt>{t("cycle")}</dt><dd>{periodMode === "fiscal" ? "FY26-27" : monthLabel(month, lang)}</dd></div>
                  <div><dt>{t("personDays")}</dt><dd>{projectAllocated(selectedItem.projectId)}</dd></div>
                  <div>
                    <dt>{t("status")}</dt>
                    <dd>
                      <select value={selectedItem.status} onChange={(event) => updateItemStatus(selectedItem.id, event.target.value)}>
                        {Object.keys(STATUS_META).map((value) => <option key={value} value={value}>{t(value)}</option>)}
                      </select>
                    </dd>
                  </div>
                  <div><dt>{t("progress")}</dt><dd className="progress-cell"><div className="progress-line"><span style={{ width: `${selectedItem.progress || 0}%` }} /></div>{selectedItem.progress}%</dd></div>
                  <div><dt>{t("budget")}</dt><dd>{compactMoney(selectedItem.budget || selectedProject?.budget || 0)}</dd></div>
                  <div><dt>{t("linkedPage")}</dt><dd><button type="button" className="link-btn"><IconFileText size={16} /> {t("pages")}</button></dd></div>
                </dl>
                <section className="rail-section">
                  <h3>{t("timelineGates")}</h3>
                  <div className="gate-track">
                    {["BSR", "ISR", "SIT", "UAT", "GRR", "Go-live"].map((gate) => (
                      <div key={gate}><i /><span>{gate}</span><small>-</small></div>
                    ))}
                  </div>
                </section>
                {selectedItem.blocker ? (
                  <section className="blocker-box">
                    <h3><IconAlertTriangle size={17} /> {t("blocker")}</h3>
                    <p>{selectedItem.blocker}</p>
                  </section>
                ) : null}
                <section className="rail-section comments">
                  <div className="comment-tabs">
                    <button className="active" type="button">{t("comments")}</button>
                    <button type="button">{t("activity")}</button>
                  </div>
                  {(selectedItem.comments || []).map((comment, index) => (
                    <article key={`${comment.author}-${index}`} className="comment-row">
                      <Avatar member={members.find((member) => member.name === comment.author) || members[0]} size="sm" />
                      <div>
                        <strong>{comment.author}<span>{comment.time}</span></strong>
                        <p>{comment.text}</p>
                      </div>
                    </article>
                  ))}
                  <label className="comment-box">
                    <IconMessageCircle size={17} />
                    <input value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder={t("addComment")} onKeyDown={(event) => { if (event.key === "Enter") addComment(); }} />
                    <button type="button" onClick={addComment}>{t("send")}</button>
                  </label>
                </section>
              </>
            ) : (
              <section className="rail-empty">
                <IconClipboardList size={28} />
                <h2>{t("emptyRailTitle")}</h2>
                <p>{t("emptyRailBody")}</p>
              </section>
            )}
          </aside>
        </div>
      </main>

      {modal === "member" ? (
        <Modal title={t("addMember")} subtitle={t("cleanWorkspaceNotice")} onClose={() => setModal(null)}>
          <form className="modal-form" onSubmit={createMember}>
            <label><span>{t("memberName")}</span><input name="name" autoFocus /></label>
            <label><span>{t("role")}</span><input name="role" /></label>
            <label><span>{t("monthlyCapacity")}</span><input name="capacity" type="number" defaultValue="20" min="0" /></label>
            <div className="modal-actions"><button className="ghost-btn" type="button" onClick={() => setModal(null)}>{t("cancel")}</button><button className="primary-btn" type="submit">{t("save")}</button></div>
          </form>
        </Modal>
      ) : null}

      {modal === "project" ? (
        <Modal title={t("addProject")} subtitle={t("cleanWorkspaceNotice")} onClose={() => setModal(null)}>
          <form className="modal-form" onSubmit={createProject}>
            <label><span>{t("projectName")}</span><input name="name" autoFocus /></label>
            <div className="modal-grid">
              <label><span>{t("budget")}</span><input name="budget" type="number" min="0" defaultValue="0" /></label>
              <label><span>{t("domain")}</span><input name="domain" /></label>
              <label><span>{t("lineStatus")}</span><select name="lineStatus" defaultValue="aboveLine"><option value="aboveLine">{t("aboveLine")}</option><option value="belowLine">{t("belowLine")}</option></select></label>
            </div>
            <label><span>{t("owner")}</span><select name="ownerId" defaultValue={members[0]?.id || ""}><option value="">-</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
            <div className="modal-actions"><button className="ghost-btn" type="button" onClick={() => setModal(null)}>{t("cancel")}</button><button className="primary-btn" type="submit">{t("save")}</button></div>
          </form>
        </Modal>
      ) : null}

      {modal === "workItem" ? (
        <Modal title={t("newWorkItem")} subtitle={t("cleanWorkspaceNotice")} onClose={() => setModal(null)}>
          <form className="modal-form" onSubmit={createWorkItem}>
            <label><span>{t("title")}</span><input name="title" autoFocus /></label>
            <label><span>{t("summary")}</span><textarea name="summary" rows={3} /></label>
            <div className="modal-grid">
              <label><span>{t("project")}</span><select name="projectId" defaultValue={projectFilter === "all" ? projects[0]?.id : projectFilter}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
              <label><span>{t("owner")}</span><select name="ownerId" defaultValue={members[0]?.id || ""}><option value="">-</option>{members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
              <label><span>{t("priority")}</span><select name="priority" defaultValue="medium">{Object.keys(PRIORITY_META).map((value) => <option key={value} value={value}>{t(value)}</option>)}</select></label>
            </div>
            <label><span>{t("budget")}</span><input name="budget" type="number" min="0" defaultValue="0" /></label>
            <div className="modal-actions"><button className="ghost-btn" type="button" onClick={() => setModal(null)}>{t("cancel")}</button><button className="primary-btn" type="submit">{t("createWorkItem")}</button></div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal">
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            <span>{subtitle}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <IconX size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
