import customtkinter as ctk
from database.db_manager import get_connection
from tkinter import ttk, messagebox
import datetime

class SiswaDashboard(ctk.CTkFrame):
    def __init__(self, parent, user_data, on_logout):
        super().__init__(parent, fg_color="#0F172A")
        self.user_data = user_data # Berisi record siswa login saat ini
        self.on_logout = on_logout
        
        self.setup_sidebar()
        self.setup_main_area()
        self.show_page("dashboard")
        
    def setup_sidebar(self):
        # Sidebar Container
        self.sidebar_frame = ctk.CTkFrame(self, width=205, fg_color="#1E293B", corner_radius=0)
        self.sidebar_frame.pack(side="left", fill="y")
        self.sidebar_frame.pack_propagate(False)
        
        # Brand Logo
        self.logo_label = ctk.CTkLabel(
            self.sidebar_frame,
            text="💰 KlasKas",
            font=ctk.CTkFont(family="Inter", size=24, weight="bold"),
            text_color="#3B82F6"
        )
        self.logo_label.pack(pady=(25, 5))
        
        self.role_badge = ctk.CTkLabel(
            self.sidebar_frame,
            text="DASHBOARD SISWA",
            font=ctk.CTkFont(family="Inter", size=10, weight="bold"),
            text_color="#F1F5F9",
            fg_color="#2563EB",
            padx=10,
            corner_radius=5
        )
        self.role_badge.pack(pady=(0, 30))
        
        # Sidebar Menu
        self.btn_dash = ctk.CTkButton(
            self.sidebar_frame,
            text="Ringkasan Kas",
            height=40,
            fg_color="#2563EB",
            anchor="w",
            font=ctk.CTkFont(family="Inter", size=12, weight="bold"),
            command=lambda: self.show_page("dashboard")
        )
        self.btn_dash.pack(fill="x", padx=12, pady=5)
        
        # Logout
        self.btn_logout = ctk.CTkButton(
            self.sidebar_frame,
            text="Keluar Akun",
            fg_color="#EF4444",
            hover_color="#DC2626",
            height=36,
            font=ctk.CTkFont(family="Inter", size=12, weight="bold"),
            command=self.on_logout
        )
        self.btn_logout.pack(fill="x", padx=12, side="bottom", pady=25)
        
    def setup_main_area(self):
        self.main_container = ctk.CTkFrame(self, fg_color="transparent")
        self.main_container.pack(side="right", fill="both", expand=True, padx=20, pady=15)
        
        # Header
        self.header_frame = ctk.CTkFrame(self.main_container, fg_color="transparent", height=55)
        self.header_frame.pack(fill="x", pady=(0, 15))
        
        self.page_title = ctk.CTkLabel(
            self.header_frame,
            text=f"Selamat Datang, {self.user_data['nama']}",
            font=ctk.CTkFont(family="Inter", size=20, weight="bold"),
            text_color="#F8FAFC"
        )
        self.page_title.pack(side="left")
        
        self.class_lbl = ctk.CTkLabel(
            self.header_frame,
            text=f"Kelas: {self.user_data['kelas']} • NIS: {self.user_data['nis']}",
            font=ctk.CTkFont(family="Inter", size=11, weight="bold"),
            text_color="#60A5FA"
        )
        self.class_lbl.pack(side="right")
        
        self.content_area = ctk.CTkFrame(self.main_container, fg_color="transparent")
        self.content_area.pack(fill="both", expand=True)
        
    def fetch_siswa_metrics(self):
        conn = get_connection()
        cursor = conn.cursor()
        
        # Total nominal yang disetor oleh siswa login ini
        cursor.execute("SELECT SUM(nominal) FROM kas_masuk WHERE siswa_id = ?", (self.user_data['id'],))
        total_pribadi = cursor.fetchone()[0] or 0.0
        
        # Total Kas Umum Kelas
        cursor.execute("SELECT SUM(nominal) FROM kas_masuk")
        total_kas_kelas = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT SUM(nominal) FROM pengeluaran")
        total_pengeluaran_kelas = cursor.fetchone()[0] or 0.0
        
        saldo_kas_kelas = total_kas_kelas - total_pengeluaran_kelas
        
        conn.close()
        return total_pribadi, saldo_kas_kelas, total_kas_kelas

    def show_page(self, page_id):
        for w in self.content_area.winfo_children():
            w.destroy()
            
        total_pribadi, saldo_kas_kelas, total_kas_kelas = self.fetch_siswa_metrics()
        
        # Target kas kelas
        target_kas = 100000.0
        status_bayar = "LUNAS" if total_pribadi >= target_kas else "BELUM LUNAS"
        badge_color = "#10B981" if status_bayar == "LUNAS" else "#F59E0B"
        
        # 3 Top Cards
        cards_f = ctk.CTkFrame(self.content_area, fg_color="transparent")
        cards_f.pack(fill="x", pady=(0, 15))
        cards_f.grid_columnconfigure((0, 1, 2), weight=1)
        
        # Card 1: Status Pembayaran Pribadi
        c1 = ctk.CTkFrame(cards_f, fg_color="#1E293B", corner_radius=12, border_width=1, border_color=badge_color)
        c1.grid(row=0, column=0, padx=5, sticky="nsew")
        ctk.CTkLabel(c1, text="STATUS PEMBAYARAN ANDA", text_color="#94A3B8", font=ctk.CTkFont(size=9, weight="bold")).pack(pady=(12, 2))
        ctk.CTkLabel(c1, text=status_bayar, text_color=badge_color, font=ctk.CTkFont(size=20, weight="bold")).pack(pady=(0, 2))
        ctk.CTkLabel(c1, text=f"Tercatat: Rp {total_pribadi:,.0f} / Rp {target_kas:,.0f}", text_color="#F1F5F9", font=ctk.CTkFont(size=10)).pack(pady=(0, 12))
        
        # Card 2: Saldo Kas Kelas Sisa
        c2 = ctk.CTkFrame(cards_f, fg_color="#1E293B", corner_radius=12, border_width=1, border_color="#334155")
        c2.grid(row=0, column=1, padx=5, sticky="nsew")
        ctk.CTkLabel(c2, text="SALDO KAS SEKARANG", text_color="#94A3B8", font=ctk.CTkFont(size=9, weight="bold")).pack(pady=(12, 2))
        ctk.CTkLabel(c2, text=f"Rp {saldo_kas_kelas:,.0f}", text_color="#3B82F6", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=(0, 2))
        ctk.CTkLabel(c2, text="Total tabungan umum kelas sekarang", text_color="#475569", font=ctk.CTkFont(size=9)).pack(pady=(0, 12))
        
        # Card 3: Total Kas Masuk Tersimpan
        c3 = ctk.CTkFrame(cards_f, fg_color="#1E293B", corner_radius=12, border_width=1, border_color="#334155")
        c3.grid(row=0, column=2, padx=5, sticky="nsew")
        ctk.CTkLabel(c3, text="TOTAL SUMBANGAN MASUK KELAS", text_color="#94A3B8", font=ctk.CTkFont(size=9, weight="bold")).pack(pady=(12, 2))
        ctk.CTkLabel(c3, text=f"Rp {total_kas_kelas:,.0f}", text_color="#10B981", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=(0, 2))
        ctk.CTkLabel(c3, text="Telah dihimpun dari seluruh siswa", text_color="#475569", font=ctk.CTkFont(size=9)).pack(pady=(0, 12))
        
        # Split layout bottom for personal history
        table_f = ctk.CTkFrame(self.content_area, fg_color="#1E293B", corner_radius=15, border_width=1, border_color="#334155")
        table_f.pack(fill="both", expand=True)
        
        ctk.CTkLabel(table_f, text="Riwayat Pembayaran Kas Anda", font=ctk.CTkFont(size=13, weight="bold"), text_color="#F8FAFC").pack(anchor="w", padx=15, pady=12)
        
        tree = ttk.Treeview(table_f, columns=("ID", "Nominal", "Tanggal", "Keterangan"), show="headings", height=10)
        tree.heading("ID", text="Nota ID")
        tree.heading("Nominal", text="Nominal Diperoleh (Rp)")
        tree.heading("Tanggal", text="Tanggal Pembayaran")
        tree.heading("Keterangan", text="Catatan Validasi")
        
        tree.column("ID", width=60, anchor="center")
        tree.column("Nominal", width=140, anchor="e")
        tree.column("Tanggal", width=110, anchor="center")
        tree.column("Keterangan", width=250, anchor="w")
        tree.pack(fill="both", expand=True, padx=15, pady=(0, 15))
        
        # Query personal history
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, nominal, tanggal, keterangan FROM kas_masuk WHERE siswa_id = ? ORDER BY tanggal DESC", (self.user_data['id'],))
        for r in cursor.fetchall():
            tree.insert("", "end", values=(r['id'], f"Rp {r['nominal']:,.0f}", r['tanggal'], r['keterangan']))
        conn.close()
