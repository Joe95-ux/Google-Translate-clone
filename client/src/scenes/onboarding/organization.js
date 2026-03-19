import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  useAuth,
  useOrganization,
} from "@clerk/clerk-react";
import { toast } from "sonner";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const OrganizationOnboarding = () => {
  const navigate = useNavigate();
  const { isLoaded: authLoaded, userId } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const apiUrl = useMemo(() => {
    if (process.env.NODE_ENV === "development") return "http://localhost:4000/";
    return "/";
  }, []);

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!organization?.id) {
      toast.error("Select an organization first.");
      return;
    }
    if (!email) {
      toast.warning("Enter an email address to invite.");
      return;
    }

    setInviting(true);
    try {
      await axios.post(`${apiUrl}orgs/${organization.id}/invitations`, {
        emailAddress: email,
        role: "org:member",
      });
      toast.success("Invitation sent.");
      setInviteEmail("");
    } catch (error) {
      const status = error?.response?.status;
      if (status === 403) toast.error("Only organization admins/owners can invite.");
      else if (status === 401) toast.error("Please sign in again.");
      else toast.error("Failed to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  const handleContinue = () => {
    if (!organization?.id) {
      toast.error("Create or select an organization to continue.");
      return;
    }
    navigate("/");
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <main>
        <SignedOut>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.25}>
                <Typography variant="h5" fontWeight={700}>
                  Sign in to continue onboarding
                </Typography>
                <Typography color="text.secondary">
                  Create an account or sign in to continue setup.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button component={Link} to="/sign-in" variant="contained">
                    Sign in
                  </Button>
                  <Button component={Link} to="/sign-up" variant="outlined">
                    Sign up
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </SignedOut>

        <SignedIn>
          <Stack spacing={2.5}>
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight={800}>
                Welcome to TranslateIt
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 640 }}>
                Quick setup: create/select your organization, then optionally invite teammates.
              </Typography>
            </Stack>

            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={1.75}>
                  <Chip label="Step 1" size="small" sx={{ alignSelf: "flex-start" }} />
                  <Typography variant="h6" fontWeight={700}>
                    Create or select your organization
                  </Typography>
                  <Typography color="text.secondary">
                    Use the switcher to create a new organization or select one you already belong to.
                  </Typography>
                  <OrganizationSwitcher
                    hidePersonal
                    afterCreateOrganizationUrl="/onboarding/organization"
                    afterSelectOrganizationUrl="/onboarding/organization"
                    afterLeaveOrganizationUrl="/onboarding/organization"
                  />
                  <Alert severity={organization?.name ? "success" : "info"}>
                    {orgLoaded
                      ? organization?.name
                        ? `Current organization: ${organization.name}`
                        : "No organization selected yet."
                      : "Loading organization..."}
                  </Alert>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={1.75}>
                  <Chip label="Step 2 (Optional)" size="small" sx={{ alignSelf: "flex-start" }} />
                  <Typography variant="h6" fontWeight={700}>
                    Invite teammates
                  </Typography>
                  <Typography color="text.secondary">
                    Add teammates now, or skip and do this later from Organization settings.
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                      type="email"
                      size="small"
                      placeholder="teammate@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      onClick={handleInvite}
                      disabled={inviting || !organization?.id}
                      sx={{ minWidth: { sm: 140 } }}
                    >
                      {inviting ? "Sending..." : "Send invite"}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                onClick={handleContinue}
                disabled={!authLoaded || !userId}
              >
                Continue to Home
              </Button>
              <Button variant="outlined" onClick={() => navigate("/")}>
                Skip for now
              </Button>
            </Stack>
          </Stack>
        </SignedIn>
      </main>
    </Container>
  );
};

export default OrganizationOnboarding;
