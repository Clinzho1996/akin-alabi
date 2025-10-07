"use client";

import { useState } from "react";

export default function RegistrationForm() {
	const [step, setStep] = useState(1);

	const nextStep = () => setStep(step + 1);
	const prevStep = () => setStep(step - 1);

	return (
		<div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6 mt-10 mb-4">
			{/* Step Progress */}
			<div className="flex justify-between items-center mb-6 border-b pb-3">
				<div className="flex items-center gap-2">
					<div
						className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
							step >= 1 ? "bg-green-600" : "bg-gray-300"
						}`}>
						1
					</div>
					<span
						className={`font-semibold ${
							step >= 1 ? "text-green-600" : "text-gray-400"
						}`}>
						Personal Information
					</span>
				</div>
				<div className="flex-1 border-t border-gray-300 mx-3"></div>
				<div className="flex items-center gap-2">
					<div
						className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
							step >= 2 ? "bg-green-600" : "bg-gray-300"
						}`}>
						2
					</div>
					<span
						className={`font-semibold ${
							step >= 2 ? "text-green-600" : "text-gray-400"
						}`}>
						Identification / Employment
					</span>
				</div>
				<div className="flex-1 border-t border-gray-300 mx-3"></div>
				<div className="flex items-center gap-2">
					<div
						className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
							step === 3 ? "bg-green-600" : "bg-gray-300"
						}`}>
						3
					</div>
					<span
						className={`font-semibold ${
							step === 3 ? "text-green-600" : "text-gray-400"
						}`}>
						Review
					</span>
				</div>
			</div>

			{/* Step 1 */}
			{step === 1 && (
				<div className="space-y-6">
					<h2 className="font-semibold text-lg">Basic Information Entry</h2>
					<div className="grid grid-cols-3 gap-4">
						<input placeholder="First Name" className="border rounded-lg p-2" />
						<input
							placeholder="Middle Name (Optional)"
							className="border rounded-lg p-2"
						/>
						<input placeholder="Last Name" className="border rounded-lg p-2" />
						<input
							placeholder="Date of Birth"
							type="date"
							className="border rounded-lg p-2"
						/>
						<select className="border rounded-lg p-2">
							<option>Gender</option>
							<option>Male</option>
							<option>Female</option>
						</select>
					</div>

					<h2 className="font-semibold text-lg pt-4">Contact Information</h2>
					<div className="grid grid-cols-2 gap-4">
						<input placeholder="Phone" className="border rounded-lg p-2" />
						<input placeholder="Email" className="border rounded-lg p-2" />
						<input
							placeholder="Address"
							className="border rounded-lg p-2 col-span-2"
						/>
						<select className="border rounded-lg p-2">
							<option>City</option>
						</select>
						<select className="border rounded-lg p-2">
							<option>State</option>
						</select>
						<select className="border rounded-lg p-2">
							<option>Local Government Area</option>
						</select>
					</div>

					<h2 className="font-semibold text-lg pt-4">Geographic Information</h2>
					<div className="grid grid-cols-3 gap-4">
						<select className="border rounded-lg p-2">
							<option>State of Origin</option>
						</select>
						<select className="border rounded-lg p-2">
							<option>LGA of Origin</option>
						</select>
						<select className="border rounded-lg p-2">
							<option>Nationality</option>
						</select>
					</div>

					<div className="flex justify-between mt-6">
						<button className="bg-gray-200 px-6 py-2 rounded-lg">Reset</button>
						<button
							onClick={nextStep}
							className="bg-secondary-1 text-white px-6 py-2 rounded-lg">
							Continue to Identification / Employment
						</button>
					</div>
				</div>
			)}

			{/* Step 2 */}
			{step === 2 && (
				<div className="space-y-6">
					<h2 className="font-semibold text-lg">Identification Details</h2>
					<div className="grid grid-cols-2 gap-4">
						<select className="border rounded-lg p-2">
							<option>National Identity Number (NIN)</option>
						</select>
						<input placeholder="ID Number" className="border rounded-lg p-2" />
					</div>
					<div className="border border-dashed border-gray-400 rounded-lg p-6 text-center">
						<p>Click to upload (JPG, JPEG, PNG, PDF, &lt;10MB)</p>
					</div>

					<h2 className="font-semibold text-lg pt-4">Employment Information</h2>
					<div className="grid grid-cols-2 gap-4">
						<input placeholder="Occupation" className="border rounded-lg p-2" />
						<input
							placeholder="Employment Status"
							className="border rounded-lg p-2"
						/>
						<input
							placeholder="Education Level"
							className="border rounded-lg p-2"
						/>
						<input
							placeholder="Association (Optional)"
							className="border rounded-lg p-2"
						/>
					</div>

					<div className="flex justify-between mt-6">
						<button
							onClick={prevStep}
							className="bg-gray-200 px-6 py-2 rounded-lg">
							Back to Previous Page
						</button>
						<button
							onClick={nextStep}
							className="bg-secondary-1 text-white px-6 py-2 rounded-lg">
							Continue to Review
						</button>
					</div>
				</div>
			)}

			{/* Step 3 */}
			{step === 3 && (
				<div className="space-y-6">
					<h2 className="font-semibold text-lg">Review</h2>
					<div className="bg-gray-50 p-4 rounded-lg border">
						<p>All entered information will appear here in a summary format.</p>
					</div>

					<div className="flex justify-between mt-6">
						<button
							onClick={prevStep}
							className="bg-gray-200 px-6 py-2 rounded-lg">
							Back to Previous Page
						</button>
						<button className="bg-secondary-1 text-white px-6 py-2 rounded-lg">
							Submit Update
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
