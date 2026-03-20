import { useMemo, useState } from "react";
import {
  SignOutButton,
  useClerk,
  useOrganization,
  useUser,
} from "@clerk/clerk-react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Typography,
} from "@mui/material";
import {
  Building2,
  CircleUserRound,
  LogOut,
  MoonStar,
  UserRoundCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppTheme } from "../theme/AppThemeProvider";

const getDisplayName = (user) => {
  const first = user?.firstName || "";
  const last = user?.lastName || "";
  const full = `${first} ${last}`.trim();
  return full || user?.username || "User";
};

export default function AccountMenu() {
  const { user, isLoaded } = useUser();
  const { organization } = useOrganization();
  const clerk = useClerk();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useAppTheme();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const primaryLabel = useMemo(
    () => user?.username || user?.emailAddresses?.[0]?.emailAddress || "No username",
    [user]
  );
  const secondaryLabel = useMemo(() => getDisplayName(user), [user]);

  if (!isLoaded || !user) return null;

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleManageAccount = () => {
    handleCloseMenu();
    clerk.openUserProfile();
  };

  const handleOrganization = () => {
    handleCloseMenu();
    if (!organization?.id) {
      toast.info("Select or create an organization first.");
      navigate("/organization");
      return;
    }
    clerk.openOrganizationProfile();
  };

  return (
    <>
      <IconButton onClick={handleOpenMenu} size="small" sx={{ p: 0 }}>
        <Avatar
          src={user.imageUrl}
          alt={secondaryLabel}
          sx={{ width: 36, height: 36, border: "1px solid rgba(148,163,184,0.5)" }}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 320,
            mt: 1,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: mode === "dark" ? "#0b1220" : "background.paper",
            boxShadow: "0 12px 28px rgba(2, 6, 23, 0.28)",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 1.25 }}>
          <Avatar src={user.imageUrl} alt={secondaryLabel} sx={{ width: 40, height: 40 }} />
          <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {primaryLabel}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {secondaryLabel}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={handleManageAccount} sx={{ py: 1.1 }}>
          <ListItemIcon>
            <UserRoundCog size={18} />
          </ListItemIcon>
          <ListItemText primary="Manage Account" />
        </MenuItem>

        <MenuItem onClick={handleOrganization} sx={{ py: 1.1 }}>
          <ListItemIcon>
            <Building2 size={18} />
          </ListItemIcon>
          <ListItemText
            primary="Organization"
            secondary={organization?.name || "No organization selected"}
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleCloseMenu();
            toast.info("Your profile page is coming soon.");
          }}
          sx={{ py: 1.1 }}
        >
          <ListItemIcon>
            <CircleUserRound size={18} />
          </ListItemIcon>
          <ListItemText primary="Your profile" />
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.preventDefault();
            toggleTheme();
          }}
          sx={{ py: 1.1 }}
        >
          <ListItemIcon>
            <MoonStar size={18} />
          </ListItemIcon>
          <ListItemText primary="Theme" secondary={mode === "dark" ? "Dark" : "Light"} />
          <Switch edge="end" checked={mode === "dark"} onChange={toggleTheme} />
        </MenuItem>

        <Divider />

        <SignOutButton>
          <MenuItem onClick={handleCloseMenu} sx={{ py: 1.1 }}>
            <ListItemIcon>
              <LogOut size={18} />
            </ListItemIcon>
            <ListItemText primary="Log out" />
          </MenuItem>
        </SignOutButton>
      </Menu>
    </>
  );
}
