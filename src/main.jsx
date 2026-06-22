import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Database,
  Gauge,
  Globe2,
  Layers3,
  LayoutDashboard,
  ListChecks,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Users,
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "pm-lite-workspace-v1";
const MONTHS = ["FY26-04", "FY26-05", "FY26-06", "FY26-07", "FY26-08", "FY26-09", "FY26-10", "FY26-11", "FY26-12", "FY27-01", "FY27-02", "FY27-03"];
const STATUSES = ["planned", "active", "atRisk", "blocked", "done"];
const RISKS = ["low", "medium", "high"];

const I18N = {
  en: {
    app: "PM Platform",
    subtitle: "Internal portfolio, delivery, budget and fiscal capacity control",
    dashboard: "Overview",
    config: "Configuration",
    operations: "Operations",
    reports: "Reports",
    people: "People",
    budgets: "Budgets",
    calendar: "Fiscal Calendar",
    portfolios: "Portfolios",
    projects: "Sub-projects",
    add: "Add",
    save: "Save",
    sync: "Save to Netlify DB",
    load: "Load DB",
    local: "Local",
    synced: "Synced",
    name: "Name",
    role: "Role",
    owner: "Owner",
    capacity: "Monthly days",
    amount: "Amount",
    category: "Category",
    month: "Month",
    status: "Status",
    progress: "Progress",
    risk: "Risk",
    budget: "Budget",
    used: "Used",
    detail: "Detail",
    portfolio: "Portfolio",
    project: "Project",
    planned: "Planned",
    active: "Active",
    atRisk: "At risk",
    blocked: "Blocked",
    done: "Done",
    low: "Low",
    medium: "Medium",
    high: "High",
    totalBudget: "Total budget",
    usedBudget: "Used budget",
    remaining: "Remaining",
    avgProgress: "Avg progress",
    openRisks: "Open risks",
    all: "All",
    filter: "Filter",
    empty: "No data yet. Add configuration first.",
    dbReady: "Netlify Database ready after deployment",
    dbNote: "Local changes are saved in this browser. Use the database buttons after Netlify provisions the database.",
  },
  zh: {
    app: "项目管理平台",
    subtitle: "内部项目集、交付进度、预算与财年人天管理",
    dashboard: "总览",
    config: "配置",
    operations: "运维",
    reports: "报表",
    people: "人员",
    budgets: "预算",
    calendar: "财年日历",
    portfolios: "项目集",
    projects: "子项目",
    add: "新增",
    save: "保存",
    sync: "保存到 Netlify DB",
    load: "读取数据库",
    local: "本地",
    synced: "已同步",
    name: "名称",
    role: "角色",
    owner: "负责人",
    capacity: "月可用人天",
    amount: "金额",
    category: "类别",
    month: "月份",
    status: "状态",
    progress: "进度",
    risk: "风险",
    budget: "预算",
    used: "已用",
    detail: "详情",
    portfolio: "项目集",
    project: "项目",
    planned: "计划中",
    active: "进行中",
    atRisk: "有风险",
    blocked: "阻塞",
    done: "完成",
    low: "低",
    medium: "中",
    high: "高",
    totalBudget: "总预算",
    usedBudget: "已用预算",
    remaining: "剩余",
    avgProgress: "平均进度",
    openRisks: "风险项目",
    all: "全部",
    filter: "筛选",
    empty: "暂无数据，请先完成基础配置。",
    dbReady: "部署后自动接入 Netlify Database",
    dbNote: "本地修改会保存在浏览器；Netlify 完成数据库初始化后可使用同步按钮。",
  },
};

function blankWorkspace() {
  return {
    people: [],
    budgets: [],
    calendar: MONTHS.map((id) => ({ id, standardDays: 20, locked: false })),
    portfolios: [],
    projects: [],
  };
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function loadInitial() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || blankWorkspace();
  } catch {
    return blankWorkspace();
  }
}

