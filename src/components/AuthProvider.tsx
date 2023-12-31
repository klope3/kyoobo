import {
  useContext,
  useState,
  createContext,
  ReactNode,
  useEffect,
} from "react";
import { User } from "../../platformer-creator-game-shared/typesFetched";
import jwtDecode from "jwt-decode";
import { parseObjWithId } from "../validations";
import { fetchUser } from "../fetch";

export type UserAuthData = Omit<User, "joinDate">;

type AuthContextType = {
  user: UserAuthData | null;
  setUser: (user: UserAuthData | null) => void;
  isPending: boolean;
};

const AuthContext = createContext(null as AuthContextType | null);

export function useAuth() {
  const context = useContext(AuthContext);
  return {
    user: context ? context.user : null,
    setUser: context ? context.setUser : null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null as UserAuthData | null);
  const [isPending, setIsPending] = useState(true);

  async function tryAutoLogin() {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setIsPending(false);
      return;
    }

    const decoded = jwtDecode(storedToken);
    try {
      const parsed = parseObjWithId(decoded);

      //? Might want to validate token first?
      const user = await fetchUser(parsed.id);

      setIsPending(false);
      setUser(user);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    tryAutoLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isPending }}>
      {children}
    </AuthContext.Provider>
  );
}
