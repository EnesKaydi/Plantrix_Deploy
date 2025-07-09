import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// This will simulate our user database for now
interface UserDatabase {
  users: User[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  users: User[]; // To simulate user database
  register: (userData: Omit<User, 'id'>) => { success: boolean; message: string };
  login: (email: string, password?: string) => { success: boolean; message: string }; // password optional for quick login
  quickLogin: () => void;
  logout: () => void;
  initialize: () => void;
}

const initialUsers: User[] = [];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: initialUsers, // Initialize with an empty user list

      register: (userData) => {
        const { users } = get();
        if (users.find(u => u.email === userData.email)) {
          return { success: false, message: 'Bu e-posta adresi zaten kullanılıyor.' };
        }
        const newUser: User = { ...userData, id: `user_${Date.now()}` };
        set({ users: [...users, newUser] });
        // Automatically log in the user after registration
        set({ user: newUser, isAuthenticated: true });
        return { success: true, message: 'Kayıt başarılı!' };
      },

      login: (email, password) => {
        // In a real app, you'd check the password. Here we only check email.
        const { users } = get();
        const foundUser = users.find(u => u.email === email);
        if (foundUser) {
          set({ user: foundUser, isAuthenticated: true });
          return { success: true, message: 'Giriş başarılı!' };
        }
        return { success: false, message: 'Kullanıcı bulunamadı veya şifre yanlış.' };
      },

      quickLogin: () => {
        const mockUser: User = {
          id: 'dev_user',
          email: 'dev@plantrix.com',
          firstName: 'Geliştirici',
          lastName: 'Modu'
        };
        set({ user: mockUser, isAuthenticated: true });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      initialize: () => {
        // console.log('Auth store initialized');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Initialize the store on application startup
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize();
} 