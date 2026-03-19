import React from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  OrganizationSwitcher,
  OrganizationProfile,
  useOrganization,
} from "@clerk/clerk-react";
import PageHeader from "../../components/PageHeader";

const Organization = () => {
  const { organization } = useOrganization();

  return (
    <>
      <PageHeader />
      <div style={{ paddingBottom: "2rem", width: "100%" }}>
        <div style={{ color: "#f5f5f5", marginBottom: "1rem" }}>
          <h1 style={{ margin: 0 }}>Organization Setup</h1>
          <p style={{ marginTop: "0.5rem", color: "rgb(148 163 184)" }}>
            Create or select an organization to unlock org features like image, batch, and glossary.
          </p>
        </div>

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
            <p style={{ margin: 0, color: "rgb(148 163 184)" }}>
              You need to sign in before you can create or join an organization.
            </p>
            <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
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
          <div style={{ display: "grid", gap: "16px" }}>
            <div
              style={{
                border: "1px solid rgb(100 116 139)",
                borderRadius: "8px",
                padding: "16px",
                background: "rgba(2, 6, 23, 0.6)",
                color: "#f5f5f5",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Select or create an organization</h3>
              <p style={{ color: "rgb(148 163 184)", marginBottom: "12px" }}>
                Use the switcher below to create a new org or choose an existing one.
              </p>
              <OrganizationSwitcher
                hidePersonal
                afterCreateOrganizationUrl="/organization"
                afterSelectOrganizationUrl="/organization"
                afterLeaveOrganizationUrl="/organization"
              />
            </div>

            {organization ? (
              <div
                style={{
                  border: "1px solid rgb(100 116 139)",
                  borderRadius: "8px",
                  padding: "16px",
                  background: "rgba(2, 6, 23, 0.6)",
                }}
              >
                <h3 style={{ marginTop: 0, color: "#f5f5f5" }}>Manage organization</h3>
                <OrganizationProfile routing="hash" />
              </div>
            ) : (
              <div style={{ color: "rgb(148 163 184)" }}>
                No organization selected yet. Create one from the switcher above.
              </div>
            )}
          </div>
        </SignedIn>
      </div>
    </>
  );
};

export default Organization;
