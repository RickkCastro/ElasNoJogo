import "./login.css";
import Button from "../../components/Button";
import supabase from "../../lib/supabaseClient";

export default function Login() {
  function loginWithGoogle() {
    supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <img src="public/logo.png" alt="logo" className="mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-primary-500 mb-4">
            Elas No Jogo
          </h1>
          <p className="text-foreground-muted text-sm md:text-base leading-relaxed">
            Talento não tem gênero, ele apenas precisa de visibilidade para ser
            reconhecido e valorizado.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-background-light rounded-2xl p-6 md:p-8 shadow-xl border border-primary-500/20">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Bem-vinda!
            </h2>
            <p className="text-foreground-muted text-sm">
              Faça login para continuar
            </p>
          </div>

          <Button
            variant="principal"
            size="large"
            onClick={loginWithGoogle}
            className="w-full"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar com Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-xs text-foreground-subtle">
              Ao continuar, você concorda com nossos{" "}
              <a
                href="#"
                className="text-secondary-500 hover:text-secondary-400 underline"
              >
                Termos de Uso
              </a>{" "}
              e{" "}
              <a
                href="#"
                className="text-secondary-500 hover:text-secondary-400 underline"
              >
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8">
          <p className="text-xs text-foreground-subtle">
            © 2025 Elas No Jogo. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </main>
  );
}
