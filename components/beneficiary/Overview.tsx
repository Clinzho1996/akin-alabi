"use client";

import { IconRefresh, IconTrash, IconUserPause } from "@tabler/icons-react";
import axios from "axios";
import { getSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "../ui/button";

interface Beneficiary {
	id: string;
	membership_code: string;
	first_name: string;
	last_name: string;
	middle_name: string | null;
	dob: string;
	gender: string;
	email: string;
	phone: string;
	residential_address: string;
	residential_state: string;
	residential_lga: string;
	residential_city: string;
	state_of_origin: string;
	lga_of_origin: string;
	nationality: string;
	identity_type: string;
	identity_number: string;
	association: string | null;
	education_level: string | null;
	employment_status: string;
	occupation: string;
	pic: string | null;
	finger_bio: string | null;
	facial_bio: string | null;
	finger_bio_encoding: string | null;
	facial_bio_encoding: string | null;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	ward_of_origin: string;
	residential_ward: string;
}

interface ApiResponse {
	status: string;
	message: string;
	data: Beneficiary;
}

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function Overview() {
	const params = useParams();
	const id = params.id as string;

	const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSuspending, setIsSuspending] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchBeneficiary = async () => {
		try {
			setIsLoading(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				toast.error("No access token found. Please log in again.");
				setIsLoading(false);
				return;
			}

			const response = await axios.get<ApiResponse>(
				`${BASE_URL}/beneficiary/${id}`,
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				setBeneficiary(response.data.data);
			} else {
				toast.error("Failed to fetch beneficiary data.");
			}
		} catch (error) {
			console.error("Error fetching beneficiary data:", error);
			toast.error("Failed to fetch beneficiary data. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const suspendBeneficiary = async () => {
		try {
			setIsSuspending(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const endpoint = beneficiary?.is_active
				? `${BASE_URL}/beneficiary/deactivate/${id}`
				: `${BASE_URL}/beneficiary/activate/${id}`;

			const response = await axios.patch(
				endpoint,
				{},
				{
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			if (response.data.status === "success") {
				toast.success(response.data.message);
				// Refresh the beneficiary data
				fetchBeneficiary();
			}
		} catch (error) {
			console.error("Error suspending/reactivating beneficiary:", error);
			toast.error("Failed to update beneficiary status. Please try again.");
		} finally {
			setIsSuspending(false);
		}
	};

	const deleteBeneficiary = async () => {
		try {
			setIsDeleting(true);
			const session = await getSession();
			const accessToken = session?.accessToken;

			if (!accessToken) {
				console.error("No access token found.");
				return;
			}

			const response = await axios.delete(`${BASE_URL}/beneficiary/${id}`, {
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (response.data.status === "success") {
				toast.success("Beneficiary deleted successfully.");
				// Redirect to beneficiaries list or handle navigation
				window.location.href = "/beneficiary-management";
			}
		} catch (error) {
			console.error("Error deleting beneficiary:", error);
			toast.error("Failed to delete beneficiary. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchBeneficiary();
		}
	}, [id]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	};

	const getBiometricStatus = (value: string | null) => {
		return value ? "Completed" : "Pending";
	};

	if (isLoading) {
		return (
			<div className="border rounded-lg p-2">
				<div className="border bg-[#F6F8FA] p-2 rounded-lg">
					<div className="flex justify-center items-center h-64">
						<p>Loading beneficiary data...</p>
					</div>
				</div>
			</div>
		);
	}

	if (!beneficiary) {
		return (
			<div className="border rounded-lg p-2">
				<div className="border bg-[#F6F8FA] p-2 rounded-lg">
					<div className="flex justify-center items-center h-64">
						<p>Beneficiary not found.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="border rounded-lg p-2">
			<div className="border bg-[#F6F8FA] p-2 rounded-lg">
				<div>
					<div className="flex flex-row justify-between items-center p-3">
						<p>Basic Information</p>
						<div className="flex flex-row justify-end items-center gap-2">
							<Button
								className="border bg-red hover:bg-red-700 text-white"
								onClick={deleteBeneficiary}
								disabled={isDeleting}>
								<IconTrash />
							</Button>
							<Button
								className="border bg-white"
								onClick={suspendBeneficiary}
								disabled={isSuspending}>
								{beneficiary.is_active ? (
									<>
										<IconUserPause /> Suspend Beneficiary
									</>
								) : (
									<>
										<IconRefresh /> Reactivate Beneficiary
									</>
								)}
							</Button>
						</div>
					</div>

					<div className="bg-white p-6 shadow-lg rounded-lg mt-1">
						<div className="pb-5">
							<Image
								src={beneficiary.pic || "/images/avatar.png"}
								alt="Profile"
								width={80}
								height={80}
								className="rounded-full w-20 h-20 object-cover"
							/>
						</div>
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5 items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">First Name</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.first_name}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Last Name</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.last_name}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Middle Name</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.middle_name || "N/A"}
									</p>
								</div>
							</div>

							<div className="flex flex-row justify-start gap-5 items-start w-full">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[32%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Date of Birth</p>
									<p className="text-sm text-dark-1">
										{formatDate(beneficiary.dob)}
									</p>
								</div>

								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[32%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Gender</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.gender}
									</p>
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />
					<p className="ml-3">Contact Information</p>
					<div className="bg-white p-6 shadow-lg rounded-lg mt-3">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5 items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Phone Number</p>
									<p className="text-sm text-dark-1">{beneficiary.phone}</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Email</p>
									<p className="text-sm text-dark-1">{beneficiary.email}</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Address</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.residential_address}
									</p>
								</div>
							</div>

							<div className="flex flex-row justify-start gap-5 items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">City</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.residential_city}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">State</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.residential_state}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Local Government</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.residential_lga}
									</p>
								</div>
							</div>

							<div className="flex flex-row justify-start gap-5 items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Residential Ward</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.residential_ward}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Residential Origin</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.ward_of_origin}
									</p>
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />
					<p className="ml-3">Geographic Information</p>
					<div className="bg-white p-6 shadow-lg rounded-lg mt-3">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5 items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">State of Origin</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.state_of_origin}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">LGA of Origin</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.lga_of_origin}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[33%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Nationality</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.nationality}
									</p>
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />
					<p className="ml-3">Identification Information</p>
					<div className="bg-white p-6 shadow-lg rounded-lg mt-3">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5 items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">ID Type</p>
									<p className="text-sm text-dark-1">
										{beneficiary.identity_type}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">ID Number</p>
									<p className="text-sm text-dark-1">
										{beneficiary.identity_number}
									</p>
								</div>
							</div>

							{beneficiary.pic && (
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[49%] border p-3 rounded-lg">
									<p className="text-xs text-[#6B7280]">Profile Picture</p>
									<div className="flex flex-row justify-start items-center gap-2">
										<Image
											src={beneficiary.pic}
											alt="Profile"
											width={20}
											height={20}
											className="rounded-sm"
										/>
										<p className="text-sm">Profile Picture</p>
										<a
											href={beneficiary.pic}
											target="_blank"
											rel="noopener noreferrer"
											className="text-green-600 text-sm hover:underline">
											Preview
										</a>
									</div>
								</div>
							)}
						</div>
					</div>

					<hr className="my-4" />
					<p className="ml-3">Employment Information</p>
					<div className="bg-white p-6 shadow-lg rounded-lg mt-3">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5 items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Occupation</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.occupation}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Employment Status</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.employment_status}
									</p>
								</div>
							</div>

							<div className="flex flex-row justify-start gap-5 items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Education Level</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.education_level || "N/A"}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Association</p>
									<p className="text-sm text-dark-1 capitalize">
										{beneficiary.association || "N/A"}
									</p>
								</div>
							</div>
						</div>
					</div>

					<hr className="my-4" />
					<p className="ml-3">Biometrics</p>
					<div className="bg-white p-6 shadow-lg rounded-lg mt-3">
						<div className="flex flex-col gap-5">
							<div className="flex flex-row justify-start gap-5 items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Face Capture</p>
									<p className="text-sm text-dark-1">
										{getBiometricStatus(beneficiary.facial_bio)}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Fingerprints</p>
									<p className="text-sm text-dark-1">
										{getBiometricStatus(beneficiary.finger_bio)}
									</p>
								</div>
							</div>

							<div className="flex flex-row justify-start gap-5 items-start">
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Liveness</p>
									<p className="text-sm text-dark-1">
										{beneficiary.facial_bio ? "Passed" : "Pending"}
									</p>
								</div>
								<div className="flex flex-row justify-between items-center gap-2 w-full sm:w-[50%] border rounded-lg p-3">
									<p className="text-xs text-[#6B7280]">Membership Code</p>
									<p className="text-sm text-dark-1">
										{beneficiary.membership_code}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Overview;
