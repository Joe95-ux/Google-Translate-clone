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
        <div style={{ color: "#f5f5f5", marginBottom: "1rem" }}>
          <h1 style={{ margin: 0 }}>Activity</h1>
          <p style={{ marginTop: "0.5rem", color: "rgb(148 163 184)" }}>
            Org audit log (admin & members with subscription)
          </p>
        </div>

        {loading ? (
          <div style={{ color: "rgb(148 163 184)" }}>Loading...</div>
        ) : activities.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activities.map((a) => (
              <div
                key={a._id || `${a.action}-${a.createdAt}`}
                style={{
                  border: "1px solid rgb(100 116 139)",
                  borderRadius: "8px",
                  padding: "14px 16px",
                  background: "rgba(2, 6, 23, 0.6)",
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
                    <div style={{ color: "rgb(148 163 184)", marginTop: "6px" }}>
                      Actor: {a.actor_user_id}
                      {a.target_user_id ? ` • Target: ${a.target_user_id}` : ""}
                    </div>
                  </div>
                  <div style={{ color: "rgb(148 163 184)" }}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                  </div>
                </div>

                {a.metadata && Object.keys(a.metadata).length > 0 && (
                  <pre
                    style={{
                      margin: "10px 0 0",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: "rgb(203 213 225)",
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
          <div style={{ color: "rgb(148 163 184)" }}>No activity yet.</div>
        )}
      </div>
    </>
  );
};

export default Activity;