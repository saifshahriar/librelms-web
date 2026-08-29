"use client";

import { useEffect, useState } from "react";
import { RequireRole } from "@/components/auth/require-role";
import {
	Badge,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TBody,
	TD,
	TH,
	THead,
	TR,
} from "@/components/ui";
import { adminService } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS, type Role, type User } from "@/lib/types";

function roleTone(role: Role) {
	switch (role) {
		case "admin":
			return "danger" as const;
		case "content_manager":
			return "purple" as const;
		case "instructor":
			return "warning" as const;
		case "student":
			return "brand" as const;
	}
}

function UserManagement() {
	const { user: me } = useAuth();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [savingId, setSavingId] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		adminService
			.users()
			.then((res) => setUsers(res.data))
			.finally(() => setLoading(false));
	}, []);

	async function changeRole(userId: number, role: Role) {
		setSavingId(userId);
		setError(null);
		try {
			const res = await adminService.setRole(userId, role);
			setUsers((prev) =>
				prev.map((u) => (u.id === userId ? res.data : u)),
			);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to update role",
			);
		} finally {
			setSavingId(null);
		}
	}

	return (
		<div className="container-page py-10">
			<h1 className="text-page-title mb-2">User management</h1>
			<p className="mb-8 text-ink-muted">
				View all users and change their roles.
			</p>

			{error && (
				<p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
					{error}
				</p>
			)}

			{loading ? (
				<div className="card-surface h-64 animate-pulse" />
			) : (
				<Table>
					<THead>
						<TR>
							<TH>Name</TH>
							<TH>Username</TH>
							<TH>Email</TH>
							<TH>Role</TH>
							<TH>Change role</TH>
						</TR>
					</THead>
					<TBody>
						{users.map((u) => (
							<TR key={u.id}>
								<TD className="font-medium">
									{u.fullName ?? u.username}
								</TD>
								<TD className="text-ink-muted">{u.username}</TD>
								<TD className="text-ink-muted">{u.email}</TD>
								<TD>
									<Badge variant={roleTone(u.role)}>
										{ROLE_LABELS[u.role]}
									</Badge>
								</TD>
								<TD>
									{me?.id === u.id ? (
										<span className="text-xs text-muted-foreground">
											That&apos;s you
										</span>
									) : (
										<Select
											value={u.role}
											disabled={savingId === u.id}
											onValueChange={(v) =>
												changeRole(u.id, v as Role)
											}
											aria-label={`Change role for ${u.username}`}
										>
											<SelectTrigger className="w-44">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{Object.entries(
													ROLE_LABELS,
												).map(([value, label]) => (
													<SelectItem
														key={value}
														value={value}
													>
														{label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								</TD>
							</TR>
						))}
					</TBody>
				</Table>
			)}
		</div>
	);
}

export default function AdminUsersPage() {
	return (
		<RequireRole roles={["admin"]}>
			<UserManagement />
		</RequireRole>
	);
}
