"use client";

import { CONTACT_TYPES, REFERRAL_SOURCES } from "@/lib/leads/types";

export type NorenCustomer = {
  contactName: string;
  jobTitle: string;
  phone: string;
  lineId: string;
  email: string;
  contactType: string;
  businessName: string;
  installAddress: string;
  installMapUrl: string;
  billingAddress: string;
  sameBilling: boolean;
  taxId: string;
  callbackDate: string;
  referralSource: string;
  note: string;
  sameLineAsPhone: boolean;
  pdpaAccepted: boolean;
  marketingOptIn: boolean;
};

export const emptyNorenCustomer = (): NorenCustomer => ({
  contactName: "",
  jobTitle: "",
  phone: "",
  lineId: "",
  email: "",
  contactType: "",
  businessName: "",
  installAddress: "",
  installMapUrl: "",
  billingAddress: "",
  sameBilling: true,
  taxId: "",
  callbackDate: "",
  referralSource: "",
  note: "",
  sameLineAsPhone: false,
  pdpaAccepted: false,
  marketingOptIn: false,
});

export const fieldClass =
  "mt-1 w-full rounded-lg border border-line bg-field px-3 py-2 outline-none focus:border-navy disabled:text-muted";

export function NorenCustomerFields({
  cust,
  onChange,
  compact,
}: {
  cust: NorenCustomer;
  onChange: (next: NorenCustomer) => void;
  compact?: boolean;
}) {
  const set = (patch: Partial<NorenCustomer>) => onChange({ ...cust, ...patch });
  const taxNeed = Boolean(cust.contactType && cust.contactType !== "บุคคลธรรมดา");

  return (
    <div className={compact ? "grid gap-3 sm:grid-cols-2" : "grid gap-3"}>
      <TextField
        label="ชื่อผู้ติดต่อ"
        required
        value={cust.contactName}
        onChange={(v) => set({ contactName: v })}
        autoComplete="name"
      />
      <TextField
        label="ตำแหน่งงาน"
        value={cust.jobTitle}
        onChange={(v) => set({ jobTitle: v })}
        autoComplete="organization-title"
      />
      <TextField
        label="เบอร์โทรศัพท์"
        required
        type="tel"
        value={cust.phone}
        onChange={(v) => set({ phone: v })}
        autoComplete="tel"
      />
      <label className="block text-sm">
        <span className="font-medium text-ink">
          ประเภทผู้ติดต่อ <span className="text-brand-red">*</span>
        </span>
        <select
          required
          className={fieldClass}
          value={cust.contactType}
          onChange={(e) => set({ contactType: e.target.value })}
        >
          <option value="">เลือก</option>
          {CONTACT_TYPES.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </label>
      <div className="space-y-2">
        <TextField
          label="LINE ID"
          disabled={cust.sameLineAsPhone}
          value={cust.sameLineAsPhone ? "" : cust.lineId}
          onChange={(v) => set({ lineId: v })}
        />
        <label className="flex min-h-11 items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-0.5 size-4"
            checked={cust.sameLineAsPhone}
            onChange={(e) => set({ sameLineAsPhone: e.target.checked })}
          />
          <span>ใช้เบอร์นี้เป็น LINE</span>
        </label>
      </div>
      <TextField
        label="E-mail"
        required
        type="email"
        value={cust.email}
        onChange={(v) => set({ email: v })}
        autoComplete="email"
      />
      <TextField
        label="ชื่อธุรกิจ"
        required={cust.contactType === "นิติบุคคล"}
        value={cust.businessName}
        onChange={(v) => set({ businessName: v })}
        autoComplete="organization"
        className={compact ? "sm:col-span-2" : undefined}
      />
      <label className={`block text-sm ${compact ? "sm:col-span-2" : ""}`}>
        <span className="font-medium text-ink">
          ที่อยู่ สำหรับ ส่งของ หรือ ติดตั้ง <span className="text-brand-red">*</span>
        </span>
        <textarea
          required
          minLength={5}
          className={fieldClass}
          rows={2}
          value={cust.installAddress}
          onChange={(e) => set({ installAddress: e.target.value })}
          autoComplete="shipping street-address"
        />
      </label>
      <TextField
        label="ลิงก์ Google Maps"
        value={cust.installMapUrl}
        onChange={(v) => set({ installMapUrl: v })}
        placeholder="https://maps.app.goo.gl/..."
      />
      <TextField
        label="เลขผู้เสียภาษี"
        required={taxNeed}
        value={cust.taxId}
        onChange={(v) => set({ taxId: v })}
      />
      <label className={`flex min-h-11 items-center gap-2 text-sm text-muted ${compact ? "sm:col-span-2" : ""}`}>
        <input
          type="checkbox"
          className="size-4"
          checked={cust.sameBilling}
          onChange={(e) => set({ sameBilling: e.target.checked })}
        />
        ใช้ที่อยู่เดียวกับที่อยู่ติดตั้ง/ส่งของ
      </label>
      <label className={`block text-sm ${compact ? "sm:col-span-2" : ""}`}>
        <span className="font-medium text-ink">ที่อยู่ สำหรับ ออกใบเสนอราคา</span>
        <textarea
          className={fieldClass}
          rows={2}
          disabled={cust.sameBilling}
          value={cust.sameBilling ? cust.installAddress : cust.billingAddress}
          onChange={(e) => set({ billingAddress: e.target.value })}
          autoComplete="billing street-address"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink">
          หาเราเจอจากที่ไหน <span className="text-brand-red">*</span>
        </span>
        <select
          required
          className={fieldClass}
          value={cust.referralSource}
          onChange={(e) => set({ referralSource: e.target.value })}
        >
          <option value="">เลือก</option>
          {REFERRAL_SOURCES.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </label>
      <label className={`block text-sm ${compact ? "sm:col-span-2" : ""}`}>
        <span className="font-medium text-ink">หมายเหตุ</span>
        <textarea
          className={fieldClass}
          rows={3}
          value={cust.note}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="จุดที่จะติด หรือสิ่งที่อยากได้"
        />
      </label>
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  required,
  disabled,
  type = "text",
  autoComplete,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className ?? ""}`}>
      <span className="font-medium text-ink">
        {label}
        {required ? <span className="text-brand-red"> *</span> : null}
      </span>
      <input
        required={required}
        disabled={disabled}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
