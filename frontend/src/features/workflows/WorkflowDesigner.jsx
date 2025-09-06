import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Stack, Card, CardContent, Typography, Button, TextField, Chip } from "@mui/material";
import { getDefinition, upsertDefinition, reloadFromMock } from "../../api/services/workflows";

// Palette
const NODE_TYPES = [
  { type: "start", label: "Start" },
  { type: "task", label: "Task" },
  { type: "approval", label: "Approval" },
  { type: "decision", label: "Decision" },
  { type: "timer", label: "Timer" },
  { type: "service", label: "Service" },
  { type: "end", label: "End" },
];

const makeNode = (type, x, y) => ({ id: `${type}_${Date.now()}`, type, x, y, props: {} });

// Visual spec (also used by edge math)
const SHAPES = {
  start:   { w: 132, h: 60,  br: 9999,  type: "ellipse",  bg: (t)=>t.palette.common.white,    bc: "divider" },
  end:     { w: 132, h: 60,  br: 9999,  type: "ellipse",  bg: (t)=>t.palette.common.white,    bc: "divider" },
  task:    { w: 200, h: 64,  br: 14,    type: "rect",     bg: (t)=>t.palette.info.light,      bc: "info.main" },
  service: { w: 200, h: 64,  br: 14,    type: "rect",     bg: (t)=>t.palette.secondary.light, bc: "secondary.main" },
  approval:{ w: 200,  h: 96,  br: 2,     type: "rect",     bg: (t)=>t.palette.success.light,   bc: "success.main" },
  timer:   { w: 140, h: 80,  br: 0,     type: "rect",     bg: (t)=>t.palette.warning.light,   bc: "warning.main",
             clip: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)" },
  decision:{ w: 110, h: 110, br: 2,     type: "diamond",  bg: (t)=>t.palette.warning.light,   bc: "warning.main", diamond: true },
};

