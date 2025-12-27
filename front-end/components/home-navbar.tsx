"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./ui/mode-toggle"
import { GalleryVerticalEnd } from "lucide-react"

export function HomeNavbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])


  // handle logout button click
  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/signin")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-5" />
          </div>
          <span className="text-lg font-semibold">Acme Inc.</span>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
              {user.role === "admin" && (
                <Button onClick={() => router.push("/dashboard")}>
                  Dashboard
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => router.push("/signin")}>
                Login
              </Button>
              <Button onClick={() => router.push("/signup")}>Sign Up</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
