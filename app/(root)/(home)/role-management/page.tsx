"use client";

import HeaderBox from "@/components/HeaderBox";
import Loader from "@/components/Loader";
import StatCard from "@/components/StatCard";
import RoleTable from "@/config/role-columns";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export type EndUser = {
	id: string;
	_id: string;
	createdAt: string;
	public_id?: string;
	full_name: string | null;
	profile_pic?: string | null;
	email: string;
	status: string;
	date_of_birth: string | null;
	gender: string | null;
	created_at: string;
	verified: boolean;
	role: string;
	pic?: string | null;
};

interface ApiResponse {
	status: boolean;
	message: string;
	data: EndUser[];
	overview: {
		total: number;
		disable: number;
		active: number;
	};
	pagination: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
	filters: Record<string, unknown>;
}
function RoleManagement() {
	const [isLoading, setIsLoading] = useState(false);
	const [stats, setStats] = useState<ApiResponse | null>(null);
	const fetchUsers = async (page = 1, limit = 5000) => {
		try {
			setIsLoading(true);
			const session = await getSession();

			const accessToken = session?.accessToken;
			if (!accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get(
				`https://api.medbankr.ai/api/v1/administrator/user?page=${page}&limit=${limit}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === true) {
				// Map the API response to match the `EndUser` type
				interface ApiUser {
					_id: string;
					createdAt: string;
					public_id?: string;
					profile_pic?: string | null;
					full_name: string | null;
					email: string;
					status: string;
					date_of_birth: string | null;
					gender: string | null;
					verified: boolean;
					role: string;
				}

				interface FormattedUser {
					id: string;
					_id: string;
					createdAt: string;
					public_id?: string;
					pic?: string | null;
					full_name: string | null;
					email: string;
					status: string;
					date_of_birth: string | null;
					gender: string | null;
					created_at: string;
					verified: boolean;
					role: string;
				}

				const formattedData: FormattedUser[] = (
					response.data.data as ApiUser[]
				).map(
					(user: ApiUser): FormattedUser => ({
						id: user._id,
						_id: user._id,
						createdAt: user.createdAt,
						public_id: user.public_id,
						pic: user.profile_pic,
						full_name: user.full_name,
						email: user.email,
						status: user.status,
						date_of_birth: user.date_of_birth,
						gender: user.gender,
						created_at: user.createdAt,
						verified: user.verified,
						role: user.role,
					})
				);

				console.log("Users Data:", formattedData);
			}

			if (response.data.overview) {
				setStats({
					status: response.data.status,
					message: response.data.message,
					data: response.data.data,
					overview: {
						total: response.data.overview.total,
						active: response.data.overview.active,
						disable: response.data.overview.disable,
					},
					pagination: {
						total: response.data.pagination.total,
						page: response.data.pagination.page,
						limit: response.data.pagination.limit,
						pages: response.data.pagination.pages,
					},
					filters: response.data.filters,
				});
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers(1, 5000); // Fetch first page with higher limit
	}, []);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="w-full overflow-x-hidden">
			<HeaderBox />
			<div className="mb-4 p-3 bg-[#F4F6F8] border border-[#6C72781A]">
				<h2 className="text-black font-medium">Role Management</h2>
				<p className="text-sm text-[#6C7278] font-normal ">
					The process of planning, organizing, and directing employee activities
					within an organization.
				</p>
			</div>

			<div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full px-4 py-2  max-w-[100vw]">
				<div className="border-[1px] border-[#E2E4E9] rounded-lg w-full bg-white overflow-hidden p-3 flex flex-col gap-3">
					<div className="flex flex-row justify-start gap-2 items-center">
						<Image src="/images/info.png" alt="info" width={20} height={20} />
						<p className="text-sm font-medium text-black">
							Key Performance Metrics (KPMs)
						</p>
					</div>

					<div className="flex flex-row justify-start items-center w-full gap-3">
						<StatCard
							title="Total User (Staff)"
							value={stats?.overview.total ?? 0}
							percentage="0%"
							positive
							className="w-full sm:w-[25%]"
						/>

						<StatCard
							title="Total Active User (Staff)"
							value={stats?.overview.active ?? 0}
							percentage="0%"
							positive={false}
							className="w-full sm:w-[25%]"
						/>
						<StatCard
							title="Total Suspended User (Staff)"
							value={stats?.overview.active ?? 0}
							percentage="0%"
							positive
							className="w-full sm:w-[25%]"
						/>
					</div>
				</div>
			</div>
			<div className="bg-white flex flex-col px-4 py-2 gap-2 w-full max-w-[100vw]">
				<RoleTable />
			</div>
		</div>
	);
}

export default RoleManagement;
