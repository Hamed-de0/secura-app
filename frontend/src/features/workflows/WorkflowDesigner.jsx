import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Stack, Card, CardContent, Typography, Button, TextField, Chip } from "@mui/material";
import { getDefinition, upsertDefinition } from "../../api/services/workflows";

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
  approval:{ w: 96,  h: 96,  br: 2,     type: "rect",     bg: (t)=>t.palette.success.light,   bc: "success.main" },
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
    const x = Math.min(12, Math.max(1, Math.round((rx / rect.width) * 12)));
    const y = Math.min(8,  Math.max(1, Math.round((ry / rect.height) * 8)));
    const to = spec.nodes.find(n => n.x===x && n.y===y);
    if (to && to.id !== connectFrom) {
      setSpec(s => ({ ...s, edges: [...s.edges, { from: connectFrom, to: to.id }] }));
    }
    setConnectFrom(null);
  };

  const save = () => upsertDefinition(spec);

  // (Anchor math implemented inside the SVG render using live canvas size)

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
                width: spec.canvas?.w || "100%",
                height: spec.canvas?.h || 1120,
                background:
                  "linear-gradient(#eee 1px, transparent 1px) 0 0/ calc(100%/12) calc(100%/8), linear-gradient(90deg,#eee 1px, transparent 1px) 0 0/ calc(100%/12) calc(100%/8)",
                borderRadius:2
              }}
              onClick={onCanvasClick}
            >
              {/* Edge layer (always render; compute size on the fly) */}
              <svg width="100%" height="100%" style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
                <defs>
                    <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 z" fill="#90caf9"/>
                    </marker>
                </defs>

                {(() => {
                    // 🔑 Absolute canvas size every render (avoids stale 0×0)
                    const rect = canvasRef.current?.getBoundingClientRect();
                    if (!rect) return null;
                    const W = rect.width  || 1;
                    const H = rect.height || 1;

                    // Node center: px/py scaled to canvas, else grid fallback
                    const vW = spec.canvas?.w || 1200;
                    const vH = spec.canvas?.h || 960;
                    const nodeCenter = (n) => {
                      const hasPx = Number.isFinite(n?.px) && Number.isFinite(n?.py);
                      if (hasPx) return [ n.px * (W / vW), n.py * (H / vH) ];
                      return [ (n.x - 0.5) / 12 * W, (n.y - 0.5) / 8 * H ];
                    };

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

                    let [sx,sy] = anchorFor(A, Ax, Ay, Bx, By);
                    let [tx,ty] = anchorFor(B, Bx, By, Ax, Ay);
                    // Nudge endpoints 1px along the line to keep arrows outside nodes
                    {
                      const dx = tx - sx, dy = ty - sy;
                      const len = Math.hypot(dx, dy) || 1;
                      const ux = dx / len, uy = dy / len;
                      const margin = 1; // px
                      sx += ux * margin; sy += uy * margin;
                      tx -= ux * margin; ty -= uy * margin;
                    }
                    const mx = (sx+tx)/2, my = (sy+ty)/2;

                    return (
                        <g key={i}>
                        <line
                            x1={sx} y1={sy} x2={tx} y2={ty}
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
                const rect = canvasRef.current?.getBoundingClientRect();
                const vW = spec.canvas?.w || 1200; const vH = spec.canvas?.h || 960;
                let style;
                if (!rect || !rect.width || !rect.height) {
                  // Fallback to grid percentage positioning until we can measure
                  const cxPct = (n.x - 0.5) / 12 * 100;
                  const cyPct = (n.y - 0.5) / 8  * 100;
                  style = {
                    position: "absolute",
                    left: `calc(${cxPct}% - ${s.w / 2}px)`,
                    top:  `calc(${cyPct}% - ${s.h / 2}px)`,
                    width: s.w, height: s.h,
                    transform: s.diamond ? "rotate(45deg)" : "none",
                    p: s.diamond ? 0 : "10px 14px",
                    bgcolor: s.bg, border: "1px solid", borderColor: s.bc,
                    borderRadius: s.br, clipPath: s.clip || "none",
                    boxShadow: 1, cursor: "pointer", display: "grid", placeItems: "center",
                  };
                } else {
                  const W = rect.width; const H = rect.height;
                  const hasPx = Number.isFinite(n?.px) && Number.isFinite(n?.py);
                  const cx = hasPx ? n.px * (W / vW) : (n.x - 0.5) / 12 * W;
                  const cy = hasPx ? n.py * (H / vH) : (n.y - 0.5) / 8  * H;
                  style = {
                    position: "absolute",
                    left: `${cx - s.w / 2}px`,
                    top:  `${cy - s.h / 2}px`,
                    width: s.w, height: s.h,
                    transform: s.diamond ? "rotate(45deg)" : "none",
                    p: s.diamond ? 0 : "10px 14px",
                    bgcolor: s.bg, border: "1px solid", borderColor: s.bc,
                    borderRadius: s.br, clipPath: s.clip || "none",
                    boxShadow: 1, cursor: "pointer", display: "grid", placeItems: "center",
                  };
                }

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
