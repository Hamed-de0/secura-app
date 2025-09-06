// src/api/workflows.js
// In-memory definition store (no localStorage)
let DEF_STORE = [];

export function listDefinitions() {
  return DEF_STORE;
}
export function getDefinition(id) {
  return DEF_STORE.find(d => d.id === id) || null;
}
export function upsertDefinition(def) {
  const i = DEF_STORE.findIndex(d => d.id === def.id);
  const now = new Date().toISOString();
  const next = { ...def, updated_at: now };
  if (i >= 0) DEF_STORE[i] = next; else DEF_STORE.push({ ...next, created_at: now });
  return next;
}
export function createBlankDefinition(name = "New workflow") {
  return {
    id: `def_${Date.now()}`,
    name,
    version: 1,
    status: "draft",
    nodes: [{ id: "start", type: "start", x: 1, y: 1 }, { id: "end", type: "end", x: 6, y: 1 }],
    edges: [],
  };
}
export function ensureSeed() {
  const now = new Date().toISOString();
  const templates = [
    exception_workflow_template(),
    risk_treatment_workflow_template(),
    createChangeMgmtDefinition()
  ];
  if (DEF_STORE.length === 0) {
    DEF_STORE = templates.map(t => ({ ...t, created_at: t.created_at || now, updated_at: t.updated_at || now }));
  } else {
    for (const tpl of templates) {
      const idx = DEF_STORE.findIndex(d => d.id === tpl.id);
      if (idx === -1) DEF_STORE.push({ ...tpl, created_at: now, updated_at: now });
    }
  }
}

// Force reload from source mock templates (useful during development)
export function reloadFromMock() {
  const now = new Date().toISOString();
  DEF_STORE = [
    exception_workflow_template(),
    risk_treatment_workflow_template(),
    createChangeMgmtDefinition(),
  ].map(t => ({ ...t, created_at: t.created_at || now, updated_at: now }));
  return DEF_STORE;
}

export function createChangeMgmtDefinition() {
  const now = new Date().toISOString();
  return {
    id: "change_mgmt",
    name: "Change Management Process",
    version: 1,
    status: "published",
    canvas: { w: 1600, h: 1850 },
    nodes: [
      // Left column centers at x=500
      { id:"start",     type:"start",    x:2, y:1 },
      { id:"req",       type:"task",     x:2, y:2, props:{ title:"Request", role:"Stakeholders" } },
      { id:"register",  type:"task",     x:2, y:3, props:{ title:"Register & assess change", role:"Project Mgr" } },
      { id:"chglog",    type:"service",  x:5, y:3, props:{ title:"Central change log" } },
      { id:"review",    type:"task",     x:2, y:4, props:{ title:"Review & submit RFC", role:"Change Mgr" } },
      { id:"decide",    type:"decision", x:1, y:5, props:{ title:"Accept?" } },
      { id:"inform",    type:"task",     x:5, y:5, props:{ title:"Inform requestor\nupdate change log", role:"Project Mgr" } },
      { id:"update",    type:"task",     x:2, y:6, props:{ title:"Update plans", role:"Project Mgr" } },
      { id:"implement", type:"task",     x:2, y:7, props:{ title:"Implement", role:"Project team" } },
      { id:"end_yes",   type:"end",      x:2, y:8 },
      { id:"end_no",    type:"end",      x:5, y:6 }
    ],
    edges: [
      { from:"start",   to:"req" },
      { from:"req",     to:"register" },
      { from:"register",to:"chglog" },
      { from:"register",to:"review" },
      { from:"review",  to:"decide" },
      { from:"decide",  to:"inform",   label:"No" },
      { from:"inform",  to:"chglog" },
      { from:"inform",  to:"end_no" },
      { from:"decide",  to:"update",   label:"Yes" },
      { from:"update",  to:"implement" },
      { from:"implement",to:"end_yes" }
    ],
    created_at: now, updated_at: now
  };
}

// ---------- Exception Handling Workflow ----------
export function exception_workflow_template() {
  const now = new Date().toISOString();
  return {
    id: "exception_flow",
    name: "Exception Handling Workflow",
    version: 1,
    status: "published",
    // Scalable virtual canvas sized to fit 200px gaps
    canvas: { w: 900, h: 2400 },
    nodes: [
      // Central column (xC = 600)
      { id:"ex_start",     type:"start",    x:1, y:1 },
      { id:"ex_draft",     type:"task",     x:1, y:2, props:{ title:"Draft exception" } },
      { id:"ex_details",   type:"task",     x:2, y:3, props:{ title:"Gather justification & scope" } },
      { id:"ex_review",    type:"approval", x:3, y:4, props:{ title:"Manager review" } },
      { id:"ex_decide",    type:"decision", x:3, y:5, props:{ title:"Approve?" } },

      // Rejection branch (right)
      { id:"ex_changes",   type:"task",     x:5, y:5, props:{ title:"Request changes" } },
      { id:"ex_resubmit",  type:"task",     x:5, y:6, props:{ title:"Resubmit" } },
      { id:"ex_end_no",    type:"end",      x:5, y:8 },

      // Approval branch (middle)
      { id:"ex_comp",      type:"task",     x:3, y:6, props:{ title:"Apply compensating controls" } },
      { id:"ex_record",    type:"service",  x:3, y:7, props:{ title:"Record in SoA & register" } },
      { id:"ex_notify",    type:"task",     x:3, y:8, props:{ title:"Notify stakeholders" } },
      { id:"ex_end_yes",   type:"end",      x:3, y:9 },
    ],
    edges: [
      { from:"ex_start",   to:"ex_draft" },
      { from:"ex_draft",   to:"ex_details" },
      { from:"ex_details", to:"ex_review" },
      { from:"ex_review",  to:"ex_decide" },

      // Decision branches
      { from:"ex_decide",  to:"ex_changes", label:"Reject" },
      { from:"ex_decide",  to:"ex_comp",    label:"Approve" },

      // Rejection flow
      { from:"ex_changes", to:"ex_resubmit" },
      { from:"ex_resubmit",to:"ex_review",  label:"Resubmit" },
      // Optional terminal on reject path
      { from:"ex_changes", to:"ex_end_no",  label:"Withdraw" },

      // Approved flow
      { from:"ex_comp",    to:"ex_record" },
      { from:"ex_record",  to:"ex_notify" },
      { from:"ex_notify",  to:"ex_end_yes" },
    ],
    created_at: now, updated_at: now
  };
}

