"use client";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const emptyMember = {
    name: "",
    relation: "",
    dob: "",
    occupation: "",
    qualification: "",
    bloodGroup: "",
  };
  const [family, setFamily] = useState([emptyMember]);

  const addFamily = () => {
    setFamily([...family, emptyMember]);
  };

  const removeFamily = (index) => {
    setFamily(family.filter((_, i) => i !== index));
  };

  const updateFamily = (index, field, value) => {
    const updated = [...family];
    updated[index][field] = value;
    setFamily(updated);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = Object.fromEntries(new FormData(e.target));

    const payload = {
      ...formData,
      family,
    };

    const res = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "RWA_Membership_Form.pdf";
    a.click();

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          RWA Membership Application Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Applicant Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
              Applicant Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 text-black gap-4">
              <Input name="name" label="Applicant Name" required />
              <Input name="fatherName" label="Father / Husband Name" />
              <Input name="mobile" label="Mobile Number" />
              <Input name="dob" label="Date of Birth" />
              <Input name="qualification" label="Qualification" />
              <Input name="occupation" label="Occupation" />
              <Input name="email" label="Email ID" />
              <Input name="bloodGroup" label="Blood Group" />
            </div>

            <div className="mt-4">
              <Label>Address</Label>
              <textarea
                name="address"
                rows="3"
                className="w-full rounded-md border border-gray-300 text-black px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Full Address"
              />
            </div>
          </div>

          {/* Family Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
              Family Details
            </h3>

            {family.map((member, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-7 gap-4 text-black mb-4 items-end"
              >
                <Input
                  label="Name"
                  value={member.name}
                  onChange={(e) => updateFamily(index, "name", e.target.value)}
                />

                <Input
                  label="Relation"
                  value={member.relation}
                  onChange={(e) =>
                    updateFamily(index, "relation", e.target.value)
                  }
                />

                <Input
                  label="DOB"
                  value={member.dob}
                  onChange={(e) => updateFamily(index, "dob", e.target.value)}
                />

                <Input
                  label="Qualification"
                  value={member.qualification}
                  onChange={(e) =>
                    updateFamily(index, "qualification", e.target.value)
                  }
                />

                <Input
                  label="Occupation"
                  value={member.occupation}
                  onChange={(e) =>
                    updateFamily(index, "occupation", e.target.value)
                  }
                />

                <Input
                  label="Blood Group"
                  value={member.bloodGroup}
                  onChange={(e) =>
                    updateFamily(index, "bloodGroup", e.target.value)
                  }
                />

                <button
                  type="button"
                  onClick={() => removeFamily(index)}
                  className="h-10 mt-6 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addFamily}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              + Add Family Member
            </button>
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg text-white font-medium transition
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? "Generating PDF..." : "Submit & Download PDF"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Reusable Components */

function Label({ children }) {
  return (
    <label className="block text-sm font-medium text-gray-600 mb-1">
      {children}
    </label>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        {...props}
        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );
}
