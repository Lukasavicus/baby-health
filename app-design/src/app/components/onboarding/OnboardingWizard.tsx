import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Activity,
  Baby,
  Droplets,
  Moon,
  Sparkles,
  Utensils,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  listBabies,
  onboardingCheckEmail,
  onboardingComplete,
  onboardingSendVerification,
  updateBaby,
  uploadProfileImage,
  type OnboardingBabyGender,
  type OnboardingCaregiverRole,
  type OnboardingCompleteBody,
} from "@/api/client";
import { useAuth, type AuthUserInfo } from "@/app/AuthContext";

const CAREGIVER_ROLES: { value: OnboardingCaregiverRole; label: string }[] = [
  { value: "mãe", label: "Mãe" },
  { value: "pai", label: "Pai" },
  { value: "vovó", label: "Vovó" },
  { value: "vovô", label: "Vovô" },
  { value: "avó", label: "Avó" },
  { value: "avô", label: "Avô" },
  { value: "tia", label: "Tia" },
  { value: "tio", label: "Tio" },
  { value: "babá", label: "Babá" },
  { value: "outro", label: "Outro" },
];

const MOCK_CODE = "123456";
const MIN_PASSWORD = 8;
const MIN_LOADER_MS = 3000;
const OTP_COOLDOWN_MS = 60_000;
const MAX_OTP_RESENDS = 3;

/** Avoid duplicate POST in React StrictMode (ref resets on remount). */
let onboardingCompleteInFlight = false;

