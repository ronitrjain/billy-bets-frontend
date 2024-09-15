import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown-menu";
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from "next/navigation";

function AvatarButton() {
  const user = useUser();

  return (
    <Avatar>
      <AvatarFallback>
        {user?.email ? user.email[0].toUpperCase() : 'B'}
      </AvatarFallback>
    </Avatar>
  );
}

export default function ProfileAvatar() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    else router.push('/auth/login'); // Redirect after sign out if necessary
  };

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
        <DropdownMenuItem onClick={() => router.push('/auth/reset')}>
          Reset Password
          <DropdownMenuShortcut>⇧⌘R</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}