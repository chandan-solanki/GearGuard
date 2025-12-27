import { HomeNavbar } from "@/components/home-navbar";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNavbar />
      <main className="flex-1">
        <section className="container px-10 py-16 md:py-24 lg:py-32">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Acme Inc.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-2xl">
              Your powerful platform for managing documents, projects, and more. 
              Sign up today to get started or login to access your dashboard.
            </p>
          </div>
        </section>

        <section className="container px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            <div className="flex flex-col gap-3 p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold">Easy to Use</h3>
              <p className="text-muted-foreground">
                Intuitive interface designed for seamless user experience and productivity.
              </p>
            </div>
            <div className="flex flex-col gap-3 p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Your data is protected with industry-standard security measures.
              </p>
            </div>
            <div className="flex flex-col gap-3 p-6 rounded-lg border bg-card">
              <h3 className="text-xl font-semibold">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Different access levels for admins and users to manage your workflow.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Acme Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