function App() {
  const [lang, setLang] = useState("zh");
  const [active, setActive] = useState("dashboard");
  const [configTab, setConfigTab] = useState("people");
  const [workspace, setWorkspace] = useState(loadInitial);
  const [filters, setFilters] = useState({ portfolioId: "all", ownerId: "all", status: "all", risk: "all", month: "all", query: "" });
  const [syncState, setSyncState] = useState(I18N.zh.local);
  const t = (key) => I18N[lang][key] || key;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace]);

  const viewProjects = useMemo(() => {
    return workspace.projects.filter((project) => {
      const query = filters.query.trim().toLowerCase();
      return (
        (filters.portfolioId === "all" || project.portfolioId === filters.portfolioId) &&
        (filters.ownerId === "all" || project.ownerId === filters.ownerId) &&
        (filters.status === "all" || project.status === filters.status) &&
        (filters.risk === "all" || project.risk === filters.risk) &&
        (filters.month === "all" || project.month === filters.month) &&
        (!query || `${project.name} ${project.detail || ""}`.toLowerCase().includes(query))
      );
    });
  }, [filters, workspace.projects]);

  const metrics = useMemo(() => {
    const totalBudget = workspace.budgets.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const usedBudget = viewProjects.reduce((sum, item) => sum + Number(item.used || 0), 0);
    const avgProgress = viewProjects.length ? Math.round(viewProjects.reduce((sum, item) => sum + Number(item.progress || 0), 0) / viewProjects.length) : 0;
    const openRisks = viewProjects.filter((item) => item.risk === "high" || item.status === "blocked").length;
    return { totalBudget, usedBudget, avgProgress, openRisks };
  }, [viewProjects, workspace.budgets]);

  function addRecord(type, record) {
    setWorkspace((current) => ({ ...current, [type]: [...current[type], { id: uid(type), ...record }] }));
    setSyncState(t("local"));
  }

  function updateRecord(type, id, patch) {
    setWorkspace((current) => ({
      ...current,
      [type]: current[type].map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
    setSyncState(t("local"));
  }

  async function syncToDb() {
    setSyncState("Saving...");
    const response = await fetch("/.netlify/functions/workspace", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: workspace }),
    });
    if (!response.ok) throw new Error(await response.text());
    setSyncState(t("synced"));
  }

  async function loadFromDb() {
    setSyncState("Loading...");
    const response = await fetch("/.netlify/functions/workspace");
    if (!response.ok) throw new Error(await response.text());
    const payload = await response.json();
    if (payload.data) setWorkspace({ ...blankWorkspace(), ...payload.data });
    setSyncState(t("synced"));
  }

  const nav = [
    ["dashboard", LayoutDashboard],
    ["config", Settings2],
    ["operations", ListChecks],
    ["reports", BarChart3],
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="mark"><Layers3 size={19} /></div>
          <div>
            <strong>{t("app")}</strong>
            <span>{t("subtitle")}</span>
          </div>
        </div>
        <nav>
          {nav.map(([key, Icon]) => (
            <button key={key} className={active === key ? "active" : ""} onClick={() => setActive(key)}>
              <Icon size={18} />
              {t(key)}
            </button>
          ))}
        </nav>
        <div className="db-card">
          <Database size={18} />
          <strong>{t("dbReady")}</strong>
          <p>{t("dbNote")}</p>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">Workspace / {t(active)}</span>
            <h1>{t(active)}</h1>
          </div>
          <div className="actions">
            <button className="small" onClick={() => setLang(lang === "zh" ? "en" : "zh")}><Globe2 size={15} />{lang === "zh" ? "EN" : "中"}</button>
            <button className="small" onClick={loadFromDb}><RefreshCw size={15} />{t("load")}</button>
            <button className="primary" onClick={syncToDb}><Database size={15} />{t("sync")}</button>
            <span className="sync">{syncState}</span>
          </div>
        </header>

        {active === "dashboard" && <Dashboard t={t} metrics={metrics} workspace={workspace} projects={viewProjects} />}
        {active === "config" && <Config t={t} tab={configTab} setTab={setConfigTab} workspace={workspace} addRecord={addRecord} updateRecord={updateRecord} />}
        {active === "operations" && <Operations t={t} workspace={workspace} addRecord={addRecord} updateRecord={updateRecord} />}
        {active === "reports" && <Reports t={t} workspace={workspace} filters={filters} setFilters={setFilters} projects={viewProjects} metrics={metrics} />}
      </main>
    </div>
  );
}

