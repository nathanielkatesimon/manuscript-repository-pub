"use client";

import React, { useState, useRef, useEffect } from "react";
import InputField from "@/app/components/InputField";
import SelectField from "@/app/components/SelectField";
import TextAreaField from "@/app/components/TextAreaField";
import { swal } from "@/lib/swal";
import useUserStore from "@/store/userStore";
import { apiFetch } from "@/lib/apiFetch";
import type { Category } from "@/lib/categories";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

// ─── Constants ───────────────────────────────────────────────────────────────

const RESEARCH_TYPES = [
  "Action Research", "Analytical Research", "Applied Research", "Case Study",
  "Causal-Comparative Research", "Clinical Research", "Content Analysis",
  "Correlational Research", "Descriptive Research", "Design-Based Research",
  "Developmental Research", "Diagnostic Research", "Experimental Research",
  "Exploratory Research", "Feasibility Study", "Field Research",
  "Historical Research", "Laboratory Research", "Market Research",
  "Mixed-Methods Research", "Narrative Research", "Observational Research",
  "Product Development Research", "Qualitative Research", "Quantitative Research",
  "Quasi-Experimental Research", "System Development Research", "Theoretical Research",
].map((t) => ({ value: t, label: t }));

const CURRENT_YEAR = new Date().getFullYear();

const MAX_ABSTRACT_WORDS = 300;

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB in bytes

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

interface AdviserOption {
  value: string;
  label: string;
}

// ─── Step 1: File Upload ──────────────────────────────────────────────────────