export default function WorkflowDesigner() {
  const { id } = useParams();
  const nav = useNavigate();
  const [spec, setSpec] = React.useState(null);
  const [connectFrom, setConnectFrom] = React.useState(null);

  // Canvas size (measured once + on resize) — no re-render loops
  const canvasRef = React.useRef(null);
  const [, forceRerender] = React.useState(0);

  React.useEffect(() => {
    const def = getDefinition(id);
    setSpec(def);
  }, [id]);

  React.useEffect(() => {
    const onResize = () => forceRerender((x) => x + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!spec) return null;

  const addNode = (type) => {
    for (let y=1; y<=8; y++) for (let x=1; x<=12; x++) {
      if (!spec.nodes.some(n => n.x===x && n.y===y)) {
        setSpec(s => ({ ...s, nodes: [...s.nodes, makeNode(type, x, y)] }));
        return;
      }
    }
  };

  const onCanvasClick = (e) => {
    if (!connectFrom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = e.clientX - rect.left, ry = e.clientY - rect.top;
    const x = Math.min(GRID_COLS, Math.max(1, Math.round(rx / CELL_W + 0.5)));
    const y = Math.max(1, Math.round(ry / CELL_H + 0.5));
    const to = spec.nodes.find(n => n.x===x && n.y===y);
    if (to && to.id !== connectFrom) {
      setSpec(s => ({ ...s, edges: [...s.edges, { from: connectFrom, to: to.id }] }));
    }
    setConnectFrom(null);
  };

  const save = () => upsertDefinition(spec);
  const refreshFromMock = () => {
    reloadFromMock();
    const def = getDefinition(id);
    if (def) setSpec(def);

    // console.log("Reloading workflow definitions from mock templates", def);

  };

  // Grid: 5 columns, unlimited rows. Each cell has 200px margins around max shape size.
  const GRID_COLS = 5;
  const CELL_MARGIN = 20;
  const MAX_W = Math.max(...Object.values(SHAPES).map(s => s.w));
  const MAX_H = Math.max(...Object.values(SHAPES).map(s => s.h));
  const CELL_W = MAX_W + 2 * CELL_MARGIN;
  const CELL_H = MAX_H + 2 * CELL_MARGIN;
  const maxRow = Math.max(1, ...((spec?.nodes || []).map(n => Number(n?.y) || 1)));
  const containerW = GRID_COLS * CELL_W;
  const containerH = maxRow * CELL_H;
  const nodeCenterGrid = (n) => {
    const col = Math.min(GRID_COLS, Math.max(1, Number(n?.x) || 1));
    const row = Math.max(1, Number(n?.y) || 1);
    return [ (col - 0.5) * CELL_W, (row - 0.5) * CELL_H ];
  };

  return (
    <Box sx={{ p:2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button size="small" onClick={() => nav("/workflows")}>Back</Button>
          <TextField size="small" value={spec.name} onChange={e=>setSpec(s=>({ ...s, name:e.target.value }))} />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Chip size="small" label={`Nodes: ${spec.nodes.length}`} />
          <Chip size="small" label={`Edges: ${spec.edges.length}`} />
          <Button variant="outlined" onClick={refreshFromMock}>Refresh</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2}>
        {/* <Card sx={{ width: 220, flex: "0 0 auto" }}>
          <CardContent>
            <Typography variant="overline">Node palette</Typography>
            <Stack spacing={1} sx={{ mt:1 }}>
              {NODE_TYPES.map(nt => (
                <Button key={nt.type} variant="outlined" onClick={() => addNode(nt.type)}>{nt.label}</Button>
              ))}
            </Stack>
          </CardContent>
        </Card> */}

        <Card sx={{ flex:1, position:"relative" }}>
          <CardContent>
            <Typography variant="overline">Canvas</Typography>

            {/* Grid canvas */}
            <Box
              ref={canvasRef}
              sx={{
                position:"relative", mt:1,
                width: containerW,
                height: containerH,
                backgroundImage: "linear-gradient(#eee 1px, transparent 1px), linear-gradient(90deg,#eee 1px, transparent 1px)",
                backgroundSize: `${CELL_W}px ${CELL_H}px, ${CELL_W}px ${CELL_H}px`,
                backgroundPosition: "0 0, 0 0",
                borderRadius:2
              }}
              onClick={onCanvasClick}
            >
              {/* Edge layer (always render; compute size on the fly) */}
              {/* Edges hidden to focus on node placement */}
              <svg width="100%" height="100%" style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
                <defs>
                    <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="#90caf9"/>
                    </marker>
                </defs>

                {(() => {
                    // 🔑 Absolute canvas size every render (avoids stale 0×0)
                    const W = containerW;
                    const H = containerH;

                    // Node center: px/py scaled to canvas, else grid fallback
                    const nodeCenter = (n) => nodeCenterGrid(n);

                    // Same anchor helpers you already have
                    const EPS = 1e-6;
                    const anchorRect = (cx0,cy0, vx,vy, w,h) => {
                    const hw = w/2, hh = h/2;
                    const ax = Math.max(Math.abs(vx), EPS), ay = Math.max(Math.abs(vy), EPS);
                    if (ax*hh >= ay*hw) { // left/right
                        const sx = Math.sign(vx);
                        const x = cx0 + sx*hw;
                        const y = cy0 + vy * (hw/ax);
                        return [x,y];
                    } else {              // top/bottom
                        const sy = Math.sign(vy);
                        const y = cy0 + sy*hh;
                        const x = cx0 + vx * (hh/ay);
                        return [x,y];
                    }
                    };
                    const anchorEllipse = (cx0,cy0, vx,vy, w,h) => {
                    const rx=w/2, ry=h/2;
                    const denom = Math.sqrt((vx*vx)/(rx*rx)+(vy*vy)/(ry*ry)) || EPS;
                    const t = 1/denom;
                    return [cx0 + vx*t, cy0 + vy*t];
                    };
                    const anchorDiamond = (cx0,cy0, vx,vy, w,h) => {
                     const hx=w/2, hy=h/2;
                     const t = 1/((Math.abs(vx)/hx) + (Math.abs(vy)/hy) || EPS);
                     return [cx0 + vx*t, cy0 + vy*t];
                    };
                    const anchorFor = (node, cx0, cy0, towardX, towardY) => {
                      const s = SHAPES[node.type] || SHAPES.task;
                      const vx = towardX - cx0, vy = towardY - cy0;
                      if (s.type === "ellipse") return anchorEllipse(cx0,cy0,vx,vy,s.w,s.h);
                      if (s.type === "diamond") return anchorDiamond(cx0,cy0,vx,vy,s.w,s.h);
                      return anchorRect(cx0,cy0,vx,vy,s.w,s.h);
                    };

                    return spec.edges.map((e,i) => {
                    const A = spec.nodes.find(n=>n.id===e.from);
                    const B = spec.nodes.find(n=>n.id===e.to);
                    if (!A || !B) return null;

                    const [Ax, Ay] = nodeCenter(A);
                    const [Bx, By] = nodeCenter(B);

                    let sx = Ax, sy = Ay;
                    let tx = Bx, ty = By;
                    const mx = (sx+tx)/2, my = (sy+ty)/2;

                    // Orthogonal centerline route (L or straight)
                    let pts;
                    if (Math.abs(sx - tx) < 1e-6 || Math.abs(sy - ty) < 1e-6) {
                      pts = [sx, sy, tx, ty];
                    } else {
                      pts = [sx, sy, tx, sy, tx, ty];
                    }
                    const points = pts.join(',');

                    return (
                        <g key={i}>
                        <polyline
                            points={points}
                            fill="none"
                            stroke="#90caf9" strokeWidth="2" strokeLinecap="round"
                            markerEnd="url(#arrow)"
                        />
                        {e.label && (
                            <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#607d8b">
                            {e.label}
                            </text>
                        )}
                        </g>
                    );
                    });
                })()}
              </svg>

              {/* Nodes */}
              {spec.nodes.map(n => {
                const s = SHAPES[n.type] || SHAPES.task;
                const col = Math.min(GRID_COLS, Math.max(1, Number(n?.x) || 1));
                const row = Math.max(1, Number(n?.y) || 1);
                const leftPx = (col - 1) * CELL_W + (CELL_W - s.w) / 2;
                const topPx  = (row - 1) * CELL_H + (CELL_H - s.h) / 2;
                const style = {
                  position: "absolute",
                  left: `${leftPx}px`,
                  top:  `${topPx}px`,
                  width: s.w, height: s.h,
                  transform: s.diamond ? "rotate(45deg)" : "none",
                  p: s.diamond ? 0 : "10px 14px",
                  bgcolor: s.bg, border: "1px solid", borderColor: s.bc,
                  borderRadius: s.br, clipPath: s.clip || "none",
                  boxShadow: 1, cursor: "pointer", display: "grid", placeItems: "center",
                };

                const title = n.props?.title ?? (n.type === "start" ? "Start" : n.type === "end" ? "End" : "");

                return (
                  <Box
                    key={n.id}
                    sx={style}
                    onClick={(e)=>{ e.stopPropagation(); setConnectFrom(n.id); }}
                  >
                    <Box sx={{ transform: s.diamond ? "rotate(-45deg)" : "none", textAlign: "center", px: 1 }}>
                      {title && (
                        <Typography variant="body2" sx={{ lineHeight: 1.1, fontWeight: 700 }}>
                          {title}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
