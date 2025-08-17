import { useState } from "react";
import Card from "../../components/UI/Card";

type Payment = {
  id: string;
  date: string;
  term: string;
  amount: number;
  method: "UPI" | "Card" | "NetBanking" | "Cash";
  status: "Paid" | "Pending" | "Failed";
  receiptUrl?: string;
};

type LeaveRequest = {
  id: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
};

export default function ParentAdminUtility() {
  const [tab, setTab] = useState<"fees" | "leave" | "profile">("fees");

  return (
    <section className="space-y-3">
      <h2 className="text-2xl ">Administrative & Utility</h2>

      {/* Tabs */}
      <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-soft">
        <TabBtn id="fees" active={tab === "fees"} onClick={() => setTab("fees")}>
          Fee Payment & History
        </TabBtn>
        <TabBtn id="leave" active={tab === "leave"} onClick={() => setTab("leave")}>
          Leave Requests
        </TabBtn>
        <TabBtn id="profile" active={tab === "profile"} onClick={() => setTab("profile")}>
          Profile Management
        </TabBtn>
      </div>

      {tab === "fees" && <FeesPanel />}
      {tab === "leave" && <LeavePanel />}
      {tab === "profile" && <ProfilePanel />}
    </section>
  );
}

function TabBtn({
  id,
  active,
  onClick,
  children,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-controls={id}
      onClick={onClick}
      className={
        "px-3 py-2 rounded-xl text-sm font-medium transition " +
        (active ? "bg-pastelBlue/20 border border-pastelBlue/40" : "hover:bg-slate-50")
      }
    >
      {children}
    </button>
  );
}

/* -------------------- FEES -------------------- */

