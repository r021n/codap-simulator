import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Pastikan doc user ada (nama/kelas bisa diisi belakangan via Firebase Console)
      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          status_selesai: false,
          updated_at: serverTimestamp(),
        },
        { merge: true },
      );

      navigate("/investigasi");
    } catch (err) {
      if (err instanceof Error) {
        setError(err?.message);
      } else {
        setError("Login gagal");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={handleLogin}>
            <div className="space-y-1">
              <div className="text-sm font-medium">Email</div>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Password</div>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button
              className="w-full"
              disabled={loading || !email || !password}
              type="submit"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-xs text-slate-500">
              Akun dibuat guru via Firebase Console (Email/Password).
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
