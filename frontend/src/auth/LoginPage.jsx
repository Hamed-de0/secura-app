import * as React from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box, Paper, Stack, Typography, TextField, Button, Alert, Divider
} from "@mui/material";
import { useAuth } from "./authContext";
import { setAuthToken } from "../api/httpClient";
import { setFileAuthToken } from "../api/fileClient";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state && loc.state.from) || "/";

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [err, setErr] = React.useState("");

  const canSubmit = identifier.trim() && password;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true); setErr("");
    try {
      await login({ identifier: identifier.trim(), password });
      
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2?.detail || e2?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100dvh",
      display: "grid",
      placeItems: "center",
      p: 2,
      bgcolor: (t)=>t.palette.mode==="light" ? "grey.100" : "background.default"
    }}>
      <Paper elevation={8} sx={{ width: 380, p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>Sign in</Typography>
          <Typography variant="body2" color="text.secondary">
            Use your <strong>email</strong> or <strong>username</strong> with your password.
          </Typography>

          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={1.5}>
              <TextField
                label="Email or Username"
                autoFocus
                value={identifier}
                onChange={(e)=>setIdentifier(e.target.value)}
                size="small"
                autoComplete="username"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                size="small"
                autoComplete="current-password"
              />
              {err && <Alert severity="error">{err}</Alert>}
              <Button
                variant="contained"
                type="submit"
                disabled={!canSubmit || submitting}
                sx={{ mt: 0.5 }}
              >
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </Box>

          <Divider flexItem />
          <Typography variant="caption" color="text.secondary">
            Trouble signing in? Contact your administrator.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
