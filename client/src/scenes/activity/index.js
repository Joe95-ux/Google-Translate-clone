import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";

const Activity = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  let apiUrl;
  if (process.env.NODE_ENV === "development") {
    apiUrl = "http://localhost:4000/";
  } else if (process.env.NODE_ENV === "production") {
    apiUrl = "/";
  }

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}activity`);
        setActivities(response?.data?.activities || []);
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401) toast.error("Please log in to view activity.");
        else if (status === 403) {
          toast.error("Set up or select an organization to view activity.");
          navigate("/organization");
        }
        else if (status === 402)
          toast.error("Subscription required for this feature.");
        else toast.error("Failed to load activity. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [apiUrl]);

  return (
    <>
      <PageHeader />
      <div style={{ padding: "0 0 2rem", width: "100%" }}>
        <div style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>
          <h1 style={{ margin: 0 }}>Activity</h1>
          <p style={{ marginTop: "0.5rem", color: "var(--text-secondary)" }}>
            Org audit log (admin & members with subscription)
          </p>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-secondary)" }}>Loading...</div>
        ) : activities.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activities.map((a) => (
              <div
                key={a._id || `${a.action}-${a.createdAt}`}
                style={{
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "14px 16px",
                  background: "var(--bg-surface)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ color: "#38BDF8", fontWeight: 600 }}>
                      {a.action}
                    </div>
                    <div style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
                      Actor: {a.actor_user_id}
                      {a.target_user_id ? ` • Target: ${a.target_user_id}` : ""}
                    </div>
                  </div>
                  <div style={{ color: "var(--text-secondary)" }}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                  </div>
                </div>

                {a.metadata && Object.keys(a.metadata).length > 0 && (
                  <pre
                    style={{
                      margin: "10px 0 0",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: "var(--text-secondary)",
                      fontSize: "12px",
                      background: "transparent",
                    }}
                  >
                    {JSON.stringify(a.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "var(--text-secondary)" }}>No activity yet.</div>
        )}
      </div>
    </>
  );
};

export default Activity;