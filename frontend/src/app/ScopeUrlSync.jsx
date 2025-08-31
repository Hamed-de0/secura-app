import React, { useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ScopeContext } from "../store/scope/ScopeProvider.jsx";
// keep scope helpers only for legacy "?scope=org:1" parsing if you already have them
import { parseScopeParam } from "../lib/url/scopeUrl";

export default function ScopeUrlSync() {
  const [params, setParams] = useSearchParams();
  const { scope, setScope, versionId, setVersionId } = useContext(ScopeContext);

  // --- On mount: read URL → store (supports new keys + legacy fallback) ---
  useEffect(() => {
    // New canonical params
    const st = params.get("scope_type");
    const si = params.get("scope_id");
    const vid = params.get("version_id");

    if (st || si) {
      setScope({ type: normalizeScopeType(st || "org"), id: toInt(si, 1) });
    } else {
      // Legacy "?scope=org:1"
      const legacy = params.get("scope");
      const parsed = legacy ? parseScopeParam(legacy) : null;
      if (parsed) setScope(parsed);
    }

    if (vid) {
      setVersionId(toInt(vid, 1));
    } else {
      // Legacy "?versions=1,2" → take first
      const legacyVers = params.get("versions");
      if (legacyVers) {
        const first = toInt(legacyVers.split(",")[0], 1);
        setVersionId(first);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // --- Store → URL (keep URL canonical; remove legacy) ---
  useEffect(() => {
    const next = new URLSearchParams(params);

    const wantSt  = scope?.type || "";
    const wantSi  = String(scope?.id ?? "");
    const wantVid = String(versionId ?? "");

    const curSt  = next.get("scope_type") || "";
    const curSi  = next.get("scope_id") || "";
    const curVid = next.get("version_id") || "";

    if (wantSt !== curSt || wantSi !== curSi || wantVid !== curVid) {
      if (wantSt) next.set("scope_type", wantSt); else next.delete("scope_type");
      if (wantSi) next.set("scope_id", wantSi);   else next.delete("scope_id");
      if (wantVid) next.set("version_id", wantVid); else next.delete("version_id");

      // clean legacy keys if present
      next.delete("scope");
      next.delete("versions");

      setParams(next, { replace: true });
    }
  }, [scope?.type, scope?.id, versionId, params, setParams]);

  return null;
}

function normalizeScopeType(t) {
  const k = String(t || "").trim();
  if (k === "org_group" || k === "orgGroup") return "org";
  if (k === "asset_tag") return "tag";
  return k || "org";
}

function toInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
