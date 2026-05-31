import customtkinter as ctk
import sqlite3
import csv
from tkinter import ttk, messagebox, filedialog
from database.db_manager import get_connection
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import datetime

class AdminDashboard(ctk.CTkFrame):
    def __init__(self, parent, user_data, on_logout):
        super().__init__(parent, fg_color="#0F172A")
        self.user_data = user_data
        self.on_logout = on_logout
        
        # Setup layouts
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
            text_color="#60A5FA"
        )
        self.logo_label.pack(pady=(25, 5))
        
        self.role_badge = ctk.CTkLabel(
            self.sidebar_frame,
            text="BENDAHARA KELAS",
            font=ctk.CTkFont(family="Inter", size=10, weight="bold"),
            text_color="#A5F3FC",
            fg_color="#0369A1",
            padx=10,
            pady=2,
            corner_radius=5
        )
        self.role_badge.pack(pady=(0, 30))
        
        # Sidebar Menu Buttons
        menus = [
            ("Dashboard", "dashboard"),
            ("Data Siswa", "siswa"),
            ("Kas Masuk", "kas_masuk"),
            ("Pengeluaran", "pengeluaran"),
            ("Statistik & Grafik", "statistik"),
            ("Laporan & Ekspor", "laporan"),
        ]
        
        self.menu_buttons = {}
        for text, page_id in menus:
            btn = ctk.CTkButton(
                self.sidebar_frame,
                text=text,
                fg_color="transparent",
                text_color="#94A3B8",
                hover_color="#334155",
                anchor="w",
                height=40,
                font=ctk.CTkFont(family="Inter", size=12, weight="bold"),
                command=lambda p=page_id: self.show_page(p)
            )
            btn.pack(fill="x", padx=12, py=3)
            self.menu_buttons[page_id] = btn
            
        # Divider
        lbl = ctk.CTkLabel(self.sidebar_frame, text="", height=1, fg_color="#334155")
        lbl.pack(fill="x", padx=12, pady=15)
        
        # Logout Button
        self.btn_logout = ctk.CTkButton(
            self.sidebar_frame,
            text="Keluar Sistem",
            fg_color="#EF4444",
            hover_color="#DC2626",
            height=36,
            font=ctk.CTkFont(family="Inter", size=12, weight="bold"),
            command=self.on_logout
        )
        self.btn_logout.pack(fill="x", padx=12, side="bottom", pady=25)
        
    def setup_main_area(self):
        # Header + Content Frame
        self.main_container = ctk.CTkFrame(self, fg_color="transparent")
        self.main_container.pack(side="right", fill="both", expand=True, padx=20, pady=15)
        
        # Top Header (Dynamic Title & Date)
        self.header_frame = ctk.CTkFrame(self.main_container, fg_color="transparent", height=50)
        self.header_frame.pack(fill="x", pady=(0, 15))
        
        self.page_title = ctk.CTkLabel(
            self.header_frame,
            text="Aplikasi Ringkasan Kas Kelas",
            font=ctk.CTkFont(family="Inter", size=22, weight="bold"),
            text_color="#F8FAFC"
        )
        self.page_title.pack(side="left")
        
        # Clock
        current_time_str = datetime.datetime.now().strftime("%d %b %Y, %H:%M")
        self.clock_lbl = ctk.CTkLabel(
            self.header_frame,
            text=f"📅 {current_time_str}",
            font=ctk.CTkFont(family="Inter", size=12),
            text_color="#94A3B8"
        )
        self.clock_lbl.pack(side="right")
        
        # Dynamic Content display area
        self.content_area = ctk.CTkFrame(self.main_container, fg_color="transparent")
        self.content_area.pack(fill="both", expand=True)

    def show_page(self, page_id):
        # Update menu buttons styling
        for pid, button in self.menu_buttons.items():
            if pid == page_id:
                button.configure(fg_color="#2563EB", text_color="#FFFFFF")
            else:
                button.configure(fg_color="transparent", text_color="#94A3B8")
                
        # Clear main page content
        for widget in self.content_area.winfo_children():
            widget.destroy()
            
        # Dispatch page rendering
        if page_id == "dashboard":
            self.render_dashboard()
        elif page_id == "siswa":
            self.render_data_siswa()
        elif page_id == "kas_masuk":
            self.render_kas_masuk()
        elif page_id == "pengeluaran":
            self.render_pengeluaran()
        elif page_id == "statistik":
            self.render_statistik()
        elif page_id == "laporan":
            self.render_laporan()

    # --- RENDER PAGES ---
    
    def fetch_metrics(self):
        conn = get_connection()
        cursor = conn.cursor()
        
        # Total Kas Masuk
        cursor.execute("SELECT SUM(nominal) FROM kas_masuk")
        total_masuk = cursor.fetchone()[0] or 0.0
        
        # Total Pengeluaran
        cursor.execute("SELECT SUM(nominal) FROM pengeluaran")
        total_keluar = cursor.fetchone()[0] or 0.0
        
        # Selisih / Saldo
        saldo = total_masuk - total_keluar
        
        # Total Siswa
        cursor.execute("SELECT COUNT(*) FROM siswa")
        total_siswa = cursor.fetchone()[0] or 0
        
        conn.close()
        return saldo, total_masuk, total_keluar, total_siswa

    def render_dashboard(self):
        self.page_title.configure(text="Papan Ikhtisar Keuangan")
        saldo, masuk, keluar, total_siswa = self.fetch_metrics()
        
        # Grid frame for Cards
        cards_frame = ctk.CTkFrame(self.content_area, fg_color="transparent")
        cards_frame.pack(fill="x", pady=(0, 15))
        cards_frame.grid_columnconfigure((0,1,2), weight=1)
        
        # Card 1: Saldo Kas
        c1 = ctk.CTkFrame(cards_frame, fg_color="#1E293B", corner_radius=12, border_width=1, border_color="#3B82F6")
        c1.grid(row=0, column=0, padx=5, pady=5, sticky="nsew")
        ctk.CTkLabel(c1, text="SALDO KAS SEKARANG", text_color="#60A5FA", font=ctk.CTkFont(size=10, weight="bold")).pack(pady=(12, 2))
        ctk.CTkLabel(c1, text=f"Rp {saldo:,.0f}", text_color="#10B981", font=ctk.CTkFont(size=20, weight="bold")).pack(pady=(0, 12))
        
        # Card 2: Pemasukan
        c2 = ctk.CTkFrame(cards_frame, fg_color="#1E293B", corner_radius=12, border_width=1, border_color="#334155")
        c2.grid(row=0, column=1, padx=5, pady=5, sticky="nsew")
        ctk.CTkLabel(c2, text="TOTAL KAS MASUK", text_color="#94A3B8", font=ctk.CTkFont(size=10, weight="bold")).pack(pady=(12, 2))
        ctk.CTkLabel(c2, text=f"Rp {masuk:,.0f}", text_color="#F8FAFC", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=(0, 12))
        
        # Card 3: Pengeluaran
        c3 = ctk.CTkFrame(cards_frame, fg_color="#1E293B", corner_radius=12, border_width=1, border_color="#334155")
        c3.grid(row=0, column=2, padx=5, pady=5, sticky="nsew")
        ctk.CTkLabel(c3, text="TOTAL PENGELUARAN", text_color="#94A3B8", font=ctk.CTkFont(size=10, weight="bold")).pack(pady=(12, 2))
        ctk.CTkLabel(c3, text=f"Rp {keluar:,.0f}", text_color="#EF4444", font=ctk.CTkFont(size=18, weight="bold")).pack(pady=(0, 12))
        
        # Bottom Dashboard Splitting View
        content_split = ctk.CTkFrame(self.content_area, fg_color="transparent")
        content_split.pack(fill="both", expand=True)
        
        # Left Panel (Recent transaction table)
        left_p = ctk.CTkFrame(content_split, fg_color="#1E293B", corner_radius=15, border_width=1, border_color="#334155")
        left_p.pack(side="left", fill="both", expand=True, padx=(0, 10))
        
        ctk.CTkLabel(left_p, text="Riwayat Transaksi Terbaru", font=ctk.CTkFont(size=14, weight="bold"), text_color="#F8FAFC").pack(anchor="w", padx=15, pady=12)
        
        # Treeview styled table
        style = ttk.Style()
        style.theme_use('default')
        style.configure("Treeview", 
                        background="#1E293B", 
                        foreground="#F8FAFC", 
                        fieldbackground="#1E293B", 
                        borderwidth=0,
                        font=("Inter", 9))
        style.map("Treeview", background=[('selected', '#2563EB')])
        style.configure("Treeview.Heading", background="#0F172A", foreground="#94A3B8", font=("Inter", 10, "bold"), borderwidth=0)
        
        tree = ttk.Treeview(left_p, columns=("Tgl", "Nama", "Nominal", "Tipe"), show="headings", height=8)
        tree.heading("Tgl", text="Tanggal")
        tree.heading("Nama", text="Uraian / Nama")
        tree.heading("Nominal", text="Nominal")
        tree.heading("Tipe", text="Tipe")
        
        tree.column("Tgl", width=80, anchor="center")
        tree.column("Nama", width=180, anchor="w")
        tree.column("Nominal", width=100, anchor="e")
        tree.column("Tipe", width=70, anchor="center")
        
        tree.pack(fill="both", expand=True, padx=15, pady=(0, 15))
        
        # Fetch operations
        conn = get_connection()
        cursor = conn.cursor()
        
        # Gabungkan pemasukan dan pengeluaran
        cursor.execute("""
            SELECT tanggal, 'Kas: ' || s.nama AS deskripsi, nominal, 'KAS MASUK' AS tipe FROM kas_masuk k JOIN siswa s ON k.siswa_id = s.id
            UNION ALL
            SELECT tanggal, nama_pengeluaran AS deskripsi, nominal, 'PENGELUARAN' AS tipe FROM pengeluaran
            ORDER BY tanggal DESC LIMIT 8
        """)
        recs = cursor.fetchall()
        for r in recs:
            sign = "+" if r['tipe'] == "KAS MASUK" else "-"
            amt = f"{sign} {r['nominal']:,.0f}"
            tree.insert("", "end", values=(r['tanggal'], r['deskripsi'], amt, r['tipe']))
        conn.close()

    def render_data_siswa(self):
        self.page_title.configure(text="Manajemen Profil Data Siswa")
        
        # Bottom Splitting
        inputs_frame = ctk.CTkFrame(self.content_area, fg_color="#1E293B", corner_radius=15, border_width=1, border_color="#334155")
        inputs_frame.pack(side="left", fill="both", width=280, padx=(0, 15), pady=5)
        inputs_frame.pack_propagate(False)
        
        table_frame = ctk.CTkFrame(self.content_area, fg_color="#1E293B", corner_radius=15, border_width=1, border_color="#334155")
        table_frame.pack(side="right", fill="both", expand=True, pady=5)
        
        # Input widgets
        ctk.CTkLabel(inputs_frame, text="Form Kelola Siswa", font=ctk.CTkFont(size=14, weight="bold"), text_color="#3B82F6").pack(anchor="w", padx=15, pady=15)
        
        # Variables for form
        var_id = ctk.StringVar()
        
        ctk.CTkLabel(inputs_frame, text="Nama Lengkap", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_nama = ctk.CTkEntry(inputs_frame, fg_color="#0F172A", border_color="#334155", height=32)
        ent_nama.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="NIS (Nomor Induk Siswa)", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_nis = ctk.CTkEntry(inputs_frame, fg_color="#0F172A", border_color="#334155", height=32)
        ent_nis.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="Kelas / Rombel", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_kelas = ctk.CTkEntry(inputs_frame, fg_color="#0F172A", border_color="#334155", height=32)
        ent_kelas.insert(0, "XII MIPA 1")
        ent_kelas.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="Username Siswa", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_user = ctk.CTkEntry(inputs_frame, fg_color="#0F172A", border_color="#334155", height=32)
        ent_user.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="Kata Sandi", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_pass = ctk.CTkEntry(inputs_frame, fg_color="#0F172A", border_color="#334155", height=32, show="*")
        ent_pass.pack(fill="x", padx=15, pady=(0, 15))
        
        # Interactive Table helper for editing
        tree = ttk.Treeview(table_frame, columns=("ID", "Nama", "NIS", "Kelas", "User"), show="headings", height=15)
        tree.heading("ID", text="ID")
        tree.heading("Nama", text="Nama Siswa")
        tree.heading("NIS", text="NIS")
        tree.heading("Kelas", text="Kelas")
        tree.heading("User", text="Username")
        
        tree.column("ID", width=40, anchor="center")
        tree.column("Nama", width=180, anchor="w")
        tree.column("NIS", width=80, anchor="center")
        tree.column("Kelas", width=90, anchor="center")
        tree.column("User", width=80, anchor="center")
        tree.pack(fill="both", expand=True, padx=15, pady=(15, 60))
        
        def reload_table(search_q=""):
            for item in tree.get_children():
                tree.delete(item)
            conn = get_connection()
            cursor = conn.cursor()
            if search_q:
                cursor.execute("SELECT * FROM siswa WHERE nama LIKE ? OR nis LIKE ?", (f"%{search_q}%", f"%{search_q}%"))
            else:
                cursor.execute("SELECT * FROM siswa ORDER BY id ASC")
            for r in cursor.fetchall():
                tree.insert("", "end", values=(r['id'], r['nama'], r['nis'], r['kelas'], r['username']))
            conn.close()
            
        reload_table()
        
        # Search Box
        search_f = ctk.CTkFrame(table_frame, fg_color="transparent")
        search_f.place(relx=0.01, rely=0.92, relwidth=0.98, height=35)
        
        search_ent = ctk.CTkEntry(search_f, placeholder_text="Cari Nama / NIS...", fg_color="#0F172A")
        search_ent.pack(side="left", fill="both", expand=True, padx=(5, 5))
        
        btn_search = ctk.CTkButton(search_f, text="Cari", width=70, fg_color="#334155", command=lambda: reload_table(search_ent.get()))
        btn_search.pack(side="left", fill="y", padx=2)
        
        btn_clr = ctk.CTkButton(search_f, text="Refresh", width=70, fg_color="transparent", border_width=1, command=lambda: [search_ent.delete(0, 'end'), reload_table()])
        btn_clr.pack(side="left", fill="y", padx=2)
        
        # Action Commands
        def save_student():
            nama = ent_nama.get().strip()
            nis = ent_nis.get().strip()
            kelas = ent_kelas.get().strip()
            user = ent_user.get().strip()
            pw = ent_pass.get().strip()
            sid = var_id.get()
            
            if not nama or not nis or not kelas or not user or not pw:
                messagebox.showerror("Error", "Isi semua kolom form pendaftaran siswa!")
                return
                
            conn = get_connection()
            cursor = conn.cursor()
            try:
                if sid: # Edit
                    cursor.execute("""
                        UPDATE siswa SET nama=?, nis=?, kelas=?, username=?, password=? WHERE id=?
                    """, (nama, nis, kelas, user, pw, int(sid)))
                else: # Tambah Baru
                    cursor.execute("""
                        INSERT INTO siswa (nama, nis, kelas, username, password) VALUES (?, ?, ?, ?, ?)
                    """, (nama, nis, kelas, user, pw))
                conn.commit()
                messagebox.showinfo("Berhasil", "Data siswa berhasil disimpan!")
                clear_form()
                reload_table()
            except sqlite3.IntegrityError:
                messagebox.showerror("Gagal", "NIS atau Username telah terdaftar di database!")
            finally:
                conn.close()
                
        def delete_student():
            selected = tree.selection()
            if not selected:
                messagebox.showwarning("Warning", "Pilih siswa dari tabel terlebih dahulu!")
                return
            student_id = tree.item(selected[0])['values'][0]
            if messagebox.askyesno("Konfirmasi", "Apakah Anda yakin ingin menghapus data siswa ini? Semua riwayat kas miliknya juga akan terhapus."):
                conn = get_connection()
                cursor = conn.cursor()
                cursor.execute("DELETE FROM siswa WHERE id=?", (student_id,))
                conn.commit()
                conn.close()
                reload_table()
                clear_form()
                
        def fill_form(event):
            selected = tree.selection()
            if not selected: return
            vals = tree.item(selected[0])['values']
            var_id.set(vals[0])
            ent_nama.delete(0, 'end'); ent_nama.insert(0, vals[1])
            ent_nis.delete(0, 'end'); ent_nis.insert(0, vals[2])
            ent_kelas.delete(0, 'end'); ent_kelas.insert(0, vals[3])
            ent_user.delete(0, 'end'); ent_user.insert(0, vals[4])
            
            # Fetch password
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT password FROM siswa WHERE id=?", (vals[0],))
            ent_pass.delete(0, 'end'); ent_pass.insert(0, cursor.fetchone()[0])
            conn.close()
            
        tree.bind("<<TreeviewSelect>>", fill_form)
        
        def clear_form():
            var_id.set("")
            ent_nama.delete(0, 'end')
            ent_nis.delete(0, 'end')
            ent_user.delete(0, 'end')
            ent_pass.delete(0, 'end')
            
        # Form buttons
        btn_save = ctk.CTkButton(inputs_frame, text="SIMPAN / UPDATE DATA", fg_color="#10B981", height=32, font=ctk.CTkFont(size=12, weight="bold"), command=save_student)
        btn_save.pack(fill="x", padx=15, pady=4)
        
        btn_clear = ctk.CTkButton(inputs_frame, text="KOSONGKAN FORM", fg_color="#475569", height=30, command=clear_form)
        btn_clear.pack(fill="x", padx=15, pady=4)
        
        btn_del = ctk.CTkButton(inputs_frame, text="HAPUS SISWA", fg_color="#EF4444", height=30, hover_color="#DC2626", command=delete_student)
        btn_del.pack(fill="x", padx=15, pady=(20, 0))

    def render_kas_masuk(self):
        self.page_title.configure(text="Pemasukan Kas Bendahara")
        
        inputs_frame = ctk.CTkFrame(self.content_area, fg_color="#1E293B", corner_radius=15, border_width=1, border_color="#334155")
        inputs_frame.pack(side="left", fill="both", width=280, padx=(0, 15), pady=5)
        
        table_frame = ctk.CTkFrame(self.content_area, fg_color="#1E293B", corner_radius=15, border_width=1, border_color="#334155")
        table_frame.pack(side="right", fill="both", expand=True, pady=5)
        
        ctk.CTkLabel(inputs_frame, text="Tambah Pemasukan Kas", font=ctk.CTkFont(size=14, weight="bold"), text_color="#10B981").pack(anchor="w", padx=15, pady=15)
        
        # Populate Students list or OptionMenu
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, nama FROM siswa ORDER BY nama ASC")
        students_rows = cursor.fetchall()
        conn.close()
        
        student_map = {r['nama']: r['id'] for r in students_rows}
        student_options = list(student_map.keys()) if student_map else ["Tidak Ada Siswa"]
        
        ctk.CTkLabel(inputs_frame, text="Pilih Anggota Siswa", text_color="#94A3B8").pack(anchor="w", padx=15)
        opt_siswa = ctk.CTkOptionMenu(inputs_frame, values=student_options, fg_color="#0F172A", button_color="#2563EB")
        opt_siswa.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="Nominal Bayar (Rp)", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_nom = ctk.CTkEntry(inputs_frame, fg_color="#0F172A")
        ent_nom.insert(0, "100000")
        ent_nom.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="Tanggal Setor (YYYY-MM-DD)", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_tgl = ctk.CTkEntry(inputs_frame, fg_color="#0F172A")
        ent_tgl.insert(0, datetime.datetime.now().strftime("%Y-%m-%d"))
        ent_tgl.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="Catatan Pembayaran", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_ket = ctk.CTkEntry(inputs_frame, fg_color="#0F172A", placeholder_text="Contoh: Lunas kas Mei")
        ent_ket.pack(fill="x", padx=15, pady=(0, 15))
        
        # Treeview kas masuk
        tree = ttk.Treeview(table_frame, columns=("ID", "Nama", "Nominal", "Tanggal", "Keterangan"), show="headings", height=15)
        tree.heading("ID", text="ID")
        tree.heading("Nama", text="Nama Siswa")
        tree.heading("Nominal", text="Uang Kas (Rp)")
        tree.heading("Tanggal", text="Tanggal")
        tree.heading("Keterangan", text="Catatan Keterangan")
        
        tree.column("ID", width=40, anchor="center")
        tree.column("Nama", width=160, anchor="w")
        tree.column("Nominal", width=100, anchor="e")
        tree.column("Tanggal", width=90, anchor="center")
        tree.column("Keterangan", width=180, anchor="w")
        tree.pack(fill="both", expand=True, padx=15, pady=15)
        
        def reload_kas():
            for item in tree.get_children():
                tree.delete(item)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT k.id, s.nama, k.nominal, k.tanggal, k.keterangan 
                FROM kas_masuk k JOIN siswa s ON k.siswa_id = s.id 
                ORDER BY k.tanggal DESC, k.id DESC
            """)
            for r in cursor.fetchall():
                tree.insert("", "end", values=(r['id'], r['nama'], f"Rp {r['nominal']:,.0f}", r['tanggal'], r['keterangan']))
            conn.close()
            
        reload_kas()
        
        def add_kas():
            siswa_name = opt_siswa.get()
            if siswa_name == "Tidak Ada Siswa" or not student_map:
                messagebox.showerror("Error", "Mohon isi data siswa di menu 'Data Siswa' terlebih dahulu!")
                return
            sid = student_map[siswa_name]
            nom = ent_nom.get().replace(",", "").replace(".", "").strip()
            tgl = ent_tgl.get().strip()
            ket = ent_ket.get().strip()
            
            if not nom.isdigit():
                messagebox.showerror("Error", "Nominal harus berupa angka saja!")
                return
                
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO kas_masuk (siswa_id, nominal, tanggal, keterangan) VALUES (?, ?, ?, ?)",
                           (sid, float(nom), tgl, ket))
            conn.commit()
            conn.close()
            
            messagebox.showinfo("Berhasil", f"Uang kas berhasil direkam untuk {siswa_name}!")
            ent_ket.delete(0, 'end')
            reload_kas()
            
        def delete_kas():
            selected = tree.selection()
            if not selected:
                messagebox.showwarning("Warning", "Pilih baris riwayat yang ingin dihapus pada tabel!")
                return
            kid = tree.item(selected[0])['values'][0]
            if messagebox.askyesno("Konfirmasi", f"Apakah Anda yakin ingin menghapus data rekam kas masuk ID {kid}?"):
                conn = get_connection()
                cursor = conn.cursor()
                cursor.execute("DELETE FROM kas_masuk WHERE id=?", (kid,))
                conn.commit()
                conn.close()
                reload_kas()
                
        btn_record = ctk.CTkButton(inputs_frame, text="CATAT MASUK KAS", fg_color="#10B981", height=35, font=ctk.CTkFont(weight="bold"), command=add_kas)
        btn_record.pack(fill="x", padx=15, pady=5)
        
        btn_del_kas = ctk.CTkButton(inputs_frame, text="Hapus Catatan Terpilih", fg_color="#EF4444", command=delete_kas)
        btn_del_kas.pack(fill="x", padx=15, pady=(20, 5))

    def render_pengeluaran(self):
        self.page_title.configure(text="Pengeluaran Kelas & Log ATK")
        
        inputs_frame = ctk.CTkFrame(self.content_area, fg_color="#1E293B", corner_radius=15, border_width=1, border_color="#334155")
        inputs_frame.pack(side="left", fill="both", width=280, padx=(0, 15), pady=5)
        
        table_frame = ctk.CTkFrame(self.content_area, fg_color="#1E293B", corner_radius=15, border_width=1, border_color="#334155")
        table_frame.pack(side="right", fill="both", expand=True, pady=5)
        
        ctk.CTkLabel(inputs_frame, text="Tambah Pengeluaran Kas", font=ctk.CTkFont(size=14, weight="bold"), text_color="#EF4444").pack(anchor="w", padx=15, pady=15)
        
        ctk.CTkLabel(inputs_frame, text="Nama / Deskripsi Keperluan", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_nama = ctk.CTkEntry(inputs_frame, fg_color="#0F172A", placeholder_text="Contoh: Beli Sapu Kelas")
        ent_nama.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="Kategori Pengeluaran", text_color="#94A3B8").pack(anchor="w", padx=15)
        opt_kat = ctk.CTkOptionMenu(inputs_frame, values=["ATK", "Kebersihan", "Konsumsi", "Seni & Pentas", "Lain-lain"], fg_color="#0F172A", button_color="#2563EB")
        opt_kat.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="Total Nominal (Rp)", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_nom = ctk.CTkEntry(inputs_frame, fg_color="#0F172A")
        ent_nom.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="Tanggal Pengeluaran", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_tgl = ctk.CTkEntry(inputs_frame, fg_color="#0F172A")
        ent_tgl.insert(0, datetime.datetime.now().strftime("%Y-%m-%d"))
        ent_tgl.pack(fill="x", padx=15, pady=(0, 10))
        
        ctk.CTkLabel(inputs_frame, text="Rincian Lengkap", text_color="#94A3B8").pack(anchor="w", padx=15)
        ent_desc = ctk.CTkEntry(inputs_frame, fg_color="#0F172A", placeholder_text="Untuk apa saja pembelian ini...")
        ent_desc.pack(fill="x", padx=15, pady=(0, 15))
        
        # Table of expenses
        tree = ttk.Treeview(table_frame, columns=("ID", "Nama", "Kategori", "Nominal", "Tanggal"), show="headings", height=15)
        tree.heading("ID", text="ID")
        tree.heading("Nama", text="Nama Pengeluaran")
        tree.heading("Kategori", text="Kategori")
        tree.heading("Nominal", text="Nominal (Rp)")
        tree.heading("Tanggal", text="Tanggal")
        
        tree.column("ID", width=40, anchor="center")
        tree.column("Nama", width=180, anchor="w")
        tree.column("Kategori", width=90, anchor="center")
        tree.column("Nominal", width=100, anchor="e")
        tree.column("Tanggal", width=90, anchor="center")
        tree.pack(fill="both", expand=True, padx=15, pady=15)
        
        def reload_out():
            for item in tree.get_children():
                tree.delete(item)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM pengeluaran ORDER BY tanggal DESC, id DESC")
            for r in cursor.fetchall():
                tree.insert("", "end", values=(r['id'], r['nama_pengeluaran'], r['kategori'], f"Rp {r['nominal']:,.0f}", r['tanggal']))
            conn.close()
            
        reload_out()
        
        def add_expense():
            nama = ent_nama.get().strip()
            kat = opt_kat.get()
            nom = ent_nom.get().replace(",", "").replace(".", "").strip()
            tgl = ent_tgl.get().strip()
            desc = ent_desc.get().strip()
            
            if not nama or not nom:
                messagebox.showerror("Error", "Semua kolom wajib diisi!")
                return
                
            if not nom.isdigit():
                messagebox.showerror("Error", "Nominal pengeluaran harus angka!")
                return
                
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO pengeluaran (nama_pengeluaran, kategori, nominal, tanggal, deskripsi) VALUES (?, ?, ?, ?, ?)",
                           (nama, kat, float(nom), tgl, desc))
            conn.commit()
            conn.close()
            
            messagebox.showinfo("Sukses", f"Pengeluaran '{nama}' berhasil dicatat!")
            ent_nama.delete(0, 'end')
            ent_nom.delete(0, 'end')
            ent_desc.delete(0, 'end')
            reload_out()
            
        def delete_expense():
            selected = tree.selection()
            if not selected:
                messagebox.showwarning("Warning", "Pilih pengeluaran dari tabel untuk dihapus!")
                return
            eid = tree.item(selected[0])['values'][0]
            if messagebox.askyesno("Konfirmasi", f"Apakah Anda yakin menghapus pengeluaran ID {eid}?"):
                conn = get_connection()
                cursor = conn.cursor()
                cursor.execute("DELETE FROM pengeluaran WHERE id=?", (eid,))
                conn.commit()
                conn.close()
                reload_out()
                
        btn_save = ctk.CTkButton(inputs_frame, text="CATAT PENGELUARAN", fg_color="#EF4444", hover_color="#DC2626", height=35, font=ctk.CTkFont(weight="bold"), command=add_expense)
        btn_save.pack(fill="x", padx=15, pady=5)
        
        btn_del = ctk.CTkButton(inputs_frame, text="Hapus Terpilih", fg_color="#475569", command=delete_expense)
        btn_del.pack(fill="x", padx=15, pady=(20, 5))

    def render_statistik(self):
        self.page_title.configure(text="Visualisasi Statistik & Grafik")
        
        canvas_container = ctk.CTkFrame(self.content_area, fg_color="#1E293B", corner_radius=15, border_width=1, border_color="#334155")
        canvas_container.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Load Matplotlib diagram
        # Mengambil data kategori pengeluaran
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT kategori, SUM(nominal) FROM pengeluaran GROUP BY kategori")
        rows = cursor.fetchall()
        
        categories = [r[0] for r in rows]
        values = [r[1] for r in rows]
        
        conn.close()
        
        if not categories:
            lbl = ctk.CTkLabel(canvas_container, text="Belum ada data pengeluaran dicatatkan untuk membuat diagram.", text_color="#94A3B8")
            lbl.pack(expand=True)
            return
            
        # Matplotlib Figure modern dark theme
        plt.style.use('dark_background')
        fig, ax = plt.subplots(figsize=(6, 4.2), dpi=100)
        fig.patch.set_facecolor('#1E293B')
        ax.set_facecolor('#1E293B')
        
        colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        wedges, texts, autotexts = ax.pie(
            values, 
            labels=categories, 
            autopct='%1.1f%%', 
            startangle=140, 
            colors=colors[:len(categories)],
            wedgeprops={"edgecolor":"#1E293B", 'linewidth': 1.5, 'antialiased': True}
        )
        
        for text in texts:
            text.set_color('#F1F5F9')
        for autotext in autotexts:
            autotext.set_color('#0F172A')
            autotext.set_weight('bold')
            
        ax.set_title("Distribusi Pengeluaran Kas Kelas", color='#F8FAFC', fontsize=12, pad=15)
        
        canvas = FigureCanvasTkAgg(fig, master=canvas_container)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True, padx=25, pady=25)

    def render_laporan(self):
        self.page_title.configure(text="Laporan Audit & Ekspor CSV")
        
        top_filter = ctk.CTkFrame(self.content_area, fg_color="#1E293B", corner_radius=12, height=65, border_width=1, border_color="#334155")
        top_filter.pack(fill="x", pady=(0, 15))
        top_filter.pack_propagate(False)
        
        ctk.CTkLabel(top_filter, text="Saring Data (Filter):", font=ctk.CTkFont(size=12, weight="bold"), text_color="#3B82F6").pack(side="left", padx=(15, 10))
        
        opt_type = ctk.CTkOptionMenu(top_filter, values=["Semua Transaksi", "Pemasukan Saja", "Pengeluaran Saja"], width=150)
        opt_type.pack(side="left", padx=10, pady=15)
        
        btn_apply = ctk.CTkButton(top_filter, text="Terapkan Filter", width=110, fg_color="#2563EB")
        btn_apply.pack(side="left", padx=5)
        
        # Table of audit
        table_frame = ctk.CTkFrame(self.content_area, fg_color="#1E293B", corner_radius=15, border_width=1, border_color="#334155")
        table_frame.pack(fill="both", expand=True)
        
        tree = ttk.Treeview(table_frame, columns=("Tgl", "Tipe", "Uraian", "Nominal"), show="headings", height=12)
        tree.heading("Tgl", text="Tanggal Transaksi")
        tree.heading("Tipe", text="Tipe Operasi")
        tree.heading("Uraian", text="Keterangan / Uraian Rinci")
        tree.heading("Nominal", text="Nominal (Rp)")
        
        tree.column("Tgl", width=110, anchor="center")
        tree.column("Tipe", width=120, anchor="center")
        tree.column("Uraian", width=250, anchor="w")
        tree.column("Nominal", width=120, anchor="e")
        tree.pack(fill="both", expand=True, padx=15, pady=(15, 60))
        
        # Export logic
        def get_unified_data(tipe):
            conn = get_connection()
            cursor = conn.cursor()
            
            if tipe == "Semua Transaksi":
                cursor.execute("""
                    SELECT tanggal, 'KAS MASUK' AS tipe, 'Kas: ' || s.nama || ' (' || k.keterangan || ')' AS uraian, nominal
                    FROM kas_masuk k JOIN siswa s ON k.siswa_id = s.id
                    UNION ALL
                    SELECT tanggal, 'PENGELUARAN' AS tipe, nama_pengeluaran || ' (' || deskripsi || ')' AS uraian, nominal
                    FROM pengeluaran
                    ORDER BY tanggal DESC
                """)
            elif tipe == "Pemasukan Saja":
                cursor.execute("""
                    SELECT k.tanggal, 'KAS MASUK' AS tipe, 'Kas: ' || s.nama || ' (' || k.keterangan || ')' AS uraian, k.nominal
                    FROM kas_masuk k JOIN siswa s ON k.siswa_id = s.id
                    ORDER BY k.tanggal DESC
                """)
            else:
                cursor.execute("""
                    SELECT tanggal, 'PENGELUARAN' AS tipe, nama_pengeluaran || ' (' || deskripsi || ')' AS uraian, nominal
                    FROM pengeluaran
                    ORDER BY tanggal DESC
                """)
                
            rows = cursor.fetchall()
            conn.close()
            return rows
            
        def fill_table():
            for item in tree.get_children():
                tree.delete(item)
            selected_filter = opt_type.get()
            data = get_unified_data(selected_filter)
            for r in data:
                sign = "+" if r['tipe'] == "KAS MASUK" else "-"
                amt = f"{sign} Rp {r['nominal']:,.0f}"
                tree.insert("", "end", values=(r['tanggal'], r['tipe'], r['uraian'], amt))
                
        btn_apply.configure(command=fill_table)
        fill_table()
        
        def export_to_csv():
            selected_filter = opt_type.get()
            data = get_unified_data(selected_filter)
            
            filepath = filedialog.asksaveasfilename(
                defaultextension=".csv",
                filetypes=[("File CSV", "*.csv")],
                title="Simpan Laporan Kas"
            )
            
            if filepath:
                try:
                    with open(filepath, mode="w", newline="", encoding="utf-8") as f:
                        writer = csv.writer(f)
                        writer.writerow(["Tanggal", "Tipe Transaksi", "Uraian / Keterangan", "Nominal"])
                        for row in data:
                            writer.writerow([row['tanggal'], row['tipe'], row['uraian'], row['nominal']])
                    messagebox.showinfo("Sukses", f"Laporan kas berhasil diekspor ke {filepath}!")
                except Exception as e:
                    messagebox.showerror("Error", f"Gagal mengekspor data: {str(e)}")
                    
        # Export button positioned in absolute style
        btn_export = ctk.CTkButton(
            table_frame, 
            text="📥 EKSPOR LAPORAN KE CSV", 
            fg_color="#10B981", 
            hover_color="#059669",
            height=35,
            font=ctk.CTkFont(size=12, weight="bold"),
            command=export_to_csv
        )
        btn_export.place(relx=0.02, rely=0.91, relwidth=0.96)
