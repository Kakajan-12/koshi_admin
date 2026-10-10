type Named = { fname?: string | null; lname?: string | null; email?: string | null };

export const fullName = (u: Named) => `${u.fname ?? ""} ${u.lname ?? ""}`.trim() || "No name";

export const initials = (u: Named) =>
    ((u.fname?.[0] ?? "") + (u.lname?.[0] ?? "")).toUpperCase() || u.email?.[0]?.toUpperCase() || "?";
