import { auth } from "@clerk/nextjs/server";
import { Roles } from "@/types/roles";

export const getRole = async () => {
  const { sessionClaims } = await auth();
  return (sessionClaims as any)?.metadata?.role as Roles | undefined;
};

export const checkRole = async (role: Roles) => {
  const currentRole = await getRole();
  return currentRole === role;
};

export const isAdmin = async () => {
  const role = await getRole();
  return role === "Administrator" || role === "admin" || role === "superadmin";
};

export const isStaff = async () => {
  const role = await getRole();
  const staffRoles = ["Administrator", "Manager", "Operator", "Mobilizer", "admin", "superadmin", "employee"];
  return staffRoles.includes(role as string);
};

export const canViewSettings = async () => {
  const role = await getRole();
  return ["Administrator", "admin", "superadmin"].includes(role as string);
};

export const canViewAccounting = async () => {
  const role = await getRole();
  return ["Administrator", "admin", "superadmin"].includes(role as string);
};

export const canViewBusinessData = async () => {
  const role = await getRole();
  return ["Administrator", "Manager", "admin", "superadmin"].includes(role as string);
};

export const isSuperadmin = async () => {
  const role = await getRole();
  return role === "superadmin" || role === "Administrator";
};

export const isClient = async () => {
  const role = await getRole();
  return role === "client";
};
