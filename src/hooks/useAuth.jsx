import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const disposed = useRef(false);

  useEffect(() => {
    disposed.current = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!disposed.current) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!disposed.current) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      disposed.current = true;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, login, logout };
}
