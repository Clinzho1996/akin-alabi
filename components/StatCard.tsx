// components/StatCard.tsx
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
	title: string;
	value: number | string;
	unit?: string;
	percentage?: string;
	positive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	unit,
	percentage,
	positive = true,
}) => {
	return (
		<div className="rounded-xl border border-gray-200 p-4 flex justify-between items-start  bg-white shadow-sm w-full">
			<div>
				<p className="text-sm text-gray-500 font-medium">{title}</p>
				<p className="text-3xl font-medium text-black mt-3">
					{value} {unit}
				</p>
			</div>
			{percentage && (
				<div
					className={`flex items-center text-sm font-medium rounded-lg ${
						positive
							? "text-green-600 bg-[#43DAB21A] p-1"
							: "text-red bg-[#FF00001A] p-1"
					}`}>
					{positive ? "+" : ""} {percentage}
					{positive ? (
						<ArrowUp className="w-4 h-4 ml-1" />
					) : (
						<ArrowDown className="w-4 h-4 ml-1" />
					)}
				</div>
			)}
		</div>
	);
};

export default StatCard;
