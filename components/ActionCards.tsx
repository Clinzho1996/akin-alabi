"use client";

import { Skeleton } from "@/components/ui/skeleton"; // Import shadcn Skeleton
import { IconImageInPicture } from "@tabler/icons-react";
import Image from "next/image";

function ActionCards({
	title,
	amount,
	difference,
	isLoading = false, // Add isLoading prop
}: {
	title: string;
	amount: number;
	difference: number;
	isLoading?: boolean;
}) {
	const formatBalance = (amount: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount ?? 0);
	};

	if (isLoading) {
		return (
			<div className="border border-[#E2E4E9] rounded-lg bg-white w-full">
				<div className="flex flex-row justify-between items-center p-2">
					<div className="flex flex-row justify-start gap-2 items-center">
						<Skeleton className="w-5 h-5 rounded-full bg-primary-1" />
						<Skeleton className="w-24 h-4 bg-primary-1" />
					</div>
					<div className="flex flex-row justify-end gap-3 items-center border rounded-lg p-2">
						<Skeleton className="w-4 h-4 bg-primary-1" />
					</div>
				</div>

				<div className="px-3 py-6">
					<Skeleton className="w-32 h-8 bg-primary-1" />
				</div>

				<div className="text-xs text-[#6B7280] bg-[#F6F8F9] p-2 rounded-b-lg">
					<Skeleton className="w-24 h-3 bg-primary-1" />
				</div>
			</div>
		);
	}

	return (
		<div className="border border-[#E2E4E9] rounded-lg bg-white w-full">
			<div className="flex flex-row justify-between items-center p-2">
				<div className="flex flex-row justify-start gap-2 items-center">
					<Image src="/images/info.png" alt="info" width={20} height={20} />
					<p className="text-sm font-medium text-black">{title}</p>
				</div>
				<div className="flex flex-row justify-end gap-3 items-center border rounded-lg p-2 cursor-pointer">
					<IconImageInPicture />
				</div>
			</div>

			<div className="px-3 py-6">
				<h2 className="text-2xl font-normal">{formatBalance(amount)}</h2>
			</div>

			<p className="text-xs text-[#6B7280] bg-[#F6F8F9] p-2 rounded-b-lg">
				<span className="text-xs text-green-600">↑ {difference}%</span> vs last
				month
			</p>
		</div>
	);
}

export default ActionCards;