function Dashboard({ t, metrics, workspace, projects }) {
  return (
    <section className="page-grid">
      <Metric icon={CircleDollarSign} label={t("totalBudget")} value={money(metrics.totalBudget)} />
      <Metric icon={Gauge} label={t("avgProgress")} value={`${metrics.avgProgress}%`} />
      <Metric icon={BriefcaseBusiness} label={t("projects")} value={workspace.projects.length} />
      <Metric icon={CheckCircle2} label={t("openRisks")} value={metrics.openRisks} />
      <section className="panel span-2">
        <PanelTitle title={t("operations")} icon={ListChecks} />
        <ProjectTable t={t} projects={projects.slice(0, 6)} workspace={workspace} />
      </section>
      <section className="panel">
        <PanelTitle title={t("calendar")} icon={CalendarDays} />
        <div className="month-list">
          {workspace.calendar.map((item) => <span key={item.id}>{item.id}<b>{item.standardDays}d</b></span>)}
        </div>
      </section>
    </section>
  );
}

function Config({ t, tab, setTab, workspace, addRecord, updateRecord }) {
  const tabs = [["people", Users], ["budgets", CircleDollarSign], ["calendar", CalendarDays], ["portfolios", Layers3], ["projects", BriefcaseBusiness]];
  return (
    <section className="panel">
      <div className="tabs">
        {tabs.map(([key, Icon]) => <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}><Icon size={16} />{t(key)}</button>)}
      </div>
      {tab === "people" && <PeopleConfig t={t} people={workspace.people} addRecord={addRecord} updateRecord={updateRecord} />}
      {tab === "budgets" && <BudgetConfig t={t} budgets={workspace.budgets} addRecord={addRecord} updateRecord={updateRecord} />}
      {tab === "calendar" && <CalendarConfig t={t} calendar={workspace.calendar} updateRecord={updateRecord} />}
      {tab === "portfolios" && <PortfolioConfig t={t} portfolios={workspace.portfolios} addRecord={addRecord} updateRecord={updateRecord} />}
      {tab === "projects" && <ProjectConfig t={t} workspace={workspace} addRecord={addRecord} updateRecord={updateRecord} />}
    </section>
  );
}

function PeopleConfig({ t, people, addRecord, updateRecord }) {
  return (
    <CrudSection
      t={t}
      fields={[["name", "text"], ["role", "text"], ["capacity", "number"]]}
      rows={people}
      onAdd={(data) => addRecord("people", { name: data.name, role: data.role, capacity: Number(data.capacity || 20) })}
      render={(person) => (
        <Card key={person.id}>
          <input value={person.name} onChange={(e) => updateRecord("people", person.id, { name: e.target.value })} />
          <input value={person.role} onChange={(e) => updateRecord("people", person.id, { role: e.target.value })} />
          <input type="number" value={person.capacity} onChange={(e) => updateRecord("people", person.id, { capacity: Number(e.target.value) })} />
        </Card>
      )}
    />
  );
}

function BudgetConfig({ t, budgets, addRecord, updateRecord }) {
  return (
    <CrudSection
      t={t}
      fields={[["name", "text"], ["category", "text"], ["amount", "number"]]}
      rows={budgets}
      onAdd={(data) => addRecord("budgets", { name: data.name, category: data.category, amount: Number(data.amount || 0) })}
      render={(budget) => (
        <Card key={budget.id}>
          <input value={budget.name} onChange={(e) => updateRecord("budgets", budget.id, { name: e.target.value })} />
          <input value={budget.category} onChange={(e) => updateRecord("budgets", budget.id, { category: e.target.value })} />
          <input type="number" value={budget.amount} onChange={(e) => updateRecord("budgets", budget.id, { amount: Number(e.target.value) })} />
        </Card>
      )}
    />
  );
}

function CalendarConfig({ t, calendar, updateRecord }) {
  return (
    <div className="cards month-cards">
      {calendar.map((month) => (
        <Card key={month.id}>
          <strong>{month.id}</strong>
          <label>{t("capacity")}</label>
          <input type="number" value={month.standardDays} onChange={(e) => updateRecord("calendar", month.id, { standardDays: Number(e.target.value) })} />
        </Card>
      ))}
    </div>
  );
}

