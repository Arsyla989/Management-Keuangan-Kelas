import React, { useState, useEffect, useMemo, useRef, FormEvent } from "react";
import { 
  Building2, 
  Users, 
  PlusCircle, 
  MinusCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieIcon, 
  FileSpreadsheet, 
  Search, 
  LogOut, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  FileCode, 
  Copy, 
  Check, 
  RefreshCw,
  Bell,
  Clock,
  ChevronRight,
  Sparkles,
  Award,
  Wallet
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { Student, KasMasuk, Pengeluaran, AppState } from "./types";
import { 
  DEFAULT_STUDENTS, 
  DEFAULT_KAS_MASUK, 
  DEFAULT_EXPENSES, 
  KAS_TARGET 
} from "./defaultData";
import { 
  PYTHON_MAIN_PY, 
  PYTHON_LOGIN_PY, 
  PYTHON_ADMIN_DASHBOARD_PY, 
  PYTHON_SISWA_DASHBOARD_PY 
} from "./python_source";

export default function App() {
  // Database States (Synced with localStorage for real persistence in preview)
  const [students, setStudents] = useState<Student[]>(() => {
    const local = localStorage.getItem("bendahara_students");
    return local ? JSON.parse(local) : DEFAULT_STUDENTS;
  });

  const [kasMasuk, setKasMasuk] = useState<KasMasuk[]>(() => {
    const local = localStorage.getItem("bendahara_kas_masuk");
    return local ? JSON.parse(local) : DEFAULT_KAS_MASUK;
  });

  const [expenses, setExpenses] = useState<Pengeluaran[]>(() => {
    const local = localStorage.getItem("bendahara_expenses");
    return local ? JSON.parse(local) : DEFAULT_EXPENSES;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("bendahara_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("bendahara_kas_masuk", JSON.stringify(kasMasuk));
  }, [kasMasuk]);

  useEffect(() => {
    localStorage.setItem("bendahara_expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Auth/Session State
  const [session, setSession] = useState<{ role: "admin" | "siswa"; user: any } | null>(null);
  const [loginRole, setLoginRole] = useState<"admin" | "siswa">("admin");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccessMessage, setLoginSuccessMessage] = useState("");

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>("dashboard");

  // Code Tab Selection Context
  const [pythonFileTab, setPythonFileTab] = useState<"main" | "db" | "login" | "admin" | "siswa">("main");
  const [copiedText, setCopiedText] = useState(false);

  // Time stamp state
  const [currentTime, setCurrentTime] = useState<string>(() => {
    return new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB";
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB");
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // CRUD & Forms states
  const [searchStudentQuery, setSearchStudentQuery] = useState("");
  
  // Student Form
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentFormName, setStudentFormName] = useState("");
  const [studentFormNis, setStudentFormNis] = useState("");
  const [studentFormClass, setStudentFormClass] = useState("XII MIPA 1");
  const [studentFormUser, setStudentFormUser] = useState("");
  const [studentFormPass, setStudentFormPass] = useState("");
  const [studentFormError, setStudentFormError] = useState("");
  const [studentFormSuccess, setStudentFormSuccess] = useState("");

  // Kas Masuk Form
  const [kasSiswaId, setKasSiswaId] = useState("");
  const [kasNominal, setKasNominal] = useState(100000);
  const [kasTanggal, setKasTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [kasKeterangan, setKasKeterangan] = useState("");
  const [kasMsg, setKasMsg] = useState("");

  // Pengeluaran Form
  const [expName, setExpName] = useState("");
  const [expCategory, setExpCategory] = useState("ATK");
  const [expNominal, setExpNominal] = useState("");
  const [expTanggal, setExpTanggal] = useState(() => new Date().toISOString().split("T")[0]);
  const [expDesc, setExpDesc] = useState("");
  const [expMsg, setExpMsg] = useState("");

  // Filter & Search Master Audit Log
  const [auditFilterType, setAuditFilterType] = useState<"semua" | "kas" | "pengeluaran">("semua");
  const [auditSearchQuery, setAuditSearchQuery] = useState("");
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");
  const [auditSortOrder, setAuditSortOrder] = useState<"terbaru" | "terlama" | "terbesar">("terbaru");

  // Notifications
  const [newNotice, setNewNotice] = useState<string | null>("Selamat datang di platform bendahara digital KlasKas!");

  // Math Metrics & Calculations
  const metrics = useMemo(() => {
    const totalPemasukan = kasMasuk.reduce((sum, item) => sum + item.nominal, 0);
    const totalPengeluaran = expenses.reduce((sum, item) => sum + item.nominal, 0);
    const saldoKas = totalPemasukan - totalPengeluaran;

    // Student paid calculation
    const paidPerStudent = students.reduce((acc, student) => {
      acc[student.id] = 0;
      return acc;
    }, {} as Record<string, number>);

    kasMasuk.forEach(kas => {
      if (paidPerStudent[kas.siswa_id] !== undefined) {
        paidPerStudent[kas.siswa_id] += kas.nominal;
      }
    });

    let lunasCount = 0;
    let belumLunasCount = 0;

    students.forEach(student => {
      const paid = paidPerStudent[student.id] || 0;
      if (paid >= KAS_TARGET) {
        lunasCount++;
      } else {
        belumLunasCount++;
      }
    });

    return {
      totalPemasukan,
      totalPengeluaran,
      saldoKas,
      lunasCount,
      belumLunasCount,
      paidPerStudent
    };
  }, [students, kasMasuk, expenses]);

  // Handle Logins
  const triggerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSuccessMessage("");

    if (!usernameInput.trim() || !passwordInput.trim()) {
      setLoginError("Harap isi username dan password!");
      return;
    }

    if (loginRole === "admin") {
      // Default admin check
      if (usernameInput === "admin" && passwordInput === "admin123") {
        setLoginSuccessMessage("Login bendahara sukses!");
        setTimeout(() => {
          setSession({ role: "admin", user: { nama: "Bendahara Kelas", username: "admin" } });
          setCurrentTab("dashboard");
          resetLoginForm();
        }, 800);
      } else {
        setLoginError("Username atau password Bendahara salah!");
      }
    } else {
      // Students search check (username or NIS)
      const foundStudent = students.find(
        s => (s.username === usernameInput || s.nis === usernameInput) && s.password === passwordInput
      );

      if (foundStudent) {
        setLoginSuccessMessage(`Selamat datang, ${foundStudent.nama}!`);
        setTimeout(() => {
          setSession({ role: "siswa", user: foundStudent });
          setCurrentTab("dashboard");
          resetLoginForm();
        }, 800);
      } else {
        setLoginError("NIS/Username atau password Siswa salah!");
      }
    }
  };

  const resetLoginForm = () => {
    setUsernameInput("");
    setPasswordInput("");
    setLoginError("");
    setLoginSuccessMessage("");
  };

  const triggerLogout = () => {
    setSession(null);
    setCurrentTab("dashboard");
  };

  const resetAllData = () => {
    if (window.confirm("Apakah Anda yakin ingin mengatur ulang data menjadi data bawaan pabrik?")) {
      setStudents(DEFAULT_STUDENTS);
      setKasMasuk(DEFAULT_KAS_MASUK);
      setExpenses(DEFAULT_EXPENSES);
      localStorage.removeItem("bendahara_students");
      localStorage.removeItem("bendahara_kas_masuk");
      localStorage.removeItem("bendahara_expenses");
      setNewNotice("Semua data berhasil di-reset kembali ke bawaan sistem!");
    }
  };

  // --- STUDENT CRUD COMMANDS ---
  const saveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentFormError("");
    setStudentFormSuccess("");

    if (!studentFormName.trim() || !studentFormNis.trim() || !studentFormClass.trim() || !studentFormUser.trim() || !studentFormPass.trim()) {
      setStudentFormError("Semua kolom isian wajib diisi!");
      return;
    }

    // Integrity check
    const duplicateNis = students.some(s => s.nis === studentFormNis && s.id !== editingStudentId);
    const duplicateUser = students.some(s => s.username === studentFormUser && s.id !== editingStudentId);

    if (duplicateNis) {
      setStudentFormError("Nomor NIS ini sudah digunakan oleh siswa lain!");
      return;
    }
    if (duplicateUser) {
      setStudentFormError("Username sudah digunakan oleh siswa lain!");
      return;
    }

    if (editingStudentId) {
      // Edit
      setStudents(students.map(s => {
        if (s.id === editingStudentId) {
          return {
            ...s,
            nama: studentFormName,
            nis: studentFormNis,
            kelas: studentFormClass,
            username: studentFormUser,
            password: studentFormPass
          };
        }
        return s;
      }));
      setStudentFormSuccess("Profil siswa berhasil di-update!");
    } else {
      // Add
      const newStudent: Student = {
        id: "s_" + Date.now(),
        nama: studentFormName,
        nis: studentFormNis,
        kelas: studentFormClass,
        username: studentFormUser,
        password: studentFormPass
      };
      setStudents([...students, newStudent]);
      setStudentFormSuccess("Siswa baru berhasil direkam!");
    }

    // Reset Form
    setEditingStudentId(null);
    setStudentFormName("");
    setStudentFormNis("");
    setStudentFormUser("");
    setStudentFormPass("");
  };

  const startEditStudent = (student: Student) => {
    setEditingStudentId(student.id);
    setStudentFormName(student.nama);
    setStudentFormNis(student.nis);
    setStudentFormClass(student.kelas);
    setStudentFormUser(student.username);
    setStudentFormPass(student.password || "123");
    setStudentFormError("");
    setStudentFormSuccess("");
  };

  const deleteStudent = (studentId: string, studentName: string) => {
    if (window.confirm(`Yakin ingin menghapus ${studentName}? Seluruh riwayat bayar miliknya juga akan hilang.`)) {
      setStudents(students.filter(s => s.id !== studentId));
      setKasMasuk(kasMasuk.filter(k => k.siswa_id !== studentId));
      setNewNotice(`Siswa '${studentName}' telah dihapus dari sistem.`);
    }
  };

  // --- KAS MASUK RECORDS COMMANDS ---
  const saveKasMasuk = (e: React.FormEvent) => {
    e.preventDefault();
    setKasMsg("");

    if (!kasSiswaId) {
      setKasMsg("⚠️ Pilih siswa pembayar kas!");
      return;
    }
    if (kasNominal <= 0) {
      setKasMsg("⚠️ Nominal kas harus lebih dari Nol!");
      return;
    }

    const newKas: KasMasuk = {
      id: "k_" + Date.now(),
      siswa_id: kasSiswaId,
      nominal: Number(kasNominal),
      tanggal: kasTanggal,
      keterangan: kasKeterangan.trim() || "Penyetoran Kas Kelas"
    };

    setKasMasuk([newKas, ...kasMasuk]);
    setKasMsg("✅ Uang kas berhasil disetor dan dicatatkan!");
    setKasKeterangan("");
    
    // Auto clear msg
    setTimeout(() => setKasMsg(""), 3000);
  };

  const deleteKasRecord = (id: string) => {
    if (window.confirm("Apakah anda yakin ingin membatalkan setoran kas ini?")) {
      setKasMasuk(kasMasuk.filter(k => k.id !== id));
      setNewNotice("Catatan setoran kas dicabut.");
    }
  };

  // --- EXPENSE RECORDS COMMANDS ---
  const saveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setExpMsg("");

    const nominalValue = Number(expNominal);
    if (!expName.trim()) {
      setExpMsg("⚠️ Isi nama barang/keperluan pengeluaran!");
      return;
    }
    if (isNaN(nominalValue) || nominalValue <= 0) {
      setExpMsg("⚠️ Masukkan nominal pengeluaran yang sah!");
      return;
    }

    const newExp: Pengeluaran = {
      id: "e_" + Date.now(),
      nama_pengeluaran: expName,
      kategori: expCategory,
      nominal: nominalValue,
      tanggal: expTanggal,
      deskripsi: expDesc.trim() ||"Pengeluaran penunjang kelas"
    };

    setExpenses([newExp, ...expenses]);
    setExpMsg("✅ Pengeluaran kelas berhasil direkam!");
    setExpName("");
    setExpNominal("");
    setExpDesc("");

    setTimeout(() => setExpMsg(""), 3000);
  };

  const deleteExpenseRecord = (id: string) => {
    if (window.confirm("Batal/Hapus catatan pengeluaran ini?")) {
      setExpenses(expenses.filter(e => e.id !== id));
      setNewNotice("Catatan pengeluaran ditarik.");
    }
  };

  // --- RECHARTS CHART PLOTTING SERIES ---
  const chartDataArea = useMemo(() => {
    // Group totals by date (latest 7 days with transactions)
    const allDates = new Set([
      ...kasMasuk.map(k => k.tanggal),
      ...expenses.map(e => e.tanggal)
    ]);
    const sortedDates = Array.from(allDates).sort().slice(-8); // Slice last 8 active days

    let cumulativeBalance = 0;
    return sortedDates.map(date => {
      const incomeOnDay = kasMasuk.filter(k => k.tanggal === date).reduce((s, c) => s + c.nominal, 0);
      const spentOnDay = expenses.filter(e => e.tanggal === date).reduce((s, c) => s + c.nominal, 0);
      
      return {
        tanggal: date.substring(5), // MM-DD
        Pemasukan: incomeOnDay,
        Pengeluaran: spentOnDay,
      };
    });
  }, [kasMasuk, expenses]);

  const chartDataPie = useMemo(() => {
    const categories: Record<string, number> = {};
    expenses.forEach(e => {
      categories[e.kategori] = (categories[e.kategori] || 0) + e.nominal;
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  }, [expenses]);

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  // --- UNIFIED LEDGER SHEET FOR AUDIT REPORT ---
  const masterLedgerFiltered = useMemo(() => {
    const parsedKas = kasMasuk.map(k => {
      const stud = students.find(s => s.id === k.siswa_id);
      return {
        id: k.id,
        tanggal: k.tanggal,
        tipe: "Kas Masuk" as const,
        nama: stud ? stud.nama : "Alumni / Siswa Dihapus",
        kategoriOrCatatan: k.keterangan || "Setoran Kas",
        nominal: k.nominal
      };
    });

    const parsedExpenses = expenses.map(e => ({
      id: e.id,
      tanggal: e.tanggal,
      tipe: "Pengeluaran" as const,
      nama: e.nama_pengeluaran,
      kategoriOrCatatan: e.kategori || "Bahan Rutin",
      nominal: e.nominal
    }));

    let combined = [...parsedKas, ...parsedExpenses];

    // Filter by type
    if (auditFilterType === "kas") {
      combined = combined.filter(x => x.tipe === "Kas Masuk");
    } else if (auditFilterType === "pengeluaran") {
      combined = combined.filter(x => x.tipe === "Pengeluaran");
    }

    // Filter by search
    if (auditSearchQuery.trim()) {
      const q = auditSearchQuery.toLowerCase();
      combined = combined.filter(
        x => x.nama.toLowerCase().includes(q) || x.kategoriOrCatatan.toLowerCase().includes(q)
      );
    }

    // Filter by date range
    if (auditStartDate) {
      combined = combined.filter(x => x.tanggal >= auditStartDate);
    }
    if (auditEndDate) {
      combined = combined.filter(x => x.tanggal <= auditEndDate);
    }

    // Sorting
    if (auditSortOrder === "terbaru") {
      combined.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    } else if (auditSortOrder === "terlama") {
      combined.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    } else if (auditSortOrder === "terbesar") {
      combined.sort((a, b) => b.nominal - a.nominal);
    }

    return combined;
  }, [kasMasuk, expenses, students, auditFilterType, auditSearchQuery, auditStartDate, auditEndDate, auditSortOrder]);

  // Export CSV Action triggers native browser spreadsheet dowloads
  const exportToCsvFile = () => {
    if (masterLedgerFiltered.length === 0) {
      alert("Tidak ada data dalam filter untuk diekspor!");
      return;
    }

    const headers = ["Tanggal", "Tipe Transaksi", "Nama / Uraian", "Kategori / Catatan", "Nominal (IDR)"];
    const rows = masterLedgerFiltered.map(item => [
      item.tanggal,
      item.tipe,
      item.nama,
      item.kategoriOrCatatan,
      item.nominal
    ]);
    
    // Create CSV content
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Kas_${auditFilterType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy code to Clipboard Widget
  const getSelectedCodeText = () => {
    switch (pythonFileTab) {
      case "main": return PYTHON_MAIN_PY;
      case "login": return PYTHON_LOGIN_PY;
      case "admin": return PYTHON_ADMIN_DASHBOARD_PY;
      case "siswa": return PYTHON_SISWA_DASHBOARD_PY;
      case "db": return `import sqlite3
# db_manager.py module code is saved inside '/database/db_manager.py' files.`;
      default: return "";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getSelectedCodeText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // --- AUTOMATED ASSISTANT SPEECH ---
  const classStatusRemark = useMemo(() => {
    const pct = metrics.lunasCount / (students.length || 1) * 100;
    if (pct >= 80) return "Sangat Sehat! Mayoritas siswa telah menuntaskan target iuran Rp 100,000 tepat waktu.";
    if (pct >= 50) return "Cukup Stabil. Sisa tunggakan sedang diupayakan penagihannya oleh Bendahara.";
    return "Peringatan Tunggakan Tinggi. Bendahara perlu mengirimkan memo iuran berkala bagi yang belum munas.";
  }, [metrics, students]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans flex flex-col antialiased">
      {/* Top Universal Navbar Info banner */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] border-b border-[#334155] px-4 py-2.5 flex justify-between items-center text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" id="glowing_dot_p"></span>
          <span className="font-semibold text-slate-300">Live Simulator Bendahara Kelas v4.2</span>
          <span className="opacity-40">|</span>
          <span className="hidden sm:inline">Mei-Juni 2026 Academic Tier</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock size={13} className="text-[#3B82F6]" />
            <span>Time: 2026-05-24 15:32:21 GMT</span>
          </div>
          <button 
            onClick={resetAllData}
            title="Reset storage" 
            className="flex items-center gap-1 text-[#60A5FA] bg-[#1E293B] hover:bg-[#334155] px-2 py-0.5 rounded border border-[#334155] transition-all cursor-pointer text-[10px]"
          >
            <RefreshCw size={10} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {session ? (
        // DASHBOARDS PAGE CONTAINER
        <div className="flex flex-1 flex-col md:flex-row">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="sidebar w-full md:w-64 flex flex-col shrink-0">
            {/* Header branding */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-b from-[#111827] to-[#090D16]">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-500/20">
                  <Wallet size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-black tracking-widest text-slate-100 uppercase" id="brand-logo">
                  Klas<span className="text-blue-500">Kas</span>
                </h1>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#60A5FA] mb-4">
                Sistem Keuangan Kelas
              </p>
              
              {/* Profile card status */}
              <div className="bg-[#0F172A]/50 rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-xs text-blue-400 font-bold">
                    {session.role === "admin" ? "B" : "S"}
                  </div>
                  <span className="text-xs font-bold text-slate-300 truncate block max-w-[120px]">
                    {session.user.nama}
                  </span>
                </div>
                <div className="text-[9px] text-slate-400 uppercase flex justify-between items-center bg-[#1E293B]/40 px-1.5 py-0.5 rounded border border-white/5">
                  <span>Role: {session.role === "admin" ? "Bendahara" : "Siswa"}</span>
                  <span className="text-cyan-400 font-mono font-bold">XII Mipa</span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <nav className="py-4 flex-grow flex flex-col gap-1">
              {session.role === "admin" ? (
                <>
                  <button
                    id="btn-sidebar-dash"
                    onClick={() => setCurrentTab("dashboard")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-r-lg text-sm font-semibold transition-all border-l-4 ${
                      currentTab === "dashboard"
                        ? "bg-blue-600/10 border-blue-600 text-white"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Building2 size={16} />
                    <span>Dashboard Utama</span>
                  </button>

                  <button
                    id="btn-sidebar-siswa"
                    onClick={() => setCurrentTab("siswa")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-r-lg text-sm font-semibold transition-all border-l-4 ${
                      currentTab === "siswa"
                        ? "bg-blue-600/10 border-blue-600 text-white"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Users size={16} />
                    <span>Data Siswa (CRUD)</span>
                  </button>

                  <button
                    id="btn-sidebar-kas"
                    onClick={() => setCurrentTab("kas_masuk")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-r-lg text-sm font-semibold transition-all border-l-4 ${
                      currentTab === "kas_masuk"
                        ? "bg-blue-600/10 border-blue-600 text-white"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <PlusCircle size={16} className="text-emerald-400" />
                    <span>Penyetoran Kas Masuk</span>
                  </button>

                  <button
                    id="btn-sidebar-exp"
                    onClick={() => setCurrentTab("pengeluaran")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-r-lg text-sm font-semibold transition-all border-l-4 ${
                      currentTab === "pengeluaran"
                        ? "bg-blue-600/10 border-blue-600 text-white"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <MinusCircle size={16} className="text-rose-400" />
                    <span>Pengeluaran Kelas</span>
                  </button>

                  <button
                    id="btn-sidebar-stats"
                    onClick={() => setCurrentTab("statistik")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-r-lg text-sm font-semibold transition-all border-l-4 ${
                      currentTab === "statistik"
                        ? "bg-blue-600/10 border-blue-600 text-white"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <PieIcon size={16} />
                    <span>Statistik Lengkap</span>
                  </button>

                  <button
                    id="btn-sidebar-audit"
                    onClick={() => setCurrentTab("laporan")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-r-lg text-sm font-semibold transition-all border-l-4 ${
                      currentTab === "laporan"
                        ? "bg-blue-600/10 border-blue-600 text-white"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <FileSpreadsheet size={16} />
                    <span>Laporan & Ekspor CSV</span>
                  </button>
                </>
              ) : (
                // Student Nav
                <>
                  <button
                    id="btn-sidebar-stud-dash"
                    onClick={() => setCurrentTab("dashboard")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-r-lg text-sm font-semibold transition-all border-l-4 ${
                      currentTab === "dashboard"
                        ? "bg-blue-600/10 border-blue-600 text-white"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Building2 size={16} />
                    <span>Ringkasan Kas Saya</span>
                  </button>

                  <button
                    id="btn-sidebar-stud-kas"
                    onClick={() => setCurrentTab("riwayat_pribadi")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-r-lg text-sm font-semibold transition-all border-l-4 ${
                      currentTab === "riwayat_pribadi"
                        ? "bg-blue-600/10 border-blue-600 text-white"
                        : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <PlusCircle size={16} />
                    <span>Histori Setoran Pribadi</span>
                  </button>
                </>
              )}

              {/* Shared Python Code Viewer button */}
              <button
                id="btn-sidebar-python"
                onClick={() => setCurrentTab("python_code")}
                className={`flex items-center gap-3 px-6 py-3 rounded-r-lg text-sm font-semibold transition-all border-l-4 ${
                  currentTab === "python_code"
                    ? "bg-indigo-600/10 border-indigo-500 text-white"
                    : "border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileCode size={16} className="text-yellow-400" />
                <span>Source Code Python Desktop</span>
              </button>
            </nav>

            {/* Logout anchor footer */}
            <div className="p-4 border-t border-white/5 bg-[#090D16]">
              <button
                id="btn-sidebar-logout"
                onClick={triggerLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-600/90 hover:bg-rose-600 active:scale-95 text-white rounded-lg text-xs font-bold tracking-wider uppercase shadow-md transition-all cursor-pointer"
              >
                <LogOut size={13} />
                <span>Keluar Aplikasi</span>
              </button>
            </div>
          </aside>

          {/* MAIN PAGE CONTENTS AREA */}
          <main className="flex-grow p-6 md:p-8 overflow-y-auto">
            {/* Context title header with clock */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <p className="text-xs text-blue-400 font-bold tracking-widest uppercase mb-1">
                  RUANG KERJA {session.role === "admin" ? "BENDAHARA" : "SISWA"}
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-white capitalize">
                  {currentTab.replace("_", " ")}
                </h2>
              </div>
              <div className="bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block leading-3">TANGGAL SAYA SEBAGAI BENDAHARA</span>
                  <span className="text-xs text-slate-200 font-mono">24 Mei 2026 • {currentTime}</span>
                </div>
              </div>
            </div>

            {/* Notification alert banner */}
            {newNotice && (
              <div className="bg-blue-900/40 border border-blue-500/30 text-slate-100 rounded-xl p-4 mb-6 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-1 px-2 rounded bg-blue-500 text-white font-extrabold uppercase text-[10px]">INFO</div>
                  <span className="font-medium text-blue-100">{newNotice}</span>
                </div>
                <button onClick={() => setNewNotice(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">Dismiss</button>
              </div>
            )}

            {/* ========================================================
               1. ADMIN: GENERAL DASHBOARD
               ======================================================== */}
            {session.role === "admin" && currentTab === "dashboard" && (
              <div className="space-y-8 animate-fade-in">
                {/* 4 Cards block of state statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Saldo Kas */}
                  <div className="sleek-card border border-white/5 relative">
                    <div className="absolute right-6 top-6 text-[#10B981] bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      <DollarSign size={20} />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">SALDO KAS SEKARANG</p>
                    <h3 className="text-2xl md:text-3xl font-black text-emerald-400 tracking-tight">
                      Rp {metrics.saldoKas.toLocaleString("id-ID")}
                    </h3>
                    <div className="mt-4 text-[10px] text-slate-400 flex items-center gap-1.5 bg-[#0F172A] py-1 px-2.5 rounded border border-white/5 w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Dana murni siap pakai</span>
                    </div>
                  </div>

                  {/* Card 2: Total Setoran */}
                  <div className="sleek-card border border-white/5 relative">
                    <div className="absolute right-6 top-6 text-[#3B82F6] bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                      <TrendingUp size={20} />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">TOTAL KAS MASUK</p>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
                      Rp {metrics.totalPemasukan.toLocaleString("id-ID")}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                      Akumulasi {kasMasuk.length} transaksi setoran siswa
                    </p>
                  </div>

                  {/* Card 3: Total Pengeluaran */}
                  <div className="sleek-card border border-white/5 relative">
                    <div className="absolute right-6 top-6 text-[#EF4444] bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                      <TrendingDown size={20} />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">TOTAL PENGELUARAN</p>
                    <h3 className="text-2xl md:text-3xl font-black text-rose-400 tracking-tight animate-pulse-slow">
                      Rp {metrics.totalPengeluaran.toLocaleString("id-ID")}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                      Belanja Sapu, ATK, FC & acara s/d Mei 2026
                    </p>
                  </div>

                  {/* Card 4: Kuantitas Lunas */}
                  <div className="sleek-card border border-white/5 relative">
                    <div className="absolute right-6 top-6 text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      <Users size={20} />
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">RATIO LUNAS KAS</p>
                    <h3 className="text-2xl md:text-3xl font-black text-[#60A5FA]">
                      {metrics.lunasCount} <span className="text-slate-400 text-xs font-normal"> / {students.length} Lunas</span>
                    </h3>
                    <div className="text-[10px] mt-4 flex justify-between text-slate-400">
                      <span>Belum Lunas: <strong className="text-amber-400 font-extrabold">{metrics.belumLunasCount} Siswa</strong></span>
                      <span className="text-slate-500">Iuran Acuan: Rp 100k</span>
                    </div>
                  </div>
                </div>

                {/* Grid chart visualization and commentary panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Line Chart */}
                  <div className="sleek-card lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-base font-extrabold text-white">Trend Arus Kas Harian Terakhir</h4>
                      <div className="text-xs text-slate-400 flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-teal-400"></span>Masuk</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-rose-400"></span>Keluar</span>
                      </div>
                    </div>
                    
                    <div className="h-64">
                      {chartDataArea.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500">Belum ada transaksi terekam.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartDataArea}>
                            <XAxis dataKey="tanggal" stroke="#94A3B8" fontSize={10} tickLine={false} />
                            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#475569" }} labelStyle={{ fontStyle: "italic", fontSize: 11 }} />
                            <Area type="monotone" dataKey="Pemasukan" stroke="#10B981" fillOpacity={0.15} fill="url(#colorMasuk)" strokeWidth={2.5} />
                            <Area type="monotone" dataKey="Pengeluaran" stroke="#EF4444" fillOpacity={0.05} fill="url(#colorKeluar)" strokeWidth={2.5} />
                            <defs>
                               <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                 <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                               </linearGradient>
                               <linearGradient id="colorKeluar" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                                 <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Pie Chart and Automated AI Assistant Speech */}
                  <div className="sleek-card flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-white mb-4">Porsi Belanja Kas</h4>
                      <div className="h-44 relative flex items-center justify-center">
                        {chartDataPie.length === 0 ? (
                          <span className="text-xs text-slate-500">Belum ada struk pengeluaran kelas.</span>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartDataPie}
                                cx="50%"
                                cy="50%"
                                innerRadius={42}
                                outerRadius={68}
                                paddingAngle={3}
                                dataKey="value"
                              >
                                {chartDataPie.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                        <div className="absolute text-center bg-[#0F172A] p-3 rounded-full border border-white/5 shadow-md w-16 h-16 flex flex-col justify-center items-center">
                          <PieIcon size={18} className="text-slate-400" />
                        </div>
                      </div>
                      
                      {/* Legend detail listings */}
                      <div className="flex flex-wrap gap-2 justify-center mt-3 text-[10px]">
                        {chartDataPie.map((entry, index) => (
                          <span key={entry.name} className="bg-[#0F172A] border border-white/5 p-1 px-2 rounded flex items-center gap-1.5 text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                            <span>{entry.name} ({Math.round(entry.value / metrics.totalPengeluaran * 100) || 0}%)</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-white/5 pt-4">
                      <div className="bg-[#0F172A] rounded-xl p-3 border border-blue-900/30 flex gap-2.5 items-start">
                        <Award size={18} className="text-blue-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="text-[10px] text-blue-400 font-extrabold uppercase leading-none block">DASHBOARD AUDIT ADVISOR</span>
                          <p className="text-[11px] text-slate-350 leading-relaxed italic">
                            "{classStatusRemark}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent entries list at bottom */}
                <div className="sleek-card">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-base font-extrabold text-white">Log Aktivitas Arus Kas Terkini</h4>
                    <span className="text-xs text-[#60A5FA] bg-blue-950 px-3 py-1 rounded-full border border-blue-900/30">Admin Master View</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#334155] text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-3.5 pl-4 font-bold">Tanggal</th>
                          <th className="pb-3.5 font-bold">Jenis / Tipe</th>
                          <th className="pb-3.5 font-bold">Nama / Anggota</th>
                          <th className="pb-3.5 font-bold">Keterangan / Catatan</th>
                          <th className="pb-3.5 pr-4 text-right font-bold">Jumlah Uang</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/60">
                        {masterLedgerFiltered.slice(0, 5).map(item => (
                          <tr key={item.id} className="hover:bg-[#0F172A]/30 transition-all">
                            <td className="py-3 pl-4 font-mono text-slate-450">{item.tanggal}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[9px] border ${
                                item.tipe === "Kas Masuk" 
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/40" 
                                  : "bg-rose-950/40 text-rose-400 border-rose-900/40"
                              }`}>
                                {item.tipe}
                              </span>
                            </td>
                            <td className="py-3 font-semibold text-slate-200">{item.nama}</td>
                            <td className="py-3 text-slate-400 max-w-[200px] truncate">{item.kategoriOrCatatan}</td>
                            <td className={`py-3 pr-4 text-right font-black font-mono text-sm ${
                              item.tipe === "Kas Masuk" ? "text-emerald-400" : "text-rose-400"
                            }`}>
                              {item.tipe === "Kas Masuk" ? "+" : "-"} Rp {item.nominal.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                        {masterLedgerFiltered.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500">Belum ada pencatatan operasional kas kelas.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
               2. ADMIN: DATA SISWA MANAGEMENT (CRUD)
               ======================================================== */}
            {session.role === "admin" && currentTab === "siswa" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                {/* Left side: Form */}
                <div className="sleek-card self-start">
                  <h4 className="text-base font-extrabold text-white mb-1">
                    {editingStudentId ? "Edit Profil Siswa" : "Tambah Anggota Siswa Baru"}
                  </h4>
                  <p className="text-xs text-[#60A5FA] mb-6">Kelola data profil akses siswa kelas XII</p>
                  
                  <form onSubmit={saveStudent} className="space-y-4">
                    {studentFormError && (
                      <div className="p-3 bg-rose-950/40 text-rose-400 rounded-lg text-xs font-bold border border-rose-900/30">
                        {studentFormError}
                      </div>
                    )}
                    {studentFormSuccess && (
                      <div className="p-3 bg-emerald-950/40 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-900/30">
                        {studentFormSuccess}
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Nama Lengkap Siswa</label>
                      <input 
                        type="text"
                        placeholder="Contoh: Muhammad Raihan" 
                        value={studentFormName}
                        onChange={e => setStudentFormName(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">NIS (Nomor Induk Siswa)</label>
                      <input 
                        type="text"
                        placeholder="Contoh: 10201" 
                        value={studentFormNis}
                        onChange={e => setStudentFormNis(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Kelas / Rombel</label>
                      <input 
                        type="text"
                        value={studentFormClass}
                        onChange={e => setStudentFormClass(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Username Login Siswa</label>
                      <input 
                        type="text"
                        placeholder="username_siswa" 
                        value={studentFormUser}
                        onChange={e => setStudentFormUser(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Kata Sandi (Password)</label>
                      <input 
                        type="password"
                        placeholder="••••••" 
                        value={studentFormPass}
                        onChange={e => setStudentFormPass(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <button 
                        type="submit"
                        className="w-full py-2.5 sleek-btn-primary rounded-xl text-xs font-extrabold transition-all cursor-pointer block text-center"
                      >
                        {editingStudentId ? "SIMPAN PERUBAHAN PROFILE" : "DAFTARKAN SISWA"}
                      </button>
                      
                      {editingStudentId && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingStudentId(null);
                            setStudentFormName("");
                            setStudentFormNis("");
                            setStudentFormUser("");
                            setStudentFormPass("");
                          }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-all cursor-pointer border border-white/5"
                        >
                          Batal Edit
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Right side: Student List Table */}
                <div className="sleek-card lg:col-span-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h4 className="text-base font-extrabold text-white">Database Daftar Siswa</h4>
                    
                    {/* Search box filters students */}
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-3.5 top-3 text-slate-400" size={14} />
                      <input 
                        type="text"
                        placeholder="Cari nama atau NIS..." 
                        value={searchStudentQuery}
                        onChange={e => setSearchStudentQuery(e.target.value)}
                        className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Student Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#334155] text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pl-4 font-bold">NIS</th>
                          <th className="pb-3 font-bold">Nama Lengkap</th>
                          <th className="pb-3 font-bold">Kelas</th>
                          <th className="pb-3 font-bold">Username</th>
                          <th className="pb-3 font-bold">Sudah Bayar</th>
                          <th className="pb-3 pr-4 text-center font-bold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/60">
                        {students
                          .filter(s => 
                            s.nama.toLowerCase().includes(searchStudentQuery.toLowerCase()) || 
                            s.nis.includes(searchStudentQuery)
                          )
                          .map(student => {
                            const sumPay = metrics.paidPerStudent[student.id] || 0;
                            const isLunas = sumPay >= KAS_TARGET;
                            return (
                              <tr key={student.id} className="hover:bg-[#0F172A]/35 transition-all">
                                <td className="py-3 pl-4 font-mono text-[#60A5FA] font-semibold">{student.nis}</td>
                                <td className="py-3 font-bold text-slate-100">{student.nama}</td>
                                <td className="py-3 text-slate-400">{student.kelas}</td>
                                <td className="py-3 text-slate-400">{student.username}</td>
                                <td className="py-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${isLunas ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                                    <span className={isLunas ? "text-emerald-400 font-extrabold" : "text-amber-400 font-bold"}>
                                      Rp {sumPay.toLocaleString("id-ID")}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 pr-4 text-center">
                                  <div className="flex justify-center items-center gap-2">
                                    <button 
                                      onClick={() => startEditStudent(student)}
                                      className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded hover:text-white transition-all cursor-pointer text-[10px] font-semibold"
                                    >
                                      Ubah
                                    </button>
                                    <button 
                                      onClick={() => deleteStudent(student.id, student.nama)}
                                      className="px-2 py-1 bg-rose-600/20 hover:bg-rose-600/45 text-rose-400 rounded hover:text-white transition-all cursor-pointer text-[10px] font-semibold"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        {students.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">Database Siswa Kosong. Harap daftarkan siswa pertama.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
               3. ADMIN: RECORD PENYETORAN KAS (KAS MASUK)
               ======================================================== */}
            {session.role === "admin" && currentTab === "kas_masuk" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                {/* Submit panel */}
                <div className="sleek-card self-start">
                  <h4 className="text-base font-extrabold text-white mb-1">Setor Kas Mingguan</h4>
                  <p className="text-xs text-emerald-400 mb-6">Rekam dana tunai kas pembayaran siswa</p>
                  
                  <form onSubmit={saveKasMasuk} className="space-y-4">
                    {kasMsg && (
                      <div className="p-3 rounded-lg text-xs font-bold bg-[#0F172A] border border-white/5 text-slate-100">
                        {kasMsg}
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Nama Pembayar (Siswa)</label>
                      <select 
                        value={kasSiswaId}
                        onChange={e => setKasSiswaId(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="">-- Pilih Siswa --</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                        ))}
                      </select>
                    </div>

                    {kasSiswaId && (
                      <div className="p-3 bg-[#0F172A] border border-white/5 rounded-xl text-xs space-y-1">
                        <span className="text-[10px] text-[#60A5FA] font-bold block uppercase">Histori Akumulasi</span>
                        <div className="flex justify-between">
                          <span>Uang disetor s/d saat ini:</span>
                          <span className="font-bold text-slate-100">
                            Rp {(metrics.paidPerStudent[kasSiswaId] || 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status Target Kelulusan:</span>
                          <span className={(metrics.paidPerStudent[kasSiswaId] || 0) >= KAS_TARGET ? "text-emerald-400 font-black" : "text-amber-400 font-black"}>
                            {(metrics.paidPerStudent[kasSiswaId] || 0) >= KAS_TARGET ? "LUNAS (100%)" : "BELUM LUNAS"}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Nominal Setoran (Rp)</label>
                      <input 
                        type="number"
                        value={kasNominal}
                        onChange={e => setKasNominal(Number(e.target.value))}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                      <div className="flex gap-2.5 mt-2">
                        <button type="button" onClick={() => setKasNominal(10000)} className="text-[10px] bg-[#0F172A] border border-white/5 px-2 py-1 rounded text-slate-300 transition-all hover:bg-white/5">10k</button>
                        <button type="button" onClick={() => setKasNominal(20000)} className="text-[10px] bg-[#0F172A] border border-white/5 px-2 py-1 rounded text-slate-300 transition-all hover:bg-white/5">20k</button>
                        <button type="button" onClick={() => setKasNominal(50000)} className="text-[10px] bg-[#0F172A] border border-white/5 px-2 py-1 rounded text-slate-300 transition-all hover:bg-white/5">50k</button>
                        <button type="button" onClick={() => setKasNominal(100000)} className="text-[10px] bg-[#0F172A] border border-white/5 px-2 py-1 rounded text-slate-300 transition-all hover:bg-white/5">100k</button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Tanggal Bayar Setor</label>
                      <input 
                        type="date"
                        value={kasTanggal}
                        onChange={e => setKasTanggal(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#60A5FA] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Catatan Keterangan</label>
                      <input 
                        type="text"
                        placeholder="Contoh: Pembayaran kas bulan Mei" 
                        value={kasKeterangan}
                        onChange={e => setKasKeterangan(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 sleek-btn-primary rounded-xl text-xs font-extrabold transition-all cursor-pointer block mt-4 text-center"
                    >
                      CATAT SETORAN DAN UPDATE SALDO
                    </button>
                  </form>
                </div>

                {/* Receipts audit board */}
                <div className="sleek-card lg:col-span-2">
                  <h4 className="text-base font-extrabold text-white mb-6">Log Riwayat Penyetoran Kas Masuk</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#334155] text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pl-4 font-bold">Tanggal</th>
                          <th className="pb-3 font-bold">Penyetor</th>
                          <th className="pb-3 font-bold">Catatan Keterangan</th>
                          <th className="pb-3 font-bold text-right">Nominal</th>
                          <th className="pb-3 pr-4 text-center font-bold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/60">
                        {kasMasuk.map(item => {
                          const stud = students.find(s => s.id === item.siswa_id);
                          return (
                            <tr key={item.id} className="hover:bg-[#0F172A]/35 transition-all">
                              <td className="py-3.5 pl-4 font-mono text-slate-400">{item.tanggal}</td>
                              <td className="py-3.5 font-bold text-slate-100">{stud ? stud.nama : "Alumni Dihapus"}</td>
                              <td className="py-3.5 text-slate-400">{item.keterangan}</td>
                              <td className="py-3.5 font-bold font-mono text-emerald-400 text-right text-sm">
                                + Rp {item.nominal.toLocaleString("id-ID")}
                              </td>
                              <td className="py-3.5 pr-4 text-center">
                                <button 
                                  onClick={() => deleteKasRecord(item.id)}
                                  className="px-2 py-0.5 bg-rose-600/10 hover:bg-rose-600 hover:text-white rounded text-rose-400 font-semibold cursor-pointer text-[10px]"
                                >
                                  Batal
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {kasMasuk.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500">Iuran Uang Kas Kosong.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
               4. ADMIN: PENGELUARAN JOURNAL MANAGER
               ======================================================== */}
            {session.role === "admin" && currentTab === "pengeluaran" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                {/* Expense form */}
                <div className="sleek-card self-start">
                  <h4 className="text-base font-extrabold text-white mb-1">Rekam Belanja Kas</h4>
                  <p className="text-xs text-rose-400 mb-6">Catat pengeluaran tunai kelas & logistik</p>
                  
                  <form onSubmit={saveExpense} className="space-y-4">
                    {expMsg && (
                      <div className="p-3 text-xs bg-[#0F172A] rounded-lg border border-white/5 font-bold text-slate-100">
                        {expMsg}
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Nama Barang / Keperluan</label>
                      <input 
                        type="text"
                        placeholder="Contoh: Sapu & Pel Kelas" 
                        value={expName}
                        onChange={e => setExpName(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Kategori Keperluan</label>
                      <select 
                        value={expCategory}
                        onChange={e => setExpCategory(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      >
                        <option value="ATK">Logistik Kantor & ATK Kelas</option>
                        <option value="Kebersihan">Kebersihan Rantai & Kamar Kelas</option>
                        <option value="Print Kebutuhan">Foto Copy, Print kertas & Jilid</option>
                        <option value="Konsumsi">Logistik Konsumsi & Snack Rapat</option>
                        <option value="Seni & Pentas">Hiasan, Seni & Kebutuhan Kelas</option>
                        <option value="Lain-lain">Lain-Lain Kebutuhan Darurat</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Nominal Biaya Habis (Rp)</label>
                      <input 
                        type="number"
                        placeholder="Berapa rupiah dibelanjakan..." 
                        value={expNominal}
                        onChange={e => setExpNominal(Number(e.target.value))}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Tanggal Belanja</label>
                      <input 
                        type="date"
                        value={expTanggal}
                        onChange={e => setExpTanggal(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-[#60A5FA] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-bold block mb-1">Rincian Lengkap / Deskripsi</label>
                      <textarea 
                        rows={3}
                        placeholder="Digunakan untuk apa saja barang ini..." 
                        value={expDesc}
                        onChange={e => setExpDesc(e.target.value)}
                        className="w-full bg-[#0F172A] border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 sleek-btn-primary rounded-xl text-xs font-extrabold transition-all cursor-pointer block mt-4 text-center"
                    >
                      REKAM PENGELUARAN KAS
                    </button>
                  </form>
                </div>

                {/* Expenditure log */}
                <div className="sleek-card lg:col-span-2">
                  <h4 className="text-base font-extrabold text-white mb-6">Log Belanja Pengeluaran Kas Kelas</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#334155] text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pl-4 font-bold">Tanggal</th>
                          <th className="pb-3 font-bold">Nama Kebutuhan</th>
                          <th className="pb-3 font-bold">Kategori</th>
                          <th className="pb-3 font-bold">Rincian Deskripsi</th>
                          <th className="pb-3 font-bold text-right">Biaya Out</th>
                          <th className="pb-3 pr-4 text-center font-bold">Ubah</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/60">
                        {expenses.map(item => (
                          <tr key={item.id} className="hover:bg-[#0F172A]/35 transition-all">
                            <td className="py-3.5 pl-4 font-mono text-slate-400">{item.tanggal}</td>
                            <td className="py-3.5 font-bold text-slate-100">{item.nama_pengeluaran}</td>
                            <td className="py-3.5">
                              <span className="p-1 px-2 rounded bg-slate-800 text-[#60A5FA] border border-[#334155] text-[10px] font-bold">
                                {item.kategori}
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-450 italic max-w-[150px] truncate" title={item.deskripsi}>{item.deskripsi}</td>
                            <td className="py-3.5 font-bold font-mono text-rose-400 text-right text-sm">
                              - Rp {item.nominal.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3.5 pr-4 text-center">
                              <button 
                                onClick={() => deleteExpenseRecord(item.id)}
                                className="px-2 py-0.5 bg-rose-600/10 hover:bg-rose-600 hover:text-white rounded text-rose-450 font-semibold cursor-pointer text-[10px]"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                        {expenses.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500">Log pengeluaran kelas kosong.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
               5. ADMIN: STATISTICAL INTERACTIVE MODULE
               ======================================================== */}
            {session.role === "admin" && currentTab === "statistik" && (
              <div className="space-y-8 animate-fade-in">
                {/* Overview analytic grid */}
                <div className="sleek-card">
                  <h4 className="text-base font-extrabold text-white mb-2">Ikhtisar Kesehatan Finansial Kelas</h4>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Visualisasi persentase siswa lunas vs belum lunas, dan perbandingan pemasukan kas bulanan terhadap pengeluaran.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Bar Chart comparing Pemasukan vs Pengeluaran */}
                    <div className="space-y-4">
                      <span className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Laporan Neraca Arus Kas</span>
                      <div className="h-56 bg-[#0F172A]/50 p-4 rounded-xl border border-white/5">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: "Pemasukan", Jumlah: metrics.totalPemasukan, stroke: "#10B981" },
                            { name: "Pengeluaran", Jumlah: metrics.totalPengeluaran, stroke: "#EF4444" }
                          ]}>
                            <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "rgba(255,255,255,0.05)" }} formatter={(value) => `Rp ${value.toLocaleString()}`} />
                            <Bar dataKey="Jumlah" radius={[6, 6, 0, 0]}>
                              <Cell fill="#10B981" />
                              <Cell fill="#EF4444" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Progres Status Iuran Siswa */}
                    <div className="space-y-6">
                      <span className="text-xs text-slate-350 font-bold uppercase tracking-wider block">Status Penagihan Kas Anggota</span>
                      
                      <div className="space-y-4 bg-[#0F172A]/55 p-5 rounded-xl border border-white/5">
                        {/* Progress Bar 1 */}
                        <div>
                          <div className="flex justify-between text-xs mb-1.5 text-slate-300">
                            <span>Siswa Lunas (Membayar ≥ Rp 100k)</span>
                            <span className="text-emerald-400 font-extrabold">{metrics.lunasCount} Siswa ({Math.round(metrics.lunasCount/students.length*100) || 0}%)</span>
                          </div>
                          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${(metrics.lunasCount/students.length*100) || 0}%` }}></div>
                          </div>
                        </div>

                        {/* Progress Bar 2 */}
                        <div>
                          <div className="flex justify-between text-xs mb-1.5 text-slate-350">
                            <span>Siswa Menunggak / Belum Lunas</span>
                            <span className="text-amber-400 font-extrabold">{metrics.belumLunasCount} Siswa ({Math.round(metrics.belumLunasCount/students.length*100) || 0}%)</span>
                          </div>
                          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full transition-all duration-500" style={{ width: `${(metrics.belumLunasCount/students.length*100) || 0}%` }}></div>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 leading-relaxed italic pt-2 border-t border-white/5 flex items-center gap-2">
                          <Sparkles size={14} className="text-indigo-400 inline shrink-0" />
                          <span>Tip Bendahara: Iuran dapat disetor dengan metode cicil minimum Rp 10.000 via dashboard bendahara.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student specific ledger ratios in bento panel */}
                <div className="sleek-card">
                  <h4 className="text-base font-extrabold text-white mb-6">Penilaian Total Iuran Siswa</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {students.map(s => {
                      const paySum = metrics.paidPerStudent[s.id] || 0;
                      const percent = Math.min(100, Math.round(paySum / KAS_TARGET * 100));
                      const isLunas = paySum >= KAS_TARGET;
                      return (
                        <div key={s.id} className="bg-[#0F172A]/40 border border-white/5 p-4 rounded-xl flex flex-col justify-between space-y-3 shadow-inner hover:border-slate-500/20 transition-all">
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono italic block leading-none mb-1">NIS {s.nis}</span>
                            <h5 className="text-xs font-extrabold text-slate-100 truncate block">{s.nama}</h5>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-slate-400">Terbayar:</span>
                              <span className={isLunas ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                                {percent}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full ${isLunas ? "bg-emerald-400" : "bg-amber-400"}`} style={{ width: `${percent}%` }}></div>
                            </div>
                          </div>
                          <span className={`self-start p-0.5 px-2 rounded-full text-[8px] font-bold ${
                            isLunas ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-amber-950 text-amber-400 border border-amber-900"
                          }`}>
                            {isLunas ? "LUNAS" : `Sisa Rp ${(KAS_TARGET - paySum).toLocaleString()}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
               6. ADMIN: MASTER AUDIT & CSV DOWNLOAD
               ======================================================== */}
            {session.role === "admin" && currentTab === "laporan" && (
              <div className="sleek-card space-y-6 animate-fade-in">
                {/* Advanced control grid */}
                <div className="bg-[#0F172A]/50 p-6 rounded-xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-[#3B82F6]" />
                    <h4 className="text-xs font-bold uppercase text-slate-350 tracking-wider">Pusat Saring Laporan Transaksi</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    {/* Option dropdown */}
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 text-[11px]">Berdasarkan Jenis</span>
                      <select 
                        value={auditFilterType}
                        onChange={e => setAuditFilterType(e.target.value as any)}
                        className="bg-[#1E293B] border border-[#334155] rounded-lg p-2 text-white text-xs"
                      >
                        <option value="semua">Semua Transaksi</option>
                        <option value="kas">Kas Masuk Saja</option>
                        <option value="pengeluaran">Pengeluaran Saja</option>
                      </select>
                    </div>

                    {/* Start Date */}
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 text-[11px]">Tanggal Mulai</span>
                      <input 
                        type="date"
                        value={auditStartDate}
                        onChange={e => setAuditStartDate(e.target.value)}
                        className="bg-[#1E293B] border border-[#334155] rounded-lg p-2 text-slate-300 text-xs text-center"
                      />
                    </div>

                    {/* End Date */}
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 text-[11px]">Tanggal Selesai</span>
                      <input 
                        type="date"
                        value={auditEndDate}
                        onChange={e => setAuditEndDate(e.target.value)}
                        className="bg-[#1E293B] border border-[#334155] rounded-lg p-2 text-slate-300 text-xs text-center"
                      />
                    </div>

                    {/* Sorting column */}
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-400 text-[11px]">Urut Nominal</span>
                      <select 
                        value={auditSortOrder}
                        onChange={e => setAuditSortOrder(e.target.value as any)}
                        className="bg-[#1E293B] border border-[#334155] rounded-lg p-2 text-white text-xs"
                      >
                        <option value="terbaru">Terbaru & Logis</option>
                        <option value="terlama">Terlama & Logis</option>
                        <option value="terbesar">Nilai Terbesar</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    {/* Keyword Search field */}
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                      <input 
                        type="text"
                        placeholder="Cari deskripsi, catatan atau nama siswa pencatat..." 
                        value={auditSearchQuery}
                        onChange={e => setAuditSearchQuery(e.target.value)}
                        className="w-full bg-[#1E293B] border border-[#334155] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    {/* Export Action */}
                    <button 
                      onClick={exportToCsvFile}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex justify-center items-center gap-2"
                    >
                      <FileSpreadsheet size={14} />
                      <span>EKSPOR LAPORAN KAS (CSV)</span>
                    </button>
                  </div>
                </div>

                {/* Audit Ledger List table */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs text-slate-400">Menampilkan <strong className="text-blue-400">{masterLedgerFiltered.length}</strong> catatan tertapis</span>
                    {(auditFilterType !== "semua" || auditSearchQuery || auditStartDate) && (
                      <button 
                        onClick={() => {
                          setAuditFilterType("semua");
                          setAuditSearchQuery("");
                          setAuditStartDate("");
                          setAuditEndDate("");
                        }}
                        className="text-xs text-rose-400 underline"
                      >
                        Bersihkan Saringan
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto bg-[#0F172A] rounded-xl border border-[#334155]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#334155] text-slate-400 uppercase tracking-wider text-[10px] bg-[#1E293B]/60">
                          <th className="py-3 pl-4 font-bold">Tanggal</th>
                          <th className="py-3 font-bold">Tipe Aliran</th>
                          <th className="py-3 font-bold">Uraian / Nama</th>
                          <th className="py-3 font-bold">Kategori / Memo</th>
                          <th className="py-3 pr-4 text-right font-bold">Nominal Bersih</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/60">
                        {masterLedgerFiltered.map(item => (
                          <tr key={item.id} className="hover:bg-[#1E293B]/20 transition-all">
                            <td className="py-3 pl-4 font-mono text-slate-450">{item.tanggal}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[8px] border ${
                                item.tipe === "Kas Masuk" 
                                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/40" 
                                  : "bg-rose-950/40 text-rose-400 border-rose-900/40"
                              }`}>
                                {item.tipe}
                              </span>
                            </td>
                            <td className="py-3 font-extrabold text-slate-100">{item.nama}</td>
                            <td className="py-3 text-slate-400 italic max-w-xs truncate" title={item.kategoriOrCatatan}>{item.kategoriOrCatatan}</td>
                            <td className={`py-3 pr-4 text-right font-black font-mono text-sm ${
                              item.tipe === "Kas Masuk" ? "text-emerald-400" : "text-rose-400"
                            }`}>
                              {item.tipe === "Kas Masuk" ? "+" : "-"} Rp {item.nominal.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                        {masterLedgerFiltered.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-500">Hasil filter tidak menemukan satupun kecocokan transaksi kas.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
               7. STUDENT: PERSONAL RINGKASAN KAS (DASHBOARD)
               ======================================================== */}
            {session.role === "siswa" && currentTab === "dashboard" && (
              <div className="space-y-8 animate-fade-in">
                {/* 3 Top Cards for student */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Personal Deposit Card with glow depending on Lunas */}
                  {(() => {
                    const paySum = metrics.paidPerStudent[session.user.id] || 0;
                    const isLunas = paySum >= KAS_TARGET;
                    return (
                      <div className={`sleek-card border relative ${
                        isLunas ? "border-emerald-500/30" : "border-amber-500/30"
                      }`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Status Pembayaran Anda</span>
                            <h3 className={`text-2xl font-black ${isLunas ? "text-emerald-400" : "text-amber-400"}`}>
                              {isLunas ? "LUNAS SEPENUHNYA" : "BELUM LUNAS"}
                            </h3>
                          </div>
                          <span className={`p-1 px-2.5 rounded-full text-[9px] font-extrabold border ${
                            isLunas ? "bg-emerald-950 text-emerald-400 border-emerald-900" : "bg-amber-950 text-amber-400 border-amber-900"
                          }`}>
                            {isLunas ? "LUNAS (100%)" : `${Math.round(paySum/KAS_TARGET*100)}%`}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b border-white/5 pb-1.5 text-slate-400">
                            <span>Total Setoran Anda:</span>
                            <span className="font-mono font-bold text-slate-100">Rp {paySum.toLocaleString("id-ID")}</span>
                          </div>
                          <div className="flex justify-between border-b border-white/5 pb-1.5 text-slate-400">
                            <span>Iuran Acuan Wajib:</span>
                            <span className="font-mono text-slate-100">Rp {KAS_TARGET.toLocaleString("id-ID")}</span>
                          </div>
                          {!isLunas && (
                            <div className="flex justify-between text-slate-400 pt-1 text-xs">
                              <span className="text-slate-400">Kekurangan Tagihan:</span>
                              <span className="text-amber-400 font-mono font-bold">Rp {(KAS_TARGET - paySum).toLocaleString("id-ID")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Saldo Kas Kelas */}
                  <div className="sleek-card">
                    <div className="text-indigo-400 bg-indigo-500/10 p-2 ml-auto w-fit rounded-lg border border-indigo-500/20 mb-4">
                      <Wallet size={16} />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider mb-1">Saldo Kas Kelas Tersisa</span>
                    <h3 className="text-2xl font-black text-slate-100">
                      Rp {metrics.saldoKas.toLocaleString("id-ID")}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Total kas masuk dikurangi seluruh belanja ATK/sapu kelas.
                    </p>
                  </div>

                  {/* General pool index */}
                  <div className="sleek-card">
                    <div className="text-emerald-400 bg-emerald-500/10 p-2 ml-auto w-fit rounded-lg border border-emerald-500/20 mb-4">
                      <TrendingUp size={16} />
                    </div>
                    <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider mb-1">Total Dana Masuk Terhimpun</span>
                    <h3 className="text-2xl font-black text-slate-100">
                      Rp {metrics.totalPemasukan.toLocaleString("id-ID")}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Konstribusi bersama seluruh {students.length} teman sekelas.
                    </p>
                  </div>
                </div>

                {/* Important notice board for student */}
                <div className="sleek-card space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl text-white">
                      <Bell size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-100">Memo Bendahara Terkait Kas Kelas</h4>
                      <p className="text-[10px] text-slate-400">Pembaruan sistem pembayaran kas digital XII Mipa 1</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-350 space-y-2 leading-relaxed">
                    <p>
                      1. Target iuran kas wajib adalah <strong>Rp 100.000</strong> per siswa untuk kebutuhan konsumsi, ATK, Sapu, dan pentas kelas.
                    </p>
                    <p>
                      2. Penyetoran dana kas dapat dicicil minimal Rp 10.000 langsung melapor tunai ke <strong>Kabin Bendahara Kelas</strong>. Setelah bendahara mencatatnya di admin portal, halaman ini akan otomatis ter-update secara realtime.
                    </p>
                    <p>
                      3. Apabila terdapat ketidaksesuaian jumlah nota bayar, hubungi bendahara kelas dengan melampirkan nota asli tanda terima iuran.
                    </p>
                  </div>
                </div>

                {/* Personal transaction histories list at bottom */}
                <div className="sleek-card">
                  <h4 className="text-sm font-extrabold text-white mb-6">Log Pengiriman Iuran Kas Anda</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#334155] text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pl-4 font-bold">Nota ID</th>
                          <th className="pb-3 font-bold">Tanggal Penyetoran</th>
                          <th className="pb-3 font-bold">Catatan Validasi</th>
                          <th className="pb-3 pr-4 text-right font-bold">Nominal Disetor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#334155]/60">
                        {kasMasuk
                          .filter(k => k.siswa_id === session.user.id)
                          .map(item => (
                            <tr key={item.id} className="hover:bg-[#0F172A]/30 transition-all">
                              <td className="py-3 pl-4 font-mono text-[#60A5FA] font-bold">{item.id}</td>
                              <td className="py-3 font-mono text-slate-350">{item.tanggal}</td>
                              <td className="py-3 text-slate-350">{item.keterangan}</td>
                              <td className="py-3 pr-4 text-right font-black font-mono text-sm text-emerald-400">
                                Rp {item.nominal.toLocaleString("id-ID")}
                              </td>
                            </tr>
                          ))}
                        {kasMasuk.filter(k => k.siswa_id === session.user.id).length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500">Anda belum menyetorkan uang kas bulan ini.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
               8. STUDENT: PERSONAL TRANSACTION HISTORY ROUTE
               ======================================================== */}
            {session.role === "siswa" && currentTab === "riwayat_pribadi" && (
              <div className="sleek-card space-y-6 animate-fade-in">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h4 className="text-base font-extrabold text-white">Buku Tabungan Iuran Kas Pribadi</h4>
                  <span className="text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900/30">
                    Histori Resmi Terverifikasi
                  </span>
                </div>

                <div className="overflow-x-auto bg-[#0F172A]/50 rounded-xl border border-white/5">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 uppercase tracking-wider text-[10px] bg-[#1E293B]/40">
                        <th className="py-3.5 pl-4 font-bold">Nota ID</th>
                        <th className="py-3.5 font-bold">Tanggal Pembayaran</th>
                        <th className="py-3.5 font-bold">Validasi Keterangan</th>
                        <th className="py-3.5 pr-4 text-right font-bold">Jumlah Diambil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {kasMasuk
                        .filter(k => k.siswa_id === session.user.id)
                        .map(item => (
                          <tr key={item.id} className="hover:bg-[#1E293B]/20 transition-all">
                            <td className="py-3 pl-4 font-mono text-blue-400 font-bold">{item.id}</td>
                            <td className="py-3 font-mono">{item.tanggal}</td>
                            <td className="py-3 italic text-slate-400">{item.keterangan}</td>
                            <td className="py-3 pr-4 text-right font-black font-mono text-sm text-emerald-400">
                              + Rp {item.nominal.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ))}
                      {kasMasuk.filter(k => k.siswa_id === session.user.id).length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500">Belum ada penyetoran kas masuk terdaftar atas nama Anda.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ========================================================
               9. SHARED: IN-APP PYTHON CODE VIEWER DECK
               ======================================================== */}
            {currentTab === "python_code" && (
              <div className="sleek-card space-y-6 animate-fade-in">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <FileCode size={20} className="text-yellow-400" />
                    <h4 className="text-base font-extrabold text-white">Source Code Python Desktop (CustomTkinter)</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Aplikasi "Manajemen Keuangan Bendahara Kelas" asli ditulis menggunakan Python modern dengan UI CustomTkinter, Matplotlib (Plot Dark Theme), Pillow, dan database relasional SQLite3. Di bawah ini adalah struktur folder & skrip yang siap dijalankan secara lokal di komputer Anda:
                  </p>
                </div>

                {/* File tab selectors */}
                <div className="bg-[#0F172A] rounded-xl p-1.5 border border-[#334155] flex flex-wrap gap-1">
                  <button 
                    onClick={() => setPythonFileTab("main")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pythonFileTab === "main" ? "bg-indigo-600 text-white" : "text-slate-450 hover:text-white"
                    }`}
                  >
                    🚀 main.py
                  </button>
                  <button 
                    onClick={() => setPythonFileTab("db")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pythonFileTab === "db" ? "bg-indigo-600 text-white" : "text-slate-450 hover:text-white"
                    }`}
                  >
                    📂 db_manager.py
                  </button>
                  <button 
                    onClick={() => setPythonFileTab("login")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pythonFileTab === "login" ? "bg-indigo-600 text-white" : "text-slate-450 hover:text-white"
                    }`}
                  >
                    🔑 login_page.py
                  </button>
                  <button 
                    onClick={() => setPythonFileTab("admin")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pythonFileTab === "admin" ? "bg-indigo-600 text-white" : "text-slate-450 hover:text-white"
                    }`}
                  >
                    📊 admin_dashboard.py
                  </button>
                  <button 
                    onClick={() => setPythonFileTab("siswa")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      pythonFileTab === "siswa" ? "bg-indigo-600 text-white" : "text-slate-450 hover:text-white"
                    }`}
                  >
                    👤 siswa_dashboard.py
                  </button>
                </div>

                {/* Code display terminal mock */}
                <div className="relative rounded-2xl overflow-hidden border border-[#334155] bg-[#090D16]">
                  {/* Title mock bar */}
                  <div className="bg-[#111827] px-4 py-2 flex justify-between items-center text-[10px] font-mono border-b border-[#334155]/60 text-slate-500">
                    <span>PATH: /bendahara-app/{pythonFileTab === "main" ? "main.py" : pythonFileTab === "db" ? "database/db_manager.py" : `pages/${pythonFileTab}_page_or_dashboard.py`}</span>
                    
                    {/* Copy to clipboard button widget */}
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 hover:text-slate-350 cursor-pointer bg-[#1E293B] hover:bg-[#334155] px-2.5 py-1 rounded text-[10px] text-slate-300 transition-all font-semibold"
                    >
                      {copiedText ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Salin Script</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Scrolling script segment */}
                  <pre className="p-5 font-mono text-[11px] overflow-x-auto text-slate-300 leading-relaxed max-h-[480px] overflow-y-auto style-scrollbar">
                    <code>
                      {getSelectedCodeText()}
                    </code>
                  </pre>
                </div>

                {/* Setup guidelines */}
                <div className="p-5 rounded-2xl bg-[#0F172A] border border-indigo-900/30 space-y-3 text-xs leading-relaxed">
                  <span className="font-bold text-indigo-400 uppercase tracking-widest text-[10px] block">Panduan Menjalankan Di Komputer Siswa</span>
                  <p>1. Ekspor aplikasi ini dalam format ZIP (Kanal samping AI Studio UI) lalu ekstrak.</p>
                  <p>2. Pastikan python3 telah terpasang, lalu instal paket pustaka visual modern:</p>
                  <pre className="bg-[#1E293B]/70 p-2 text-[10px] text-emerald-400 font-mono rounded border border-[#334155]">
                    pip install customtkinter matplotlib pillow
                  </pre>
                  <p>3. Jalankan aplikasi menggunakan command terminal desktop:</p>
                  <pre className="bg-[#1E293B]/70 p-2 text-[10px] text-emerald-400 font-mono rounded border border-[#334155]">
                    python main.py
                  </pre>
                </div>
              </div>
            )}
          </main>
        </div>
      ) : (
        // ========================================================
        // AUTHENTICATION SCREEN: WELCOME / CHOOSE ROLE / LOGIN FORM
        // ========================================================
        <div className="flex-1 flex justify-center items-center p-4 relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
          {/* Neon radial blur lights backgrounds */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[130px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-indigo-600/15 blur-[160px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

          {/* Form container frame (light glassmorphism style) */}
          <div className="w-full max-w-md bg-[#1E293B]/90 rounded-2xl p-8 border border-blue-500/30 shadow-2xl relative z-10 animate-fade-in backdrop-blur-md">
            
            {/* Upper brand */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center bg-blue-600 rounded-2xl p-3 shadow-lg shadow-blue-500/20 mb-3.5">
                <Wallet size={36} className="text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-widest text-white uppercase leading-none">
                Klas<span className="text-blue-500">Kas</span>
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium tracking-wide">
                Manajemen Kas Digital Kelas XII MIPA 1
              </p>
            </div>

            {/* Selector multi-roles tab bars */}
            <div className="bg-[#0F172A] p-1.5 rounded-xl border border-[#334155] flex gap-1.5 mb-6">
              <button
                type="button"
                id="btn-login-tab-admin"
                onClick={() => { setLoginRole("admin"); setLoginError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                  loginRole === "admin" 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                    : "text-slate-450 hover:text-slate-200"
                }`}
              >
                🔐 BENDHARA / ADMIN
              </button>
              <button
                type="button"
                id="btn-login-tab-siswa"
                onClick={() => { setLoginRole("siswa"); setLoginError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                  loginRole === "siswa" 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                    : "text-slate-450 hover:text-slate-200"
                }`}
              >
                👤 LOG SISWA KELAS
              </button>
            </div>

            {/* Feedback system messages */}
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-900/30 text-rose-400 text-xs font-bold animate-pulse-slow">
                {loginError}
              </div>
            )}
            {loginSuccessMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 text-xs font-bold animate-pulse-slow">
                {loginSuccessMessage}
              </div>
            )}

            {/* Login Inputs form block */}
            <form onSubmit={triggerLogin} className="space-y-4">
              <div>
                <label className="text-xs text-slate-450 font-bold block mb-1">
                  {loginRole === "admin" ? "Username Admin" : "Username Siswa / NIS"}
                </label>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  placeholder={loginRole === "admin" ? "Contoh: admin" : "Contoh: raihan atau 10201"}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-450 font-bold block mb-1">Kata Sandi (Password)</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0F172A] border border-[#334155] rounded-xl pl-4 pr-10 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-450 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                id="btn-login-submit"
                className="w-full py-3 sleek-btn-primary font-extrabold uppercase text-xs tracking-wider rounded-xl shadow-lg mt-4"
              >
                MASUK SEKARANG
              </button>
            </form>

            {/* Quick Demo Assist details */}
            <div className="mt-8 pt-4 border-t border-white/5 text-[10px] text-slate-450 leading-relaxed text-center space-y-1">
              <span className="font-extrabold uppercase text-slate-400 block tracking-wider mb-2">AKSES KREDENSIAL SIMULASI</span>
              <p>🔑 Akun Bendahara: <strong className="text-slate-300">admin</strong> / sandi: <strong className="text-slate-300">admin123</strong></p>
              <p>👤 Akun Siswa: <strong className="text-slate-300">raihan</strong> (atau NIS <strong className="text-slate-300">10201</strong>) / sandi: <strong className="text-slate-300">123</strong></p>
            </div>

          </div>
        </div>
      )}

      {/* Persistent modern footer */}
      <footer className="bg-[#090D16] border-t border-white/5 text-[10px] text-slate-500 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 - Bendahara Kelas XII MIPA 1. All Rights Reserved.</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span>Powered by</span>
            <span className="text-[#3B82F6] font-extrabold uppercase">CustomTKinter SQLite Python Desktop & React</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
