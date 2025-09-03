// src/components/UserNameBadge.jsx
import * as React from "react";
import { Chip, Avatar } from "@mui/material";
import { useAuth } from "../auth/authContext";

export default function UserNameBadge() {
  const { displayName, profile } = useAuth();
  const avatar = profile?.person?.avatar_url || "";
  const initials =
    profile?.person?.initials
    || (displayName ? displayName.split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase() : "");

  return (
    <Chip
      variant="outlined"
      avatar={<Avatar src={avatar}>{!avatar && initials}</Avatar>}
      label={displayName || "Signed out"}
      sx={{ ml: 1 }}
    />
  );
}