// ---------- Risk Treatment / Mitigation Workflow ----------
export function risk_treatment_workflow_template() {
  const now = new Date().toISOString();
  return {
    id: "risk_treatment",
    name: "Risk Treatment Workflow",
    version: 1,
    status: "published", 
    canvas: { w: 900, h: 2700 },
    nodes: [
      { id:"rt_start",     type:"start",    x:2, y:1 },
      { id:"rt_identify",  type:"task",     x:2, y:2, props:{ title:"Identify risk" } },
      { id:"rt_assess",    type:"task",     x:2, y:3, props:{ title:"Assess (impact × likelihood)" } },
      { id:"rt_decide",    type:"decision", x:2, y:4, props:{ title:"Treatment option?" } },

      // Avoid branch (left)
      { id:"rt_change",    type:"task",     x:1, y:5, props:{ title:"Change/stop activity" } },
      { id:"rt_update",    type:"service",  x:1, y:6, props:{ title:"Update registers" } },
      { id:"rt_end_avoid", type:"end",      x:1, y:7 },

      // Reduce branch (middle)
      { id:"rt_plan",      type:"task",     x:2, y:5, props:{ title:"Plan mitigations" } },
      { id:"rt_implement", type:"task",     x:2, y:6, props:{ title:"Implement controls" } },
      { id:"rt_validate",  type:"approval", x:2, y:7, props:{ title:"Validate effectiveness" } },
      { id:"rt_residual",  type:"decision", x:2, y:8, props:{ title:"Residual within appetite?" } },
      { id:"rt_close",     type:"task",     x:2, y:9, props:{ title:"Close risk & update SoA" } },
      { id:"rt_end_treat", type:"end",      x:2, y:10 },

      // Escalation from residual "No"
      { id:"rt_escalate",  type:"task",     x:3, y:8, props:{ title:"Escalate & re-evaluate" } },
      { id:"rt_replan",    type:"task",     x:3, y:9, props:{ title:"Re-plan treatment" } },
      { id:"rt_end_escal", type:"end",      x:3, y:10 },

      // Accept branch (right)
      { id:"rt_accept_rec",type:"service",  x:3, y:5, props:{ title:"Record risk acceptance" } },
      { id:"rt_end_acc",   type:"end",      x:3, y:6 },

      // Transfer branch (right)
      { id:"rt_select",    type:"task",     x:4, y:5, props:{ title:"Select transfer mechanism" } },
      { id:"rt_contract",  type:"service",  x:4, y:6, props:{ title:"Execute contract" } },
      { id:"rt_monitor",   type:"task",     x:4, y:7, props:{ title:"Monitor third party" } },
      { id:"rt_end_trans", type:"end",      x:4, y:8 },
    ],
    edges: [
      { from:"rt_start",     to:"rt_identify" },
      { from:"rt_identify",  to:"rt_assess" },
      { from:"rt_assess",    to:"rt_decide" },

      // Option branches
      { from:"rt_decide",    to:"rt_change",     label:"Avoid" },
      { from:"rt_decide",    to:"rt_plan",       label:"Reduce" },
      { from:"rt_decide",    to:"rt_accept_rec", label:"Accept" },
      { from:"rt_decide",    to:"rt_select",     label:"Transfer" },

      // Avoid
      { from:"rt_change",    to:"rt_update" },
      { from:"rt_update",    to:"rt_end_avoid" },

      // Reduce
      { from:"rt_plan",      to:"rt_implement" },
      { from:"rt_implement", to:"rt_validate" },
      { from:"rt_validate",  to:"rt_residual" },
      { from:"rt_residual",  to:"rt_close",     label:"Yes" },
      { from:"rt_close",     to:"rt_end_treat" },
      { from:"rt_residual",  to:"rt_escalate",  label:"No" },
      { from:"rt_escalate",  to:"rt_replan" },
      { from:"rt_replan",    to:"rt_end_escal" },

      // Accept
      { from:"rt_accept_rec",to:"rt_end_acc" },

      // Transfer
      { from:"rt_select",    to:"rt_contract" },
      { from:"rt_contract",  to:"rt_monitor" },
      { from:"rt_monitor",   to:"rt_end_trans" },
    ],
    created_at: now, updated_at: now
  };
}