function PlantGrowingLoader() {
  return (
    <div className="flex flex-col items-center gap-6 py-8" aria-busy="true" aria-label="Preparando seu espaço">
      <div className="relative h-28 w-20 flex items-end justify-center">
        <svg viewBox="0 0 64 96" className="h-28 w-20 text-baby-mint" aria-hidden>
          <path
            d="M32 88 L32 52"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="origin-bottom animate-[stem_1.2s_ease-in-out_infinite]"
          />
          <path
            d="M32 52 Q20 44 16 32 Q24 36 32 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="origin-[32px_52px] animate-[leaf_1.2s_ease-in-out_infinite]"
          />
          <path
            d="M32 48 Q44 40 48 28 Q40 34 32 46"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="origin-[32px_52px] animate-[leaf2_1.2s_ease-in-out_infinite_0.15s]"
          />
          <ellipse cx="32" cy="90" rx="18" ry="5" className="fill-baby-mint/25" />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-xs px-2 break-words">
        Criando seu perfil e carregando os dados…
      </p>
      <style>{`
        @keyframes stem {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.08); }
        }
        @keyframes leaf {
          0%, 100% { transform: scale(1) rotate(-4deg); opacity: 0.85; }
          50% { transform: scale(1.12) rotate(6deg); opacity: 1; }
        }
        @keyframes leaf2 {
          0%, 100% { transform: scale(1) rotate(4deg); opacity: 0.85; }
          50% { transform: scale(1.1) rotate(-6deg); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/** Focus next OTP cell after React commits state (mobile + desktop). */
function focusOtpIndex(idx: number, refs: React.MutableRefObject<(HTMLInputElement | null)[]>) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      refs.current[idx]?.focus();
    });
  });
}

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<OnboardingCaregiverRole>("mãe");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [cooldownEndsAt, setCooldownEndsAt] = useState<number | null>(null);
  const [resendCount, setResendCount] = useState(0);
  const [resendExhausted, setResendExhausted] = useState(false);
  const [tick, setTick] = useState(0);

  const [babyName, setBabyName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"" | OnboardingBabyGender>("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const finalizeOnce = useRef(false);

  useEffect(() => {
    if (!cooldownEndsAt || Date.now() >= cooldownEndsAt) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [cooldownEndsAt, tick]);

  const now = Date.now();
  const inCooldown = cooldownEndsAt !== null && now < cooldownEndsAt;
  const secondsLeft = inCooldown ? Math.max(0, Math.ceil((cooldownEndsAt! - now) / 1000)) : 0;
  const canShowResend =
    codeSent &&
    !resendExhausted &&
    resendCount < MAX_OTP_RESENDS &&
    !inCooldown;

  const setOtpDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) {
      focusOtpIndex(i + 1, otpRefs);
    }
  };

  useEffect(() => {
    if (codeSent) {
      requestAnimationFrame(() => focusOtpIndex(0, otpRefs));
    }
  }, [codeSent]);

  const onOtpPaste = (e: React.ClipboardEvent) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (t.length === 6) {
      e.preventDefault();
      setOtp(t.split(""));
      requestAnimationFrame(() => focusOtpIndex(5, otpRefs));
    }
  };

  const handleResendCode = async () => {
    if (!email.trim() || resendExhausted || resendCount >= MAX_OTP_RESENDS || inCooldown) return;
    setError(null);
    try {
      await onboardingSendVerification(email.trim());
      const next = resendCount + 1;
      setResendCount(next);
      setCooldownEndsAt(Date.now() + OTP_COOLDOWN_MS);
      if (next >= MAX_OTP_RESENDS) {
        setResendExhausted(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível reenviar o código.");
    }
  };

  const validateStep0 = () => true;

  const validateStep1 = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Digite um e-mail válido.");
      return false;
    }
    if (!displayName.trim()) {
      setError("Digite seu nome.");
      return false;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD} caracteres.`);
      return false;
    }
    if (password !== password2) {
      setError("As senhas não coincidem.");
      return false;
    }
    try {
      const { available } = await onboardingCheckEmail(email.trim());
      if (!available) {
        setError("Este e-mail já está cadastrado. Entre na conta ou use outro e-mail.");
        return false;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível verificar o e-mail.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const joined = otp.join("");
    if (joined !== MOCK_CODE) {
      setError(`Código incorreto. No modo demo, use: ${MOCK_CODE}`);
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!babyName.trim()) {
      setError("Digite o nome do bebê.");
      return false;
    }
    if (!birthDate) {
      setError("Informe a data de nascimento do bebê.");
      return false;
    }
    if (weightKg.trim()) {
      const w = Number(weightKg.replace(",", "."));
      if (Number.isNaN(w) || w < 0 || w > 30) {
        setError("Peso inválido (use kg entre 0 e 30).");
        return false;
      }
    }
    if (heightCm.trim()) {
      const h = Number(heightCm.replace(",", "."));
      if (Number.isNaN(h) || h < 20 || h > 150) {
        setError("Altura inválida (use cm entre 20 e 150).");
        return false;
      }
    }
    return true;
  };

  const runFinalize = useCallback(async () => {
    if (finalizeOnce.current || onboardingCompleteInFlight) return;
    finalizeOnce.current = true;
    onboardingCompleteInFlight = true;
    setError(null);
    const t0 = Date.now();
    const body: OnboardingCompleteBody = {
      email: email.trim().toLowerCase(),
      password,
      display_name: displayName.trim(),
      role,
      verification_code: otp.join(""),
      baby: {
        name: babyName.trim(),
        birth_date: birthDate,
        gender: gender || null,
        weight_kg: weightKg.trim() ? Number(weightKg.replace(",", ".")) : null,
        height_cm: heightCm.trim() ? Number(heightCm.replace(",", ".")) : null,
      },
    };
    try {
      const res = await onboardingComplete(body);
      const user: AuthUserInfo = {
        id: res.user.id,
        username: res.user.username,
        display_name: res.user.display_name,
        profile_dir: res.user.profile_dir,
        caregiver_id: res.user.caregiver_id,
      };
      setSession(res.access_token, user);

      if (photoFile) {
        const babies = await listBabies();
        const bid = babies[0]?.id;
        if (bid) {
          const { url } = await uploadProfileImage(photoFile);
          await updateBaby(bid, { photo_url: url });
        }
      }
      const elapsed = Date.now() - t0;
      const wait = Math.max(0, MIN_LOADER_MS - elapsed);
      if (wait > 0) {
        await new Promise((r) => setTimeout(r, wait));
      }
      navigate("/", { replace: true });
      queueMicrotask(() => {
        onboardingCompleteInFlight = false;
      });
    } catch (e) {
      finalizeOnce.current = false;
      onboardingCompleteInFlight = false;
      setError(e instanceof Error ? e.message : "Não foi possível criar o perfil.");
      setStep(3);
    }
  }, [
    babyName,
    birthDate,
    displayName,
    email,
    gender,
    heightCm,
    navigate,
    otp,
    password,
    photoFile,
    role,
    setSession,
    weightKg,
  ]);

  useEffect(() => {
    if (step !== 4) return;
    void runFinalize();
  }, [step, runFinalize]);

  const goNext = async () => {
    setError(null);
    if (step === 0) {
      if (!validateStep0()) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      if (!(await validateStep1())) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!codeSent) {
        try {
          await onboardingSendVerification(email.trim());
          setCodeSent(true);
          setCooldownEndsAt(Date.now() + OTP_COOLDOWN_MS);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Não foi possível enviar o código.");
        }
        return;
      }
      if (!validateStep2()) return;
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!validateStep3()) return;
      setStep(4);
    }
  };

  const goBack = () => {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  };

  const highlights = [
    { Icon: Utensils, text: "Alimentação, hidratação e sono em um só lugar" },
    { Icon: Moon, text: "Janelas de sono e resumo do dia" },
    { Icon: Droplets, text: "Saúde, crescimento e marcos" },
    { Icon: Activity, text: "Compartilhe com cuidadores da família" },
  ];

  const slideClass = "w-1/5 shrink-0 min-w-0 p-6 space-y-4 box-border";

  return (
    <div className="min-h-dvh bg-gradient-to-b from-baby-mint/25 to-white px-4 py-8 pb-24">
      <div className="max-w-md mx-auto mb-4 flex justify-between items-center min-w-0">
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground shrink-0">
          ← Entrar
        </Link>
        <span className="text-xs text-muted-foreground text-right">
          Passo {step + 1} de 5
        </span>
      </div>
      <div className="max-w-md mx-auto w-full min-w-0 overflow-hidden rounded-3xl border border-baby-mint/30 bg-white/90 shadow-lg">
        <div
          className="flex w-[500%] transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${step * 20}%)` }}
        >
          {/* 0 — Marketing */}
          <div className={slideClass}>
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-baby-peach/40 flex items-center justify-center">
                <Baby className="w-8 h-8 text-baby-peach" />
              </div>
            </div>
            <h1 className="text-xl font-semibold text-center text-foreground break-words px-1">
              Bem-vindo ao Baby Health
            </h1>
            <p className="text-sm text-muted-foreground text-center break-words text-balance px-1">
              Uma ferramenta para acompanhar o dia a dia do bebê com calma e clareza.
            </p>
            <ul className="space-y-3 pt-2">
              {highlights.map(({ Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm min-w-0">
                  <span className="mt-0.5 rounded-full bg-baby-mint/30 p-2 shrink-0">
                    <Icon className="w-4 h-4 text-foreground/70" />
                  </span>
                  <span className="break-words min-w-0">{text}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-center pt-2">
              <Sparkles className="w-5 h-5 text-baby-mint" />
            </div>
          </div>

          {/* 1 — Conta */}
          <div className={slideClass}>
            <h2 className="text-lg font-semibold break-words">Sua conta</h2>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dname">Seu nome</Label>
              <Input
                id="dname"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como você se chama"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Quem você é para o bebê?</Label>
              <select
                id="role"
                className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as OnboardingCaregiverRole)}
              >
                {CAREGIVER_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">Senha</Label>
              <Input
                id="pw"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw2">Confirmar senha</Label>
              <Input
                id="pw2"
                type="password"
                autoComplete="new-password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>
          </div>

          {/* 2 — OTP */}
          <div className={`${slideClass} !space-y-4`}>
            <h2 className="text-lg font-semibold break-words">Confirme o e-mail</h2>
            <p className="text-sm text-muted-foreground break-words text-balance">
              {codeSent
                ? "Digite o código de 6 dígitos (modo demo: 123456)."
                : "Vamos enviar um código de verificação (simulado)."}
            </p>
            {codeSent && (
              <>
                <div className="flex gap-2 justify-center flex-wrap" onPaste={onOtpPaste}>
                  {otp.map((d, i) => (
                    <Input
                      key={i}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      className="w-10 h-12 text-center text-lg p-0 shrink-0"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => setOtpDigit(i, e.target.value)}
                      onInput={(e) => {
                        const v = (e.target as HTMLInputElement).value;
                        if (v.replace(/\D/g, "").slice(-1)) setOtpDigit(i, v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                      }}
                    />
                  ))}
                </div>
                {inCooldown && (
                  <p className="text-xs text-center text-muted-foreground">
                    Você poderá reenviar o código em {secondsLeft}s
                  </p>
                )}
                {canShowResend && (
                  <div className="flex justify-center">
                    <Button type="button" variant="secondary" size="sm" onClick={() => void handleResendCode()}>
                      Reenviar código
                    </Button>
                  </div>
                )}
                {resendExhausted && (
                  <p className="text-xs text-center text-amber-800 bg-amber-50 rounded-lg px-3 py-2">
                    Você atingiu o limite de reenvios. Tente novamente mais tarde.
                  </p>
                )}
              </>
            )}
          </div>

          {/* 3 — Bebê */}
          <div className={`${slideClass} max-h-[70vh] overflow-y-auto`}>
            <h2 className="text-lg font-semibold">Sobre o bebê</h2>
            <div className="space-y-2">
              <Label htmlFor="bname">Nome</Label>
              <Input id="bname" value={babyName} onChange={(e) => setBabyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bdate">Data de nascimento</Label>
              <Input id="bdate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gen">Sexo (opcional)</Label>
              <select
                id="gen"
                className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value as "" | OnboardingBabyGender)}
              >
                <option value="">Prefiro não informar</option>
                <option value="female">Menina</option>
                <option value="male">Menino</option>
                <option value="unknown">Outro / prefiro não classificar</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="w">Peso (kg, opcional)</Label>
                <Input
                  id="w"
                  inputMode="decimal"
                  placeholder="ex.: 4,2"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="h">Altura (cm, opcional)</Label>
                <Input
                  id="h"
                  inputMode="decimal"
                  placeholder="ex.: 54"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photo">Foto (opcional)</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* 4 — Final */}
          <div className={`${slideClass} !p-4 sm:!p-6`}>
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">Quase lá</CardTitle>
              </CardHeader>
              <CardContent>
                <PlantGrowingLoader />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {error && step !== 4 && (
        <p className="max-w-md mx-auto mt-3 text-sm text-red-600 text-center bg-red-50 rounded-lg px-3 py-2 break-words">
          {error}
        </p>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent max-w-md mx-auto flex gap-3">
        {step > 0 && step < 4 && (
          <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
            Voltar
          </Button>
        )}
        {step < 4 && (
          <Button type="button" className="flex-1" onClick={() => void goNext()}>
            {step === 2 && !codeSent ? "Enviar código" : step === 2 && codeSent ? "Verificar e continuar" : "Continuar"}
          </Button>
        )}
      </div>
    </div>
  );
}