function PortfolioConfig({ t, portfolios, addRecord, updateRecord }) {
  return (
    <CrudSection
      t={t}
      fields={[["name", "text"], ["owner", "text"]]}
      rows={portfolios}
      onAdd={(data) => addRecord("portfolios", { name: data.name, owner: data.owner })}
      render={(portfolio) => (
        <Card key={portfolio.id}>
          <input value={portfolio.name} onChange={(e) => updateRecord("portfolios", portfolio.id, { name: e.target.value })} />
          <input value={portfolio.owner} onChange={(e) => updateRecord("portfolios", portfolio.id, { owner: e.target.value })} />
        </Card>
      )}
    />
  );
}

function ProjectConfig({ t, workspace, addRecord, updateRecord }) {
  return (
    <div>
      <ProjectForm t={t} workspace={workspace} onSubmit={(data) => addRecord("projects", data)} />
      <div className="cards">
        {workspace.projects.map((project) => (
          <ProjectEditCard key={project.id} t={t} project={project} workspace={workspace} update={(patch) => updateRecord("projects", project.id, patch)} />
        ))}
      </div>
    </div>
  );
}

function Operations({ t, workspace, addRecord, updateRecord }) {
  return (
    <section className="page-grid">
      <section className="panel span-2">
        <PanelTitle title={t("operations")} icon={ListChecks} />
        <ProjectForm t={t} workspace={workspace} onSubmit={(data) => addRecord("projects", data)} compact />
      </section>
      {workspace.projects.length ? workspace.projects.map((project) => (
        <ProjectEditCard key={project.id} t={t} project={project} workspace={workspace} update={(patch) => updateRecord("projects", project.id, patch)} operational />
      )) : <Empty t={t} />}
    </section>
  );
}

