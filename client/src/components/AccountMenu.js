import { UserButton, useUser } from "@clerk/clerk-react";

export default function AccountMenu() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return null;

  return (
    <div style={{display:"flex", alignItems:"center", gap:"10px", overflow:"hidden"}}>
      <span className="text-sm">
        {user.username || user.firstName || user.emailAddresses[0]?.emailAddress}
      </span>
      <UserButton/>
    </div>
  );
}