function StepUpload({
  file,
  onFileChange,
  onNext,
}: {
  file: File | null;
  onFileChange: (f: File) => void;
  onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(f: File) {
    if (f.type !== "application/pdf") {
      swal.error("Invalid File Type", "Only PDF files are accepted. Please upload a .pdf file.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      swal.error("File Too Large", "The selected file exceeds the maximum allowed size of 500 MB. Please upload a smaller file.");
      return;
    }
    onFileChange(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full rounded-xl border-2 border-dashed py-14 flex flex-col items-center gap-3 transition-colors cursor-pointer
          ${dragging ? "border-black bg-gray-100" : file ? "border-green-500 bg-green-50 hover:bg-green-100" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}`}
      >
        {/* Upload icon — changes when a file is selected */}
        {file ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}
        <span className={`text-sm font-medium ${file ? "text-green-700" : "text-gray-400"}`}>
          {file ? file.name : "Upload File"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </button>

      <p className="text-xs text-gray-500">
        Supported file type: PDF only. Maximum file size: 500 MB.
      </p>

      {/* IP notice */}
      <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-700 leading-relaxed">
        We take <strong>intellectual property rights seriously</strong>. Only upload manuscripts that are{" "}
        <strong>your original work</strong>. Do{" "}
        <strong className="text-red-700">not upload</strong> content you did not create or that may be copyrighted.
        <br />
        The system <strong>removes infringing submissions</strong> and may restrict users who repeatedly violate these rules.
      </div>

      {/* Next */}
      <div className="flex justify-end mt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!file}
          className="rounded-lg bg-primary px-8 py-2.5 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Metadata Form ────────────────────────────────────────────────────

function StepMetadata({
  file,
  onSuccess,
  onDiscard,
}: {
  file: File;
  onSuccess: () => void;
  onDiscard: () => void;
}) {
  const { user, token } = useUserStore();
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [completionYear, setCompletionYear] = useState(CURRENT_YEAR.toString());
  const [programTrack, setProgramTrack] = useState("");
  const [researchType, setResearchType] = useState("");
  const [adviserId, setAdviserId] = useState("");
  const [abstract, setAbstract] = useState("");
  const [adviserOptions, setAdviserOptions] = useState<AdviserOption[]>([]);
  const [programTrackOptions, setProgramTrackOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [adviserLoadError, setAdviserLoadError] = useState(false);
  const [categoryLoadError, setCategoryLoadError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wordCount = countWords(abstract);
  const overLimit = wordCount > MAX_ABSTRACT_WORDS;

  useEffect(() => {
    if (!token) return;
    apiFetch(`${API_BASE_URL}/api/v1/advisers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setAdviserOptions(
            data.data.map((a: { id: number; first_name: string; middle_name?: string | null; last_name: string }) => ({
              value: String(a.id),
              label: [a.first_name, a.middle_name, a.last_name].filter(Boolean).join(" "),
            }))
          );
        }
      })
      .catch(() => {
        setAdviserLoadError(true);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    apiFetch(`${API_BASE_URL}/api/v1/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          setProgramTrackOptions(
            (data.data as Category[]).map((category) => ({
              value: category.name,
              label: category.name,
            }))
          );
        }
      })
      .catch(() => {
        setCategoryLoadError(true);
      });
  }, [token]);

  async function handleSubmit() {
    if (!title.trim()) {
      await swal.error("Missing Field", "Research title is required.");
      return;
    }
    if (!authors.trim()) {
      await swal.error("Missing Field", "Author(s) is required.");
      return;
    }
    if (!programTrack) {
      await swal.error("Missing Field", "Please select a Program/Track/Strand.");
      return;
    }
    if (!researchType) {
      await swal.error("Missing Field", "Please select a Research Type.");
      return;
    }
    if (!adviserId) {
      await swal.error("Missing Field", "Please select a Research Instructor.");
      return;
    }
    if (!abstract.trim()) {
      await swal.error("Missing Field", "Abstract is required.");
      return;
    }
    if (overLimit) return;

    const studentId = user?.id;
    if (!studentId) {
      await swal.error("Authentication Error", "You must be logged in to submit a manuscript.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("manuscript[title]", title.trim());
      formData.append("manuscript[authors]", authors.trim());
      formData.append("manuscript[completion_date]", `${completionYear}-01-01`);
      formData.append("manuscript[program_or_track]", programTrack);
      formData.append("manuscript[research_type]", researchType);
      formData.append("manuscript[adviser_id]", adviserId);
      formData.append("manuscript[abstract]", abstract.trim());
      formData.append("manuscript[student_id]", String(studentId));
      formData.append("manuscript[status]", "pending");
      formData.append("manuscript[pdf]", file);

      const response = await apiFetch(`${API_BASE_URL}/api/v1/manuscripts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        await swal.success(
          "Manuscript Submitted!",
          "Your manuscript has been submitted and is now pending review by your adviser."
        );
        onSuccess();
      } else {
        const errors: string[] = data.errors ?? ["Submission failed. Please try again."];
        await swal.error("Submission Failed", errors.join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Research Title */}
      <InputField
        label="Research Title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter full research title"
        hint="Enter the complete and official title of your research manuscript."
      />

      {/* Authors */}
      <InputField
        label="Author(s)"
        required
        value={authors}
        onChange={(e) => setAuthors(e.target.value)}
        placeholder="e.g., Jame Paul Hinlong, Mica Ella Alamil, Christian Dano"
      />

      {/* Year / Program / Research Type — 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Year of Completion */}
        <InputField
          label="Year of Completion"
          required
          type="number"
          min={1900}
          max={CURRENT_YEAR}
          value={completionYear}
          onChange={(e) => setCompletionYear(e.target.value)}
          placeholder={CURRENT_YEAR.toString()}
        />

        <SelectField
          label="Program/Track/Strand"
          placeholder="Select"
          options={programTrackOptions}
          required={true}
          value={programTrack}
          onChange={(e) => setProgramTrack(e.target.value)}
        />
        {categoryLoadError && (
          <p className="text-xs text-red-500 sm:col-span-3 -mt-2">
            Could not load categories. Please refresh or try again later.
          </p>
        )}

        <SelectField
          label="Research Type"
          placeholder="Research Type"
          options={RESEARCH_TYPES}
          required={true}
          value={researchType}
          onChange={(e) => setResearchType(e.target.value)}
        />
      </div>

      {/* Research Instructor */}
      <SelectField
        label="Research Instructor"
        placeholder="Select Name"
        options={adviserOptions}
        required={true}
        value={adviserId}
        onChange={(e) => setAdviserId(e.target.value)}
      />
      {adviserLoadError && (
        <p className="text-xs text-red-500 -mt-3">
          Could not load instructors. Please refresh or try again later.
        </p>
      )}

      {/* Abstract */}
      <div className="flex flex-col gap-1">
        <TextAreaField
          label="Abstract"
          required
          rows={5}
          placeholder="Summarize the purpose, method, and key findings of your study. This abstract will be visible to all authorized users."
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
        />
        <p className={`text-xs text-right ${overLimit ? "text-red-600 font-semibold" : "text-gray-400"}`}>
          {wordCount}/{MAX_ABSTRACT_WORDS} words
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-2">
        <button
          type="button"
          onClick={onDiscard}
          disabled={isSubmitting}
          className="rounded-lg bg-gray-300 px-8 py-2.5 text-sm font-bold text-white hover:bg-gray-400 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={overLimit || isSubmitting}
          className="rounded-lg bg-primary px-8 py-2.5 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Success ──────────────────────────────────────────────────────────

function StepSuccess() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      {/* Check circle */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
          fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 className="text-xl font-extrabold text-gray-900">
        Manuscript Submitted Successfully
      </h2>
      <p className="max-w-sm text-sm text-gray-500 leading-relaxed">
        Your research manuscript has been submitted and is now pending review by your adviser.
      </p>
    </div>
  );
}

// ─── Page step type ───────────────────────────────────────────────────────────

type Step = "upload" | "metadata" | "success";

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  if (step === "success") return null;

  const steps: { key: Step; label: string }[] = [
    { key: "upload", label: "Upload File" },
    { key: "metadata", label: "Manuscript Details" },
  ];

  const activeIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const isActive = s.key === step;
        const isDone = i < activeIndex;
        const labelColor = isActive ? "text-gray-900" : isDone ? "text-gray-500" : "text-gray-400";
        const badgeColor = isActive
          ? "bg-primary text-white"
          : isDone
          ? "bg-primary/20 text-primary"
          : "bg-gray-200 text-gray-400";

        return (
          <React.Fragment key={s.key}>
            {i > 0 && (
              <div className={`h-px w-10 ${isDone ? "bg-primary" : "bg-gray-200"}`} />
            )}
            <div className={`flex items-center gap-2 text-sm font-medium ${labelColor}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${badgeColor}`}>
                {isDone ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              {s.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewUploadPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Page header */}
        {step !== "success" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload New Manuscript</h1>
            <p className="mt-1 text-sm text-gray-500">
              Submit your research manuscript for review by your assigned adviser.
            </p>
          </div>
        )}

        {/* Step indicator */}
        <StepIndicator step={step} />

        {/* Divider */}
        {step !== "success" && <hr className="border-gray-200" />}

        {/* Step content */}
        {step === "upload" && (
          <StepUpload
            file={file}
            onFileChange={setFile}
            onNext={() => setStep("metadata")}
          />
        )}
        {step === "metadata" && file && (
          <StepMetadata
            file={file}
            onSuccess={() => setStep("success")}
            onDiscard={() => { setFile(null); setStep("upload"); }}
          />
        )}
        {step === "success" && <StepSuccess />}
      </div>
    </main>
  );
}
