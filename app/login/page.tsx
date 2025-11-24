"use client";

import type React from "react";

import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/saturasui/button";
import { Input } from "@/components/saturasui/input";
import { Label } from "@/components/saturasui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/saturasui/card";
import { useAuth } from "@/lib/context/auth";
import Link from "next/link";
import { useTranslation } from "@/lib/hooks/use-translation";
import LanguageSelector from "@/components/language-selector";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { onLogin, loading } = useAuth();
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-purple-50/60 to-pink-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center text-purple-700 hover:text-purple-800 transition-colors text-xs font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            {t.login.backToHome}
          </Link>
          <LanguageSelector />
        </div>

        <Card>
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 p-2">
              <img
                src="/saturasa-min.png"
                alt="saturasa logo"
                className="h-full w-full object-contain"
              />
            </div>
            <CardTitle className="text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t.login.title}
            </CardTitle>
            <CardDescription>
              {t.login.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">{t.login.username}</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={t.login.usernamePlaceholder}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t.login.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t.login.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? t.login.signingIn : t.login.signIn}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
