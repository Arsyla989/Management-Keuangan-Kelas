import customtkinter as ctk
from tkinter import messagebox
from database.db_manager import get_connection

class LoginPage(ctk.CTkFrame):
    def __init__(self, parent, on_login_success):
        super().__init__(parent, fg_color="#0F172A") # Background navy dark
        
        self.on_login_success = on_login_success
        self.role = "admin" # Default role
        
        # Setup UI
        self.create_widgets()
        
    def create_widgets(self):
        # Main Glow Card Frame (Glassmorphism effect)
        self.card_frame = ctk.CTkFrame(
            self,
            width=420,
            height=540,
            fg_color="#1E293B",
            corner_radius=20,
            border_width=2,
            border_color="#2563EB"
        )
        self.card_frame.place(relx=0.5, rely=0.5, anchor="center")
        self.card_frame.pack_propagate(False)
        
        # App Logo & Title
        self.title_label = ctk.CTkLabel(
            self.card_frame,
            text="💰 KlasKas",
            font=ctk.CTkFont(family="Inter", size=32, weight="bold"),
            text_color="#3B82F6"
        )
        self.title_label.pack(pady=(35, 5))
        
        self.subtitle_label = ctk.CTkLabel(
            self.card_frame,
            text="Manajemen Keuangan Kas Kelas",
            font=ctk.CTkFont(family="Inter", size=13),
            text_color="#60A5FA"
        )
        self.subtitle_label.pack(pady=(0, 20))
        
        # Tab Role Selector
        self.role_frame = ctk.CTkFrame(self.card_frame, fg_color="#0F172A", corner_radius=10, height=45)
        self.role_frame.pack(fill="x", padx=40, pady=(10, 25))
        self.role_frame.pack_propagate(False)
        
        self.btn_admin_role = ctk.CTkButton(
            self.role_frame,
            text="Bendahara",
            fg_color="#2563EB",
            hover_color="#1E40AF",
            font=ctk.CTkFont(family="Inter", size=12, weight="bold"),
            corner_radius=8,
            command=lambda: self.select_role("admin")
        )
        self.btn_admin_role.pack(side="left", fill="both", expand=True, padx=2, pady=2)
        
        self.btn_siswa_role = ctk.CTkButton(
            self.role_frame,
            text="Siswa",
            fg_color="transparent",
            text_color="#94A3B8",
            hover_color="#1E293B",
            font=ctk.CTkFont(family="Inter", size=12),
            corner_radius=8,
            command=lambda: self.select_role("siswa")
        )
        self.btn_siswa_role.pack(side="right", fill="both", expand=True, padx=2, pady=2)
        
        # Username Input
        self.username_label = ctk.CTkLabel(
            self.card_frame,
            text="Username Admin",
            font=ctk.CTkFont(family="Inter", size=12, weight="bold"),
            text_color="#F1F5F9"
        )
        self.username_label.pack(anchor="w", padx=42, pady=(0, 4))
        
        self.entry_username = ctk.CTkEntry(
            self.card_frame,
            placeholder_text="Masukkan username admin",
            fg_color="#0F172A",
            border_color="#334155",
            corner_radius=8,
            height=38,
            font=ctk.CTkFont(family="Inter", size=12)
        )
        self.entry_username.pack(fill="x", padx=40, pady=(0, 15))
        
        # Password Input
        self.password_label = ctk.CTkLabel(
            self.card_frame,
            text="Kata Sandi (Password)",
            font=ctk.CTkFont(family="Inter", size=12, weight="bold"),
            text_color="#F1F5F9"
        )
        self.password_label.pack(anchor="w", padx=42, pady=(0, 4))
        
        self.entry_password = ctk.CTkEntry(
            self.card_frame,
            placeholder_text="🔑 ••••••••",
            show="*",
            fg_color="#0F172A",
            border_color="#334155",
            corner_radius=8,
            height=38,
            font=ctk.CTkFont(family="Inter", size=12)
        )
        self.entry_password.pack(fill="x", padx=40, pady=(0, 8))
        
        # Show/Hide Password Checkbox
        self.switch_pass = ctk.CTkCheckBox(
            self.card_frame,
            text="Tampilkan Sandi",
            font=ctk.CTkFont(family="Inter", size=11),
            text_color="#94A3B8",
            border_color="#475569",
            hover_color="#334155",
            command=self.toggle_password
        )
        self.switch_pass.pack(anchor="w", padx=42, pady=(0, 25))
        
        # Login Button with gradient effect
        self.btn_login = ctk.CTkButton(
            self.card_frame,
            text="MASUK KE SISTEM",
            fg_color="#3B82F6",
            hover_color="#2563EB",
            height=42,
            font=ctk.CTkFont(family="Inter", size=13, weight="bold"),
            corner_radius=8,
            command=self.handle_login
        )
        self.btn_login.pack(fill="x", padx=40, pady=(10, 0))
        
    def select_role(self, role):
        self.role = role
        if role == "admin":
            self.btn_admin_role.configure(fg_color="#2563EB", text_color="#FFFFFF", font=ctk.CTkFont(family="Inter", size=12, weight="bold"))
            self.btn_siswa_role.configure(fg_color="transparent", text_color="#94A3B8", font=ctk.CTkFont(family="Inter", size=12))
            self.username_label.configure(text="Username Admin")
            self.entry_username.configure(placeholder_text="Masukkan username admin")
        else:
            self.btn_siswa_role.configure(fg_color="#2563EB", text_color="#FFFFFF", font=ctk.CTkFont(family="Inter", size=12, weight="bold"))
            self.btn_admin_role.configure(fg_color="transparent", text_color="#94A3B8", font=ctk.CTkFont(family="Inter", size=12))
            self.username_label.configure(text="Username / NIS Siswa")
            self.entry_username.configure(placeholder_text="Masukkan NIS atau username")
            
    def toggle_password(self):
        if self.switch_pass.get() == 1:
            self.entry_password.configure(show="")
        else:
            self.entry_password.configure(show="*")
            
    def handle_login(self):
        username = self.entry_username.get().strip()
        password = self.entry_password.get().strip()
        
        if not username or not password:
            messagebox.showerror("Error", "Semua kolom input wajib diisi!")
            return
            
        conn = get_connection()
        cursor = conn.cursor()
        
        if self.role == "admin":
            cursor.execute("SELECT * FROM users WHERE username = ? AND password = ? AND role = 'admin'", (username, password))
            admin = cursor.fetchone()
            conn.close()
            
            if admin:
                user_data = dict(admin)
                messagebox.showinfo("Sukses", "Login sbg Bendahara Berhasil!")
                self.on_login_success("admin", user_data)
            else:
                messagebox.showerror("Login Gagal", "Username atau password Admin salah!")
        else:
            # Siswa bisa login menggunakan username maupun NIS
            cursor.execute("SELECT * FROM siswa WHERE (username = ? OR nis = ?) AND password = ?", (username, username, password))
            siswa = cursor.fetchone()
            conn.close()
            
            if siswa:
                user_data = dict(siswa)
                messagebox.showinfo("Sukses", f"Selamat datang, {user_data['nama']}!")
                self.on_login_success("siswa", user_data)
            else:
                messagebox.showerror("Login Gagal", "NIS/Username atau password Siswa salah!")