function FeesPanel() {
  const [history, setHistory] = useState<Payment[]>([
    {
      id: "pmt_101",
      date: "2025-07-05",
      term: "Term 1",
      amount: 25000,
      method: "UPI",
      status: "Paid",
      receiptUrl: "#",
    },
    {
      id: "pmt_102",
      date: "2025-11-05",
      term: "Term 2",
      amount: 25000,
      method: "Card",
      status: "Pending",
    },
  ]);

  const [form, setForm] = useState({
    term: "Term 2",
    amount: 25000,
    method: "UPI" as Payment["method"],
    upiId: "",
    cardLast4: "",
  });

  const [message, setMessage] = useState<string | null>(null);

  function handlePay() {
    // Fake payment submit
    const newItem: Payment = {
      id: "pmt_" + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString().slice(0, 10),
      term: form.term,
      amount: form.amount,
      method: form.method,
      status: "Paid",
      receiptUrl: "#",
    };
    setHistory(h => [newItem, ...h]);
    setMessage("Payment successful! Receipt generated.");
    setTimeout(() => setMessage(null), 4000);
  }

  return (
    <div id="fees" className="grid md:grid-cols-5 gap-3">
      <Card className="md:col-span-2" title="Pay Fees">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Term</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white"
                value={form.term}
                onChange={e => setForm({ ...form, term: e.target.value })}
              >
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Transport</option>
                <option>Lab Fee</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="block text-slate-600 mb-1">Amount (₹)</span>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </label>
          </div>

          <label className="text-sm block">
            <span className="block text-slate-600 mb-1">Method</span>
            <div className="flex gap-2">
              {(["UPI", "Card", "NetBanking", "Cash"] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, method: m })}
                  className={
                    "px-3 py-1.5 rounded-xl border text-sm " +
                    (form.method === m
                      ? "border-pastelGreen bg-pastelGreen/20"
                      : "border-slate-200 bg-white hover:bg-slate-50")
                  }
                >
                  {m}
                </button>
              ))}
            </div>
          </label>

          {form.method === "UPI" && (
            <label className="text-sm block">
              <span className="block text-slate-600 mb-1">UPI ID</span>
              <input
                placeholder="yourname@bank"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.upiId}
                onChange={e => setForm({ ...form, upiId: e.target.value })}
              />
            </label>
          )}

          {form.method === "Card" && (
            <label className="text-sm block">
              <span className="block text-slate-600 mb-1">Card Last 4</span>
              <input
                placeholder="1234"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.cardLast4}
                onChange={e => setForm({ ...form, cardLast4: e.target.value.slice(0, 4) })}
              />
            </label>
          )}

          <button
            onClick={handlePay}
            className="w-full rounded-xl bg-pastelGreen px-4 py-2 font-medium"
          >
            Pay Now
          </button>

          {message && (
            <div className="text-sm rounded-xl bg-green-50 border border-green-200 px-3 py-2">
              {message}
            </div>
          )}
        </div>
      </Card>

      <Card className="md:col-span-3" title="Payment History">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Term</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3">Method</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {history.map(p => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3">{p.date}</td>
                  <td className="py-2 pr-3">{p.term}</td>
                  <td className="py-2 pr-3">₹{p.amount.toLocaleString("en-IN")}</td>
                  <td className="py-2 pr-3">{p.method}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        "px-2 py-0.5 rounded-full text-xs " +
                        (p.status === "Paid"
                          ? "bg-green-100 border border-green-200"
                          : p.status === "Pending"
                          ? "bg-yellow-100 border border-yellow-200"
                          : "bg-red-100 border border-red-200")
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    {p.receiptUrl ? (
                      <a className="underline" href={p.receiptUrl}>
                        View
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* -------------------- LEAVE -------------------- */

function LeavePanel() {
  const [requests, setRequests] = useState<LeaveRequest[]>([
    {
      id: "lv1",
      from: "2025-08-20",
      to: "2025-08-22",
      reason: "Family function",
      status: "Approved",
    },
    { id: "lv2", from: "2025-09-05", to: "2025-09-05", reason: "Doctor visit", status: "Pending" },
  ]);

  const [form, setForm] = useState({
    from: "",
    to: "",
    reason: "",
  });

  const [msg, setMsg] = useState<string | null>(null);

  function submitLeave() {
    if (!form.from || !form.to || !form.reason.trim()) {
      setMsg("Please fill all fields.");
      setTimeout(() => setMsg(null), 3000);
      return;
    }
    const item: LeaveRequest = {
      id: "lv_" + Math.random().toString(36).slice(2, 6),
      from: form.from,
      to: form.to,
      reason: form.reason.trim(),
      status: "Pending",
    };
    setRequests(r => [item, ...r]);
    setForm({ from: "", to: "", reason: "" });
    setMsg("Leave request submitted. You'll be notified on approval.");
    setTimeout(() => setMsg(null), 4000);
  }

  return (
    <div id="leave" className="grid md:grid-cols-5 gap-3">
      <Card className="md:col-span-2" title="Apply for Leave">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">
              <span className="block text-slate-600 mb-1">From</span>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.from}
                onChange={e => setForm({ ...form, from: e.target.value })}
              />
            </label>
            <label className="text-sm">
              <span className="block text-slate-600 mb-1">To</span>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 px-3 py-2"
                value={form.to}
                onChange={e => setForm({ ...form, to: e.target.value })}
              />
            </label>
          </div>
          <label className="text-sm block">
            <span className="block text-slate-600 mb-1">Reason</span>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Write a brief reason..."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
            />
          </label>
          <button
            onClick={submitLeave}
            className="w-full rounded-xl bg-pastelBlue px-4 py-2 font-medium"
          >
            Submit Leave Request
          </button>
          {msg && (
            <div className="text-sm rounded-xl bg-blue-50 border border-blue-200 px-3 py-2">
              {msg}
            </div>
          )}
        </div>
      </Card>

      <Card className="md:col-span-3" title="Leave History">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th className="py-2 pr-3">From</th>
                <th className="py-2 pr-3">To</th>
                <th className="py-2 pr-3">Reason</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3">{r.from}</td>
                  <td className="py-2 pr-3">{r.to}</td>
                  <td className="py-2 pr-3">{r.reason}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        "px-2 py-0.5 rounded-full text-xs " +
                        (r.status === "Approved"
                          ? "bg-green-100 border border-green-200"
                          : r.status === "Pending"
                          ? "bg-yellow-100 border border-yellow-200"
                          : "bg-red-100 border border-red-200")
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* -------------------- PROFILE -------------------- */

function ProfilePanel() {
  const [form, setForm] = useState({
    parentName: "Aarav Mehta",
    email: "aarav.parent@example.com",
    phone: "+91 90000 00000",
    address: "Plot 12, Green Meadows, Hyderabad",
    studentName: "Aarav Mehta",
    className: "Class 8 - B",
    emergencyContact: "+91 98888 88888",
  });

  const [saved, setSaved] = useState(false);

  function saveProfile() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div id="profile" className="grid md:grid-cols-2 gap-3">
      <Card title="Parent Details">
        <div className="space-y-3">
          <TextField
            label="Parent Name"
            value={form.parentName}
            onChange={v => setForm({ ...form, parentName: v })}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={v => setForm({ ...form, email: v })}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={v => setForm({ ...form, phone: v })}
          />
          <TextField
            label="Address"
            value={form.address}
            onChange={v => setForm({ ...form, address: v })}
          />
        </div>
      </Card>

      <Card title="Student Details">
        <div className="space-y-3">
          <TextField
            label="Student Name"
            value={form.studentName}
            onChange={v => setForm({ ...form, studentName: v })}
          />
          <TextField
            label="Class"
            value={form.className}
            onChange={v => setForm({ ...form, className: v })}
          />
          <TextField
            label="Emergency Contact"
            value={form.emergencyContact}
            onChange={v => setForm({ ...form, emergencyContact: v })}
          />
          <button
            onClick={saveProfile}
            className="w-full rounded-xl bg-pastelGreen px-4 py-2 font-medium"
          >
            Save Changes
          </button>
          {saved && (
            <div className="text-sm rounded-xl bg-green-50 border border-green-200 px-3 py-2">
              Profile updated successfully.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="text-sm block">
      <span className="block text-slate-600 mb-1">{label}</span>
      <input
        className="w-full rounded-xl border border-slate-200 px-3 py-2"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}