function Reports({ t, workspace, filters, setFilters, projects, metrics }) {
  const byStatus = STATUSES.map((status) => ({ status, count: projects.filter((item) => item.status === status).length }));
  return (
    <section className="page-grid">
      <section className="panel span-3">
        <PanelTitle title={t("filter")} icon={Search} />
        <div className="filters">
          <select value={filters.portfolioId} onChange={(e) => setFilters({ ...filters, portfolioId: e.target.value })}>
            <option value="all">{t("portfolio")}: {t("all")}</option>
            {workspace.portfolios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={filters.ownerId} onChange={(e) => setFilters({ ...filters, ownerId: e.target.value })}>
            <option value="all">{t("owner")}: {t("all")}</option>
            {workspace.people.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="all">{t("status")}: {t("all")}</option>
            {STATUSES.map((item) => <option key={item} value={item}>{t(item)}</option>)}
          </select>
          <select value={filters.risk} onChange={(e) => setFilters({ ...filters, risk: e.target.value })}>
            <option value="all">{t("risk")}: {t("all")}</option>
            {RISKS.map((item) => <option key={item} value={item}>{t(item)}</option>)}
          </select>
          <select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
            <option value="all">{t("month")}: {t("all")}</option>
            {MONTHS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input value={filters.query} placeholder={t("project")} onChange={(e) => setFilters({ ...filters, query: e.target.value })} />
        </div>
      </section>
      <Metric icon={CircleDollarSign} label={t("usedBudget")} value={money(metrics.usedBudget)} />
      <Metric icon={Gauge} label={t("avgProgress")} value={`${metrics.avgProgress}%`} />
      <Metric icon={CheckCircle2} label={t("openRisks")} value={metrics.openRisks} />
      <section className="panel span-1">
        <PanelTitle title={t("status")} icon={BarChart3} />
        <div className="bars">
          {byStatus.map((item) => <div key={item.status}><span>{t(item.status)}</span><i style={{ width: `${Math.max(6, item.count * 20)}%` }} /><b>{item.count}</b></div>)}
        </div>
      </section>
      <section className="panel span-2">
        <ProjectTable t={t} projects={projects} workspace={workspace} />
      </section>
    </section>
  );
}

function ProjectForm({ t, workspace, onSubmit, compact }) {
  const [form, setForm] = useState({ name: "", portfolioId: "", ownerId: "", budgetId: "", month: MONTHS[0], status: "planned", progress: 0, risk: "low", used: 0, detail: "" });
  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({ ...form, progress: Number(form.progress || 0), used: Number(form.used || 0), updatedAt: new Date().toISOString() });
    setForm({ ...form, name: "", progress: 0, used: 0, detail: "" });
  }
  return (
    <form className={compact ? "project-form compact" : "project-form"} onSubmit={submit}>
      <input value={form.name} placeholder={t("project")} onChange={(e) => set("name", e.target.value)} />
      <select value={form.portfolioId} onChange={(e) => set("portfolioId", e.target.value)}>
        <option value="">{t("portfolio")}</option>
        {workspace.portfolios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <select value={form.ownerId} onChange={(e) => set("ownerId", e.target.value)}>
        <option value="">{t("owner")}</option>
        {workspace.people.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <select value={form.budgetId} onChange={(e) => set("budgetId", e.target.value)}>
        <option value="">{t("budget")}</option>
        {workspace.budgets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <select value={form.month} onChange={(e) => set("month", e.target.value)}>{MONTHS.map((item) => <option key={item}>{item}</option>)}</select>
      <button className="primary" type="submit"><Plus size={16} />{t("add")}</button>
    </form>
  );
}

function ProjectEditCard({ t, project, workspace, update, operational }) {
  const getName = (type, id) => workspace[type].find((item) => item.id === id)?.name || "-";
  return (
    <article className="project-card">
      <div className="project-head">
        <div>
          <strong>{project.name}</strong>
          <span>{getName("portfolios", project.portfolioId)} / {getName("people", project.ownerId)}</span>
        </div>
        <select value={project.status} onChange={(e) => update({ status: e.target.value, updatedAt: new Date().toISOString() })}>
          {STATUSES.map((item) => <option key={item} value={item}>{t(item)}</option>)}
        </select>
      </div>
      <label>{t("progress")}: {project.progress}%</label>
      <input type="range" min="0" max="100" value={project.progress} onChange={(e) => update({ progress: Number(e.target.value), updatedAt: new Date().toISOString() })} />
      <div className="inline-grid">
        <select value={project.risk} onChange={(e) => update({ risk: e.target.value, updatedAt: new Date().toISOString() })}>
          {RISKS.map((item) => <option key={item} value={item}>{t(item)}</option>)}
        </select>
        <input type="number" value={project.used} placeholder={t("used")} onChange={(e) => update({ used: Number(e.target.value), updatedAt: new Date().toISOString() })} />
        <select value={project.month} onChange={(e) => update({ month: e.target.value, updatedAt: new Date().toISOString() })}>
          {MONTHS.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      {operational ? <textarea value={project.detail} placeholder={t("detail")} onChange={(e) => update({ detail: e.target.value, updatedAt: new Date().toISOString() })} /> : null}
    </article>
  );
}

function CrudSection({ t, fields, rows, onAdd, render }) {
  const [form, setForm] = useState(Object.fromEntries(fields.map(([field]) => [field, ""])));
  function submit(event) {
    event.preventDefault();
    if (!Object.values(form).some(Boolean)) return;
    onAdd(form);
    setForm(Object.fromEntries(fields.map(([field]) => [field, ""])));
  }
  return (
    <div>
      <form className="crud-form" onSubmit={submit}>
        {fields.map(([field, type]) => <input key={field} type={type} value={form[field]} placeholder={t(field)} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />)}
        <button className="primary" type="submit"><Plus size={16} />{t("add")}</button>
      </form>
      <div className="cards">{rows.length ? rows.map(render) : <Empty t={t} />}</div>
    </div>
  );
}

function ProjectTable({ t, projects, workspace }) {
  const getName = (type, id) => workspace[type].find((item) => item.id === id)?.name || "-";
  if (!projects.length) return <Empty t={t} />;
  return (
    <div className="table">
      {projects.map((project) => (
        <div key={project.id} className="row">
          <strong>{project.name}</strong>
          <span>{getName("portfolios", project.portfolioId)}</span>
          <span>{getName("people", project.ownerId)}</span>
          <span>{t(project.status)}</span>
          <span>{project.progress}%</span>
          <span>{t(project.risk)}</span>
        </div>
      ))}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <section className="metric"><Icon size={19} /><span>{label}</span><strong>{value}</strong></section>;
}

function PanelTitle({ title, icon: Icon }) {
  return <div className="panel-title"><Icon size={18} /><h2>{title}</h2></div>;
}

function Card({ children }) {
  return <article className="card">{children}</article>;
}

function Empty({ t }) {
  return <div className="empty">{t("empty")}</div>;
}

createRoot(document.getElementById("root")).render(<App />);
