import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'


  
function AvatarButton() {
  const user = useUser()


   return (
      <Avatar>
        <AvatarFallback>{
          user?.email ? user.email[0].toUpperCase() : 'B'
        }
        </AvatarFallback>
      </Avatar>
    )
  }

export default function ProfileAvatar() {
  const supabase = useSupabaseClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) alert(error.message)
  }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <AvatarButton /> 
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    }
  