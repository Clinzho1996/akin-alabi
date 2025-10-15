"use client";

import { IconCircleFilled } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

type ApiResponse = {
	status: string;
	message: string;
	data: {
		total_staff: number;
		total_beneficiaries: number;
		beneficiaries_with_facial_bio: number;
		beneficiaries_without_facial_bio: number;
		total_events: number;
		active_beneficiaries: number;
		inactive_beneficiaries: number;
	};
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function TrafficSources() {
	const [beneficiariesData, setBeneficiariesData] = useState<
		{ category: string; value: number; color: string }[]
	>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchBeneficiariesData = async () => {
		setIsLoading(true);
		try {
			const session = await getSession();
			if (!session?.accessToken) {
				console.error("No access token found.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(`${BASE_URL}/analytics`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${session.accessToken}`,
				},
			});

			if (response.data.status === "success") {
				const data = response.data.data;
				const formattedData = [
					{
						category: "Total Beneficiaries",
						value: data.total_beneficiaries,
						color: "#DCB085",
					},
					{
						category: "Active Beneficiaries",
						value: data.active_beneficiaries,
						color: "#008027",
					},
					{
						category: "Inactive Beneficiaries",
						value: data.inactive_beneficiaries,
						color: "#277EFF",
					},
				];

				setBeneficiariesData(formattedData);
			}
		} catch (error) {
			console.error("Error fetching beneficiaries data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchBeneficiariesData();
	}, []);

	const maxValue = Math.max(...beneficiariesData.map((item) => item.value), 1);

	const renderProgressBar = (
		value: number,
		color: string,
		category?: string
	) => {
		const percentage = (value / maxValue) * 100;

		return (
			<div className="mt-2">
				{/* Progress Bar Container */}
				<div className="w-full h-8 bg-gray-200 overflow-hidden">
					{/* Progress Fill */}
					<div
						className="h-full transition-all duration-500 ease-out"
						style={{
							width: `${percentage}%`,
							backgroundColor: color,
						}}
					/>
				</div>

				{/* Category label and value */}
				<div className="flex justify-between items-center mt-2">
					<p className="text-sm text-gray-600">{category}</p>
					<p className="text-sm font-semibold text-gray-900">
						{value.toLocaleString()}
					</p>
				</div>
			</div>
		);
	};

	return (
		<div className="p-5 bg-white rounded-xl border border-gray-200 w-full">
			{/* Header */}
			<div className="flex justify-between items-center mb-5">
				<div className="flex items-center gap-2">
					<Image src="/images/info.png" alt="icon" width={18} height={18} />
					<h2 className="text-sm font-medium text-gray-800">
						Beneficiaries Overview
					</h2>
				</div>

				<div className="flex flex-row justify-between items-center gap-5">
					<div className="flex flex-row justify-start items-center gap-2">
						<IconCircleFilled size={12} color="#DCB085" />
						<p className="text-sm text-gray-600">Total</p>
					</div>
					<div className="flex flex-row justify-start items-center gap-2">
						<IconCircleFilled size={12} color="#008027" />
						<p className="text-sm text-gray-600">Active</p>
					</div>
					<div className="flex flex-row justify-start items-center gap-2">
						<IconCircleFilled size={12} color="#277EFF" />
						<p className="text-sm text-gray-600">Inactive</p>
					</div>
				</div>
			</div>

			{/* Body */}
			<div className="space-y-6">
				{isLoading ? (
					<p className="text-sm text-gray-500">Loading beneficiaries data...</p>
				) : (
					beneficiariesData.map(({ category, value, color }, idx) => (
						<div key={idx} className="mt-4">
							{/* Category header */}
							<div className="flex justify-between items-center mb-2">
								<p className="text-sm text-gray-800">{category}</p>
							</div>

							{renderProgressBar(value, color)}

							{/* Divider */}
							{idx < beneficiariesData.length - 1 && (
								<hr className="my-4 border-gray-200" />
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default TrafficSources;
