"use client"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/saturasui/sidebar"
import { Button } from "@/components/saturasui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/saturasui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/saturasui/avatar"
import { LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/lib/context/auth"

export function TopBar() {
  const router = useRouter()
  const { user, onLogout } = useAuth()

  const handleLogout = () => {
    onLogout()
  }

  const handleSettings = () => {
    router.push("/dashboard/settings")
  }

  const handleProfile = () => {
    // Navigate to profile page when implemented
  }

  return (
    <header className="flex h-10 shrink-0 items-center gap-2 border-b border-[#F2F1ED] bg-white px-3">
      <SidebarTrigger />
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-7 w-7 p-0">
              <Avatar className="h-7 w-7">
                <AvatarImage src="/placeholder-user.jpg" alt={user?.name || "User"} />
                <AvatarFallback>
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-gray-500">{user?.email || ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile}>
              <User className="h-3.5 w-3.5" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings}>
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
