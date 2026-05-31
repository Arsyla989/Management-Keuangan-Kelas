import customtkinter as ctk
from database.db_manager import init_db
from pages.login_page import LoginPage

class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("Manajemen Keuangan Bendahara Kelas")
        self.geometry("1100x680")
        self.minsize(950, 600)
        
        # Tema warna dark modern
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("dark-blue")
        
        # Inisialisasi Database
        init_db()
        
        # Mulai di halaman Login
        self.show_login_page()
        
    def show_login_page(self):
        # Bersihkan frame yang ada
        for widget in self.winfo_children():
            widget.destroy()
            
        self.login_page = LoginPage(self, self.on_login_success)
        self.login_page.pack(fill="both", expand=True)
        
    def on_login_success(self, role, user_data):
        # user_data berisi detail record admin atau siswa
        for widget in self.winfo_children():
            widget.destroy()
            
        if role == "admin":
            from pages.admin_dashboard import AdminDashboard
            self.dashboard = AdminDashboard(self, user_data, self.show_login_page)
            self.dashboard.pack(fill="both", expand=True)
        else:
            from pages.siswa_dashboard import SiswaDashboard
            self.dashboard = SiswaDashboard(self, user_data, self.show_login_page)
            self.dashboard.pack(fill="both", expand=True)

if __name__ == "__main__":
    app = App()
    app.mainloop()
