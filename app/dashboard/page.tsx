"use client";
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from '@supabase/supabase-js'
import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import AccuracyOverTime from "@/components/charts/AccuracyOverTime"
import ActiveUsers from "@/components/charts/ActiveUsers"
import UsersOverTime from "@/components/charts/UsersOverTime"
import QuestionType from "@/components/charts/QuestionType"
import { useSupabaseClient } from "@supabase/auth-helpers-react"



function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [promptsPerDay, setPromptsPerDay] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = useSupabaseClient()

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: sessionData, error: sessionError } = await supabase.from('user_sessions').select('*');
      if (sessionError) {
        console.error('Error fetching session data:', sessionError);
      } else {
        setSessions(sessionData);
      }
    };

    const fetchPrompts = async () => {
      const { data: promptData, error: promptError } = await supabase.from('store-queries').select('*').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      if (promptError) {
        console.error('Error fetching prompt data:', promptError);
      } else {
        const promptCount = promptData.length;
        setTotalPrompts(promptCount);
        setPromptsPerDay(promptCount / 7);
      }
    };

    fetchSessions();
    fetchPrompts();
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalSessions = sessions.length;
  const totalUsers = new Set(sessions.map(session => session.user_id)).size;

  const avgSessionTime = sessions.reduce((total, session) => {
    if (session.session_end && session.session_start) {
      return total + (new Date(session.session_end) - new Date(session.session_start));
    }
    return total;
  }, 0) / totalSessions;


  return (
    <div className="flex h-full w-full flex-col">

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sessions per day
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground"></p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Number of Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Session Time
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(avgSessionTime / 60000).toFixed(2)} minutes</div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prompts per day</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promptsPerDay.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground"></p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
          <AccuracyOverTime />
          <ActiveUsers />
        </div>
      </main>
    </div>
  )
}

export default Dashboard;
