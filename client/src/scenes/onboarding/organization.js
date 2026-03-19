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
    <div className="wrapper">
      <main style={{ width: "100%", maxWidth: 860, margin: "2.5rem auto", padding: "0 1rem" }}>
        <SignedOut>
          <div
            style={{
              border: "1px solid rgb(100 116 139)",
              borderRadius: "8px",
              padding: "16px",
              background: "rgba(2, 6, 23, 0.6)",
              color: "#f5f5f5",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Sign in to continue onboarding</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/sign-in" className="auth-btn top-btn" style={{ textDecoration: "none" }}>
                Sign in
              </Link>
              <Link to="/sign-up" className="auth-btn top-btn" style={{ textDecoration: "none" }}>
                Sign up
              </Link>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div style={{ color: "#f5f5f5", marginBottom: "1rem" }}>
            <h1 style={{ margin: 0 }}>Organization onboarding</h1>
            <p style={{ marginTop: "0.5rem", color: "rgb(148 163 184)" }}>
              Step 1: Create or select your organization. Step 2: Invite teammates (optional).
            </p>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <section
              style={{
                border: "1px solid rgb(100 116 139)",
                borderRadius: "8px",
                padding: "16px",
                background: "rgba(2, 6, 23, 0.6)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#f5f5f5" }}>1. Create/select organization</h3>
              <p style={{ marginTop: "0.5rem", color: "rgb(148 163 184)" }}>
                Use the switcher to create a new organization or select one you already belong to.
              </p>
              <OrganizationSwitcher
                hidePersonal
                afterCreateOrganizationUrl="/onboarding/organization"
                afterSelectOrganizationUrl="/onboarding/organization"
                afterLeaveOrganizationUrl="/onboarding/organization"
              />
              <div style={{ marginTop: "10px", color: "rgb(148 163 184)" }}>
                {orgLoaded
                  ? organization?.name
                    ? `Current organization: ${organization.name}`
                    : "No organization selected yet."
                  : "Loading organization..."}
              </div>
            </section>

            <section
              style={{
                border: "1px solid rgb(100 116 139)",
                borderRadius: "8px",
                padding: "16px",
                background: "rgba(2, 6, 23, 0.6)",
              }}
            >
              <h3 style={{ marginTop: 0, color: "#f5f5f5" }}>2. Invite teammates (optional)</h3>
              <p style={{ marginTop: "0.5rem", color: "rgb(148 163 184)" }}>
                Invite organization members now, or skip and do this later.
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <input
                  type="email"
                  placeholder="teammate@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  style={{
                    flex: "1 1 280px",
                    minWidth: 220,
                    padding: "10px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgb(100 116 139)",
                    background: "transparent",
                    color: "#f5f5f5",
                  }}
                />
                <button
                  type="button"
                  onClick={handleInvite}
                  disabled={inviting || !organization?.id}
                  className="translate-btn"
                  style={{ minWidth: 140 }}
                >
                  {inviting ? "Sending..." : "Send invite"}
                </button>
              </div>
            </section>
          </div>

          <div style={{ marginTop: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="translate-btn"
              onClick={handleContinue}
              disabled={!authLoaded || !userId}
            >
              Continue to Home
            </button>
            <button
              type="button"
              className="translate-btn"
              style={{ background: "transparent", border: "1px solid rgb(100 116 139)" }}
              onClick={() => navigate("/")}
            >
              Skip for now
            </button>
          </div>
        </SignedIn>
      </main>
    </div>
  );
};

export default OrganizationOnboarding;
