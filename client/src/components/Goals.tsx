import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Target, Flame, Trophy } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DailyGoal, StudySession, Subject } from "@shared/schema";

interface DashboardStats {
  todayProgress: number;
  totalSessions: number;
  pendingTasks: number;
  streak: number;
}

export default function Goals() {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  const { data: todayGoal } = useQuery<DailyGoal>({
    queryKey: ["/api/daily-goals", today],
    retry: false,
  });

  const { data: dashboardStats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: todaySessions = [] } = useQuery<(StudySession & { subject: Subject })[]>({
    queryKey: ["/api/study-sessions/date-range", today, today],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/study-sessions/date-range?startDate=${today}&endDate=${today}`);
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: { date: string; targetMinutes: number }) => {
      const response = await apiRequest("POST", "/api/daily-goals", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-goals"] });
      toast({
        title: "Goal set!",
        description: "Your daily goal has been updated.",
      });
      setIsEditingGoal(false);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (data: { date: string; targetMinutes: number; completedMinutes: number }) => {
      const response = await apiRequest("PUT", `/api/daily-goals/${data.date}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-goals"] });
      toast({
        title: "Goal updated!",
        description: "Your daily goal has been updated.",
      });
      setIsEditingGoal(false);
    },
  });

  const handleSaveGoal = () => {
    const targetMinutes = parseInt(goalInput);
    if (!targetMinutes || targetMinutes <= 0) {
      toast({
        title: "Invalid goal",
        description: "Please enter a valid number of minutes.",
        variant: "destructive",
      });
      return;
    }

    const completedMinutes = dashboardStats?.todayProgress || 0;

    if (todayGoal) {
      updateGoalMutation.mutate({
        date: today,
        targetMinutes,
        completedMinutes,
      });
    } else {
      createGoalMutation.mutate({
        date: today,
        targetMinutes,
      });
    }
  };

  const currentGoal = todayGoal?.targetMinutes || 0;
  const currentProgress = dashboardStats?.todayProgress || 0;
  const progressPercentage = currentGoal > 0 ? Math.min((currentProgress / currentGoal) * 100, 100) : 0;
  const streak = dashboardStats?.streak || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Daily Goal
            </CardTitle>
            <Dialog open={isEditingGoal} onOpenChange={setIsEditingGoal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Daily Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-minutes">Target Minutes</Label>
                    <Input
                      id="goal-minutes"
                      type="number"
                      placeholder="Enter target minutes"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setIsEditingGoal(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveGoal}
                      disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                    >
                      {createGoalMutation.isPending || updateGoalMutation.isPending ? "Saving..." : "Save Goal"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {currentGoal > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Progress</span>
                <span className="text-slate-800 font-medium">
                  {Math.round(currentProgress / 60 * 10) / 10}h / {Math.round(currentGoal / 60 * 10) / 10}h
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="text-xs text-slate-600">
                {progressPercentage.toFixed(0)}% complete
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">No daily goal set</p>
              <p className="text-sm text-slate-400">
                Set a daily study goal to track your progress
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {streak}
              </div>
              <div className="text-sm text-slate-600">
                {streak === 1 ? "day" : "days"} in a row
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Best Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {streak}
              </div>
              <div className="text-sm text-slate-600">
                personal best
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setIsEditingGoal(true)}
            >
              <Target className="w-4 h-4 mr-2" />
              Set New Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
